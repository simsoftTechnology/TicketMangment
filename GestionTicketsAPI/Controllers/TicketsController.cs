using AutoMapper;
using CloudinaryDotNet.Actions;
using GestionTicketsAPI.DTOs;
using GestionTicketsAPI.Entities;
using GestionTicketsAPI.Helpers;
using GestionTicketsAPI.Interfaces;
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

    public TicketsController(ITicketService ticketService, IMapper mapper, IPhotoService photoService)
    {
      _ticketService = ticketService;
      _mapper = mapper;
      _photoService = photoService;
    }

    // GET api/tickets?...
    [HttpGet]
    public async Task<ActionResult<IEnumerable<TicketDto>>> GetTickets([FromQuery] UserParams ticketParams)
    {
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
    public async Task<ActionResult<TicketDto>> CreateTicket([FromBody] TicketCreateDto ticketCreateDto)
    {
      var ticket = _mapper.Map<Ticket>(ticketCreateDto);
      ticket.CreatedAt = DateTime.UtcNow;
      await _ticketService.AddTicketAsync(ticket);
      var ticketDto = _mapper.Map<TicketDto>(ticket);
      return CreatedAtAction(nameof(GetTicket), new { id = ticket.Id }, ticketDto);
    }

    // POST api/tickets/withAttachment
    [HttpPost("withAttachment")]
    public async Task<ActionResult<TicketDto>> CreateTicketWithAttachment([FromForm] TicketCreateDto ticketDto)
    {
      UploadResult uploadResult = null;
      if (ticketDto.Attachment != null)
      {
        uploadResult = await _photoService.UploadFileAsync(ticketDto.Attachment);
        if (uploadResult.Error != null)
          return BadRequest(uploadResult.Error.Message);
      }
      var ticket = _mapper.Map<Ticket>(ticketDto);
      ticket.CreatedAt = DateTime.UtcNow;
      if (uploadResult?.SecureUrl != null)
      {
        ticket.Attachments = uploadResult.SecureUrl.AbsoluteUri;
      }
      await _ticketService.AddTicketAsync(ticket);
      var resultDto = _mapper.Map<TicketDto>(ticket);
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
