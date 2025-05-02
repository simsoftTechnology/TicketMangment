using System;

namespace GestionTicketsAPI.DTOs;

public class DashboardCountsDto
{
    // Visible uniquement pour le super admin
    public int CategoriesCount { get; set; }
    public int PaysCount { get; set; }
    public int SocietesCount { get; set; }
    public int StatutsCount { get; set; }
    public int UsersCount { get; set; }

    // Visible pour tout le monde (mais filtré si pas super admin)
    public int ProjectsCount { get; set; }
    public int TicketsCount { get; set; }

    // Vous pouvez aussi renvoyer un tableau pour le détail des tickets par statut
    public List<object> TicketCountByStatus { get; set; } = new();
}
