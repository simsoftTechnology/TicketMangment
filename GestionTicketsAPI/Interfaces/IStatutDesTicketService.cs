using GestionTicketsAPI.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace GestionTicketsAPI.Services.Interfaces
{
    public interface IStatutDesTicketService
    {
        Task<IEnumerable<StatutDesTicket>> GetAllStatutsAsync();
        Task<StatutDesTicket> GetStatutByIdAsync(int id);
        Task<StatutDesTicket> CreateStatutAsync(StatutDesTicket statut);
        Task UpdateStatutAsync(StatutDesTicket statut);
        Task DeleteStatutAsync(int id);
    }
}
