using GestionTicketsAPI.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace GestionTicketsAPI.Repositories.Interfaces
{
    public interface IStatutDesTicketRepository
    {
        Task<IEnumerable<StatutDesTicket>> GetAllAsync();
        Task<StatutDesTicket> GetByIdAsync(int id);
        Task<StatutDesTicket> CreateAsync(StatutDesTicket statut);
        Task UpdateAsync(StatutDesTicket statut);
        Task DeleteAsync(int id);
        Task<bool> StatutExists(string nom);
    }
}
