using GestionTicketsAPI.Entities;

namespace GestionTicketsAPI.DTOs
{
    public class TicketDto
    {
        public int Id { get; set; }
        public string Titre { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Priorite { get; set; } = "Moyenne";
        public string Statuts { get; set; } = "Ouvert";
        public DateTime DateCreation { get; set; }
        public DateTime? DateModification { get; set; }
        public int UtilisateurId { get; set; }
        public UserDto? Utilisateur { get; set; }
        public int CategorieProblemeId { get; set; }
        public CategorieProbleme? CategorieProbleme { get; set; }
        public string Qualification { get; set; } = string.Empty;
        public string? Attachement { get; set; }
        public int ProjetId { get; set; }

        // Remplace la navigation complète par un DTO qui ne pose pas de risque de cycle
        public ProjetDto? Projet { get; set; }
    }
}
