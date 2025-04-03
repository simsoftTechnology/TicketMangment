using System;
using GestionTicketsAPI.DTOs;
using GestionTicketsAPI.Helpers;

namespace GestionTicketsAPI.Interfaces;

 public interface ISocieteService
    {
        Task<IEnumerable<SocieteDto>> GetAllSocietesAsync(string? searchTerm = null, string? pays = null);
        Task<PagedList<SocieteDto>> GetSocietesPagedAsync(UserParams userParams);
        Task<SocieteDto?> GetSocieteByIdAsync(int id);
        Task<SocieteDetailsDto?> GetSocieteWithDetailsByIdAsync(int id);
        Task<SocieteDto> AddSocieteAsync(SocieteDto societeDto);
        Task<bool> UpdateSocieteAsync(int id, SocieteDto societeDto);
        Task<bool> DeleteSocieteAsync(int id);
        Task<bool> DeleteSocietesAsync(List<int> ids);
        Task<PagedList<UserDto>> GetSocieteUsersPagedAsync(int societeId, UserParams userParams);
        Task<bool> AttachUserToSocieteAsync(int societeId, int userId);
        Task<bool> DetachUserFromSocieteAsync(int societeId, int userId);
        Task<bool> SocieteExists(string nom);
    }
