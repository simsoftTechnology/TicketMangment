using System;
using GestionTicketsAPI.Entities;
using GestionTicketsAPI.Helpers;

namespace GestionTicketsAPI.Interfaces;

public interface IProjetRepository
    {
        // Projets
        Task<IEnumerable<Projet>> GetProjetsAsync();
        Task<PagedList<Projet>> GetProjetsPagedAsync(UserParams projetParams);
        Task<Projet?> GetProjetByIdAsync(int id);
        Task AddProjetAsync(Projet projet);
        void UpdateProjet(Projet projet);
        void RemoveProjet(Projet projet);
        Task<bool> ProjetExistsAsync(int id);
        Task<bool> SaveAllAsync();

        // Gestion des associations ProjetUser
        Task AddProjetUserAsync(ProjetUser projetUser);
        Task<ProjetUser?> GetProjetUserAsync(int projetId, int userId);
        void RemoveProjetUser(ProjetUser projetUser);
        Task<IEnumerable<dynamic>> GetMembresProjetAsync(int projetId);
        Task<bool> ProjetExists(string nom);
    }
