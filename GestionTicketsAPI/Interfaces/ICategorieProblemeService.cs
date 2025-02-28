using System.Collections.Generic;
using System.Threading.Tasks;
using GestionTicketsAPI.Entities;
using GestionTicketsAPI.Helpers;

namespace GestionTicketsAPI.Interfaces
{
    public interface ICategorieProblemeService
    {
        Task<IEnumerable<CategorieProbleme>> GetCategoriesAsync();
        Task<PagedList<CategorieProbleme>> GetCategoriesPagedAsync(string searchTerm, int pageNumber, int pageSize);
        Task<CategorieProbleme?> GetCategorieByIdAsync(int id);
        Task<bool> AddCategorieAsync(CategorieProbleme categorie);
        Task<bool> UpdateCategorieAsync(CategorieProbleme categorie);
        Task<bool> DeleteCategorieAsync(int id);
        Task<bool> DeleteMultipleCategoriesAsync(List<int> ids);
    }
}
