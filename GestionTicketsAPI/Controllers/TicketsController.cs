using AutoMapper;
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

    public TicketsController(ITicketService ticketService, IMapper mapper)
    {
      _ticketService = ticketService;
      _mapper = mapper;
    }

    // GET api/tickets?...
    [HttpGet]
    public async Task<ActionResult<IEnumerable<TicketDto>>> GetTickets([FromQuery] UserParams ticketParams)
    {
      var pagedTickets = await _ticketService.GetTicketsPagedAsync(ticketParams);

      // Création de l'objet de pagination
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
      // Mappe le TicketCreateDto en entité Ticket
      var ticket = _mapper.Map<Ticket>(ticketCreateDto);
      ticket.DateCreation = DateTime.UtcNow;

      await _ticketService.AddTicketAsync(ticket);

      // Retourne le DTO créé
      var ticketDto = _mapper.Map<TicketDto>(ticket);
      return CreatedAtAction(nameof(GetTicket), new { id = ticket.Id }, ticketDto);
    }

    // POST api/tickets/withAttachment
    [HttpPost("withAttachment")]
    public async Task<ActionResult<TicketDto>> CreateTicketWithAttachment([FromForm] TicketCreateDto ticketDto)
    {
      string? filePath = null;
      if (ticketDto.Attachment != null)
      {
        var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
        if (!Directory.Exists(uploadsFolder))
        {
          Directory.CreateDirectory(uploadsFolder);
        }
        var uniqueFileName = Guid.NewGuid().ToString() + "_" + Path.GetFileName(ticketDto.Attachment.FileName);
        filePath = Path.Combine("uploads", uniqueFileName);
        var fullPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", filePath);
        using (var stream = new FileStream(fullPath, FileMode.Create))
        {
          await ticketDto.Attachment.CopyToAsync(stream);
        }
      }

      // Mappe le DTO en entité Ticket et affecte le chemin de l'attachement
      var ticket = _mapper.Map<Ticket>(ticketDto);
      ticket.DateCreation = DateTime.UtcNow;
      ticket.Attachement = filePath;

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

      // On mappe le DTO en entité pour la mise à jour
      var ticket = _mapper.Map<Ticket>(ticketDto);
      var result = await _ticketService.UpdateTicketAsync(ticket);
      if (result) return NoContent();

      return BadRequest("La mise à jour du ticket a échoué");
    }

    // DELETE api/tickets/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTicket(int id)
    {
      // On récupère le ticket à supprimer
      var ticketDto = await _ticketService.GetTicketByIdAsync(id);
      if (ticketDto == null) return NotFound();

      // On mappe le DTO en entité pour la suppression
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
