using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GestionTicketsAPI.Entities
{
  public class Societe
  {
    [Key]
    public int Id { get; set; }

    [Required]
    [StringLength(100)]
    public string Nom { get; set; } = string.Empty;

    [Required]
    public string Adresse { get; set; } = string.Empty;

    [Required]
    [StringLength(50)]
    public string Telephone { get; set; } = string.Empty;

    public int PaysId { get; set; }
    public Pays? Pays { get; set; }

    public ICollection<User>? Utilisateurs { get; set; }
    public ICollection<Projet>? Projets { get; set; }


    [InverseProperty("SocietePartenaire")]
    public ICollection<Contrat> ContratsPartenaire { get; set; } = new List<Contrat>();
  }
}
