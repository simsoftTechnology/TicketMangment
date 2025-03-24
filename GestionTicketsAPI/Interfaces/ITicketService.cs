using GestionTicketsAPI.DTOs;
using GestionTicketsAPI.Entities;
using GestionTicketsAPI.Helpers;

namespace GestionTicketsAPI.Interfaces
{
    public interface ITicketService
    {
        Task<TicketDto?> GetTicketByIdAsync(int id);
        Task<Ticket?> GetTicketEntityByIdAsync(int id);
        Task<IEnumerable<TicketDto>> GetTicketsAsync();
        Task<PagedList<TicketDto>> GetTicketsPagedAsync(UserParams ticketParams);
        Task AddTicketAsync(Ticket ticket);
        Task<bool> UpdateTicketAsync(Ticket ticket);
        Task<bool> DeleteTicketAsync(Ticket ticket);
        Task<bool> DeleteMultipleTicketsAsync(IEnumerable<int> ticketIds);
        Task<bool> TicketExists(string title);
        Task<StatutDesTicket?> GetStatusByNameAsync(string statusName);
        List<object> GetTicketCountByStatus(int userId, string role);

        Task<bool> SaveAllAsync();
    }
}
