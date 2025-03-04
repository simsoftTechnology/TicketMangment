using GestionTicketsAPI.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace GestionTicketsAPI.Repositories.Interfaces
{
    public interface IRoleRepository
    {
        Task<IEnumerable<Role>> GetAllAsync();
        Task<Role> GetByIdAsync(int id);
        Task<Role> CreateAsync(Role role);
        Task UpdateAsync(Role role);
        Task DeleteAsync(int id);
    }
}
