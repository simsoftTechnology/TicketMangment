using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GestionTicketsAPI.Entities
{
  public class Projet
  {
    [Key]
    public int Id { get; set; }

    [Required]
    [StringLength(100)]
    public string Nom { get; set; } = string.Empty;

    // Nouveau champ optionnel Description
    public string? Description { get; set; }

    // Un projet peut appartenir soit à une société, soit à un client (mais pas aux deux)
    public int? SocieteId { get; set; }
    public Societe? Societe { get; set; }

    [ForeignKey("Pays")]
    [Column("id_pays")]
    public int IdPays { get; set; }
    public Pays? Pays { get; set; }

    public DateTime? CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public DateTime? DeletedAt { get; set; }
    public ICollection<Ticket>? Tickets { get; set; }
    public ICollection<ProjetUser> ProjetUsers { get; set; } = new List<ProjetUser>();
  }
}
