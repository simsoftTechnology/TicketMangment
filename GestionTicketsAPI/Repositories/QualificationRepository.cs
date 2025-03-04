using GestionTicketsAPI.Data;
using GestionTicketsAPI.Entities;
using GestionTicketsAPI.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace GestionTicketsAPI.Repositories
{
    public class QualificationRepository : IQualificationRepository
    {
        private readonly DataContext _context;
        public QualificationRepository(DataContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Qualification>> GetAllAsync()
        {
            return await _context.Qualifications.ToListAsync();
        }

        public async Task<Qualification?> GetByIdAsync(int id)
        {
            return await _context.Qualifications.FirstOrDefaultAsync(q => q.Id == id);
        }

        public async Task AddAsync(Qualification qualification)
        {
            await _context.Qualifications.AddAsync(qualification);
        }

        public void Update(Qualification qualification)
        {
            _context.Entry(qualification).State = EntityState.Modified;
        }

        public void Delete(Qualification qualification)
        {
            _context.Qualifications.Remove(qualification);
        }

        public async Task<bool> SaveAllAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }
    }
}
