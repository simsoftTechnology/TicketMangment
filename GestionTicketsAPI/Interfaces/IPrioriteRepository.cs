using GestionTicketsAPI.Entities;

namespace GestionTicketsAPI.Interfaces
{
    public interface IPrioriteRepository
    {
        Task<IEnumerable<Priorite>> GetAllAsync();
        Task<Priorite?> GetByIdAsync(int id);
        Task AddAsync(Priorite priorite);
        void Update(Priorite priorite);
        void Delete(Priorite priorite);
        Task<bool> PrioriteExists(string nom);
        Task<bool> SaveAllAsync();
    }
}
