using GestionTicketsAPI.Data;
using GestionTicketsAPI.Entities;
using GestionTicketsAPI.Helpers;
using GestionTicketsAPI.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace GestionTicketsAPI.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly DataContext _context;
        
        public UserRepository(DataContext context)
        {
            _context = context;
        }
        
        public async Task<PagedList<User>> GetUsersAsync(UserParams userParams)
        {
            var query = _context.Users.Include(u => u.Contrats).Include(u => u.Role).AsQueryable();

            if (!string.IsNullOrEmpty(userParams.SearchTerm))
            {
                var lowerSearchTerm = userParams.SearchTerm.ToLower();
                query = query.Where(u => u.FirstName.ToLower().Contains(lowerSearchTerm)
                                      || u.LastName.ToLower().Contains(lowerSearchTerm));
            }

            return await PagedList<User>.CreateAsync(query, userParams.PageNumber, userParams.PageSize);
        }
        
        public async Task<IEnumerable<User>> GetUsersNoPaginationAsync()
        {
            return await _context.Users.Include(u => u.Contrats).Include(u => u.Role).ToListAsync();
        }
        
        public async Task<User?> GetUserByIdAsync(int id)
        {
            return await _context.Users
                .Include(u => u.Contrats)
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Id == id);
        }
        
        public async Task<User?> GetUserWithProjetUsersAsync(int id)
        {
            return await _context.Users
                .Include(u => u.ProjetUsers)
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Id == id);
        }
        
        public async Task<bool> DeleteUserAsync(User user)
        {
            await _context.Entry(user)
                .Collection(u => u.Contrats)
                .LoadAsync();

            if (user.Contrats?.Any() == true)
            {
                _context.Contrats.RemoveRange(user.Contrats);
            }

            _context.Users.Remove(user);
            return await _context.SaveChangesAsync() > 0;
        }
        
        public async Task<bool> SaveAllAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }

        // Implémentation de GetUserProjectsAsync
        public async Task<PagedList<Projet>> GetUserProjectsAsync(int userId, UserParams userParams)
        {
            var query = _context.ProjetUser
              .Include(pm => pm.Projet)
                  .ThenInclude(p => p.Pays)
              .Include(pm => pm.Projet)
                  .ThenInclude(p => p.Societe)
              .Where(pm => pm.UserId == userId)
              .Select(pm => pm.Projet)
              .AsQueryable();

            if (!string.IsNullOrEmpty(userParams.SearchTerm))
            {
                query = query.Where(p => p.Nom.Contains(userParams.SearchTerm));
            }

            return await PagedList<Projet>.CreateAsync(query, userParams.PageNumber, userParams.PageSize);
        }
        
        // Implémentation de GetUserTicketsAsync
        public async Task<PagedList<Ticket>> GetUserTicketsAsync(int userId, UserParams userParams)
        {
            var query = _context.Tickets
                .Where(t => t.OwnerId == userId) // Mise à jour : Utiliser OwnerId
                .AsQueryable();

            if (!string.IsNullOrEmpty(userParams.SearchTerm))
            {
                query = query.Where(t => t.Title.Contains(userParams.SearchTerm)); // Mise à jour : Utiliser Title
            }

            return await PagedList<Ticket>.CreateAsync(query, userParams.PageNumber, userParams.PageSize);
        }

        // Méthode Update pour marquer l'entité comme modifiée
        public void Update(User user)
        {
            _context.Entry(user).State = EntityState.Modified;
        }
    }
}
