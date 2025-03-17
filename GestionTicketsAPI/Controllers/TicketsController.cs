using System.Security.Claims;
using AutoMapper;
using CloudinaryDotNet.Actions;
using GestionTicketsAPI.DTOs;
using GestionTicketsAPI.Entities;
using GestionTicketsAPI.Helpers;
using GestionTicketsAPI.Interfaces;
using GestionTicketsAPI.Services;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;

namespace GestionTicketsAPI.Controllers
{
  [ApiController]
  [Route("api/[controller]")]
  public class TicketsController : ControllerBase
  {
    private readonly ITicketService _ticketService;
    private readonly IMapper _mapper;
    private readonly IPhotoService _photoService;
    private readonly EmailService _emailService;

    private readonly IUserService _userService;

    public TicketsController(ITicketService ticketService, IMapper mapper, IPhotoService photoService, IUserService userService, EmailService emailService)
    {
      _ticketService = ticketService;
      _mapper = mapper;
      _photoService = photoService;
      _userService = userService;
      _emailService = emailService;
    }

    // GET api/tickets?...
    [HttpGet]
    public async Task<ActionResult<IEnumerable<TicketDto>>> GetTickets([FromQuery] UserParams ticketParams)
    {
      // Extraction des informations de l'utilisateur connecté via les claims
      var userIdClaim = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier);
      var roleClaim = HttpContext.User.FindFirst(ClaimTypes.Role);
      if (userIdClaim != null && roleClaim != null)
      {
        ticketParams.UserId = int.Parse(userIdClaim.Value);
        ticketParams.Role = roleClaim.Value;
      }

      var pagedTickets = await _ticketService.GetTicketsPagedAsync(ticketParams);
      var pagination = new
      {
        currentPage = pagedTickets.CurrentPage,
        pageSize = pagedTickets.PageSize,
        totalItems = pagedTickets.TotalCount,
        totalPages = pagedTickets.TotalPages
      };
      Response.Headers["Pagination"] = JsonConvert.SerializeObject(pagination);
      return Ok(pagedTickets);
    }

    // GET api/tickets/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<TicketDto>> GetTicket(int id)
    {
      var ticketDto = await _ticketService.GetTicketByIdAsync(id);
      if (ticketDto == null) return NotFound();
      return Ok(ticketDto);
    }

    // POST api/tickets
    [HttpPost]
    public async Task<ActionResult<TicketDto>> CreateTicket([FromForm] TicketCreateDto ticketCreateDto)
    {
      // Vérification de l'unicité du titre du ticket
      if (await _ticketService.TicketExists(ticketCreateDto.Title))
        return BadRequest("Un ticket avec ce titre existe déjà");

      UploadResult uploadResult = null;
      if (ticketCreateDto.Attachment != null)
      {
        uploadResult = await _photoService.UploadFileAsync(ticketCreateDto.Attachment);
        if (uploadResult?.Error != null)
          return BadRequest(uploadResult.Error.Message);
      }

      // Mapper le DTO vers l'entité Ticket et définir la date de création
      var ticket = _mapper.Map<Ticket>(ticketCreateDto);
      ticket.CreatedAt = DateTime.UtcNow;
      ticket.UpdatedAt = null;

      // Récupération du statut par défaut depuis la table des statuts
      var defaultStatus = await _ticketService.GetStatusByNameAsync("-");
      if (defaultStatus == null)
        return BadRequest("Statut par défaut introuvable");
      ticket.StatutId = defaultStatus.Id;

      if (uploadResult?.SecureUrl != null)
      {
        ticket.Attachments = uploadResult.SecureUrl.AbsoluteUri;
      }

      // Ajout du ticket dans le repository
      await _ticketService.AddTicketAsync(ticket);
      await _ticketService.SaveAllAsync();

      // Recharger le ticket avec ses relations (incluant Projet et ChefProjet)
      var ticketFromDb = await _ticketService.GetTicketByIdAsync(ticket.Id);
      if (ticketFromDb == null)
      {
        return NotFound();
      }

      // Envoi d'email au chef de projet s'il existe
      var chefProjet = ticketFromDb.Projet?.ChefProjet;
      if (chefProjet != null)
      {
        await _emailService.SendEmailAsync(
            $"{chefProjet.FirstName} {chefProjet.LastName}",
            chefProjet.Email,
            "Nouveau ticket créé",
            $"Le client '{ticket.Owner.FirstName} {ticket.Owner.LastName}' a créé un nouveau ticket intitulé '{ticket.Title}' (n° {ticket.Id}) pour le projet '{ticketFromDb.Projet.Nom}'."
        );
      }

      // Envoi d'email de confirmation au client (celui qui a créé le ticket)
      var client = ticketFromDb.Owner;
      if (client != null)
      {
        await _emailService.SendEmailAsync(
            $"{client.FirstName} {client.LastName}",
            client.Email,
            "Confirmation de création de ticket",
            $"Bonjour {client.FirstName},\n\nVotre ticket intitulé '{ticket.Title}' (n° {ticket.Id}) a été créé avec succès. Nous vous remercions pour votre confiance."
        );
      }

      // Envoi d'email aux utilisateurs ayant le rôle 'super admin'
      var superAdmins = await _userService.GetUsersByRoleAsync("super admin");
      foreach (var admin in superAdmins)
      {
        await _emailService.SendEmailAsync(
            $"{admin.FirstName} {admin.LastName}",
            admin.Email,
            "Nouveau ticket créé",
            $"Le client '{ticket.Owner.FirstName} {ticket.Owner.LastName}' a créé un nouveau ticket intitulé '{ticket.Title}' (n° {ticket.Id}) . Veuillez vérifier les détails dans l'application."
        );
      }

      var resultDto = _mapper.Map<TicketDto>(ticketFromDb);
      return CreatedAtAction(nameof(GetTicket), new { id = ticket.Id }, resultDto);
    }


    [HttpPost("validate/{id}")]
    public async Task<IActionResult> ValidateTicket(int id, [FromBody] TicketValidationDto ticketValidationDto)
    {
      // Récupération du ticket à valider
      var ticket = await _ticketService.GetTicketEntityByIdAsync(id);
      if (ticket == null)
        return NotFound("Ticket non trouvé");

      // Vérification de l'autorisation : seul le chef de projet ou un super admin peut valider
      var currentUserIdClaim = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier);
      var currentUserRoleClaim = HttpContext.User.FindFirst(ClaimTypes.Role);
      if (currentUserIdClaim == null || currentUserRoleClaim == null)
        return Unauthorized("Utilisateur non authentifié");

      var currentUserId = int.Parse(currentUserIdClaim.Value);
      var currentUserRole = currentUserRoleClaim.Value;

      bool isAuthorized = false;
      if (ticket.Projet?.ChefProjet != null && ticket.Projet.ChefProjet.Id == currentUserId)
        isAuthorized = true;
      else if (currentUserRole.ToLower() == "super admin")
        isAuthorized = true;
      if (!isAuthorized)
        return Unauthorized("Vous n'êtes pas autorisé à valider ce ticket.");

      if (ticketValidationDto.IsAccepted)
      {
        // Si accepté, rechercher le statut "Accepté"
        var acceptedStatus = await _ticketService.GetStatusByNameAsync("Accepté");
        if (acceptedStatus == null)
          return BadRequest("Statut 'Accepté' introuvable");

        ticket.StatutId = acceptedStatus.Id;
        // Mise à jour de la date de validation
        ticket.ApprovedAt = DateTime.UtcNow;

        // Envoi d'email d'acceptation au client
        var client = ticket.Owner;
        if (client != null)
        {
          await _emailService.SendEmailAsync(
              $"{client.FirstName} {client.LastName}",
              client.Email,
              "Ticket accepté",
              $"Votre ticket '{ticket.Title}' (n°{ticket.Id}) a été accepté."
          );
        }

        // Si un responsable est assigné, on met à jour et on change le statut en "En cours"
        if (ticketValidationDto.ResponsibleId.HasValue)
        {
          ticket.ResponsibleId = ticketValidationDto.ResponsibleId.Value;
          var inProgressStatus = await _ticketService.GetStatusByNameAsync("En cours");
          if (inProgressStatus == null)
            return BadRequest("Statut 'En cours' introuvable");
          ticket.StatutId = inProgressStatus.Id;

          // Envoi d'email au responsable assigné
          var responsible = await _userService.GetUserByIdAsync(ticket.ResponsibleId.Value);
          if (responsible != null)
          {
            await _emailService.SendEmailAsync(
                $"{responsible.FirstName} {responsible.LastName}",
                responsible.Email,
                "Nouveau ticket assigné",
                $"Le ticket '{ticket.Title}' (n°{ticket.Id}) vous a été assigné."
            );
          }
        }
      }
      else
      {
        // Si refusé, rechercher le statut "Refusé"
        var refusedStatus = await _ticketService.GetStatusByNameAsync("Refusé");
        if (refusedStatus == null)
          return BadRequest("Statut 'Refusé' introuvable");
        ticket.StatutId = refusedStatus.Id;
        // Enregistrement de la raison de refus
        ticket.ValidationReason = ticketValidationDto.Reason;
      }

      // Mise à jour de la date de modification
      ticket.UpdatedAt = DateTime.UtcNow;

      var updateResult = await _ticketService.UpdateTicketAsync(ticket);
      if (updateResult)
      {
        // Si le ticket a été refusé, envoyer un e-mail au client avec la raison du refus
        if (!ticketValidationDto.IsAccepted)
        {
          var client = ticket.Owner;
          if (client != null)
          {
            await _emailService.SendEmailAsync(
                $"{client.FirstName} {client.LastName}",
                client.Email,
                "Ticket refusé",
                $"Votre ticket '{ticket.Title}' (n°{ticket.Id}) a été refusé. Raison : {ticket.ValidationReason}"
            );
          }
        }
        return NoContent();
      }
      return BadRequest("La validation du ticket a échoué");
    }



    // Endpoint pour l'upload du fichier en arrière-plan
    [HttpPost("upload")]
    public async Task<IActionResult> UploadFile([FromForm] IFormFile file)
    {
      var uploadResult = await _photoService.UploadFileAsync(file);
      if (uploadResult == null || uploadResult.Error != null)
        return BadRequest("L'upload a échoué.");
      return Ok(new { secureUrl = uploadResult.SecureUrl.AbsoluteUri });
    }

    // DELETE api/tickets/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTicket(int id)
    {
      var ticketDto = await _ticketService.GetTicketByIdAsync(id);
      if (ticketDto == null) return NotFound();
      var ticket = _mapper.Map<Ticket>(ticketDto);
      var result = await _ticketService.DeleteTicketAsync(ticket);
      if (result) return NoContent();
      return BadRequest("La suppression du ticket a échoué");
    }

    // DELETE api/tickets/bulk
    [HttpDelete("bulk")]
    public async Task<IActionResult> DeleteMultipleTickets([FromBody] IEnumerable<int> ticketIds)
    {
      if (ticketIds == null || !ticketIds.Any())
      {
        return BadRequest("Aucun ticket spécifié pour la suppression.");
      }
      var result = await _ticketService.DeleteMultipleTicketsAsync(ticketIds);
      if (result)
        return NoContent();
      return BadRequest("La suppression des tickets a échoué.");
    }



    [HttpPost("finish/{id}")]
    public async Task<IActionResult> FinishTicket(int id, [FromBody] TicketCompletionDto completionDto)
    {
      // Récupération du ticket
      var ticket = await _ticketService.GetTicketEntityByIdAsync(id);
      if (ticket == null)
        return NotFound("Ticket non trouvé");

      // Vérification de l'authentification et de l'autorisation
      var currentUserIdClaim = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier);
      var currentUserRoleClaim = HttpContext.User.FindFirst(ClaimTypes.Role);
      if (currentUserIdClaim == null || currentUserRoleClaim == null)
        return Unauthorized("Utilisateur non authentifié");

      var currentUserId = int.Parse(currentUserIdClaim.Value);
      var currentUserRole = currentUserRoleClaim.Value.ToLower();

      // Seul le chef de projet, le super admin ou le responsable assigné peut terminer le ticket
      bool isAuthorized = false;
      if (ticket.Projet?.ChefProjet != null && ticket.Projet.ChefProjet.Id == currentUserId)
        isAuthorized = true;
      else if (currentUserRole == "super admin")
        isAuthorized = true;
      else if (ticket.ResponsibleId.HasValue && ticket.ResponsibleId.Value == currentUserId)
        isAuthorized = true;

      if (!isAuthorized)
        return Unauthorized("Vous n'êtes pas autorisé à terminer ce ticket.");

      // Détermination du nouveau statut en fonction de la résolution
      var newStatusName = completionDto.IsResolved ? "Résolu" : "Non Résolu";
      var newStatus = await _ticketService.GetStatusByNameAsync(newStatusName);
      if (newStatus == null)
        return BadRequest($"Statut '{newStatusName}' introuvable");

      ticket.StatutId = newStatus.Id;

      // Enregistrement des informations de clôture
      // On met à jour SolvedAt (Résolu à) avec la date envoyée dans le DTO
      ticket.CompletionComment = completionDto.Comment;
      ticket.HoursSpent = completionDto.HoursSpent;
      ticket.SolvedAt = completionDto.CompletionDate; // Mettez à jour la propriété SolvedAt

      // Sauvegarde des modifications
      var updateResult = await _ticketService.UpdateTicketAsync(ticket);
      if (!updateResult)
        return BadRequest("La clôture du ticket a échoué");

      // Envoi d'emails aux différents destinataires

      // 1. Email au client (Owner)
      if (ticket.Owner != null)
      {
        await _emailService.SendEmailAsync(
            $"{ticket.Owner.FirstName} {ticket.Owner.LastName}",
            ticket.Owner.Email,
            "Ticket terminé",
            $"Votre ticket '{ticket.Title}' (n°{ticket.Id}) a été terminé. Commentaire : {completionDto.Comment}"
        );
      }

      // 2. Email au chef de projet (s'il existe)
      if (ticket.Projet?.ChefProjet != null)
      {
        await _emailService.SendEmailAsync(
            $"{ticket.Projet.ChefProjet.FirstName} {ticket.Projet.ChefProjet.LastName}",
            ticket.Projet.ChefProjet.Email,
            "Ticket terminé",
            $"Le ticket '{ticket.Title}' (n°{ticket.Id}) du projet '{ticket.Projet.Nom}' a été terminé. Commentaire : {completionDto.Comment}"
        );
      }

      // 3. Email au responsable assigné (s'il existe et est différent du chef de projet)
      if (ticket.Responsible != null)
      {
        await _emailService.SendEmailAsync(
            $"{ticket.Responsible.FirstName} {ticket.Responsible.LastName}",
            ticket.Responsible.Email,
            "Ticket terminé",
            $"Le ticket '{ticket.Title}' (n°{ticket.Id}) qui vous a été assigné a été terminé. Commentaire : {completionDto.Comment}"
        );
      }

      // 4. Email à tous les super admins
      var superAdmins = await _userService.GetUsersByRoleAsync("super admin");
      foreach (var admin in superAdmins)
      {
        await _emailService.SendEmailAsync(
            $"{admin.FirstName} {admin.LastName}",
            admin.Email,
            "Ticket terminé",
            $"Le ticket '{ticket.Title}' (n°{ticket.Id}) a été terminé. Commentaire : {completionDto.Comment}"
        );
      }

      return NoContent();
    }


    [HttpPost("updateResponsible/{id}")]
    public async Task<IActionResult> UpdateResponsible(int id, [FromBody] TicketResponsibleDto responsibleDto)
    {
      var ticket = await _ticketService.GetTicketEntityByIdAsync(id);
      if (ticket == null)
        return NotFound("Erreur : Ticket non trouvé.");

      // Vérification de l'authentification et de l'autorisation
      var currentUserIdClaim = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier);
      var currentUserRoleClaim = HttpContext.User.FindFirst(ClaimTypes.Role);
      if (currentUserIdClaim == null || currentUserRoleClaim == null)
        return Unauthorized("Erreur : Utilisateur non authentifié.");

      var currentUserId = int.Parse(currentUserIdClaim.Value);
      var currentUserRole = currentUserRoleClaim.Value.ToLower();
      bool isAuthorized = false;
      if (ticket.Projet?.ChefProjet != null && ticket.Projet.ChefProjet.Id == currentUserId)
        isAuthorized = true;
      else if (currentUserRole == "super admin")
        isAuthorized = true;
      else if (ticket.ResponsibleId.HasValue && ticket.ResponsibleId.Value == currentUserId)
        isAuthorized = true;

      if (!isAuthorized)
        return Unauthorized("Erreur : Vous n'êtes pas autorisé à modifier le responsable.");

      // Vérifier si le responsable a réellement changé
      if (ticket.ResponsibleId.HasValue && ticket.ResponsibleId.Value == responsibleDto.ResponsibleId)
      {
        return BadRequest("Erreur : Le responsable n'a pas été modifié.");
      }

      // Mise à jour du responsable
      ticket.ResponsibleId = responsibleDto.ResponsibleId;
      var updateResult = await _ticketService.UpdateTicketAsync(ticket);
      if (!updateResult)
        return BadRequest("Erreur : La mise à jour du responsable a échoué.");

      // Récupérer le nouveau responsable pour envoyer un e-mail
      var responsible = await _userService.GetUserByIdAsync(ticket.ResponsibleId.Value);
      if (responsible != null)
      {
        await _emailService.SendEmailAsync(
          $"{responsible.FirstName} {responsible.LastName}",
          responsible.Email,
          "Ticket mis à jour - Nouveau responsable assigné",
          $"Le ticket '{ticket.Title}' (n°{ticket.Id}) vous a été assigné en tant que responsable."
        );
      }

      return NoContent();
    }

  }
}
