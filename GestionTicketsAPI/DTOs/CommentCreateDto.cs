using System;

namespace GestionTicketsAPI.DTOs;

public class CommentCreateDto
{
    public string Contenu { get; set; }
    public int TicketId { get; set; }
}