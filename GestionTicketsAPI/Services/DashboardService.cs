using System;
using GestionTicketsAPI.Data;
using GestionTicketsAPI.DTOs;

namespace GestionTicketsAPI.Services;

public interface IDashboardService
{
    DashboardCountsDto GetDashboardCounts(int userId, string role);
}

public class DashboardService : IDashboardService
{
    private readonly DataContext _context;

    public DashboardService(DataContext context)
    {
        _context = context;
    }

    public DashboardCountsDto GetDashboardCounts(int userId, string role)
    {
        var dto = new DashboardCountsDto();

        // 1) Les counts visibles uniquement pour le super admin
        //    => si l’utilisateur est super admin, on compte tout ; sinon on ne renvoie rien (ou 0).
        bool isSuperAdmin = string.Equals(role, "super admin", StringComparison.OrdinalIgnoreCase);

        if (isSuperAdmin)
        {
            dto.CategoriesCount = _context.CategorieProblemes.Count();
            dto.PaysCount       = _context.Pays.Count();
            dto.SocietesCount  = _context.Societes.Count();
            dto.StatutsCount   = _context.StatutsDesTickets.Count();
            dto.UsersCount     = _context.Users.Count();
        }

        // 2) Les counts qui peuvent être filtrés si l’utilisateur n’est pas super admin
        //    a) Projets
        if (isSuperAdmin)
        {
            dto.ProjectsCount = _context.Projets.Count();
        }
        else
        {
            // Par exemple : on compte uniquement les projets auxquels l’utilisateur est lié
            //   soit via ProjetUser, soit s’il est ChefProjetId
            dto.ProjectsCount = _context.Projets
                .Where(p => p.ChefProjetId == userId 
                            || p.ProjetUsers.Any(pu => pu.UserId == userId))
                .Count();
        }

        //  b) Tickets
        if (isSuperAdmin)
        {
            dto.TicketsCount = _context.Tickets.Count();
        }
        else
        {
            // Filtrer par OwnerId, ResponsibleId ou ChefProjet
            dto.TicketsCount = _context.Tickets
                .Where(t => t.OwnerId == userId
                            || t.ResponsibleId == userId
                            || (t.Projet != null && t.Projet.ChefProjetId == userId))
                .Count();
        }

        // 3) Comptage par statut (exemple déjà donné)
        //    Si vous voulez l’afficher pour tout le monde, on applique le même filtre
        var filteredTickets = _context.Tickets.AsQueryable();
        if (!isSuperAdmin)
        {
            filteredTickets = filteredTickets.Where(t =>
                t.OwnerId == userId ||
                t.ResponsibleId == userId ||
                (t.Projet != null && t.Projet.ChefProjetId == userId)
            );
        }

        // Regrouper par statut
        var ticketCountByStatus = _context.StatutsDesTickets
            .GroupJoin(
                filteredTickets,
                statut => statut.Id,
                ticket => ticket.StatutId,
                (statut, ticketsGroup) => new
                {
                    Id = statut.Id,
                    Name = statut.Name,
                    Count = ticketsGroup.Count()
                }
            )
            .ToList();

        // On le stocke dans la propriété du DTO
        dto.TicketCountByStatus = ticketCountByStatus.Cast<object>().ToList();

        return dto;
    }
}

