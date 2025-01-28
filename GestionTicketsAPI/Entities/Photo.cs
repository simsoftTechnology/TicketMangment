using System.ComponentModel.DataAnnotations.Schema;

namespace GestionTicketsAPI.Entities;

[Table("Photos")]
public class Photo
{
  public int Id { get; set; }
  public required string Url { get; set; }
  public string? PublicId { get; set; }

  public int PaysId { get; set; }

  public Pays? Pays { get; set; } = null;
}