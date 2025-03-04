using GestionTicketsAPI.Data;
using GestionTicketsAPI.Entities;
using GestionTicketsAPI.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace GestionTicketsAPI.Repositories
{
    public class ValidationRepository : IValidationRepository
    {
        private readonly DataContext _context;
        public ValidationRepository(DataContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Validation>> GetAllAsync()
        {
            return await _context.Validation.ToListAsync();
        }

        public async Task<Validation> GetByIdAsync(int id)
        {
            return await _context.Validation.FindAsync(id);
        }

        public async Task<Validation> CreateAsync(Validation validation)
        {
            _context.Validation.Add(validation);
            await _context.SaveChangesAsync();
            return validation;
        }

        public async Task UpdateAsync(Validation validation)
        {
            _context.Validation.Update(validation);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var validation = await _context.Validation.FindAsync(id);
            if (validation != null)
            {
                _context.Validation.Remove(validation);
                await _context.SaveChangesAsync();
            }
        }
    }
}
