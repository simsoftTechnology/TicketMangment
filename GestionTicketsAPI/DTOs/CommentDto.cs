using System;
using Microsoft.AspNetCore.Mvc;

namespace GestionTicketsAPI.DTOs;

public class CommentDto
{
    public int Id { get; set; }
    public string Contenu { get; set; }
    public DateTime Date { get; set; }
    public int UtilisateurId { get; set; }
    public int TicketId { get; set; }
    public UserDto? Utilisateur { get; set; }

    public string? Attachement { get; set; }
}