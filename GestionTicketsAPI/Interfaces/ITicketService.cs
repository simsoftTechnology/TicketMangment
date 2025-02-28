using GestionTicketsAPI.DTOs;
using GestionTicketsAPI.Entities;
using GestionTicketsAPI.Helpers;

namespace GestionTicketsAPI.Interfaces
{
    public interface ITicketService
    {
        Task<TicketDto?> GetTicketByIdAsync(int id);
        Task<IEnumerable<TicketDto>> GetTicketsAsync();
        Task<PagedList<TicketDto>> GetTicketsPagedAsync(UserParams ticketParams);
        Task AddTicketAsync(Ticket ticket);
        Task<bool> UpdateTicketAsync(Ticket ticket);
        Task<bool> DeleteTicketAsync(Ticket ticket);
        Task<bool> DeleteMultipleTicketsAsync(IEnumerable<int> ticketIds);
    }
}
