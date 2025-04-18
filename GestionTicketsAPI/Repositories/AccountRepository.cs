using GestionTicketsAPI.Data;
using GestionTicketsAPI.Entities;
using GestionTicketsAPI.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace GestionTicketsAPI.Repositories
{
    public class AccountRepository : IAccountRepository
    {
        private readonly DataContext _context;
        public AccountRepository(DataContext context)
        {
            _context = context;
        }

        public async Task<bool> UserExistsAsync(string firstname, string lastname, string email)
        {
            return await _context.Users.AnyAsync(x =>
                (x.FirstName.ToLower() == firstname.ToLower() &&
                 x.LastName.ToLower() == lastname.ToLower()) ||
                 x.Email.ToLower() == email.ToLower());
        }

        public async Task<User?> GetUserByEmailAsync(string email)
        {
            return await _context.Users
                .Include(u => u.PaysNavigation)
                .Include(u => u.Role)
                .Include(u => u.SocieteUsers)
                    .ThenInclude(su => su.Societe)
                .FirstOrDefaultAsync(x => x.Email.ToLower() == email.ToLower());
        }

        public async Task AddUserAsync(User user)
        {
            await _context.Users.AddAsync(user);
        }

        // Ajout de la méthode pour ajouter un contrat
        public async Task AddContractAsync(Contrat contrat)
        {
            await _context.Contrats.AddAsync(contrat);
        }

        public async Task<bool> SaveAllAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<Pays?> GetPaysByIdAsync(int paysId)
        {
            return await _context.Pays.FindAsync(paysId);
        }

        public async Task<int> GetRoleIdByNameAsync(string roleName)
        {
            var role = await _context.Roles.FirstOrDefaultAsync(r => r.Name.ToLower() == roleName.ToLower());
            if (role == null)
                throw new Exception("Role not found");
            return role.Id;
        }
    }
}
