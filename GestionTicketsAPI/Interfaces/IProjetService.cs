using System;
using GestionTicketsAPI.DTOs;
using GestionTicketsAPI.Helpers;

namespace GestionTicketsAPI.Interfaces;

public interface IProjetService
    {
        Task<IEnumerable<ProjetDto>> GetProjetsAsync();
        Task<PagedList<ProjetDto>> GetProjetsPagedAsync(UserParams projetParams);
        Task<ProjetDto?> GetProjetByIdAsync(int id);
        Task<ProjetDto> AddProjetAsync(ProjetDto projetDto);
        Task<bool> UpdateProjetAsync(int id, ProjetDto projetDto);
        Task<bool> DeleteProjetAsync(int id);
        Task<bool> DeleteProjetsAsync(List<int> ids);
        Task<bool> AjouterUtilisateurAuProjetAsync(int projetId, ProjetUserDto projetUserDto);
        Task<object> AssignerRoleAsync(int projetId, int userId, string role);
        Task<IEnumerable<dynamic>> GetMembresProjetAsync(int projetId);
        Task<bool> SupprimerUtilisateurDuProjetAsync(int projetId, int userId);
    }
