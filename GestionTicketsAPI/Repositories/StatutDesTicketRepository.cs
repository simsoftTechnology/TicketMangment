using GestionTicketsAPI.Data;
using GestionTicketsAPI.Entities;
using GestionTicketsAPI.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace GestionTicketsAPI.Repositories
{
  public class StatutDesTicketRepository : IStatutDesTicketRepository
  {
    private readonly DataContext _context;
    public StatutDesTicketRepository(DataContext context)
    {
      _context = context;
    }

    public async Task<IEnumerable<StatutDesTicket>> GetAllAsync()
    {
      return await _context.StatutsDesTickets.ToListAsync();
    }

    public async Task<StatutDesTicket> GetByIdAsync(int id)
    {
      return await _context.StatutsDesTickets.FindAsync(id);
    }

    public async Task<StatutDesTicket> CreateAsync(StatutDesTicket statut)
    {
      _context.StatutsDesTickets.Add(statut);
      await _context.SaveChangesAsync();
      return statut;
    }

    public async Task UpdateAsync(StatutDesTicket statut)
    {
      _context.StatutsDesTickets.Update(statut);
      await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
      var statut = await _context.StatutsDesTickets.FindAsync(id);
      if (statut != null)
      {
        _context.StatutsDesTickets.Remove(statut);
        await _context.SaveChangesAsync();
      }
    }

    public async Task<bool> StatutExists(string nom)
    {
      return await _context.StatutsDesTickets.AnyAsync(s => s.Name == nom);
    }
  }
}
