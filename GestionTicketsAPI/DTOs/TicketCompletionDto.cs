using System;

namespace GestionTicketsAPI.DTOs;

public class TicketCompletionDto {
    public bool IsResolved { get; set; }
    public string Comment { get; set; }
    public int HoursSpent { get; set; }
    public DateTime CompletionDate { get; set; }
}
