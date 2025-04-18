using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using AutoMapper;
using GestionTicketsAPI.DTOs;
using GestionTicketsAPI.Entities;
using GestionTicketsAPI.Extensions;
using GestionTicketsAPI.Helpers;
using GestionTicketsAPI.Interfaces;
using GestionTicketsAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GestionTicketsAPI.Controllers
{
  [ApiController]
  public class SocieteController : BaseApiController

  {
    private readonly ISocieteService _societeService;
    private readonly ExcelExportServiceClosedXML _excelExportService;
    private readonly IMapper _mapper;

    public SocieteController(ExcelExportServiceClosedXML excelExportService, IMapper mapper, ISocieteService societeService)
    {
      _societeService = societeService;
      _mapper = mapper;
      _excelExportService = excelExportService;
    }

    // GET: api/Societe?searchTerm=...
    [HttpPost("search")]
    public async Task<IActionResult> GetSocietes([FromBody] JsonElement body)
    {
      // Tente de récupérer la propriété "searchTerm" depuis le corps JSON
      string? searchTerm = body.TryGetProperty("searchTerm", out JsonElement searchTermProp)
                           ? searchTermProp.GetString()
                           : null;

      var societes = await _societeService.GetAllSocietesAsync(searchTerm);
      return Ok(societes);
    }

    // GET: api/Societe/paged?PageNumber=1&PageSize=10&SearchTerm=...
    [HttpPost("paged")]
    public async Task<ActionResult<PagedList<SocieteDto>>> GetSocietesPaged([FromBody] UserParams userParams)
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

    // GET: api/Societe/details/5
    [HttpGet("details/{id}")]
    public async Task<IActionResult> GetSocieteDetails(int id)
    {
      var societeDetails = await _societeService.GetSocieteWithDetailsByIdAsync(id);
      if (societeDetails == null)
        return NotFound();
      return Ok(societeDetails);
    }



    [HttpPost]
    public async Task<IActionResult> AddSociete([FromBody] SocieteDto societe)
    {
            try
            { 
                //SocieteDto societe = JsonSerializer.Deserialize<SocieteDto>(societeDto.test);

                if (await _societeService.SocieteExists(societe.Nom))
                    return BadRequest("La société existe déjà");

                var newSociete = await _societeService.AddSocieteAsync(societe);
                return CreatedAtAction(nameof(GetSociete), new { id = newSociete.Id }, newSociete);
            }
            catch (Exception ex) {
                Console.WriteLine("Erreur : " + ex.Message);
                return StatusCode(500, $"Une erreur est survenue : {ex.Message}");

            }
    }

    [HttpPost("modif/{id}")]
    public async Task<IActionResult> UpdateSociete(int id, SocieteDto societeDto)
    {
      var updated = await _societeService.UpdateSocieteAsync(id, societeDto);
      if (!updated)
        return NotFound("Société introuvable ou mise à jour échouée");
      return NoContent();
    }


    // DELETE: api/Societe/5
    [HttpGet("delet/{id}")]
    public async Task<IActionResult> DeleteSociete(int id)
    {
      var deleted = await _societeService.DeleteSocieteAsync(id);
      if (!deleted)
        return NotFound();
      return NoContent();
    }

    // DELETE: api/Societe/supprimerSocietes
    [HttpGet("supprimerSocietes")]
    public async Task<IActionResult> DeleteSocietes([FromBody] List<int> ids)
    {
      if (ids == null || !ids.Any())
        return BadRequest("Aucun identifiant fourni.");

      var result = await _societeService.DeleteSocietesAsync(ids);
      if (!result)
        return NotFound("Une ou plusieurs sociétés n'ont pas été trouvées.");
      return NoContent();
    }

    // GET: api/Societe/5/users/paged?PageNumber=1&PageSize=10&SearchTerm=...
    [HttpPost("{societeId}/users/paged")]
    public async Task<ActionResult<PagedList<UserDto>>> GetSocieteUsersPaged(
        int societeId,
        [FromBody] UserParams userParams)
    {
      var usersPaged = await _societeService.GetSocieteUsersPagedAsync(societeId, userParams);
      Response.AddPaginationHeader(usersPaged);
      return Ok(usersPaged);
    }

    [HttpPost("{societeId}/users/{userId}")]
    public async Task<IActionResult> AttachUser(int societeId, int userId)
    {
      
      try
      {
        bool attached = await _societeService.AttachUserToSocieteAsync(societeId, userId);
        if (attached)
        {
          return Ok("Utilisateur attaché à la société avec succès.");
        }
        else
        {
          return Conflict("Cet utilisateur est déjà attaché à la société.");

        }
      }
      catch (Exception ex)
      {
        // Loggez l'exception en détail pour analyser le problème
        return StatusCode(500, new { message = ex.Message });
      }
    }
    


    [HttpGet("{societeId}/delete/users/{userId}")]
    public async Task<IActionResult> DetachUser(int societeId, int userId)
    {
      if (await _societeService.DetachUserFromSocieteAsync(societeId, userId))
        return Ok("Utilisateur détaché de la société avec succès.");
      return BadRequest("Aucune association trouvée ou une erreur est survenue.");
    }

    [HttpPost("export")]
    public async Task<IActionResult> ExportSocietes([FromBody] JsonElement body)
    {
      // Récupérer les propriétés "searchTerm" et "pays" depuis le corps JSON
      string? searchTerm = body.TryGetProperty("searchTerm", out JsonElement searchTermProp)
                           ? searchTermProp.GetString()
                           : null;
      string? pays = body.TryGetProperty("pays", out JsonElement paysProp)
                     ? paysProp.GetString()
                     : null;

      // Récupérer les sociétés filtrées
      var societes = await _societeService.GetAllSocietesAsync(searchTerm, pays);

      // Mapper vers le DTO d'export
      var societesExportDto = _mapper.Map<IEnumerable<SocieteExportDto>>(societes);

      // Générer le fichier Excel
      var content = _excelExportService.ExportToExcel(societesExportDto, "Societes");

      return File(content,
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          $"SocietesExport_{DateTime.Now:yyyyMMddHHmmss}.xlsx");
    }
  }
}
