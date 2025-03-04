using GestionTicketsAPI.Entities;

namespace GestionTicketsAPI.Interfaces
{
    public interface IQualificationRepository
    {
        Task<IEnumerable<Qualification>> GetAllAsync();
        Task<Qualification?> GetByIdAsync(int id);
        Task AddAsync(Qualification qualification);
        void Update(Qualification qualification);
        void Delete(Qualification qualification);
        Task<bool> SaveAllAsync();
    }
}
