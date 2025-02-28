using System;
using GestionTicketsAPI.Entities;
using GestionTicketsAPI.Helpers;

namespace GestionTicketsAPI.Interfaces;

public interface ITicketRepository
    {
        Task<Ticket?> GetTicketByIdAsync(int id);
        Task<IEnumerable<Ticket>> GetTicketsAsync();
        Task<PagedList<Ticket>> GetTicketsPagedAsync(UserParams ticketParams);
        Task AddTicketAsync(Ticket ticket);
        void UpdateTicket(Ticket ticket);
        void DeleteTicket(Ticket ticket);
        Task<bool> SaveAllAsync();
        Task<bool> DeleteMultipleTicketsAsync(IEnumerable<int> ticketIds);

    }
