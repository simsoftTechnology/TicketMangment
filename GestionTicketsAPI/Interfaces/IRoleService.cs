using GestionTicketsAPI.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace GestionTicketsAPI.Services.Interfaces
{
    public interface IRoleService
    {
        Task<IEnumerable<Role>> GetAllRolesAsync();
        Task<Role> GetRoleByIdAsync(int id);
        Task<Role> CreateRoleAsync(Role role);
        Task UpdateRoleAsync(Role role);
        Task DeleteRoleAsync(int id);
        Task<bool> RoleExists(string nom);
    }
}
