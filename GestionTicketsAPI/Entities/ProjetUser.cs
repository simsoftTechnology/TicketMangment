using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GestionTicketsAPI.Entities;

public class ProjetUser
{
  [Key] // Déclaration de la clé composite
  [Column(Order = 1)]
  [ForeignKey("Projet")]
  public int ProjetId { get; set; }
  public Projet? Projet { get; set; }

  [Key] // Déclaration de la clé composite
  [Column(Order = 2)]
  [ForeignKey("User")]
  public int UserId { get; set; }
  public User? User { get; set; }

  public DateTime? CreatedAt { get; set; }
  public DateTime? UpdatedAt { get; set; }
}
