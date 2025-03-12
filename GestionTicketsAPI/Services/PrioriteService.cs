using GestionTicketsAPI.Entities;
using GestionTicketsAPI.Interfaces;

namespace GestionTicketsAPI.Services
{
  public class PrioriteService : IPrioriteService
  {
    private readonly IPrioriteRepository _prioriteRepository;

    public PrioriteService(IPrioriteRepository prioriteRepository)
    {
      _prioriteRepository = prioriteRepository;
    }

    public async Task<IEnumerable<Priorite>> GetAllAsync()
    {
      return await _prioriteRepository.GetAllAsync();
    }

    public async Task<Priorite?> GetByIdAsync(int id)
    {
      return await _prioriteRepository.GetByIdAsync(id);
    }

    public async Task<Priorite> AddAsync(Priorite priorite)
    {
      await _prioriteRepository.AddAsync(priorite);
      await _prioriteRepository.SaveAllAsync();
      return priorite;
    }

    public async Task<bool> UpdateAsync(int id, Priorite priorite)
    {
      var existing = await _prioriteRepository.GetByIdAsync(id);
      if (existing == null)
        return false;

      // Mise à jour des propriétés (ici, seulement Name)
      existing.Name = priorite.Name;
      _prioriteRepository.Update(existing);
      return await _prioriteRepository.SaveAllAsync();
    }

    public async Task<bool> DeleteAsync(int id)
    {
      var existing = await _prioriteRepository.GetByIdAsync(id);
      if (existing == null)
        return false;

      _prioriteRepository.Delete(existing);
      return await _prioriteRepository.SaveAllAsync();
    }

    public async Task<bool> PrioriteExists(string nom)
    {
      return await _prioriteRepository.PrioriteExists(nom);
    }
  }
}
