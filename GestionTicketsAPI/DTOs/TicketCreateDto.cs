using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace GestionTicketsAPI.DTOs
{
    public class TicketCreateDto
    {
        [Required]
        public string Titre { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;

        public string Priorite { get; set; } = "Moyenne";

        public string Statuts { get; set; } = "Ouvert";

        [Required]
        public int UtilisateurId { get; set; }

        [Required]
        public int CategorieProblemeId { get; set; }

        [Required]
        public string Qualification { get; set; } = string.Empty;

        [Required]
        public int ProjetId { get; set; }

        // Le fichier attaché (Word, PDF ou image)
        public IFormFile? Attachment { get; set; }
    }
}
