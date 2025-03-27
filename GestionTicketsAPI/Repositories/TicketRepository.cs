using GestionTicketsAPI.Data;
using GestionTicketsAPI.Entities;
using GestionTicketsAPI.Helpers;
using GestionTicketsAPI.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace GestionTicketsAPI.Repositories
{
  public class TicketRepository : ITicketRepository
  {
    private readonly DataContext _context;

    public TicketRepository(DataContext context)
    {
      _context = context;
    }

    public async Task<Ticket?> GetTicketByIdAsync(int id)
    {
      return await _context.Tickets
          .Include(t => t.Owner)
          .Include(t => t.ProblemCategory)
          .Include(t => t.Projet)
            .ThenInclude(p => p.ChefProjet)
          .Include(t => t.Responsible)
          .Include(t => t.Priority)
          .Include(t => t.Qualification)
          .Include(t => t.Statut)
          .FirstOrDefaultAsync(t => t.Id == id);
    }

    public async Task<IEnumerable<Ticket>> GetTicketsAsync()
    {
      return await _context.Tickets
          .Include(t => t.Owner)
          .Include(t => t.ProblemCategory)
          .Include(t => t.Projet)
            .ThenInclude(p => p.ChefProjet)
          .Include(t => t.Responsible)
          .Include(t => t.Priority)
          .Include(t => t.Qualification)
          .Include(t => t.Statut)
          .ToListAsync();
    }

    public async Task<PagedList<Ticket>> GetTicketsPagedAsync(UserParams ticketParams)
    {
      var query = _context.Tickets
          .Include(t => t.Owner)
          .Include(t => t.ProblemCategory)
          .Include(t => t.Projet)
              .ThenInclude(p => p.ChefProjet)
          .Include(t => t.Responsible)
          .Include(t => t.Priority)
          .Include(t => t.Qualification)
          .Include(t => t.Statut)
          .OrderByDescending(t => t.CreatedAt)
          .AsQueryable();

      // Si l'utilisateur n'est pas un super admin
      if (!(ticketParams.Role?.Replace(" ", "").Equals("superadmin", StringComparison.OrdinalIgnoreCase) ?? false))
      {
        // Si l'utilisateur est un client : ne voir que ses tickets
        if (string.Equals(ticketParams.Role, "client", StringComparison.OrdinalIgnoreCase))
        {
          query = query.Where(t => t.OwnerId == ticketParams.UserId);
        }
        // Si l'utilisateur est un chef de projet ou un collaborateur
        else if (string.Equals(ticketParams.Role, "chef de projet", StringComparison.OrdinalIgnoreCase) ||
                 string.Equals(ticketParams.Role, "collaborateur", StringComparison.OrdinalIgnoreCase))
        {
          if (!string.IsNullOrEmpty(ticketParams.FilterType))
          {
            if (ticketParams.FilterType.Equals("associated", StringComparison.OrdinalIgnoreCase))
            {
              // Tickets directement associés (propriétaire, responsable, chef de projet)
              query = query.Where(t =>
                  t.OwnerId == ticketParams.UserId ||
                  t.ResponsibleId == ticketParams.UserId ||
                  (t.Projet != null && t.Projet.ChefProjetId == ticketParams.UserId)
              );
            }
            else if (ticketParams.FilterType.Equals("projetUser", StringComparison.OrdinalIgnoreCase))
            {
              // Tickets associés via ProjetUser
              query = query.Where(t =>
                  _context.ProjetUser.Any(pu => pu.ProjetId == t.Projet.Id && pu.UserId == ticketParams.UserId)
              );
            }
          }
          else
          {
            // Par défaut, pour les chefs de projets et collaborateurs, on récupère tous les tickets associés
            query = query.Where(t =>
                t.OwnerId == ticketParams.UserId ||
                t.ResponsibleId == ticketParams.UserId ||
                (t.Projet != null && t.Projet.ChefProjetId == ticketParams.UserId) ||
                _context.ProjetUser.Any(pu => pu.ProjetId == t.Projet.Id && pu.UserId == ticketParams.UserId)
            );
          }
        }
      }

      // Filtrage par terme de recherche (pour tous les rôles)
      if (!string.IsNullOrEmpty(ticketParams.SearchTerm))
      {
        var lowerSearchTerm = ticketParams.SearchTerm.ToLower();
        query = query.Where(t => t.Title.ToLower().Contains(lowerSearchTerm) ||
                                 t.Description.ToLower().Contains(lowerSearchTerm));
      }

      return await PagedList<Ticket>.CreateAsync(query, ticketParams.PageNumber, ticketParams.PageSize);
    }




    public async Task AddTicketAsync(Ticket ticket)
    {
      await _context.Tickets.AddAsync(ticket);
    }

    public void UpdateTicket(Ticket ticket)
    {
      _context.Entry(ticket).State = EntityState.Modified;
    }

    public void DeleteTicket(Ticket ticket)
    {
      _context.Tickets.Remove(ticket);
    }

    public async Task<bool> SaveAllAsync()
    {
      return await _context.SaveChangesAsync() > 0;
    }

    public async Task<bool> DeleteMultipleTicketsAsync(IEnumerable<int> ticketIds)
    {
      var tickets = await _context.Tickets
          .Where(t => ticketIds.Contains(t.Id))
          .ToListAsync();

      if (!tickets.Any())
      {
        return false;
      }

      _context.Tickets.RemoveRange(tickets);
      return await SaveAllAsync();
    }

    public async Task<bool> TicketExists(string title)
    {
      return await _context.Tickets.AnyAsync(t => t.Title == title);
    }

    public async Task<StatutDesTicket?> GetStatusByNameAsync(string statusName)
    {
      return await _context.StatutsDesTickets.FirstOrDefaultAsync(s => s.Name == statusName);
    }

    public List<object> GetTicketCountByStatus(int userId, string role)
    {
      // Commence par récupérer tous les tickets
      IQueryable<Ticket> filteredTickets = _context.Tickets;

      // Si l'utilisateur n'est pas un superadmin, on filtre les tickets
      if (!string.Equals(role, "super admin", StringComparison.OrdinalIgnoreCase))
      {
        filteredTickets = filteredTickets.Where(t =>
            t.OwnerId == userId ||
            t.ResponsibleId == userId ||
            (t.Projet != null && t.Projet.ChefProjetId == userId)
        );
      }

      // Groupement par statut en utilisant uniquement les tickets filtrés
      var results = _context.StatutsDesTickets
           .GroupJoin(
                filteredTickets,
                statut => statut.Id,       // clé côté Statut
                ticket => ticket.StatutId, // clé côté Ticket
                (statut, ticketsGroup) => new
                {
                  Id = statut.Id,
                  Name = statut.Name,
                  Count = ticketsGroup.Count()
                }
           )
           .ToList();

      return results.Cast<object>().ToList();
    }

  }
}
