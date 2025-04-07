using GestionTicketsAPI.Entities;
using GestionTicketsAPI.Helpers;
using GestionTicketsAPI.Interfaces;
using GestionTicketsAPI.Repositories;

namespace GestionTicketsAPI.Services
{
  public class CategorieProblemeService : ICategorieProblemeService
  {
    private readonly ICategorieProblemeRepository _categorieRepository;
    private readonly ITicketRepository _ticketRepository;
    public CategorieProblemeService(ITicketRepository ticketRepository, ICategorieProblemeRepository categorieRepository)
    {
      _categorieRepository = categorieRepository;
      _ticketRepository = ticketRepository;
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
      if (categorie == null)
        throw new Exception("La catégorie n'existe pas.");

      // Vérification si la catégorie est utilisée par des tickets
      var ticketsUsingCategory = await _ticketRepository.GetTicketsByCategoryIdAsync(id);
      if (ticketsUsingCategory != null && ticketsUsingCategory.Any())
        throw new Exception("La catégorie est utilisée par un ou plusieurs tickets et ne peut pas être supprimée.");

      _categorieRepository.DeleteCategorie(categorie);
      if (!await _categorieRepository.SaveAllAsync())
        throw new Exception("Une erreur est survenue lors de la suppression de la catégorie.");

      return true;
    }



    // Méthode corrigée pour supprimer plusieurs catégories
    public async Task<bool> DeleteMultipleCategoriesAsync(List<int> ids)
    {
      var categories = await _categorieRepository.GetCategoriesByIdsAsync(ids);
      if (categories == null || !categories.Any())
        return false;

      // Filtrer les catégories qui ne sont pas utilisées par un ticket
      var categoriesToDelete = new List<CategorieProbleme>();
      foreach (var categorie in categories)
      {
        var ticketsUsingCategory = await _ticketRepository.GetTicketsByCategoryIdAsync(categorie.Id);
        if (ticketsUsingCategory == null || !ticketsUsingCategory.Any())
        {
          categoriesToDelete.Add(categorie);
        }
      }

      // Si aucune catégorie n'est éligible à la suppression, retourner false ou gérer le cas autrement
      if (!categoriesToDelete.Any())
        return false;

      _categorieRepository.DeleteCategoriesRange(categoriesToDelete);
      return await _categorieRepository.SaveAllAsync();
    }
    public async Task<bool> CategorieExists(string nom)
    {
      return await _categorieRepository.CategorieExists(nom);
    }
  }
}
