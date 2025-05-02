using System.Collections.Generic;
using System.Threading.Tasks;
using GestionTicketsAPI.Entities;
using GestionTicketsAPI.Helpers;

namespace GestionTicketsAPI.Interfaces
{
    public interface ICategorieProblemeRepository
    {
        Task<IEnumerable<CategorieProbleme>> GetCategoriesAsync();
        Task<PagedList<CategorieProbleme>> GetCategoriesPagedAsync(string searchTerm, int pageNumber, int pageSize);
        Task<CategorieProbleme?> GetCategorieByIdAsync(int id);
        
        // Nouvelle méthode pour récupérer plusieurs catégories par leurs IDs
        Task<IEnumerable<CategorieProbleme>> GetCategoriesByIdsAsync(List<int> ids);
        
        Task AddCategorieAsync(CategorieProbleme categorie);
        void UpdateCategorie(CategorieProbleme categorie);
        void DeleteCategorie(CategorieProbleme categorie);
        
        // Nouvelle méthode pour supprimer un ensemble de catégories
        void DeleteCategoriesRange(IEnumerable<CategorieProbleme> categories);
        Task<bool> CategorieExists(string nom);
        Task<bool> SaveAllAsync();
    }
}
