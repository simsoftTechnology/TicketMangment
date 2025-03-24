using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GestionTicketsAPI.Entities;

public class Pays
{
  [Key]
  [Column("id_pays")] // Correspond à la colonne dans la base de données
  public int IdPays { get; set; }

  [Required]
  [StringLength(100, ErrorMessage = "Le nom du pays ne peut pas dépasser 100 caractères.")]
  public string Nom { get; set; } = string.Empty;

  public Photo? paysPhoto { get; set; }
  
  [StringLength(10)]
  public string? CodeTel { get; set; }
  public ICollection<Societe>? Societes { get; set; }
}
