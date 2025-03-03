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
          .Include(t => t.Utilisateur)
          .Include(t => t.Commentaires)
          .Include(t => t.CategorieProbleme)
          .Include(t => t.Projet)
          .Include(t => t.Developpeur)
          .FirstOrDefaultAsync(t => t.Id == id);
    }

    public async Task<IEnumerable<Ticket>> GetTicketsAsync()
    {
      return await _context.Tickets
          .Include(t => t.Utilisateur)
          .Include(t => t.Commentaires)
          .Include(t => t.CategorieProbleme)
          .Include(t => t.Projet)
          .Include(t => t.Developpeur)
          .ToListAsync();
    }

    public async Task<PagedList<Ticket>> GetTicketsPagedAsync(UserParams ticketParams)
    {
      var query = _context.Tickets
          .Include(t => t.Utilisateur)
          .Include(t => t.Commentaires)
          .Include(t => t.CategorieProbleme)
          .Include(t => t.Projet)
          .Include(t => t.Developpeur)
          .AsQueryable();

      if (!string.IsNullOrEmpty(ticketParams.SearchTerm))
      {
        var lowerSearchTerm = ticketParams.SearchTerm.ToLower();
        query = query.Where(t => t.Titre.ToLower().Contains(lowerSearchTerm)
                               || t.Description.ToLower().Contains(lowerSearchTerm));
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
      // Récupère tous les tickets correspondant aux IDs fournis
      var tickets = await _context.Tickets
          .Where(t => ticketIds.Contains(t.Id))
          .ToListAsync();

      if (!tickets.Any())
      {
        return false; // Aucun ticket trouvé
      }

      _context.Tickets.RemoveRange(tickets);
      return await SaveAllAsync();
    }

  }

}
