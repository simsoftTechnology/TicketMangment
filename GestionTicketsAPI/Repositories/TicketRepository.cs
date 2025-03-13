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
          .OrderBy(t => t.CreatedAt) // Tri par date de création
          .AsQueryable(); 

      // Filtrage par terme de recherche
      if (!string.IsNullOrEmpty(ticketParams.SearchTerm))
      {
        var lowerSearchTerm = ticketParams.SearchTerm.ToLower();
        query = query.Where(t => t.Title.ToLower().Contains(lowerSearchTerm)
                               || t.Description.ToLower().Contains(lowerSearchTerm));
      }

      // Filtrage basé sur le rôle et l'utilisateur
      if (!ticketParams.Role?.Replace(" ", "").Equals("superadmin", StringComparison.OrdinalIgnoreCase) ?? true)
      {
        if (string.Equals(ticketParams.Role, "client", StringComparison.OrdinalIgnoreCase))
        {
          // Le client voit uniquement les tickets dont il est le propriétaire
          query = query.Where(t => t.Owner != null && t.Owner.Id == ticketParams.UserId);
        }
        else if (string.Equals(ticketParams.Role, "collaborateur", StringComparison.OrdinalIgnoreCase))
        {
          // Le développeur voit uniquement les tickets qui lui sont assignés
          query = query.Where(t => t.ResponsibleId == ticketParams.UserId);
        }
        else if (string.Equals(ticketParams.Role, "chef de projet", StringComparison.OrdinalIgnoreCase))
        {
          // Le chef de projet voit les tickets des projets dont il est le responsable
          query = query.Where(t => t.Projet != null && t.Projet.ChefProjetId == ticketParams.UserId);
        }
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
  }
}
