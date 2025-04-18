using System;

namespace GestionTicketsAPI.DTOs;

public class TicketValidationDto
{
    // True si le ticket est accepté, false s'il est refusé
    public bool IsAccepted { get; set; }
    
    // Raison de refus (obligatoire si IsAccepted == false)
    public string? Reason { get; set; }
    
    // (Facultatif) ID du responsable à assigner en cas d'acceptation
    public int? ResponsibleId { get; set; }
}

