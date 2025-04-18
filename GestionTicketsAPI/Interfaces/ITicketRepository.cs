using System;
using GestionTicketsAPI.Entities;
using GestionTicketsAPI.Helpers;

namespace GestionTicketsAPI.Interfaces
{
    public interface ITicketRepository
    {
        Task<Ticket?> GetTicketByIdAsync(int id);
        Task<IEnumerable<Ticket>> GetTicketsAsync();
        Task<PagedList<Ticket>> GetTicketsPagedAsync(TicketFilterParams filterParams);
        Task AddTicketAsync(Ticket ticket);
        void UpdateTicket(Ticket ticket);
        void DeleteTicket(Ticket ticket);
        Task<bool> SaveAllAsync();
        Task<bool> DeleteMultipleTicketsAsync(IEnumerable<int> ticketIds);
        Task<bool> TicketExists(string title);
        Task<StatutDesTicket?> GetStatusByNameAsync(string statusName);
        Task<IEnumerable<Ticket>> GetTicketsFilteredAsync(TicketFilterParams filterParams);
        List<object> GetTicketCountByStatus(int userId, string role);
        Task<IEnumerable<Ticket>> GetTicketsByCategoryIdAsync(int categoryId);
    }
}
