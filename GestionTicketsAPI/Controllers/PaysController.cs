using AutoMapper;
using GestionTicketsAPI.DTOs;
using GestionTicketsAPI.Interfaces;
using GestionTicketsAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GestionTicketsAPI.Controllers
{
  [Route("api/[controller]")]
  [ApiController]
  public class PaysController : BaseApiController
  {
    private readonly IPaysService _paysService;

    public PaysController(IPaysService paysService)
    {
      _paysService = paysService;
    }

    [Authorize]
    [HttpGet("getPays")]
    public async Task<ActionResult<IEnumerable<PaysDto>>> GetPays([FromQuery] string? searchTerm)
    {
      if (!string.IsNullOrWhiteSpace(searchTerm))
      {
        var filteredPays = await _paysService.GetPaysAsync(searchTerm);
        return Ok(filteredPays);
      }
      else
      {
        var allPays = await _paysService.GetPaysAsync();
        return Ok(allPays);
      }
    }

    [Authorize]
    [HttpGet("{idPays}")]
    public async Task<ActionResult<PaysDto>> GetPaysById(int idPays)
    {
      var pays = await _paysService.GetPaysByIdAsync(idPays);
      if (pays == null) return NotFound("Le pays spécifié n'existe pas.");
      return Ok(pays);
    }

    [Authorize]
    [HttpPut("ModifierPays/{idPays}")]
    public async Task<ActionResult> UpdatePays(int idPays, [FromForm] PaysUpdateDto paysUpdateDto, IFormFile? file)
    {
      var updated = await _paysService.UpdatePaysAsync(idPays, paysUpdateDto, file);
      if (!updated) return BadRequest("Erreur lors de la mise à jour du pays.");
      return NoContent();
    }

    [Authorize]
    [HttpPost("ajouterPays")]
    public async Task<ActionResult<PaysDto>> AddPays([FromForm] string nom, [FromForm] string? codeTel, IFormFile file)
    {
      // Vérifier si le pays existe déjà en fonction de son nom
      if (await _paysService.PaysExists(nom))
        return BadRequest("Le pays existe déjà");

      try
      {
        var paysDto = await _paysService.AddPaysAsync(nom, codeTel, file);
        return CreatedAtAction(nameof(GetPays), new { idPays = paysDto.IdPays }, paysDto);
      }
      catch (Exception ex)
      {
        return BadRequest(ex.Message);
      }
    }



    [Authorize]
    [HttpDelete("supprimerPays/{idPays}")]
    public async Task<ActionResult> DeletePays(int idPays)
    {
      var deleted = await _paysService.DeletePaysAsync(idPays);
      if (!deleted) return BadRequest("Erreur lors de la suppression du pays.");
      return NoContent();
    }

    [HttpPost("{idPays}/add-photo")]
    public async Task<ActionResult<PhotoDto>> AddPhoto(int idPays, IFormFile file)
    {
      try
      {
        var photoDto = await _paysService.AddPhotoAsync(idPays, file);
        return CreatedAtAction(nameof(GetPays), new { idPays = idPays }, photoDto);
      }
      catch (Exception ex)
      {
        return BadRequest(ex.Message);
      }
    }
  }
}
