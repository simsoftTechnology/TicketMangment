using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;
using GestionTicketsAPI.Data;
using GestionTicketsAPI.Entities;
using GestionTicketsAPI.Helpers;
using GestionTicketsAPI.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace GestionTicketsAPI.Repositories
{
    public class CategorieProblemeRepository : ICategorieProblemeRepository
    {
        private readonly DataContext _context;

        public CategorieProblemeRepository(DataContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<CategorieProbleme>> GetCategoriesAsync()
        {
            return await _context.CategorieProblemes.ToListAsync();
        }

        public async Task<PagedList<CategorieProbleme>> GetCategoriesPagedAsync(string searchTerm, int pageNumber, int pageSize)
        {
            var query = _context.CategorieProblemes.AsQueryable();

            if (!string.IsNullOrEmpty(searchTerm))
            {
                query = query.Where(c => c.Nom.ToLower().Contains(searchTerm.ToLower()));
            }

            return await PagedList<CategorieProbleme>.CreateAsync(query, pageNumber, pageSize);
        }

        public async Task<CategorieProbleme?> GetCategorieByIdAsync(int id)
        {
            return await _context.CategorieProblemes.FindAsync(id);
        }

        // Implémentation de la nouvelle méthode
        public async Task<IEnumerable<CategorieProbleme>> GetCategoriesByIdsAsync(List<int> ids)
        {
            return await _context.CategorieProblemes
                                 .Where(c => ids.Contains(c.Id))
                                 .ToListAsync();
        }

        public async Task AddCategorieAsync(CategorieProbleme categorie)
        {
            await _context.CategorieProblemes.AddAsync(categorie);
        }

        public void UpdateCategorie(CategorieProbleme categorie)
        {
            _context.CategorieProblemes.Update(categorie);
        }

        public void DeleteCategorie(CategorieProbleme categorie)
        {
            _context.CategorieProblemes.Remove(categorie);
        }

        // Implémentation de la suppression en masse
        public void DeleteCategoriesRange(IEnumerable<CategorieProbleme> categories)
        {
            _context.CategorieProblemes.RemoveRange(categories);
        }

        public async Task<bool> SaveAllAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }
    }
}
