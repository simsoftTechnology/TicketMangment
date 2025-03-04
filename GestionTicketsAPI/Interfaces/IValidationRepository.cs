using GestionTicketsAPI.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace GestionTicketsAPI.Repositories.Interfaces
{
    public interface IValidationRepository
    {
        Task<IEnumerable<Validation>> GetAllAsync();
        Task<Validation> GetByIdAsync(int id);
        Task<Validation> CreateAsync(Validation validation);
        Task UpdateAsync(Validation validation);
        Task DeleteAsync(int id);
    }
}
