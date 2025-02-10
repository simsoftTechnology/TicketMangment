using System;
using GestionTicketsAPI.DTOs;
using GestionTicketsAPI.Helpers;

namespace GestionTicketsAPI.Interfaces;

public interface IUserService
    {
        // Récupère tous les utilisateurs et les transforme en DTOs
        Task<PagedList<UserDto>> GetAllUsersAsync(UserParams userParams); 

        // Nouvelle méthode sans pagination
        Task<IEnumerable<UserDto>> GetAllUsersNoPaginationAsync();
        
        // Récupère un utilisateur par son identifiant et le transforme en DTO
        Task<UserDto?> GetUserByIdAsync(int id);
        
        // Supprime un utilisateur via son identifiant
        Task<bool> DeleteUserAsync(int id);
    }
