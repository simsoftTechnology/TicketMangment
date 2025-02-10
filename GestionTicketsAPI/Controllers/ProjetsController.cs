using AutoMapper;
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
    public class ProjetsController : BaseApiController
    {
        private readonly IProjetService _projetService;

        public ProjetsController(IProjetService projetService)
        {
            _projetService = projetService;
        }

        // 🔹 Récupérer tous les projets
        [Authorize]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProjetDto>>> GetProjets()
        {
            var projetsDto = await _projetService.GetProjetsAsync();
            return Ok(projetsDto);
        }

        // Nouvel endpoint pour la pagination
        [Authorize]
        [HttpGet("paged")]
        public async Task<ActionResult<PagedList<ProjetDto>>> GetProjetsPaged([FromQuery] UserParams projetParams)
        {
            var projetsPaged = await _projetService.GetProjetsPagedAsync(projetParams);
            Response.AddPaginationHeader(projetsPaged); // Ajoute les métadonnées de pagination dans l'en-tête HTTP
            return Ok(projetsPaged);
        }

        // 🔹 Récupérer un projet par ID
        [Authorize]
        [HttpGet("{id}")]
        public async Task<ActionResult<ProjetDto>> GetProjet(int id)
        {
            var projetDto = await _projetService.GetProjetByIdAsync(id);
            if (projetDto == null)
                return NotFound();
            return Ok(projetDto);
        }

        // 🔹 Ajouter un projet
        [Authorize]
        [HttpPost("ajouterProjet")]
        public async Task<ActionResult<ProjetDto>> PostProjet(ProjetDto projetDto)
        {
            var createdProjetDto = await _projetService.AddProjetAsync(projetDto);
            return CreatedAtAction(nameof(GetProjet), new { id = createdProjetDto.Id }, createdProjetDto);
        }

        // 🔹 Mettre à jour un projet
        [Authorize]
        [HttpPut("modifierProjet/{id}")]
        public async Task<IActionResult> PutProjet(int id, ProjetDto projetDto)
        {
            if (id != projetDto.Id)
                return BadRequest();
            var result = await _projetService.UpdateProjetAsync(id, projetDto);
            if (!result)
                return NotFound();
            return NoContent();
        }

        // 🔹 Supprimer un projet
        [Authorize]
        [HttpDelete("supprimerProjet/{id}")]
        public async Task<IActionResult> DeleteProjet(int id)
        {
            var result = await _projetService.DeleteProjetAsync(id);
            if (!result)
                return NotFound();
            return NoContent();
        }

        // 🔹 Ajouter un utilisateur au projet
        [HttpPost("{projetId}/utilisateurs")]
        public async Task<IActionResult> AjouterUtilisateurAuProjet(int projetId, [FromBody] ProjetUserDto projetUserDto)
        {
            var result = await _projetService.AjouterUtilisateurAuProjetAsync(projetId, projetUserDto);
            if (!result)
                return NotFound("Projet ou utilisateur non trouvé.");
            return Ok(new { message = "Utilisateur ajouté au projet avec succès." });
        }

        // 🔹 Assigner un rôle à un utilisateur sur un projet
        [HttpPost("assigner-role")]
        public async Task<IActionResult> AssignerRole(int projetId, int userId, string role)
        {
            var projetUser = await _projetService.AssignerRoleAsync(projetId, userId, role);
            return Ok(projetUser);
        }

        // 🔹 Récupérer les membres d'un projet
        [HttpGet("membres/{projetId}")]
        public async Task<IActionResult> GetMembresProjet(int projetId)
        {
            var membres = await _projetService.GetMembresProjetAsync(projetId);
            return Ok(membres);
        }

        // 🔹 Supprimer un utilisateur d'un projet
        [Authorize]
        [HttpDelete("{projetId}/utilisateurs/{userId}")]
        public async Task<IActionResult> SupprimerUtilisateurDuProjet(int projetId, int userId)
        {
            var result = await _projetService.SupprimerUtilisateurDuProjetAsync(projetId, userId);
            if (!result)
                return NotFound();
            return NoContent();
        }
    }
}
