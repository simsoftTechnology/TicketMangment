using System;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;
using GestionTicketsAPI.Data;
using GestionTicketsAPI.Entities;
using GestionTicketsAPI.Helpers;
using GestionTicketsAPI.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace GestionTicketsAPI.Repositories
{
  public class SocieteRepository : ISocieteRepository
  {
    private readonly DataContext _context;

    public SocieteRepository(DataContext context)
    {
      _context = context;
    }

    // Récupérer toutes les sociétés
    public async Task<IEnumerable<Societe>> GetAllSocietesAsync(string? searchTerm = null)
    {
      var query = _context.Societes.AsQueryable();

      if (!string.IsNullOrEmpty(searchTerm))
      {
        var lowerSearchTerm = searchTerm.ToLower();
        query = query.Where(s => s.Nom.ToLower().Contains(lowerSearchTerm));
      }

      return await query.ToListAsync();
    }

    public async Task<PagedList<Societe>> GetSocietesPagedAsync(UserParams userParams)
    {
      var query = _context.Societes.AsQueryable();

      if (!string.IsNullOrEmpty(userParams.SearchTerm))
      {
        var lowerSearchTerm = userParams.SearchTerm.ToLower();
        query = query.Where(s => s.Nom.ToLower().Contains(lowerSearchTerm));
      }

      return await PagedList<Societe>.CreateAsync(query, userParams.PageNumber, userParams.PageSize);
    }

    // Récupérer une société par ID (simple)
    public async Task<Societe?> GetSocieteByIdAsync(int id)
    {
      return await _context.Societes.FindAsync(id);
    }

    // Récupérer une société avec ses détails (utilisateurs et projets)
    public async Task<Societe?> GetSocieteWithDetailsByIdAsync(int id)
    {
      return await _context.Societes
          .Include(s => s.Utilisateurs)
          .Include(s => s.ContratsPartenaire)
          .Include(s => s.Projets!)
              .ThenInclude(p => p.Pays)
          .FirstOrDefaultAsync(s => s.Id == id);
    }

    // Ajouter une société
    public async Task AddSocieteAsync(Societe societe)
    {
      await _context.Societes.AddAsync(societe);

    }

    // Mettre à jour une société
    public void UpdateSociete(Societe societe)
    {
      _context.Societes.Update(societe);
    }

    // Méthode standard (non utilisée ici) pour supprimer une société
    public void RemoveSociete(Societe societe)
    {
      _context.Societes.Remove(societe);
    }

    // Suppression d'une société en chargeant explicitement ses associations
    public async Task<bool> DeleteSocieteWithAssociationsAsync(int id)
{
    // Charger la société avec ses associations
    var societe = await _context.Societes
        .Include(s => s.Utilisateurs)
            .ThenInclude(u => u.Contrats)
        .Include(s => s.ContratsPartenaire)
        .Include(s => s.Projets)
        .FirstOrDefaultAsync(s => s.Id == id);

    if (societe == null)
    {
        return false;
    }

    // Supprimer manuellement les contrats des utilisateurs
    if (societe.Utilisateurs?.Any() == true)
    {
        foreach (var user in societe.Utilisateurs)
        {
            if (user.Contrats?.Any() == true)
            {
                _context.Contrats.RemoveRange(user.Contrats);
            }
        }
        // Supprimer les utilisateurs associés
        _context.Users.RemoveRange(societe.Utilisateurs);
    }

    // Supprimer les contrats où la société est partenaire
    if (societe.ContratsPartenaire?.Any() == true)
    {
        // Si nécessaire, filtrer pour éviter de supprimer un contrat déjà supprimé
        _context.Contrats.RemoveRange(societe.ContratsPartenaire);
    }

    // Supprimer les projets associés
    if (societe.Projets?.Any() == true)
    {
        _context.Projets.RemoveRange(societe.Projets);
    }

    // Supprimer la société elle-même
    _context.Societes.Remove(societe);

    // Utilisation d'une transaction pour garantir l'atomicité
    using (var transaction = await _context.Database.BeginTransactionAsync())
    {
        await _context.SaveChangesAsync();
        await transaction.CommitAsync();
    }

    return true;
}




    // Sauvegarder les modifications
    public async Task<bool> SaveAllAsync()
    {
      return await _context.SaveChangesAsync() > 0;
    }
  }
}
