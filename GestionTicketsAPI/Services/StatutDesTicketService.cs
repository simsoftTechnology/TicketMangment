using GestionTicketsAPI.Entities;
using GestionTicketsAPI.Repositories.Interfaces;
using GestionTicketsAPI.Services.Interfaces;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace GestionTicketsAPI.Services
{
  public class StatutDesTicketService : IStatutDesTicketService
  {
    private readonly IStatutDesTicketRepository _repository;
    public StatutDesTicketService(IStatutDesTicketRepository repository)
    {
      _repository = repository;
    }

    public async Task<IEnumerable<StatutDesTicket>> GetAllStatutsAsync()
    {
      return await _repository.GetAllAsync();
    }

    public async Task<StatutDesTicket> GetStatutByIdAsync(int id)
    {
      return await _repository.GetByIdAsync(id);
    }

    public async Task<StatutDesTicket> CreateStatutAsync(StatutDesTicket statut)
    {
      return await _repository.CreateAsync(statut);
    }

    public async Task UpdateStatutAsync(StatutDesTicket statut)
    {
      await _repository.UpdateAsync(statut);
    }

    public async Task DeleteStatutAsync(int id)
    {
      await _repository.DeleteAsync(id);
    }

    public async Task<bool> StatutExists(string nom)
    {
      return await _repository.StatutExists(nom);
    }
  }
}
