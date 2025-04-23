using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GestionTicketsAPI.Entities;

public class Notification
{
    [Key]
    public int Id { get; set; }

    [Required]
    public string Message { get; set; } = string.Empty;

    [Required]
    public DateTime DateEnvoi { get; set; } = DateTime.UtcNow;

    [ForeignKey("Utilisateur")]
    public int UtilisateurId { get; set; }

    public User? Utilisateur { get; set; }
    public bool IsRead { get; set; } = false;

    public string? EntityType { get; set; }   // ex: "Projets", "Tickets", "Societes"
    public int?    EntityId   { get; set; }
}
