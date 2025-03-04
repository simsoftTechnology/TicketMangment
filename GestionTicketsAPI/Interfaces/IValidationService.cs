using GestionTicketsAPI.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace GestionTicketsAPI.Services.Interfaces
{
    public interface IValidationService
    {
        Task<IEnumerable<Validation>> GetAllValidationsAsync();
        Task<Validation> GetValidationByIdAsync(int id);
        Task<Validation> CreateValidationAsync(Validation validation);
        Task UpdateValidationAsync(Validation validation);
        Task DeleteValidationAsync(int id);
    }
}
