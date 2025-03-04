using GestionTicketsAPI.Entities;

namespace GestionTicketsAPI.Interfaces
{
    public interface IPrioriteService
    {
        Task<IEnumerable<Priorite>> GetAllAsync();
        Task<Priorite?> GetByIdAsync(int id);
        Task<Priorite> AddAsync(Priorite priorite);
        Task<bool> UpdateAsync(int id, Priorite priorite);
        Task<bool> DeleteAsync(int id);
    }
}
