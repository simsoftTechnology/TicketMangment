using System;

namespace GestionTicketsAPI.DTOs;

public class TicketExportDto
{
  public int Id { get; set; }
  public string Title { get; set; } = string.Empty;
  public string QualificationName { get; set; } = string.Empty;
  public string ProjetName { get; set; } = string.Empty;
  public string OwnerName { get; set; } = string.Empty;
  public string ProblemCategoryName { get; set; } = string.Empty;

  public string PriorityName { get; set; } = string.Empty;

  public string StatutName { get; set; } = string.Empty;

  public string ResponsibleName { get; set; } = string.Empty;
}
