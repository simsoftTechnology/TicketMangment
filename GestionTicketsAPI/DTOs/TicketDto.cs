using GestionTicketsAPI.Entities;

namespace GestionTicketsAPI.DTOs
{
    public class TicketDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty; // Anciennement Titre
        public string Description { get; set; } = string.Empty;
        public int PriorityId { get; set; }              // Anciennement Priorite
        public int StatutId { get; set; }                // Anciennement Statuts
        public DateTime CreatedAt { get; set; }          // Anciennement DateCreation
        public DateTime? UpdatedAt { get; set; }           // Anciennement DateModification
        public int OwnerId { get; set; }                 // Anciennement UtilisateurId
        public UserDto? Owner { get; set; }              // Anciennement Utilisateur
        public int ProblemCategoryId { get; set; }       // Anciennement CategorieProblemeId
        public CategorieProbleme? ProblemCategory { get; set; } // Anciennement CategorieProbleme
        public int QualificationId { get; set; }         // Anciennement Qualification
        public string? Attachments { get; set; }         // Anciennement Attachement
        public int ProjetId { get; set; }
        public ProjetDto? Projet { get; set; }
        public int? ResponsibleId { get; set; }          // Anciennement DeveloppeurId
        public UserDto? Responsible { get; set; }        // Anciennement Developpeur
    }
}
