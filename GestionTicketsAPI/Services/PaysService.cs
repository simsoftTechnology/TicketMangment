using System;
using AutoMapper;
using GestionTicketsAPI.DTOs;
using GestionTicketsAPI.Entities;
using GestionTicketsAPI.Interfaces;

namespace GestionTicketsAPI.Services;

public class PaysService : IPaysService
{
  private readonly IPaysRepository _paysRepository;
  private readonly IMapper _mapper;

  public PaysService(IPaysRepository paysRepository, IMapper mapper)
  {
    _paysRepository = paysRepository;
    _mapper = mapper;
  }

  public async Task<IEnumerable<PaysDto>> GetPaysAsync()
  {
    var paysList = await _paysRepository.GetPaysAsync();
    return _mapper.Map<IEnumerable<PaysDto>>(paysList);
  }

  public async Task<IEnumerable<PaysDto>> GetPaysAsync(string searchTerm)
  {
    var paysList = await _paysRepository.GetPaysAsync(searchTerm);
    return _mapper.Map<IEnumerable<PaysDto>>(paysList);
  }

  public async Task<PaysDto?> GetPaysByIdAsync(int idPays)
  {
    var pays = await _paysRepository.GetPaysByIdAsync(idPays);
    if (pays == null) return null;
    return _mapper.Map<PaysDto>(pays);
  }

  public async Task<bool> UpdatePaysAsync(int idPays, PaysUpdateDto paysUpdateDto, IFormFile? file)
  {
    var pays = await _paysRepository.GetPaysByIdAsync(idPays);
    if (pays == null) return false;

    // Mettre à jour le nom si fourni
    if (!string.IsNullOrWhiteSpace(paysUpdateDto.Nom))
      pays.Nom = paysUpdateDto.Nom;

    // Mettre à jour le code téléphonique si fourni
    if (!string.IsNullOrWhiteSpace(paysUpdateDto.CodeTel))
      pays.CodeTel = paysUpdateDto.CodeTel;

    // Mettre à jour la photo si un fichier est fourni
    if (file != null && file.Length > 0)
    {
      // 1. Si le pays a déjà une photo en base, supprimer l'ancienne du disque
      if (pays.paysPhoto != null && !string.IsNullOrEmpty(pays.paysPhoto.Url))
      {
        // Récupération du chemin complet sur le disque
        var oldPhotoPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", pays.paysPhoto.Url);
        if (System.IO.File.Exists(oldPhotoPath))
          System.IO.File.Delete(oldPhotoPath);
      }

      // 2. Sauvegarder le nouveau fichier
      var localPath = await SaveFileLocally(file);

      // 3. Mettre à jour la photo dans l'entité
      var newPhoto = new Photo
      {
        Url = localPath,       // ex: "assets/xxx.jpg"
        PublicId = null,       // plus besoin de PublicId si on ne gère plus Cloudinary
        PaysId = idPays
      };
      pays.paysPhoto = newPhoto;
    }

    return await _paysRepository.SaveAllAsync();
  }


  public async Task<PaysDto> AddPaysAsync(string nom, string? codeTel, string? fileBase64)
  {
    if (string.IsNullOrWhiteSpace(nom))
      throw new Exception("Le nom du pays est requis.");
    if (string.IsNullOrWhiteSpace(fileBase64))
      throw new Exception("Veuillez fournir une photo valide.");

    IFormFile file;
    try
    {
      // On suppose que fileBase64 est au format "data:<mimeType>;base64,<data>"
      var commaIndex = fileBase64.IndexOf(',');
      if (commaIndex < 0)
        throw new Exception("Le format de la chaîne base64 est invalide.");

      var base64Data = fileBase64.Substring(commaIndex + 1);
      var bytes = Convert.FromBase64String(base64Data);
      var stream = new MemoryStream(bytes);
      // Vous pouvez ajuster le nom et le type MIME selon vos besoins
      file = new FormFile(stream, 0, stream.Length, "file", "uploadedFile.jpg");
    }
    catch (Exception ex)
    {
      throw new Exception("Erreur lors de la conversion du fichier : " + ex.Message);
    }

    // Déléguer à la méthode interne qui accepte un IFormFile
    return await AddPaysFromFileAsync(nom, codeTel, file);
  }

  private async Task<PaysDto> AddPaysFromFileAsync(string nom, string? codeTel, IFormFile file)
  {
    // 1. Sauvegarder le fichier localement
    var localPath = await SaveFileLocally(file);

    // 2. Créer l'entité Photo
    var photo = new Photo
    {
      Url = localPath, // ex: "assets/xxx.jpg"
      PublicId = null  // plus utilisé
    };

    // 3. Créer l'entité Pays
    var pays = new Pays
    {
      Nom = nom,
      CodeTel = codeTel,
      paysPhoto = photo
    };

    // 4. Ajouter et sauvegarder
    await _paysRepository.AddPaysAsync(pays);
    if (!await _paysRepository.SaveAllAsync())
      throw new Exception("Erreur lors de l'ajout du pays.");

    return _mapper.Map<PaysDto>(pays);
  }



  public async Task<bool> DeletePaysAsync(int idPays)
  {
    // 1. Récupérer le pays en base
    var pays = await _paysRepository.GetPaysByIdAsync(idPays);
    if (pays == null) return false;

    // 2. S'il y a une photo associée, la supprimer du disque
    if (pays.paysPhoto != null && !string.IsNullOrEmpty(pays.paysPhoto.Url))
    {
      // Construit le chemin absolu vers le fichier
      var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", pays.paysPhoto.Url);
      if (File.Exists(filePath))
      {
        File.Delete(filePath);
      }
    }

    // 3. Supprimer le pays de la base (et donc la photo associée, 
    //    si la relation est configurée en cascade ou si vous gérez manuellement la suppression).
    _paysRepository.RemovePays(pays);

    // 4. Sauvegarder les changements
    return await _paysRepository.SaveAllAsync();
  }




  public async Task<bool> PaysExists(string nom)
  {
    return await _paysRepository.PaysExists(nom);
  }

  private async Task<string> SaveFileLocally(IFormFile file)
  {
    // Chemin absolu vers le dossier "assets" dans wwwroot
    // => wwwroot/assets
    var assetsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "assets");

    // Assurer l'existence du dossier
    if (!Directory.Exists(assetsFolder))
      Directory.CreateDirectory(assetsFolder);

    // Nom unique (ou usage direct du nom d’origine file.FileName)
    // Ici, on préfixe par un GUID pour éviter les collisions
    var uniqueFileName = Guid.NewGuid() + Path.GetExtension(file.FileName);

    // Chemin complet où sera stocké le fichier
    var filePath = Path.Combine(assetsFolder, uniqueFileName);

    // Copier le contenu du IFormFile dans un fichier physique
    using (var stream = new FileStream(filePath, FileMode.Create))
    {
      await file.CopyToAsync(stream);
    }

    // Retourne le nom de fichier ou le chemin relatif 
    // Par exemple : "assets/xxxxxxx.png"
    return Path.Combine("assets", uniqueFileName);
  }

}
