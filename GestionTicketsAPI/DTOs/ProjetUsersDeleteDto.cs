using System;

namespace GestionTicketsAPI.DTOs;

public class ProjetUsersDeleteDto
{
    public int ProjetId { get; set; }
    public List<int> UserIds { get; set; } = new List<int>();
}
