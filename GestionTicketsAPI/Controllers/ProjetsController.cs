using System.Security.Claims;
using AutoMapper;
using GestionTicketsAPI.DTOs;
using GestionTicketsAPI.Extensions;
using GestionTicketsAPI.Helpers;
using GestionTicketsAPI.Interfaces;
using GestionTicketsAPI.Services;
using Hangfire;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
namespace GestionTicketsAPI.Controllers
{
  [ApiController]
  [Authorize]
  public class ProjetsController : BaseApiController
  {
    private readonly IProjetService _projetService;
    private readonly EmailService _emailService;
    private readonly ExcelExportServiceClosedXML _excelExportService;
    private readonly IMapper _mapper;

    public ProjetsController(ExcelExportServiceClosedXML excelExportService, IMapper mapper, IProjetService projetService, EmailService emailService)
    {
      _projetService = projetService;
      _emailService = emailService;
      _mapper = mapper;
      _excelExportService = excelExportService;
    }

    // Récupérer tous les projets
    [HttpPost("search")]
    public async Task<ActionResult<IEnumerable<ProjetDto>>> GetProjects([FromBody] ProjectFilterParams filterParams)
    {
      // Extraction des infos de l'utilisateur connecté
      var userIdClaim = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier);
      var roleClaim = HttpContext.User.FindFirst(ClaimTypes.Role);
      if (userIdClaim != null && roleClaim != null)
      {
        filterParams.UserId = int.Parse(userIdClaim.Value);
        filterParams.Role = roleClaim.Value.ToLower().Trim();
      }

      var pagedProjects = await _projetService.GetProjetsPagedAsync(filterParams);

      var pagination = new
      {
        currentPage = pagedProjects.CurrentPage,
        pageSize = pagedProjects.PageSize,
        totalItems = pagedProjects.TotalCount,
        totalPages = pagedProjects.TotalPages
      };
      Response.Headers["Pagination"] = JsonConvert.SerializeObject(pagination);
      return Ok(pagedProjects);
    }

    // Récupérer les projets paginés
    [HttpPost("paged")]
    public async Task<ActionResult<PagedList<ProjetDto>>> GetProjetsPaged([FromBody] ProjectFilterParams filterParams)
    {
      Console.WriteLine($"Role: {filterParams.Role}, UserId: {filterParams.UserId}");
      var projetsPaged = await _projetService.GetProjetsPagedAsync(filterParams);
      Response.AddPaginationHeader(projetsPaged);
      return Ok(projetsPaged);
    }


    // Récupérer un projet par ID
    [HttpGet("{id}")]
    public async Task<ActionResult<ProjetDto>> GetProjet(int id)
    {
      var projetDto = await _projetService.GetProjetByIdAsync(id);
      if (projetDto == null)
        return NotFound();
      return Ok(projetDto);
    }

    // Ajouter un projet
    [HttpPost("ajouterProjet")]
    public async Task<ActionResult<ProjetDto>> PostProjet([FromBody] ProjetDto projetDto)
    {
      // Vérifier l'existence d'un projet avec le même nom (ou autre critère d'unicité)
      if (await _projetService.ProjetExists(projetDto.Nom))
        return BadRequest("Le projet existe déjà");

      // Création du projet
      var createdProjetDto = await _projetService.AddProjetAsync(projetDto);

      // Envoi d'un e-mail au chef de projet si défini
      if (createdProjetDto.ChefProjet != null)
      {
        // Le contenu de l'e-mail peut être personnalisé
        BackgroundJob.Enqueue(() => _emailService.SendEmailAsync(
            $"{createdProjetDto.ChefProjet.FirstName} {createdProjetDto.ChefProjet.LastName}",
            createdProjetDto.ChefProjet.Email,
            "Désignation en tant que Chef de Projet",
            $"Vous avez été désigné comme chef du projet {createdProjetDto.Nom}."
        ));
      }

      return CreatedAtAction(nameof(GetProjet), new { id = createdProjetDto.Id }, createdProjetDto);
    }


    // Mettre à jour un projet
    [HttpPost("modifierProjet/{id}")]
    public async Task<IActionResult> PutProjet(int id, [FromBody] ProjetUpdateDto projetUpdateDto)
    {
      if (id != projetUpdateDto.Id)
        return BadRequest("L'ID du projet ne correspond pas.");

      var result = await _projetService.UpdateProjetAsync(id, projetUpdateDto);
      if (!result)
        return NotFound();
      return NoContent();
    }


    // Supprimer un projet
    [HttpGet("supprimerProjet/{id}")]
    public async Task<IActionResult> DeleteProjet(int id)
    {
      var result = await _projetService.DeleteProjetAsync(id);
      if (!result)
        return NotFound();
      return NoContent();
    }

    // Supprimer plusieurs projets
    [HttpGet("supprimerProjets")]
    public async Task<IActionResult> DeleteProjets([FromBody] List<int> ids)
    {
      if (ids == null || !ids.Any())
        return BadRequest("Aucun identifiant fourni.");

      var result = await _projetService.DeleteProjetsAsync(ids);
      if (!result)
        return NotFound("Un ou plusieurs projets non trouvés.");
      return NoContent();
    }

    // Ajouter un utilisateur au projet
    [HttpPost("{projetId}/utilisateurs")]
    public async Task<IActionResult> AjouterUtilisateurAuProjet(int projetId, [FromBody] ProjetUserDto projetUserDto)
    {
      try
      {
        var result = await _projetService.AjouterUtilisateurAuProjetAsync(projetId, projetUserDto);
        if (!result)
          return NotFound("Projet ou utilisateur non trouvé.");
        return Ok(new { message = "Utilisateur ajouté au projet avec succès." });
      }
      catch (InvalidOperationException ex)
      {
        // Renvoyer un statut 409 Conflict pour signaler le conflit
        return Conflict(new { message = ex.Message });
      }
    }




    // Récupérer les membres d'un projet
    [HttpGet("membres/{projetId}")]
    public async Task<IActionResult> GetMembresProjet(int projetId)
    {
      var membres = await _projetService.GetMembresProjetAsync(projetId);
      return Ok(membres);
    }

    // Supprimer un utilisateur d'un projet
    [HttpGet("delete/{projetId}/utilisateurs/{userId}")]
    public async Task<IActionResult> SupprimerUtilisateurDuProjet(int projetId, int userId)
    {
      var result = await _projetService.SupprimerUtilisateurDuProjetAsync(projetId, userId);
      if (!result)
        return NotFound();
      return NoContent();
    }

    // Supprimer plusieurs utilisateurs d'un projet
    [HttpGet("supprimerUtilisateursDuProjet")]
    public async Task<IActionResult> SupprimerUtilisateursDuProjet([FromBody] ProjetUsersDeleteDto deleteDto)
    {
      if (deleteDto == null || deleteDto.UserIds == null || !deleteDto.UserIds.Any())
        return BadRequest("Aucun utilisateur spécifié.");

      foreach (var userId in deleteDto.UserIds)
      {
        var result = await _projetService.SupprimerUtilisateurDuProjetAsync(deleteDto.ProjetId, userId);
        if (!result)
          return NotFound($"Utilisateur {userId} non trouvé dans le projet {deleteDto.ProjetId}.");
      }

      return NoContent();
    }

    [HttpGet("user")]
    public async Task<IActionResult> GetUserProjets()
    {
      var userIdClaim = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier);
      if (userIdClaim == null)
        return Unauthorized();

      int userId = int.Parse(userIdClaim.Value);
      var projets = await _projetService.GetProjetsForUserAsync(userId);
      return Ok(projets);
    }

    [HttpGet("societe/{societeId}")]
    public async Task<ActionResult<IEnumerable<ProjetDto>>> GetProjetsBySocieteId(int societeId)
    {
      var projetsDto = await _projetService.GetProjetsBySocieteIdAsync(societeId);
      if (projetsDto == null || !projetsDto.Any())
        return NotFound($"Aucun projet trouvé pour la société ID {societeId}.");

      return Ok(projetsDto);
    }

    [HttpPost("export")]
    public async Task<IActionResult> ExportProjects([FromBody] ProjectFilterParams filterParams)
    {
      // Extraction des infos de l'utilisateur connecté
      var userIdClaim = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier);
      var roleClaim = HttpContext.User.FindFirst(ClaimTypes.Role);
      if (userIdClaim != null && roleClaim != null)
      {
        filterParams.UserId = int.Parse(userIdClaim.Value);
        filterParams.Role = roleClaim.Value;
      }

      var projects = await _projetService.GetProjetsFilteredAsync(filterParams);
      var projectExportDtos = _mapper.Map<IEnumerable<ProjectExportDto>>(projects);
      var content = _excelExportService.ExportToExcel(projectExportDtos, "Projects");
      return File(content,
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          $"ProjectsExport_{DateTime.Now:yyyyMMddHHmmss}.xlsx");
    }

  }
}
