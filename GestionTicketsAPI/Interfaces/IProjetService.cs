using GestionTicketsAPI.DTOs;
using GestionTicketsAPI.Entities;
using GestionTicketsAPI.Helpers;

namespace GestionTicketsAPI.Interfaces
{
  public interface IProjetService
  {
    Task<IEnumerable<ProjetDto>> GetProjetsAsync();
    Task<PagedList<ProjetDto>> GetProjetsPagedAsync(UserParams projetParams);
    Task<ProjetDto?> GetProjetByIdAsync(int id);
    Task<ProjetDto> AddProjetAsync(ProjetDto projetDto);
    Task<bool> UpdateProjetAsync(int id, ProjetDto projetDto);
    Task<bool> DeleteProjetAsync(int id);
    Task<bool> DeleteProjetsAsync(List<int> ids);
    Task<IEnumerable<Projet>> GetProjetsForUserAsync(int userId);
    Task<bool> AjouterUtilisateurAuProjetAsync(int projetId, ProjetUserDto projetUserDto);
    // La méthode AssignerRoleAsync a été supprimée
    Task<IEnumerable<dynamic>> GetMembresProjetAsync(int projetId);
    Task<bool> SupprimerUtilisateurDuProjetAsync(int projetId, int userId);
    Task<bool> ProjetExists(string nom);
    Task<IEnumerable<ProjetDto>> GetProjetsBySocieteIdAsync(int societeId);

  }
}
