using System;
using System.ComponentModel.DataAnnotations;

namespace GestionTicketsAPI.Entities;

public class CategorieProbleme
{
  [Key]
  public int Id { get; set; }
  public required string Nom { get; set; }
  public DateTime? CreatedAt { get; set; }
  public DateTime? UpdatedAt { get; set; }
  public DateTime? DeletedAt { get; set; }
}
