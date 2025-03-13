using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace GestionTicketsAPI.DTOs
{
    public class TicketCreateDto
    {
        [Required]
        public string Title { get; set; } = string.Empty; // Anciennement Titre

        [Required]
        public string Description { get; set; } = string.Empty;

        [Required]
        public int PriorityId { get; set; } // Anciennement Priorite

        [Required]
        public int OwnerId { get; set; }    // Anciennement UtilisateurId

        [Required]
        public int ProblemCategoryId { get; set; } // Anciennement CategorieProblemeId

        [Required]
        public int QualificationId { get; set; }   // Anciennement Qualification

        [Required]
        public int ProjetId { get; set; }

        // Fichier attaché (Word, PDF ou image)
        public IFormFile? Attachment { get; set; }
    }
}
