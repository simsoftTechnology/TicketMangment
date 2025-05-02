using GestionTicketsAPI.Entities;

namespace GestionTicketsAPI.Interfaces
{
    public interface IQualificationService
    {
        Task<IEnumerable<Qualification>> GetAllAsync();
        Task<Qualification?> GetByIdAsync(int id);
        Task<Qualification> AddAsync(Qualification qualification);
        Task<bool> UpdateAsync(int id, Qualification qualification);
        Task<bool> QualificationExists(string nom);
        Task<bool> DeleteAsync(int id);
    }
}
