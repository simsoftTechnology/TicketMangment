using GestionTicketsAPI.DTOs;
using GestionTicketsAPI.Entities;
using GestionTicketsAPI.Extensions;
using GestionTicketsAPI.Helpers;
using GestionTicketsAPI.Interfaces;
using GestionTicketsAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GestionTicketsAPI.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class SocieteController : ControllerBase
{
  private readonly ISocieteService _societeService;

  public SocieteController(ISocieteService societeService)
  {
    _societeService = societeService;
  }

  // GET: api/Societe
  [HttpGet]
  public async Task<IActionResult> GetSocietes()
  {
    var societes = await _societeService.GetAllSocietesAsync();
    return Ok(societes);
  }

  // Nouvel endpoint pour la pagination

  [HttpGet("paged")]
  public async Task<ActionResult<PagedList<SocieteDto>>> GetSocietesPaged([FromQuery] UserParams userParams)
  {
    var societesPaged = await _societeService.GetSocietesPagedAsync(userParams);
    Response.AddPaginationHeader(societesPaged); // Ajoute les métadonnées de pagination dans l'en-tête HTTP
    return Ok(societesPaged);
  }

  // GET: api/Societe/5
  [HttpGet("{id}")]
  public async Task<IActionResult> GetSociete(int id)
  {
    var societe = await _societeService.GetSocieteByIdAsync(id);
    if (societe == null)
      return NotFound();
    return Ok(societe);
  }

  [HttpGet("details/{id}")]
  public async Task<IActionResult> GetSocieteDetails(int id)
  {
    var societeDetails = await _societeService.GetSocieteWithDetailsByIdAsync(id);
    if (societeDetails == null)
    {
      return NotFound();
    }
    return Ok(societeDetails);
  }

  // POST: api/Societe
  [HttpPost]
  public async Task<IActionResult> AddSociete(SocieteDto societeDto)
  {
    var newSociete = await _societeService.AddSocieteAsync(societeDto);
    return CreatedAtAction(nameof(GetSociete), new { id = newSociete.Id }, newSociete);
  }

  // PUT: api/Societe/5
  [HttpPut("{id}")]
  public async Task<IActionResult> UpdateSociete(int id, SocieteDto societeDto)
  {
    var updated = await _societeService.UpdateSocieteAsync(id, societeDto);
    if (!updated)
      return NotFound("Société introuvable ou mise à jour échouée");
    return NoContent();
  }

  // DELETE: api/Societe/5
  [HttpDelete("{id}")]
  public async Task<IActionResult> DeleteSociete(int id)
  {
    var deleted = await _societeService.DeleteSocieteAsync(id);
    if (!deleted)
      return NotFound();
    return NoContent();
  }
}