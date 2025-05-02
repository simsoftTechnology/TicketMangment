using System;
using System.Linq;
using GestionTicketsAPI.Data;
using GestionTicketsAPI.DTOs;

namespace GestionTicketsAPI.Services
{
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
                dto.SocietesCount   = _context.Societes.Count();
                dto.StatutsCount    = _context.StatutsDesTickets.Count();
                dto.UsersCount      = _context.Users.Count();
            }

            // 2) Comptage des Projets
            if (isSuperAdmin)
            {
                dto.ProjectsCount = _context.Projets.Count();
            }
            else
            {
                // L'utilisateur est considéré associé s'il est ChefProjet ou présent dans ProjetUsers.
                dto.ProjectsCount = _context.Projets
                    .Where(p => p.ChefProjetId == userId || p.ProjetUsers.Any(pu => pu.UserId == userId))
                    .Count();
            }

            // 3) Comptage des Tickets selon la même logique que pour GetTicketsPagedAsync
            if (isSuperAdmin)
            {
                dto.TicketsCount = _context.Tickets.Count();
            }
            else
            {
                if (string.Equals(role, "chef de projet", StringComparison.OrdinalIgnoreCase))
                {
                    dto.TicketsCount = _context.Tickets
                        .Where(t => t.Projet != null &&
                                   (t.Projet.ChefProjetId == userId ||
                                    t.ResponsibleId == userId ||
                                    t.Projet.ProjetUsers.Any(pu => pu.UserId == userId)))
                        .Count();
                }
                else if (string.Equals(role, "collaborateur", StringComparison.OrdinalIgnoreCase))
                {
                    dto.TicketsCount = _context.Tickets
                        .Where(t => t.Projet != null &&
                                   (t.ResponsibleId == userId ||
                                    t.Projet.ProjetUsers.Any(pu => pu.UserId == userId)))
                        .Count();
                }
                else if (string.Equals(role, "client", StringComparison.OrdinalIgnoreCase))
                {
                    dto.TicketsCount = _context.Tickets
                        .Where(t => t.OwnerId == userId)
                        .Count();
                }
                else
                {
                    // Pour tout autre rôle, on compte les tickets associés via ProjetUsers.
                    dto.TicketsCount = _context.Tickets
                        .Where(t => t.Projet != null &&
                                    t.Projet.ProjetUsers.Any(pu => pu.UserId == userId))
                        .Count();
                }
            }

            // 4) Comptage par statut en appliquant le même filtrage que pour les tickets
            var filteredTickets = _context.Tickets.AsQueryable();
            if (!isSuperAdmin)
            {
                if (string.Equals(role, "chef de projet", StringComparison.OrdinalIgnoreCase))
                {
                    filteredTickets = filteredTickets.Where(t => t.Projet != null &&
                        (t.Projet.ChefProjetId == userId ||
                         t.ResponsibleId == userId ||
                         t.Projet.ProjetUsers.Any(pu => pu.UserId == userId)));
                }
                else if (string.Equals(role, "collaborateur", StringComparison.OrdinalIgnoreCase))
                {
                    filteredTickets = filteredTickets.Where(t => t.Projet != null &&
                        (t.ResponsibleId == userId ||
                         t.Projet.ProjetUsers.Any(pu => pu.UserId == userId)));
                }
                else if (string.Equals(role, "client", StringComparison.OrdinalIgnoreCase))
                {
                    filteredTickets = filteredTickets.Where(t => t.OwnerId == userId);
                }
                else
                {
                    filteredTickets = filteredTickets.Where(t => t.Projet != null &&
                        t.Projet.ProjetUsers.Any(pu => pu.UserId == userId));
                }
            }

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

            dto.TicketCountByStatus = ticketCountByStatus.Cast<object>().ToList();

            return dto;
        }
    }
}
