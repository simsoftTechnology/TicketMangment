using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GestionTicketsAPI.Entities;

public class Ticket
{
    [Key]
    public int Id { get; set; }

    [Required]
    [StringLength(100)]
    public string Titre { get; set; } = string.Empty;

    [Required]
    public string Description { get; set; } = string.Empty;

    [Required]
    public string Priorite { get; set; } = "Moyenne";

    [Required]
    public string Statuts { get; set; } = "Ouvert";

    [Required]
    public DateTime DateCreation { get; set; } = DateTime.UtcNow;

    public DateTime? DateModification { get; set; }

    [ForeignKey("Utilisateur")]
    public int UtilisateurId { get; set; }

    public User? Utilisateur { get; set; }

    // Relation avec CategorieProbleme
    [ForeignKey("CategorieProbleme")]
    public int CategorieProblemeId { get; set; }

    public CategorieProbleme? CategorieProbleme { get; set; }

    public ICollection<Commentaire>? Commentaires { get; set; }

    // Nouvelle propriété : Qualification (string)
    [Required]
    public string Qualification { get; set; } = string.Empty;

    // Nouvelle propriété : Attachement (par exemple, chemin d'accès ou URL du fichier attaché)
    public string? Attachement { get; set; }

    // Ticket associé à un unique projet
    [ForeignKey("Projet")]
    public int ProjetId { get; set; }

    public Projet? Projet { get; set; }
}
