using AutoMapper;
using GestionTicketsAPI.Data;
using GestionTicketsAPI.DTOs;
using GestionTicketsAPI.Entities;
using GestionTicketsAPI.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GestionTicketsAPI.Controllers;


public class UsersController(DataContext context, IMapper mapper, IPhotoService photoService) : BaseApiController
{
  [Authorize]
  [HttpGet]
  public async Task<ActionResult<IEnumerable<UserDto>>> GetUsers()
  {
    var users = await context.Users.ToListAsync();

    var usersToReturn = mapper.Map<IEnumerable<UserDto>>(users);

    return Ok(usersToReturn);
  }

  [Authorize]
  [HttpGet("{id:int}")]
  public async Task<ActionResult<UserDto>> GetUser(int id)
  {
    var user = await context.Users.FindAsync(id);

    if (user == null) return NotFound();

    return mapper.Map<UserDto>(user);
  }

  [Authorize]
  [HttpGet("pays")]
  public async Task<ActionResult<IEnumerable<PaysDto>>> GetPays()
  {
    var pays = await context.Pays
        .Include(p => p.paysPhoto) // Inclure les photos dans la requête
        .ToListAsync();

    var paysToReturn = mapper.Map<IEnumerable<PaysDto>>(pays);

    return Ok(paysToReturn);
  }


  [Authorize]
  [HttpPut("ModifierPays/{idPays}")]
  public async Task<ActionResult> UpdatePays(int idPays, [FromForm] PaysUpdateDto paysUpdateDto, IFormFile? file)
  {
    // Vérifiez si le pays existe
    var pays = await context.Pays.Include(p => p.paysPhoto).FirstOrDefaultAsync(p => p.IdPays == idPays);

    if (pays == null) return NotFound("Le pays spécifié n'existe pas.");

    // Mettre à jour le nom si fourni
    if (!string.IsNullOrWhiteSpace(paysUpdateDto.Nom))
    {
      pays.Nom = paysUpdateDto.Nom;
    }

    // Mettre à jour la photo si un fichier est fourni
    if (file != null && file.Length > 0)
    {
      // Supprimer l'ancienne photo si elle existe
      if (pays.paysPhoto != null)
      {
        var deleteResult = await photoService.DeletePhotoAsync(pays.paysPhoto.PublicId);
        if (deleteResult.Error != null) return BadRequest(deleteResult.Error.Message);

        context.Photos.Remove(pays.paysPhoto); // Supprimez l'enregistrement de la base de données
      }

      // Ajouter la nouvelle photo via le service photo (ex. Cloudinary)
      var result = await photoService.AddPhotoAsync(file);
      if (result.Error != null) return BadRequest(result.Error.Message);

      // Créer l'objet photo
      var newPhoto = new Photo
      {
        Url = result.SecureUrl.AbsoluteUri,
        PublicId = result.PublicId,
        PaysId = idPays
      };

      // Associer la nouvelle photo au pays
      pays.paysPhoto = newPhoto;
      context.Photos.Add(newPhoto);
    }

    // Sauvegarder les modifications
    var saveResult = await context.SaveChangesAsync();

    if (saveResult <= 0) return BadRequest("Erreur lors de la mise à jour du pays.");

    return NoContent(); // Succès : retourne 204
  }



  [Authorize]
  [HttpPost("ajouterPays")]
  public async Task<ActionResult<PaysDto>> AddPays([FromForm] string nom, IFormFile file)
  {
    // Vérifier si le nom est fourni
    if (string.IsNullOrWhiteSpace(nom))
      return BadRequest("Le nom du pays est requis.");

    // Vérifier si le fichier est valide
    if (file == null || file.Length == 0)
      return BadRequest("Veuillez fournir une photo valide.");

    // Ajouter la photo via le service photo (ex. Cloudinary)
    var result = await photoService.AddPhotoAsync(file);

    if (result.Error != null)
      return BadRequest(result.Error.Message);

    // Créer l'objet Photo
    var photo = new Photo
    {
      Url = result.SecureUrl.AbsoluteUri,
      PublicId = result.PublicId
    };

    // Créer l'objet Pays
    var pays = new Pays
    {
      Nom = nom,
      paysPhoto = photo
    };

    // Ajouter à la base de données
    context.Pays.Add(pays);
    context.Photos.Add(photo);
    await context.SaveChangesAsync();

    // Retourner le pays ajouté avec les informations nécessaires
    var response = new PaysDto
    {
      IdPays = pays.IdPays,
      Nom = pays.Nom,
      PhotoUrl = photo.Url
    };

    return CreatedAtAction(nameof(GetPays), new { idPays = pays.IdPays }, response);
  }


  [Authorize]
  [HttpDelete("supprimerPays/{idPays}")]
  public async Task<ActionResult> DeletePays(int idPays)
  {
    // Rechercher le pays avec l'ID fourni
    var pays = await context.Pays.Include(p => p.paysPhoto).FirstOrDefaultAsync(p => p.IdPays == idPays);

    if (pays == null)
      return NotFound("Le pays spécifié n'existe pas.");

    // Supprimer la photo associée si elle existe
    if (pays.paysPhoto != null)
    {
      var deleteResult = await photoService.DeletePhotoAsync(pays.paysPhoto.PublicId);
      if (deleteResult.Error != null)
        return BadRequest(deleteResult.Error.Message);

      context.Photos.Remove(pays.paysPhoto); // Supprimer l'enregistrement photo
    }

    // Supprimer le pays
    context.Pays.Remove(pays);

    // Sauvegarder les modifications
    var saveResult = await context.SaveChangesAsync();

    if (saveResult <= 0)
      return BadRequest("Erreur lors de la suppression du pays.");

    return NoContent(); // Retourner un succès 204
  }






  [HttpPost("{idPays}/add-photo")]
  public async Task<ActionResult<PhotoDto>> AddPhoto(int idPays, IFormFile file)
  {
    // Vérifier si le fichier est valide
    if (file == null || file.Length == 0)
      return BadRequest("Le fichier fourni est invalide.");

    // Récupérer le pays depuis la base de données
    var pays = await context.Pays
        .Include(p => p.paysPhoto) // Inclure la photo si elle existe
        .FirstOrDefaultAsync(p => p.IdPays == idPays);

    if (pays == null) return NotFound("Le pays spécifié n'existe pas.");

    // Ajouter la photo via le service photo (par ex. Cloudinary)
    var result = await photoService.AddPhotoAsync(file);

    if (result.Error != null) return BadRequest(result.Error.Message);

    // Créer l'objet photo
    var photo = new Photo
    {
      Url = result.SecureUrl.AbsoluteUri,
      PublicId = result.PublicId,
      PaysId = idPays
    };

    // Associer la photo au pays
    pays.paysPhoto = photo;

    // Enregistrer les modifications dans la base de données
    context.Photos.Add(photo); // Ajouter la photo au contexte
    context.Pays.Update(pays); // Mettre à jour le pays avec la nouvelle photo
    await context.SaveChangesAsync(); // Enregistrer les modifications

    // Retourner la photo ajoutée en réponse
    return CreatedAtAction(nameof(GetPays),
        new { idPays = pays.IdPays },
        new PhotoDto { Id = photo.Id, Url = photo.Url });
  }


}

