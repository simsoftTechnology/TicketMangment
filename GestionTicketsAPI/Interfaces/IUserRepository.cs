using System;
using GestionTicketsAPI.DTOs;
using GestionTicketsAPI.Entities;
using GestionTicketsAPI.Helpers;

namespace GestionTicketsAPI.Interfaces;

 public interface IUserRepository
    {
        // Récupère tous les utilisateurs
        Task<PagedList<User>> GetUsersAsync(UserParams userParams);
        
        Task<IEnumerable<User>> GetUsersNoPaginationAsync();
        // Récupère un utilisateur par son identifiant
        Task<User?> GetUserByIdAsync(int id);
        
        // Récupère un utilisateur avec ses associations (pour la suppression)
        Task<User?> GetUserWithProjetUsersAsync(int id);
        
        // Supprime un utilisateur (et ses associations)
        Task<bool> DeleteUserAsync(User user);
        
        // Sauvegarde les modifications dans le contexte
        Task<bool> SaveAllAsync();
    }
