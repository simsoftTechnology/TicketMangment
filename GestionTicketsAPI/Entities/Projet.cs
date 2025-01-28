using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GestionTicketsAPI.Entities;

public class Projet
{
    [Key]
    public int Id { get; set; }

    [Required]
    [StringLength(100)]
    public string Nom { get; set; } = string.Empty;

    [Required]
    public DateTime DateDebut { get; set; }

    public DateTime? DateFin { get; set; }

    [ForeignKey("Societe")]
    public int SocieteId { get; set; }

    public Societe? Societe { get; set; }

    public ICollection<Ticket>? Tickets { get; set; }
}
