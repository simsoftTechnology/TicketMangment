using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using DocumentFormat.OpenXml.Wordprocessing;

namespace GestionTicketsAPI.Entities;

public class Ticket
{
    public int Id { get; set; }
    public string Title { get; set; }
    public string Description { get; set; }
    public int PriorityId { get; set; }
    public Priorite Priority { get; set; }
    public int ProjetId { get; set; }
    public Projet Projet { get; set; }
    public int OwnerId { get; set; }
    public User Owner { get; set; }
    public int QualificationId { get; set; }
    public Qualification Qualification { get; set; }
    public int ProblemCategoryId { get; set; }
    public CategorieProbleme ProblemCategory { get; set; }
    public int StatutId { get; set; }
    public StatutDesTicket Statut { get; set; }

    public string? ValidationReason { get; set; }
    public int? ResponsibleId { get; set; }
    public User Responsible { get; set; }
    public string? Attachments { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public DateTime? ApprovedAt { get; set; }
    public DateTime? SolvedAt { get; set; }
    public DateTime? DeletedAt { get; set; }

    public string? CompletionComment { get; set; }
    public int? HoursSpent { get; set; }
    public int? MinutesSpent { get; set; }
}

public class PagedTicket
{
    public int Id { get; set; }

    // Champs simples
    public string Title { get; set; }
    public string Description { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ApprovedAt { get; set; }
    public DateTime? SolvedAt { get; set; }
    public int? HoursSpent { get; set; }
    public int? MinutesSpent { get; set; }

    // Clés étrangères
    public int OwnerId { get; set; }
    public int? ResponsibleId { get; set; }
    public int? ProjetId { get; set; }
    public int? ProblemCategoryId { get; set; }
    public int? StatutId { get; set; }
    public int? PriorityId { get; set; }
    public int? QualificationId { get; set; }

    // Propriétés de navigation
    public virtual User Owner { get; set; }
    public virtual User Responsible { get; set; }
    public virtual Projet Projet { get; set; }
    public CategorieProbleme ProblemCategory { get; set; }
    public StatutDesTicket Statut { get; set; }

    public Priorite Priority { get; set; }
    public virtual Qualification Qualification { get; set; }
}
