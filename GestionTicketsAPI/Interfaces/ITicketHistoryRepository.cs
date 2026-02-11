using GestionTicketsAPI.Entities;

namespace GestionTicketsAPI.Interfaces
{
    public interface ITicketHistoryRepository
    {
        Task<Result> AddAsync(TicketHistory history);

    }
}
