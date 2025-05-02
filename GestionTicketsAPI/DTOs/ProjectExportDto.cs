using System;

namespace GestionTicketsAPI.DTOs;

public class ProjectExportDto
{
  public int Id { get; set; }
  public string Nom { get; set; } = string.Empty;
  public string? Description { get; set; }
  public string? ChefProjet { get; set; }
  public string? Societe { get; set; }
  public string? Pays { get; set; }
}
