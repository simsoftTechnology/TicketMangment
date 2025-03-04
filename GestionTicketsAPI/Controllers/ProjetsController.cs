using GestionTicketsAPI.DTOs;
using GestionTicketsAPI.Extensions;
using GestionTicketsAPI.Helpers;
using GestionTicketsAPI.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
namespace GestionTicketsAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ProjetsController : BaseApiController
    {
        private readonly IProjetService _projetService;

        public ProjetsController(IProjetService projetService)
        {
            _projetService = projetService;
        }

        // Récupérer tous les projets
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProjetDto>>> GetProjets()
        {
            var projetsDto = await _projetService.GetProjetsAsync();
            return Ok(projetsDto);
        }

        // Récupérer les projets paginés
        [HttpGet("paged")]
        public async Task<ActionResult<PagedList<ProjetDto>>> GetProjetsPaged([FromQuery] UserParams projetParams)
        {
            var projetsPaged = await _projetService.GetProjetsPagedAsync(projetParams);
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
            var createdProjetDto = await _projetService.AddProjetAsync(projetDto);
            return CreatedAtAction(nameof(GetProjet), new { id = createdProjetDto.Id }, createdProjetDto);
        }

        // Mettre à jour un projet
        [HttpPut("modifierProjet/{id}")]
        public async Task<IActionResult> PutProjet(int id, [FromBody] ProjetDto projetDto)
        {
            if (id != projetDto.Id)
                return BadRequest("L'ID du projet ne correspond pas.");
            var result = await _projetService.UpdateProjetAsync(id, projetDto);
            if (!result)
                return NotFound();
            return NoContent();
        }

        // Supprimer un projet
        [HttpDelete("supprimerProjet/{id}")]
        public async Task<IActionResult> DeleteProjet(int id)
        {
            var result = await _projetService.DeleteProjetAsync(id);
            if (!result)
                return NotFound();
            return NoContent();
        }

        // Supprimer plusieurs projets
        [HttpDelete("supprimerProjets")]
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
            var result = await _projetService.AjouterUtilisateurAuProjetAsync(projetId, projetUserDto);
            if (!result)
                return NotFound("Projet ou utilisateur non trouvé.");
            return Ok(new { message = "Utilisateur ajouté au projet avec succès." });
        }

        // L'action pour assigner un rôle a été supprimée car le rôle n'est plus utilisé.
        // Vous pouvez supprimer ou commenter l'action suivante :
        /*
        [HttpPost("assigner-role")]
        public async Task<IActionResult> AssignerRole(
            [FromQuery] int projetId,
            [FromQuery] int userId,
            [FromQuery] string role)
        {
            var projetUser = await _projetService.AssignerRoleAsync(projetId, userId, role);
            return Ok(projetUser);
        }
        */

        // Récupérer les membres d'un projet
        [HttpGet("membres/{projetId}")]
        public async Task<IActionResult> GetMembresProjet(int projetId)
        {
            var membres = await _projetService.GetMembresProjetAsync(projetId);
            return Ok(membres);
        }

        // Supprimer un utilisateur d'un projet
        [HttpDelete("{projetId}/utilisateurs/{userId}")]
        public async Task<IActionResult> SupprimerUtilisateurDuProjet(int projetId, int userId)
        {
            var result = await _projetService.SupprimerUtilisateurDuProjetAsync(projetId, userId);
            if (!result)
                return NotFound();
            return NoContent();
        }

        // Supprimer plusieurs utilisateurs d'un projet
        [HttpDelete("supprimerUtilisateursDuProjet")]
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
    }
}
