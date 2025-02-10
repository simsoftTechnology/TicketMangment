using System;
using GestionTicketsAPI.Data;
using GestionTicketsAPI.Entities;
using GestionTicketsAPI.Helpers;
using GestionTicketsAPI.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace GestionTicketsAPI.Repositories;

public class UserRepository : IUserRepository
    {
        private readonly DataContext _context;
        
        public UserRepository(DataContext context)
        {
            _context = context;
        }
        
        public async Task<PagedList<User>> GetUsersAsync(UserParams userParams)
        {
            var query = _context.Users;
            return await PagedList<User>.CreateAsync(query, userParams.PageNumber, userParams.PageSize);
        }

        public async Task<IEnumerable<User>> GetUsersNoPaginationAsync()
        {
            return await _context.Users.ToListAsync();
        }

        
        public async Task<User?> GetUserByIdAsync(int id)
        {
            return await _context.Users.FindAsync(id);
        }
        
        public async Task<User?> GetUserWithProjetUsersAsync(int id)
        {
            return await _context.Users
                .Include(u => u.ProjetUsers) // Vérifie que la propriété ProjetUsers existe dans ton entité User
                .FirstOrDefaultAsync(u => u.Id == id);
        }
        
        public async Task<bool> DeleteUserAsync(User user)
        {
            // Supprime les associations dans ProjetUsers
            _context.ProjetUser.RemoveRange(user.ProjetUsers);
            
            // Supprime l'utilisateur
            _context.Users.Remove(user);
            
            return await SaveAllAsync();
        }
        
        public async Task<bool> SaveAllAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }
    }
