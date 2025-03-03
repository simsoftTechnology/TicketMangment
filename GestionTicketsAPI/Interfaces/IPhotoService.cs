using CloudinaryDotNet.Actions;

namespace GestionTicketsAPI.Interfaces
{
    public interface IPhotoService
    {
        /// <summary>
        /// Upload d'une image sur Cloudinary.
        /// </summary>
        /// <param name="file">Fichier image</param>
        /// <returns>ImageUploadResult contenant l'URL et d'autres infos</returns>
        Task<ImageUploadResult> AddPhotoAsync(IFormFile file);

        /// <summary>
        /// Upload d'un fichier (image ou non‑image) sur Cloudinary.
        /// </summary>
        /// <param name="file">Fichier à uploader</param>
        /// <returns>UploadResult générique contenant l'URL et d'autres infos</returns>
        Task<UploadResult> UploadFileAsync(IFormFile file);

        /// <summary>
        /// Suppression d'un fichier sur Cloudinary.
        /// </summary>
        /// <param name="publicId">Identifiant public du fichier</param>
        /// <returns>DeletionResult de l'opération</returns>
        Task<DeletionResult> DeletePhotoAsync(string publicId);
    }
}
