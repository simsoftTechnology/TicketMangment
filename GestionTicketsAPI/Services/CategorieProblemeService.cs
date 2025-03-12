using GestionTicketsAPI.Entities;
using GestionTicketsAPI.Helpers;
using GestionTicketsAPI.Interfaces;

namespace GestionTicketsAPI.Services
{
  public class CategorieProblemeService : ICategorieProblemeService
  {
    private readonly ICategorieProblemeRepository _categorieRepository;

    public CategorieProblemeService(ICategorieProblemeRepository categorieRepository)
    {
      _categorieRepository = categorieRepository;
    }

    public async Task<IEnumerable<CategorieProbleme>> GetCategoriesAsync()
    {
      return await _categorieRepository.GetCategoriesAsync();
    }

    public async Task<PagedList<CategorieProbleme>> GetCategoriesPagedAsync(string searchTerm, int pageNumber, int pageSize)
    {
      return await _categorieRepository.GetCategoriesPagedAsync(searchTerm, pageNumber, pageSize);
    }

    public async Task<CategorieProbleme?> GetCategorieByIdAsync(int id)
    {
      return await _categorieRepository.GetCategorieByIdAsync(id);
    }

    public async Task<bool> AddCategorieAsync(CategorieProbleme categorie)
    {
      await _categorieRepository.AddCategorieAsync(categorie);
      return await _categorieRepository.SaveAllAsync();
    }

    public async Task<bool> UpdateCategorieAsync(CategorieProbleme categorie)
    {
      _categorieRepository.UpdateCategorie(categorie);
      return await _categorieRepository.SaveAllAsync();
    }

    public async Task<bool> DeleteCategorieAsync(int id)
    {
      var categorie = await _categorieRepository.GetCategorieByIdAsync(id);
      if (categorie == null) return false;

      _categorieRepository.DeleteCategorie(categorie);
      return await _categorieRepository.SaveAllAsync();
    }

    // Méthode corrigée pour supprimer plusieurs catégories
    public async Task<bool> DeleteMultipleCategoriesAsync(List<int> ids)
    {
      var categories = await _categorieRepository.GetCategoriesByIdsAsync(ids);
      if (categories == null || !categories.Any())
        return false;

      _categorieRepository.DeleteCategoriesRange(categories);
      return await _categorieRepository.SaveAllAsync();
    }

    public async Task<bool> CategorieExists(string nom)
    {
        return await _categorieRepository.CategorieExists(nom);
    }
  }
}
