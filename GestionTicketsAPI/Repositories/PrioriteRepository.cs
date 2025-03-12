using GestionTicketsAPI.Data;
using GestionTicketsAPI.Entities;
using GestionTicketsAPI.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace GestionTicketsAPI.Repositories
{
  public class PrioriteRepository : IPrioriteRepository
  {
    private readonly DataContext _context;

    public PrioriteRepository(DataContext context)
    {
      _context = context;
    }

    public async Task<IEnumerable<Priorite>> GetAllAsync()
    {
      return await _context.Priorities.ToListAsync();
    }

    public async Task<Priorite?> GetByIdAsync(int id)
    {
      return await _context.Priorities.FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task AddAsync(Priorite priorite)
    {
      await _context.Priorities.AddAsync(priorite);
    }

    public void Update(Priorite priorite)
    {
      _context.Entry(priorite).State = EntityState.Modified;
    }

    public void Delete(Priorite priorite)
    {
      _context.Priorities.Remove(priorite);
    }

    public async Task<bool> SaveAllAsync()
    {
      return await _context.SaveChangesAsync() > 0;
    }

    public async Task<bool> PrioriteExists(string nom)
    {
      return await _context.Priorities.AnyAsync(p => p.Name == nom);
    }
  }
}
