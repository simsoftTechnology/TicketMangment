using System.Security.Claims;
using AutoMapper;
using CloudinaryDotNet.Actions;
using GestionTicketsAPI.DTOs;
using GestionTicketsAPI.Entities;
using GestionTicketsAPI.Helpers;
using GestionTicketsAPI.Interfaces;
using GestionTicketsAPI.Services;
using Hangfire;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using ClosedXML.Excel;
using System.Text;

namespace GestionTicketsAPI.Controllers
{
  [ApiController]
  public class TicketsController : BaseApiController
  {
    private readonly ITicketService _ticketService;
    private readonly IMapper _mapper;
    private readonly IPhotoService _photoService;
    private readonly EmailService _emailService;
    private readonly IUserService _userService;
    private readonly ICommentService _commentService;
    private readonly ExcelExportServiceClosedXML _excelExportService;
    private readonly NotificationService _notifService;
    private readonly IWebHostEnvironment _env;

    public TicketsController(IWebHostEnvironment env, ExcelExportServiceClosedXML excelExportService, ITicketService ticketService, IMapper mapper, IPhotoService photoService, IUserService userService, EmailService emailService, ICommentService commentService,
    NotificationService notifService)
    {
      _ticketService = ticketService;
      _mapper = mapper;
      _photoService = photoService;
      _userService = userService;
      _emailService = emailService;
      _commentService = commentService;
      _excelExportService = excelExportService;
      _env = env;
      _notifService = notifService;
    }

    // GET api/tickets?...
    [HttpPost("paged")]
    public async Task<ActionResult<IEnumerable<TicketDto>>> GetTickets([FromBody] TicketFilterParams filterParams)
    {
      var userIdClaim = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier);
      var roleClaim = HttpContext.User.FindFirst(ClaimTypes.Role);
      if (userIdClaim != null && roleClaim != null)
      {
        filterParams.UserId = int.Parse(userIdClaim.Value);
        filterParams.Role = roleClaim.Value;
      }
           

      var pagedTickets = await _ticketService.GetTicketsPagedAsync(filterParams);

      var pagedTickets = await _ticketService.GetTicketsPagedAsync(filterParams);

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
    public async Task<ActionResult<TicketDto>> CreateTicket([FromBody] TicketCreateDto ticketCreateDto)
    {
      if (await _ticketService.TicketExists(ticketCreateDto.Title))
        return BadRequest("Un ticket avec ce titre existe déjà");

      // 1) Création du ticket
      var ticket = _mapper.Map<Ticket>(ticketCreateDto);
      ticket.CreatedAt = DateTime.UtcNow;
      var defaultStatus = await _ticketService.GetStatusByNameAsync("—");
      if (defaultStatus == null)
        return BadRequest("Statut par défaut introuvable");
      ticket.StatutId = defaultStatus.Id;

      await _ticketService.AddTicketAsync(ticket);
      await _ticketService.SaveAllAsync();

      // 2) Récupération enrichie
      var ticketFromDb = await _ticketService.GetTicketByIdAsync(ticket.Id);
      if (ticketFromDb == null)
        return NotFound();

      // 3) Notifications

      // 3.a) Chef de projet
      if (ticketFromDb.Projet?.ChefProjet is { } chef)
      {
        // Email
        BackgroundJob.Enqueue(() => _emailService.SendEmailAsync(
            $"{chef.FirstName} {chef.LastName}",
            chef.Email,
            "Nouveau ticket créé",
            $"Bonjour {chef.FirstName} {chef.LastName}, un nouveau ticket #{ticket.Id} a été créé."
        ));

        // DTO commun
        var notifDto = new NotificationDto
        {
          Message = $"Nouveau ticket #{ticket.Id} créé par {ticket.Owner.FirstName} {ticket.Owner.LastName}.",
          DateEnvoi = DateTime.UtcNow,
          EntityType = "Tickets",
          EntityId = ticket.Id
        };
        BackgroundJob.Enqueue(() => _notifService.NotifyRealtimeAsync(chef.Id, notifDto));
        BackgroundJob.Enqueue(() => _notifService.NotifyPushAsync(chef.Id, notifDto));
      }

      // 3.b) Client (uniquement email)
      if (ticketFromDb.Owner is { } client)
      {
        BackgroundJob.Enqueue(() => _emailService.SendEmailAsync(
            $"{client.FirstName} {client.LastName}",
            client.Email,
            "Confirmation de création de ticket",
            $"Bonjour {client.FirstName} {client.LastName}, votre ticket #{ticket.Id} a bien été créé."
        ));
      }

      // 3.c) Super-admins
      var superAdmins = await _userService.GetUsersByRoleAsync("super admin");
      foreach (var admin in superAdmins)
      {
        BackgroundJob.Enqueue(() => _emailService.SendEmailAsync(
            $"{admin.FirstName} {admin.LastName}",
            admin.Email,
            "Nouveau ticket créé",
            $"Bonjour {admin.FirstName} {admin.LastName}, un nouveau ticket #{ticket.Id} a été créé."
        ));

        var notifDto = new NotificationDto
        {
          Message = $"Nouveau ticket #{ticket.Id} créé par {ticket.Owner.FirstName} {ticket.Owner.LastName}.",
          DateEnvoi = DateTime.UtcNow,
          EntityType = "Tickets",
          EntityId = ticket.Id
        };
        BackgroundJob.Enqueue(() => _notifService.NotifyRealtimeAsync(admin.Id, notifDto));
        BackgroundJob.Enqueue(() => _notifService.NotifyPushAsync(admin.Id, notifDto));
      }

      var resultDto = _mapper.Map<TicketDto>(ticketFromDb);
      return CreatedAtAction(nameof(GetTicket), new { id = ticket.Id }, resultDto);
    }

    [HttpPost("validate/{id}")]
    public async Task<IActionResult> ValidateTicket(int id, [FromBody] TicketValidationDto validationDto)
    {
      // 1) Récupérer l’entité ticket
      var ticket = await _ticketService.GetTicketEntityByIdAsync(id);
      if (ticket == null)
        return NotFound("Ticket non trouvé");

      var currentUserIdClaim = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier);
      var currentUserRoleClaim = HttpContext.User.FindFirst(ClaimTypes.Role);
      if (currentUserIdClaim == null || currentUserRoleClaim == null)
                return Unauthorized("Utilisateur non authentifié");

      var currentUserId = int.Parse(currentUserIdClaim.Value);
      var currentUserRole = currentUserRoleClaim.Value;

      bool isAuthorized = false;
      if (ticket.Projet?.ChefProjet != null && ticket.Projet.ChefProjet.Id == currentUserId)
        isAuthorized = true;
      else if (currentUserRole.ToLower() == "super admin" || currentUserRole.ToLower() == "chef de projet")
                isAuthorized = true;
      if (!isAuthorized)
        return Unauthorized("Vous n'êtes pas autorisé à valider ce ticket.");

      if (ticketValidationDto.IsAccepted)
      {
        var acceptedStatus = await _ticketService.GetStatusByNameAsync("Accepté");
        if (acceptedStatus == null)
          return BadRequest("Statut 'Accepté' introuvable");

        ticket.StatutId = acceptedStatus.Id;
        ticket.ApprovedAt = DateTime.UtcNow;

        if (ticket.Owner is { } client)
        {
          var notifDto = new NotificationDto
          {
            Message = $"Votre ticket #{ticket.Id} a été accepté.",
            DateEnvoi = DateTime.UtcNow,
            EntityType = "Tickets",
            EntityId = ticket.Id
          };
          BackgroundJob.Enqueue(() => _emailService.SendEmailAsync(
              $"{client.FirstName} {client.LastName}",
              client.Email,
              "Ticket accepté",
               $@"<html>
                <body style='font-family: Arial, sans-serif; color: #333; font-size: 14px;'>
                <h3>Support Technique </h3>  

                <p>Bonjour {client.FirstName} {client.LastName},</p> 

                <p>                    Ceci est une notification de validation de ticket de support .                </p>

                <p>                    Votre ticket a été accepté avec succée.                </p>

                <p>                 Vous pouvez consulter ce ticket à tout moment ici :   <a href='https://simsoft-gt.tn/#/home/Tickets/details/{ticket.Id}'  style='color: #de0b0b;  font-weight: bold; font-family: Arial, sans-serif;'>   Ticket N° {ticket.Id}     </a>    </p>

                <ul>
                    <li><strong>Sujet :</strong> {ticket.Title}</li>
                    <li><strong>Projet :</strong> {ticket.Projet.Nom}</li>
                    <li><strong>Statut :</strong> En cours</li>
                </ul>

                <p style='margin-top: 20px;'>      Nous restons à votre disposition pour toute information complémentaire.    </p>

                <p> Cordialement, </p>

                <p><strong>  Support Technique</strong> </p>

                <p> SIMSOFT TECHNOLOGIES </p>

                </body>
                </html>
                "
             
          ));
           BackgroundJob.Enqueue(() => _notifService.NotifyRealtimeAsync(client.Id, notifDto));
          BackgroundJob.Enqueue(() => _notifService.NotifyPushAsync(client.Id, notifDto));
        }

        if (ticketValidationDto.ResponsibleId.HasValue)
        {
          ticket.ResponsibleId = ticketValidationDto.ResponsibleId.Value;
          var inProgressStatus = await _ticketService.GetStatusByNameAsync("En cours");
          if (inProgressStatus == null)
            return BadRequest("Statut 'En cours' introuvable");
          ticket.StatutId = inProgressStatus.Id;

          var responsible = await _userService.GetUserByIdAsync(ticket.ResponsibleId.Value);
          if (responsible != null)
          {
            BackgroundJob.Enqueue(() => _emailService.SendEmailAsync(
                $"{responsible.FirstName} {responsible.LastName}",
                responsible.Email,
                "Nouveau ticket assigné",
                 $@"<html>
                     <body style='font-family: Arial, sans-serif; color: #333; font-size: 14px;'>
                    <h3 style='color: #2c3e50;'> Nouveau ticket de support</h3>

                    <p>Bonjour  {responsible.FirstName} {responsible.LastName},</p>

                     <p>               Ceci est une notification d'assignement de ticket de support .            </p>

                    <p>                  Vous avez été désigné comme responsable du Ticket.               </p>

                     <p>                 Vous pouvez consulter ce ticket à tout moment ici :   <a href='https://simsoft-gt.tn/#/home/Tickets/details/{ticket.Id}'  style='color: #de0b0b;  font-weight: bold; font-family: Arial, sans-serif;'>   Ticket N° {ticket.Id}     </a>    </p>

                    <ul>
                     <li><strong>Sujet :</strong> {ticket.Title}</li>
                     <li><strong>Projet :</strong> {ticket.Projet.Nom}</li>
                     <li><strong>Statut :</strong> En cours</li>
                    </ul>



                    <p> Cordialement, </p>

                    <p><strong>  Support Technique</strong> </p>

                    <p> SIMSOFT TECHNOLOGIES </p>

                    </body>
                    </html>
                    " 
            ));
            ar resp = await _userService.GetUserByIdAsync(ticket.ResponsibleId.Value);
            if (resp != null && resp.Id != currentUserId)
            {
              var notifDto = new NotificationDto
              {
                Message = $"Vous avez été désigné responsable du ticket #{ticket.Id}.",
                DateEnvoi = DateTime.UtcNow,
                EntityType = "Tickets",
                EntityId = ticket.Id
              };
              BackgroundJob.Enqueue(() => _emailService.SendEmailAsync(
                  $"{resp.FirstName} {resp.LastName}",
                  resp.Email,
                  "Nouveau ticket assigné",
                  $"Bonjour {resp.FirstName} {resp.LastName}, vous êtes responsable du ticket #{ticket.Id}."
              ));
              BackgroundJob.Enqueue(() => _notifService.NotifyRealtimeAsync(resp.Id, notifDto));
              BackgroundJob.Enqueue(() => _notifService.NotifyPushAsync(resp.Id, notifDto));
            }
          }
        }
      }
      else
      {
        // Refus
        var refusedStatus = await _ticketService.GetStatusByNameAsync("Refusé");
        if (refusedStatus == null)
          return BadRequest("Statut 'Refusé' introuvable");
        ticket.StatutId = refusedStatus.Id;
        ticket.ValidationReason = validationDto.Reason;

        if (ticket.Owner is { } client)
        {
          var notifDto = new NotificationDto
          {
            Message = $"Votre ticket #{ticket.Id} a été refusé. Raison : {validationDto.Reason}",
            DateEnvoi = DateTime.UtcNow,
            EntityType = "Tickets",
            EntityId = ticket.Id
          };
          BackgroundJob.Enqueue(() => _emailService.SendEmailAsync(
              $"{client.FirstName} {client.LastName}",
              client.Email,
              "Ticket refusé",
               $@"<html>
                <body style='font-family: Arial, sans-serif; color: #333; font-size: 14px;'>
                <h3>Support Technique </h3>  

                <p>Bonjour {client.FirstName} {client.LastName},</p>

                <p>
                    Ceci est une notification de validation de ticket de support .
                </p>

                <p>
                    Votre ticket a été  refusé.
                </p>

                <p>
                 Vous pouvez consulter ce ticket à tout moment ici :   <a href='https://simsoft-gt.tn/#/home/Tickets/details/{ticket.Id}'  style='color: #de0b0b;  font-weight: bold; font-family: Arial, sans-serif;'>   Ticket N° {ticket.Id}     </a>    </p>

                <ul>
                    <li><strong>Sujet :</strong> {ticket.Title}</li>
                    <li><strong>Projet :</strong> {ticket.Projet.Nom}</li>
                    <li><strong>Statut :</strong> Refusé </li>
                    <li><strong>Raison :</strong>  {ticket.ValidationReason} </li>
                </ul>

                <p style='margin-top: 20px;'> Nous restons à votre disposition pour toute information complémentaire.    </p>

                <p> Cordialement, </p>
                <p><strong>  Support Technique</strong> </p>
                <p> SIMSOFT TECHNOLOGIES </p>

                </body>
                </html>
                "



          ));
              
          BackgroundJob.Enqueue(() => _notifService.NotifyRealtimeAsync(client.Id, notifDto));
          BackgroundJob.Enqueue(() => _notifService.NotifyPushAsync(client.Id, notifDto));
        }
      }

      ticket.UpdatedAt = DateTime.UtcNow;

      var updateResult = await _ticketService.UpdateTicketAsync(ticket);
      if (updateResult)
        return NoContent();
      return BadRequest("La validation du ticket a échoué");
    }

    // Endpoint pour l'upload du fichier en arrière-plan
    [HttpPost("upload")]
    public async Task<IActionResult> UploadFile([FromBody] IFormFile file)
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
      var ticket = await _ticketService.GetTicketEntityByIdAsync(id);
      if (ticket == null)
        return NotFound("Ticket non trouvé");

      // Autorisation (Chef, SuperAdmin ou Responsable)
      var currentUserId = int.Parse(HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
      var role = HttpContext.User.FindFirst(ClaimTypes.Role)!.Value.ToLower();
      var isAllowed = ticket.Projet?.ChefProjet?.Id == currentUserId
                      || ticket.ResponsibleId == currentUserId
                      || role == "super admin";
      if (!isAllowed)
        return Unauthorized("Vous n'êtes pas autorisé à terminer ce ticket.");

      // Changer statut
      var newStatusName = completionDto.IsResolved ? "Résolu" : "Non Résolu";
      var newStatus = await _ticketService.GetStatusByNameAsync(newStatusName);
      if (newStatus == null)
        return BadRequest($"Statut '{newStatusName}' introuvable");

      ticket.StatutId = newStatus.Id;
      ticket.CompletionComment = completionDto.Comment;
      ticket.HoursSpent = completionDto.HoursSpent;
      ticket.SolvedAt = completionDto.CompletionDate;

      var updateResult = await _ticketService.UpdateTicketAsync(ticket);
       // 1) Notification au propriétaire
      if (ticket.Owner is { } owner)
      {
               BackgroundJob.Enqueue(() => _emailService.SendEmailAsync(
            $"{ticket.Owner.FirstName} {ticket.Owner.LastName}",
            ticket.Owner.Email,
            "Ticket terminé",
             $@"<html>
                <body style='font-family: Arial, sans-serif; color: #051678; font-size: 14px;'>
              <h3>Support Technique </h3>
                <p>Bonjour {ticket.Owner.FirstName} {ticket.Owner.LastName},</p>

                <p>              Ceci est une notification  de ticket de support .               </p>

                <p>                    Votre ticket a été  {ticket.Statut.Name}.{commentText}.                </p>
                <p>                 Vous pouvez consulter ce ticket à tout moment ici :   <a href='https://simsoft-gt.tn/#/home/Tickets/details/{ticket.Id}'  style='color: #de0b0b;  font-weight: bold; font-family: Arial, sans-serif;'>   Ticket N° {ticket.Id}     </a>    </p>
                <ul>
                    <li><strong>Sujet :</strong> {ticket.Title}</li>
                    <li><strong>Projet :</strong> {ticket.Projet.Nom}</li>
                   <li><strong>Statut :</strong> Terminer </li>
                    <li><strong>Date de début :</strong> {ticket.CreatedAt:dd/MM/yyyy HH:mm} </li>
                    <li><strong>Date de fin :</strong> {completionDto.CompletionDate:dd/MM/yyyy HH:mm} </li>
                    <li><strong>Nombre d'heures :</strong> {completionDto.HoursSpent} </li>
                </ul>


                <p> Cordialement, </p>
                <p><strong>  Support Technique</strong> </p>
                <p> SIMSOFT TECHNOLOGIES </p>

                </body>
                </html>
              "
          
        ));
        var notifDto = new NotificationDto
        {
          Message = $"Votre ticket #{ticket.Id} est {(completionDto.IsResolved ? "résolu" : "non résolu")}.",
          DateEnvoi = DateTime.UtcNow,
          EntityType = "Tickets",
          EntityId = ticket.Id
        };
        BackgroundJob.Enqueue(() => _notifService.NotifyRealtimeAsync(owner.Id, notifDto));
        BackgroundJob.Enqueue(() => _notifService.NotifyPushAsync(owner.Id, notifDto));
      }
      if (!updateResult)
        return BadRequest("La clôture du ticket a échoué");

      string commentText = !string.IsNullOrWhiteSpace(completionDto.Comment)
                             ? $" Commentaire : {completionDto.Comment}"
                             : "";

     

     // 2) Notification au chef de projet si différent
      if (ticket.Projet?.ChefProjet is { } chefProj && chefProj.Id != currentUserId)
      {
         var notifDto = new NotificationDto
        {
          Message = $"Le ticket #{ticket.Id} du projet « {ticket.Projet.Nom} » est {(completionDto.IsResolved ? "résolu" : "non résolu")}.",
          DateEnvoi = DateTime.UtcNow,
          EntityType = "Tickets",
          EntityId = ticket.Id
        };
        BackgroundJob.Enqueue(() => _notifService.NotifyRealtimeAsync(chefProj.Id, notifDto));
        BackgroundJob.Enqueue(() => _notifService.NotifyPushAsync(chefProj.Id, notifDto));
        BackgroundJob.Enqueue(() => _emailService.SendEmailAsync(
            $"{ticket.Projet.ChefProjet.FirstName} {ticket.Projet.ChefProjet.LastName}",
            ticket.Projet.ChefProjet.Email,
            "Ticket terminé",

             $@"
        <html>
        <body style='font-family: Arial, sans-serif; color: #333; font-size: 14px;'>
              
        <h3>Bonjour  {ticket.Projet.ChefProjet.FirstName} {ticket.Projet.ChefProjet.LastName},</h3>

                <p>              Ceci est une notification  de ticket de support .               </p>

                <p>                    la ticket de Mr/Mme  {ticket.Owner.FirstName} {ticket.Owner.LastName}  a été  {ticket.Statut.Name}.{commentText}.                </p>

                <p>                 Vous pouvez consulter ce ticket à tout moment ici :   <a href='https://simsoft-gt.tn/#/home/Tickets/details/{ticket.Id}'  style='color: #de0b0b;  font-weight: bold; font-family: Arial, sans-serif;'>   Ticket N° {ticket.Id}     </a>    </p>
                <ul>
                    <li><strong>Sujet :</strong> {ticket.Title}</li>
                    <li><strong>Projet :</strong> {ticket.Projet.Nom}</li>
                    <li><strong>Statut :</strong> Terminer </li>
                    <li><strong>Date de début :</strong> {ticket.CreatedAt:dd/MM/yyyy HH:mm} </li>
                    <li><strong>Date de fin :</strong> {completionDto.CompletionDate:dd/MM/yyyy HH:mm} </li>
                    <li><strong>Nombre d'heures :</strong> {completionDto.HoursSpent} </li>

                </ul>

                <p> Cordialement, </p>
                <p><strong>  Support Technique</strong> </p>
                <p> SIMSOFT TECHNOLOGIES </p>

        </body>
        </html>
          "
    
        ));
      }
 
   // 3) Notification au responsable si différent
      if (ticket.Responsible is { } resp && resp.Id != currentUserId)
      {
        var notifDto = new NotificationDto
        {
          Message = $"Le ticket #{ticket.Id} qui vous était assigné est {(completionDto.IsResolved ? "résolu" : "non résolu")}.",
          DateEnvoi = DateTime.UtcNow,
          EntityType = "Tickets",
          EntityId = ticket.Id
        };
        BackgroundJob.Enqueue(() => _notifService.NotifyRealtimeAsync(resp.Id, notifDto));
        BackgroundJob.Enqueue(() => _notifService.NotifyPushAsync(resp.Id, notifDto));
      }

     // 4) Commentaire interne
      var sb = new StringBuilder();
      sb.AppendLine($"Votre ticket est {(completionDto.IsResolved ? "résolu" : "non résolu")}.");
      // Date de début = date de création du ticket
      sb.AppendLine($"Date de début : {ticket.CreatedAt.ToLocalTime():dd/MM/yyyy HH:mm}");
      // Date de fin = date fournie dans le DTO
      sb.AppendLine($"Date de fin : {completionDto.CompletionDate.ToLocalTime():dd/MM/yyyy HH:mm}");
      // Nombre d'heures passées
      sb.AppendLine($"Nombre d'heures : {completionDto.HoursSpent}");
      // Si l’utilisateur a ajouté un commentaire, on l’ajoute aussi
      if (!string.IsNullOrWhiteSpace(completionDto.Comment))
      {
        sb.AppendLine($"Commentaire client : {completionDto.Comment}");
      }

      var commentText = sb.ToString();

      await _commentService.CreateCommentAsync(new CommentCreateDto
      {
        Contenu = commentText,
        TicketId = ticket.Id
      }, currentUserId);

      return NoContent();
    }

    [HttpPost("updateResponsible/{id}")]
    public async Task<IActionResult> UpdateResponsible(int id, [FromBody] TicketResponsibleDto responsibleDto)
    {
      var ticket = await _ticketService.GetTicketEntityByIdAsync(id);
      if (ticket == null)
        return NotFound("Erreur : Ticket non trouvé.");

      var currentUserIdClaim = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier);
      var currentUserRoleClaim = HttpContext.User.FindFirst(ClaimTypes.Role);
      if (currentUserIdClaim == null || currentUserRoleClaim == null)
        return Unauthorized("Erreur : Utilisateur non authentifié.");

      var currentUserId = int.Parse(currentUserIdClaim.Value);
      var currentUserRole = currentUserRoleClaim.Value.ToLower();
  
      bool isAuthorized = false;
      if (ticket.Projet?.ChefProjet != null && ticket.Projet.ChefProjet.Id == currentUserId)
        isAuthorized = true;
      else if (currentUserRole == "super admin" || currentUserRole ==  "chef de projet")
        isAuthorized = true;
      else if (ticket.ResponsibleId.HasValue && ticket.ResponsibleId.Value == currentUserId)
        isAuthorized = true;

      if (!isAuthorized)
        return Unauthorized("Erreur : Vous n'êtes pas autorisé à modifier le responsable.");

      if (ticket.ResponsibleId.HasValue && ticket.ResponsibleId.Value == responsibleDto.ResponsibleId)
      {
        return BadRequest("Erreur : Le responsable n'a pas été modifié.");
      }

      ticket.ResponsibleId = responsibleDto.ResponsibleId;
      var updateResult = await _ticketService.UpdateTicketAsync(ticket);
      if (!updateResult)
        return BadRequest("Erreur : La mise à jour du responsable a échoué.");

      var responsible = await _userService.GetUserByIdAsync(ticket.ResponsibleId.Value);
      if (responsible != null)
      {
       /// send Notif
          var notifDto = new NotificationDto
        {
          Message = $"Vous avez été désigné responsable du ticket #{ticket.Id}.",
          DateEnvoi = DateTime.UtcNow,
          EntityType = "Tickets",
          EntityId = ticket.Id
        };
        BackgroundJob.Enqueue(() => _emailService.SendEmailAsync(
            $"{newResp.FirstName} {newResp.LastName}",
            newResp.Email,
            "Nouveau responsable de ticket",
            $"Bonjour {newResp.FirstName} {newResp.LastName}, vous êtes désormais responsable du ticket #{ticket.Id}."
        ));
        BackgroundJob.Enqueue(() => _notifService.NotifyRealtimeAsync(newResp.Id, notifDto));
        BackgroundJob.Enqueue(() => _notifService.NotifyPushAsync(newResp.Id, notifDto));
        //send mail
        BackgroundJob.Enqueue(() => _emailService.SendEmailAsync(
          $"{responsible.FirstName} {responsible.LastName}",
          responsible.Email,

           "Nouveau ticket assigné",
                 $@"<html>
                     <body style='font-family: Arial, sans-serif; color: #333; font-size: 14px;'>
                    <h3 style='color: #2c3e50;'> Nouveau ticket de support</h3>

                    <p>Bonjour  {responsible.FirstName} {responsible.LastName},</p>

                     <p>               Ceci est une notification d'assignement de ticket de support .            </p>

                    <p>                  Vous avez été désigné comme responsable du Ticket.               </p>

                     <p>                 Vous pouvez consulter ce ticket à tout moment ici :   <a href='https://simsoft-gt.tn/#/home/Tickets/details/{ticket.Id}'  style='color: #de0b0b;  font-weight: bold; font-family: Arial, sans-serif;'>   Ticket N° {ticket.Id}     </a>    </p>

                    <ul>
                     <li><strong>Sujet :</strong> {ticket.Title}</li>
                     <li><strong>Projet :</strong> {ticket.Projet.Nom}</li>
                     <li><strong>Statut :</strong> En cours</li>
                    </ul>
 

                    <p> Cordialement, </p>

                    <p><strong>  Support Technique</strong> </p>

                    <p> SIMSOFT TECHNOLOGIES </p>

                    </body>
                    </html>
                    "
         
        ));
      }

      return NoContent();
    }

    [HttpGet("status-count")]
    public IActionResult GetTicketCountByStatus()
    {
      var userIdClaim = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier);
      var roleClaim = HttpContext.User.FindFirst(ClaimTypes.Role);
      if (userIdClaim == null || roleClaim == null)
      {
        return Unauthorized("Utilisateur non authentifié.");
      }

      int userId = int.Parse(userIdClaim.Value);
      string role = roleClaim.Value;

      var result = _ticketService.GetTicketCountByStatus(userId, role);
      return Ok(result);
    }

    [HttpPost("export")]
    public async Task<IActionResult> ExportTickets([FromBody] TicketFilterParams filterParams)
    {
      var userIdClaim = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier);
      var roleClaim = HttpContext.User.FindFirst(ClaimTypes.Role);
      if (userIdClaim != null && roleClaim != null)
      {
        filterParams.UserId = int.Parse(userIdClaim.Value);
        filterParams.Role = roleClaim.Value;
      }

      var tickets = await _ticketService.GetTicketsFilteredAsync(filterParams);
      var ticketExportDtos = _mapper.Map<IEnumerable<TicketExportDto>>(tickets);
      var content = _excelExportService.ExportToExcel(ticketExportDtos, "Tickets");

      return File(content,
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          $"TicketsExport_{DateTime.Now:yyyyMMddHHmmss}.xlsx");
    }

  }
}
