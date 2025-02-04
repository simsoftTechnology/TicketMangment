using GestionTicketsAPI.Data;
using GestionTicketsAPI.Entities;
using Microsoft.EntityFrameworkCore;

namespace GestionTicketsAPI.Services;

public class SocieteService
{
    private readonly DataContext _context;

    public SocieteService(DataContext context)
    {
        _context = context;
    }

    // Récupérer toutes les sociétés
    public async Task<IEnumerable<Societe>> GetAllSocietesAsync()
    {
        return await _context.Societes.ToListAsync();
    }

    // Récupérer une société par ID
    public async Task<Societe?> GetSocieteByIdAsync(int id)
    {
        return await _context.Societes.FindAsync(id);
    }

    // Ajouter une société
    public async Task<Societe> AddSocieteAsync(Societe societe)
    {
        _context.Societes.Add(societe);
        await _context.SaveChangesAsync();
        return societe;
    }

    // Mettre à jour une société
    public async Task<bool> UpdateSocieteAsync(Societe societe)
    {
        _context.Societes.Update(societe);
        return await _context.SaveChangesAsync() > 0;
    }

    // Supprimer une société
    public async Task<bool> DeleteSocieteAsync(int id)
    {
        var societe = await _context.Societes.FindAsync(id);
        if (societe == null) return false;

        _context.Societes.Remove(societe);
        return await _context.SaveChangesAsync() > 0;
    }
}
