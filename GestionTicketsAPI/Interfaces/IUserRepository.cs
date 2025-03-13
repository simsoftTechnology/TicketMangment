using GestionTicketsAPI.Entities;
using GestionTicketsAPI.Helpers;

namespace GestionTicketsAPI.Interfaces
{
    public interface IUserRepository
    {
        Task<PagedList<User>> GetUsersAsync(UserParams userParams);
        Task<IEnumerable<User>> GetUsersNoPaginationAsync();
        Task<User?> GetUserByIdAsync(int id);
        Task<User?> GetUserWithProjetUsersAsync(int id);
        Task<bool> DeleteUserAsync(User user);
        Task<bool> SaveAllAsync();

        // Pour projets et tickets...
        Task<PagedList<Projet>> GetUserProjectsAsync(int userId, UserParams userParams);
        Task<PagedList<Ticket>> GetUserTicketsAsync(int userId, UserParams userParams);

        // Méthode d'update
        void Update(User user);
        Task<IEnumerable<User>> GetUsersByRoleAsync(string roleName);
    }
}
