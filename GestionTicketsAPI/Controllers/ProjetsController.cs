using GestionTicketsAPI.Entities;
using GestionTicketsAPI.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using GestionTicketsAPI.DTOs;
using AutoMapper;

namespace GestionTicketsAPI.Controllers
{
  [Route("api/[controller]")]
  [ApiController]
  public class ProjetsController : BaseApiController
  {
    private readonly DataContext _context;
    private readonly IMapper _mapper;  // Add IMapper dependency

    public ProjetsController(DataContext context, IMapper mapper) : base()
    {
      _context = context;
      _mapper = mapper;  // Initialize the mapper
    }

    // 🔹 Récupérer tous les projets
    [Authorize]
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProjetDto>>> GetProjets()
    {
      var projets = await _context.Projets
          .Include(p => p.Societe)
          .Include(p => p.Pays)
          .ToListAsync();  // Get the list of entities

      // Use AutoMapper to convert entities to DTOs
      var projetsDto = _mapper.Map<IEnumerable<ProjetDto>>(projets);

      return Ok(projetsDto);  // Return the DTO list
    }

    // 🔹 Récupérer un projet par ID
    [Authorize]
    [HttpGet("{id}")]
    public async Task<ActionResult<ProjetDto>> GetProjet(int id)
    {
      var projet = await _context.Projets
          .Include(p => p.Societe)
          .Include(p => p.Pays)
          .FirstOrDefaultAsync(p => p.Id == id);

      if (projet == null)
      {
        return NotFound();
      }

      // Map the entity to DTO using AutoMapper
      var projetDto = _mapper.Map<ProjetDto>(projet);

      return Ok(projetDto);  // Return the DTO
    }

    // 🔹 Ajouter un projet
    [Authorize]
    [HttpPost("ajouterProjet")]
    public async Task<ActionResult<ProjetDto>> PostProjet(ProjetDto projetDto)
    {
      // Convert DTO to entity using AutoMapper
      var projet = _mapper.Map<Projet>(projetDto);

      _context.Projets.Add(projet);
      await _context.SaveChangesAsync();

      // Return the created DTO
      var createdProjetDto = _mapper.Map<ProjetDto>(projet);
      return CreatedAtAction(nameof(GetProjet), new { id = projet.Id }, createdProjetDto);
    }

    // 🔹 Mettre à jour un projet
    [Authorize]
    [HttpPut("modifierProjet/{id}")]
    public async Task<IActionResult> PutProjet(int id, ProjetDto projetDto)
    {
      if (id != projetDto.Id)
      {
        return BadRequest();
      }

      // Convert DTO to entity
      var projet = _mapper.Map<Projet>(projetDto);
      _context.Entry(projet).State = EntityState.Modified;

      try
      {
        await _context.SaveChangesAsync();
      }
      catch (DbUpdateConcurrencyException)
      {
        if (!ProjetExists(id))
        {
          return NotFound();
        }
        else
        {
          throw;
        }
      }

      return NoContent();
    }


    [HttpPost("{projetId}/utilisateurs")]
    public async Task<IActionResult> AjouterUtilisateurAuProjet(int projetId, [FromBody] ProjetUserDto projetUserDto)
    {
      try
      {
        var projet = await _context.Projets.FindAsync(projetId);
        if (projet == null)
        {
          return NotFound("Projet non trouvé.");
        }

        var user = await _context.Users.FindAsync(projetUserDto.UserId);
        if (user == null)
        {
          return NotFound("Utilisateur non trouvé.");
        }

        var projetUser = new ProjetUser
        {
          ProjetId = projetId,
          UserId = projetUserDto.UserId,
          Role = projetUserDto.Role
        };

        _context.ProjetUser.Add(projetUser);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Utilisateur ajouté au projet avec succès." });
      }
      catch (Exception ex)
      {
        // Logguez l'exception (par exemple, avec ILogger)
        // logger.LogError(ex, "Erreur lors de l'ajout de l'utilisateur au projet");

        // En mode développement, vous pouvez renvoyer les détails (mais pas en production)
        return StatusCode(500, new { message = ex.Message, detail = ex.InnerException?.Message });
      }
    }


    // 🔹 Supprimer un projet
    [Authorize]
    [HttpDelete("supprimerProjet/{id}")]
    public async Task<IActionResult> DeleteProjet(int id)
    {
      var projet = await _context.Projets
          .Include(p => p.ProjetUsers) // Inclure les relations ProjetUser
          .FirstOrDefaultAsync(p => p.Id == id);

      if (projet == null)
      {
        return NotFound();
      }

      // Supprimer les associations dans ProjetUser
      _context.ProjetUser.RemoveRange(projet.ProjetUsers);

      // Supprimer le projet
      _context.Projets.Remove(projet);

      await _context.SaveChangesAsync();

      return NoContent();
    }


    private bool ProjetExists(int id)
    {
      return _context.Projets.Any(e => e.Id == id);
    }

    [HttpPost("assigner-role")]
    public async Task<IActionResult> AssignerRole(int projetId, int userId, string role)
    {
      // Vérifier si l'utilisateur a déjà un rôle sur ce projet
      var projetUser = await _context.ProjetUser
          .FirstOrDefaultAsync(pu => pu.ProjetId == projetId && pu.UserId == userId);

      if (projetUser == null)
      {
        // Si non existant, on ajoute un nouvel enregistrement
        projetUser = new ProjetUser
        {
          ProjetId = projetId,
          UserId = userId,
          Role = role
        };
        _context.ProjetUser.Add(projetUser);
      }
      else
      {
        // Sinon, on met à jour le rôle existant
        projetUser.Role = role;
      }

      await _context.SaveChangesAsync();
      return Ok(projetUser);
    }



    [HttpGet("membres/{projetId}")]
    public async Task<IActionResult> GetMembresProjet(int projetId)
    {
      var membres = await _context.ProjetUser
          .Where(pu => pu.ProjetId == projetId)
          .Select(pu => new
          {
            pu.UserId,
            pu.User.FirstName,  // Assure-toi que `User` a une propriété `Nom`
            pu.User.LastName,
            pu.Role
          })
          .ToListAsync();

      return Ok(membres);
    }




    // DELETE: api/projets/{projetId}/utilisateurs/{userId}
    [Authorize]
    [HttpDelete("{projetId}/utilisateurs/{userId}")]
    public async Task<IActionResult> SupprimerUtilisateurDuProjet(int projetId, int userId)
    {
      var projetUser = await _context.ProjetUser
          .FirstOrDefaultAsync(pu => pu.ProjetId == projetId && pu.UserId == userId);

      if (projetUser == null)
      {
        return NotFound();
      }

      _context.ProjetUser.Remove(projetUser);
      await _context.SaveChangesAsync();

      return NoContent();
    }


  }
}
