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
        totalCount = pagedTickets.TotalCount,
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

      // Assignation automatique des valeurs désirées
      ticket.StatutId = 5;
      ticket.ValidationId = 4;

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
            $"Le client '{ticket.Owner.FirstName} {ticket.Owner.LastName}' a créé un nouveau ticket intitulé '{ticket.Title}' pour le projet '{ticketFromDb.Projet.Nom}'."
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
            $"Le client '{ticket.Owner.FirstName} {ticket.Owner.LastName}' a créé un nouveau ticket intitulé '{ticket.Title}'. Veuillez vérifier les détails dans l'application."
        );
      }

      var resultDto = _mapper.Map<TicketDto>(ticketFromDb);
      return CreatedAtAction(nameof(GetTicket), new { id = ticket.Id }, resultDto);
    }


    // PUT api/tickets/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTicket(int id, [FromBody] TicketDto ticketDto)
    {
      if (id != ticketDto.Id)
        return BadRequest("L'ID du ticket ne correspond pas");

      // Récupère l'entité existante
      var existingTicket = await _ticketService.GetTicketEntityByIdAsync(id);
      if (existingTicket == null)
        return NotFound();

      // Mettez à jour uniquement les champs modifiables
      existingTicket.Title = ticketDto.Title;
      existingTicket.Description = ticketDto.Description;
      existingTicket.PriorityId = ticketDto.PriorityId;
      existingTicket.QualificationId = ticketDto.QualificationId;
      existingTicket.ProjetId = ticketDto.ProjetId;
      existingTicket.ProblemCategoryId = ticketDto.ProblemCategoryId;
      existingTicket.StatutId = ticketDto.StatutId;
      existingTicket.UpdatedAt = DateTime.UtcNow;

      var result = await _ticketService.UpdateTicketAsync(existingTicket);
      if (result)
        return NoContent();

      return BadRequest("La mise à jour du ticket a échoué");
    }

    // PUT api/tickets/withAttachment/{id}
    [HttpPut("withAttachment/{id}")]
    public async Task<ActionResult<TicketDto>> UpdateTicketWithAttachment(int id, [FromForm] TicketCreateDto ticketDto)
    {
      var existingTicket = await _ticketService.GetTicketEntityByIdAsync(id);
      if (existingTicket == null)
        return NotFound();

      if (ticketDto.Attachment != null)
      {
        var uploadResult = await _photoService.UploadFileAsync(ticketDto.Attachment);
        if (uploadResult.Error != null)
          return BadRequest(uploadResult.Error.Message);

        if (uploadResult.SecureUrl != null)
          existingTicket.Attachments = uploadResult.SecureUrl.AbsoluteUri;
      }

      existingTicket.Title = ticketDto.Title;
      existingTicket.Description = ticketDto.Description;
      existingTicket.QualificationId = ticketDto.QualificationId;
      existingTicket.ProjetId = ticketDto.ProjetId;
      existingTicket.ProblemCategoryId = ticketDto.ProblemCategoryId;
      existingTicket.PriorityId = ticketDto.PriorityId;
      existingTicket.UpdatedAt = DateTime.UtcNow;

      var result = await _ticketService.UpdateTicketAsync(existingTicket);
      if (!result)
        return BadRequest("La mise à jour du ticket a échoué");

      var updatedTicketDto = _mapper.Map<TicketDto>(existingTicket);
      return Ok(updatedTicketDto);
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
  }
}
