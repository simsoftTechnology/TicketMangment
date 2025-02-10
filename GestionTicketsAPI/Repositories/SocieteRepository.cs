using System;
using GestionTicketsAPI.Data;
using GestionTicketsAPI.Entities;
using GestionTicketsAPI.Helpers;
using GestionTicketsAPI.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace GestionTicketsAPI.Repositories;

public class SocieteRepository : ISocieteRepository
{
  private readonly DataContext _context;

  public SocieteRepository(DataContext context)
  {
    _context = context;
  }

  // Récupérer toutes les sociétés
  public async Task<IEnumerable<Societe>> GetAllSocietesAsync()
  {
    return await _context.Societes.ToListAsync();
  }

  public async Task<PagedList<Societe>> GetSocietesPagedAsync(UserParams userParams)
  {
    var query = _context.Societes;
    return await PagedList<Societe>.CreateAsync(query, userParams.PageNumber, userParams.PageSize);
  }

  // Récupérer une société par ID
  public async Task<Societe?> GetSocieteByIdAsync(int id)
  {
    return await _context.Societes.FindAsync(id);
  }

  public async Task<Societe?> GetSocieteWithDetailsByIdAsync(int id)
  {
    return await _context.Societes
    .Include(s => s.Utilisateurs)  
    .Include(s => s.Projets!)
        .ThenInclude(p => p.Pays)   
    .FirstOrDefaultAsync(s => s.Id == id);
  }

  // Ajouter une société
  public async Task AddSocieteAsync(Societe societe)
  {
    await _context.Societes.AddAsync(societe);
  }

  // Mettre à jour une société (la méthode Update est généralement une opération sur le contexte)
  public void UpdateSociete(Societe societe)
  {
    _context.Societes.Update(societe);
  }

  // Supprimer une société
  public void RemoveSociete(Societe societe)
  {
    _context.Societes.Remove(societe);
  }

  // Sauvegarder les modifications
  public async Task<bool> SaveAllAsync()
  {
    return await _context.SaveChangesAsync() > 0;
  }
}