using System;

namespace GestionTicketsAPI.DTOs;

public class TicketExportDto
{
  public int Id { get; set; }
  public string Title { get; set; } = string.Empty;
  public string Description { get; set; } = string.Empty;

  public int PriorityId { get; set; }
  public string PriorityName { get; set; } = string.Empty;

  public int StatutId { get; set; }
  public string StatutName { get; set; } = string.Empty;

  public DateTime CreatedAt { get; set; }
  public DateTime? UpdatedAt { get; set; }

  public int OwnerId { get; set; }
  public string OwnerName { get; set; } = string.Empty;

  public int ProblemCategoryId { get; set; }
  public string ProblemCategoryName { get; set; } = string.Empty;

  public int QualificationId { get; set; }
  public string QualificationName { get; set; } = string.Empty;

  public string? Attachments { get; set; }

  public int ProjetId { get; set; }
  public string ProjetName { get; set; } = string.Empty;

  public int? ResponsibleId { get; set; }
  public string ResponsibleName { get; set; } = string.Empty;

  public DateTime? ApprovedAt { get; set; }
  public DateTime? SolvedAt { get; set; }
}
