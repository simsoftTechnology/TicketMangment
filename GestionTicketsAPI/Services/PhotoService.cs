using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using GestionTicketsAPI.Helpers;
using GestionTicketsAPI.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace GestionTicketsAPI.Services
{
  public class PhotoService : IPhotoService
  {
    private readonly Cloudinary _cloudinary;

    public PhotoService(IOptions<CloudinarySettings> config)
    {
      var acc = new Account(
          config.Value.CloudName,
          config.Value.ApiKey,
          config.Value.ApiSecret
      );
      _cloudinary = new Cloudinary(acc);
    }

    /// <summary>
    /// Upload d'une image sur Cloudinary.
    /// </summary>
    public async Task<ImageUploadResult> AddPhotoAsync(IFormFile file)
    {
      var uploadResult = new ImageUploadResult();

      if (file.Length > 0)
      {
        using var stream = file.OpenReadStream();
        var uploadParams = new ImageUploadParams
        {
          File = new FileDescription(file.FileName, stream),
          Transformation = new Transformation()
                                .Quality(100), // ou ne pas appliquer de redimensionnement
          Folder = "ticketManagment"
        };
        uploadResult = await _cloudinary.UploadAsync(uploadParams);
      }

      return uploadResult;
    }

    /// <summary>
    /// Upload d'un fichier (image ou non‑image) sur Cloudinary.
    /// Pour les images, la même transformation que AddPhotoAsync est appliquée.
    /// Pour les autres fichiers (Word, PDF, etc.), on utilise RawUploadParams.
    /// </summary>
    public async Task<UploadResult> UploadFileAsync(IFormFile file)
    {
      if (file.Length <= 0)
        return null;

      using var stream = file.OpenReadStream();
      var uploadParams = new RawUploadParams
      {
        File = new FileDescription(file.FileName, stream),
        Folder = "ticketManagment"
      };

      return await _cloudinary.UploadAsync(uploadParams);
    }


    public async Task<DeletionResult> DeletePhotoAsync(string publicId)
    {
      var deleteParams = new DeletionParams(publicId);
      return await _cloudinary.DestroyAsync(deleteParams);
    }
  }
}
