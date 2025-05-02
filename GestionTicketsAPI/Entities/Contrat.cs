using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GestionTicketsAPI.Entities;
public class Contrat
{
    [Key]
    public int Id { get; set; }
    
    [Required]
    public DateTime DateDebut { get; set; }
    
    public DateTime? DateFin { get; set; }
    
    
    // "Client-Societe" ou "Societe-Societe"
    [Required]
    [StringLength(50)]
    public string TypeContrat { get; set; } = "Client-Societe";
    
    // Société partenaire (requis uniquement pour Societe-Societe)
    public int? SocietePartenaireId { get; set; }
    
    [ForeignKey("SocietePartenaireId")]
    [InverseProperty("ContratsPartenaire")]
    public Societe? SocietePartenaire { get; set; }
    
    // Client (requis uniquement pour Client-Societe)
    public int? ClientId { get; set; }
    
    [ForeignKey("ClientId")]
    public User? Client { get; set; }
}
