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

        [ForeignKey("Societe")]
        public int SocieteId { get; set; }
        public Societe? Societe { get; set; }

        [ForeignKey("Pays")]
        [Column("id_pays")]
        public int IdPays { get; set; }
        public Pays? Pays { get; set; }

        public ICollection<Ticket>? Tickets { get; set; }

        public ICollection<ProjetUser> ProjetUsers { get; set; } = new List<ProjetUser>();
    }
}
