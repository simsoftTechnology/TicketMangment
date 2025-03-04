using System;
using GestionTicketsAPI.Data;
using GestionTicketsAPI.Entities;
using GestionTicketsAPI.Helpers;
using GestionTicketsAPI.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace GestionTicketsAPI.Repositories;

public class ProjetRepository : IProjetRepository
{
  private readonly DataContext _context;
  public ProjetRepository(DataContext context)
  {
    _context = context;
  }

  public async Task<IEnumerable<Projet>> GetProjetsAsync()
  {
    return await _context.Projets
        .Include(p => p.Societe)
        .Include(p => p.Pays)
        .ToListAsync();
  }

  public async Task<PagedList<Projet>> GetProjetsPagedAsync(UserParams projetParams)
  {
    var query = _context.Projets
        .Include(p => p.Societe)
        .Include(p => p.Pays)
        .AsQueryable();

    if (!string.IsNullOrEmpty(projetParams.SearchTerm))
    {
      var lowerSearchTerm = projetParams.SearchTerm.ToLower();
      query = query.Where(p => p.Nom.ToLower().Contains(lowerSearchTerm));
    }

    return await PagedList<Projet>.CreateAsync(query, projetParams.PageNumber, projetParams.PageSize);
  }

  public async Task<Projet?> GetProjetByIdAsync(int id)
  {
    return await _context.Projets
        .Include(p => p.Societe)
        .Include(p => p.Pays)
        .Include(p => p.ProjetUsers)
        .FirstOrDefaultAsync(p => p.Id == id);
  }

  public async Task AddProjetAsync(Projet projet)
  {
    await _context.Projets.AddAsync(projet);
  }

  public void UpdateProjet(Projet projet)
  {
    _context.Entry(projet).State = EntityState.Modified;
  }

  public void RemoveProjet(Projet projet)
  {
    _context.Projets.Remove(projet);
  }

  public async Task<bool> ProjetExistsAsync(int id)
  {
    return await _context.Projets.AnyAsync(e => e.Id == id);
  }

  public async Task<bool> SaveAllAsync()
  {
    return await _context.SaveChangesAsync() > 0;
  }

  public async Task AddProjetUserAsync(ProjetUser projetUser)
  {
    await _context.ProjetUser.AddAsync(projetUser);
  }

  public async Task<ProjetUser?> GetProjetUserAsync(int projetId, int userId)
  {
    return await _context.ProjetUser
        .FirstOrDefaultAsync(pu => pu.ProjetId == projetId && pu.UserId == userId);
  }

  public void RemoveProjetUser(ProjetUser projetUser)
  {
    _context.ProjetUser.Remove(projetUser);
  }

  public async Task<IEnumerable<dynamic>> GetMembresProjetAsync(int projetId)
  {
    return await _context.ProjetUser
        .Where(pu => pu.ProjetId == projetId)
        .Select(pu => new
        {
          pu.UserId,
          pu.User.FirstName,
          pu.User.LastName
        })
        .ToListAsync();
  }
}
