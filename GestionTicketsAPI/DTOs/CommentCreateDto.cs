using System;
using Microsoft.AspNetCore.Mvc;

namespace GestionTicketsAPI.DTOs;

public class CommentCreateDto
{
    public string Contenu { get; set; }
    public int TicketId { get; set; }
    public string? AttachmentBase64 { get; set; }
    public string? AttachmentFileName { get; set; }
 

}