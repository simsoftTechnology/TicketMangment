using GestionTicketsAPI.DTOs;
using GestionTicketsAPI.Entities;
using GestionTicketsAPI.Services;
using Microsoft.AspNetCore.Mvc;

namespace GestionTicketsAPI.Controllers;

[Route("api/[controller]")]
[ApiController]
public class SocieteController : ControllerBase
{
    private readonly SocieteService _societeService;

    public SocieteController(SocieteService societeService)
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

    // GET: api/Societe/5
    [HttpGet("{id}")]
    public async Task<IActionResult> GetSociete(int id)
    {
        var societe = await _societeService.GetSocieteByIdAsync(id);
        if (societe == null) return NotFound();

        return Ok(societe);
    }

    // POST: api/Societe
    [HttpPost]
    public async Task<IActionResult> AddSociete(SocieteDto societeDto)
    {
        var societe = new Societe
        {
            Nom = societeDto.Nom,
            Adresse = societeDto.Adresse,
            Telephone = societeDto.Telephone
        };

        var newSociete = await _societeService.AddSocieteAsync(societe);
        return CreatedAtAction(nameof(GetSociete), new { id = newSociete.Id }, newSociete);
    }

    // PUT: api/Societe/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateSociete(int id, SocieteDto societeDto)
    {
        var existingSociete = await _societeService.GetSocieteByIdAsync(id);
        if (existingSociete == null) return NotFound();

        existingSociete.Nom = societeDto.Nom;
        existingSociete.Adresse = societeDto.Adresse;
        existingSociete.Telephone = societeDto.Telephone;

        var updated = await _societeService.UpdateSocieteAsync(existingSociete);
        if (!updated) return BadRequest("Échec de la mise à jour");

        return NoContent();
    }

    // DELETE: api/Societe/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteSociete(int id)
    {
        var deleted = await _societeService.DeleteSocieteAsync(id);
        if (!deleted) return NotFound();

        return NoContent();
    }
}
