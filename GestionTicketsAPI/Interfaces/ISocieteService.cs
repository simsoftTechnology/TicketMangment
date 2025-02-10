using System;
using GestionTicketsAPI.DTOs;
using GestionTicketsAPI.Helpers;

namespace GestionTicketsAPI.Interfaces;

 public interface ISocieteService
    {
        Task<IEnumerable<SocieteDto>> GetAllSocietesAsync();
        Task<PagedList<SocieteDto>> GetSocietesPagedAsync(UserParams userParams);
        Task<SocieteDto?> GetSocieteByIdAsync(int id);
        Task<SocieteDetailsDto?> GetSocieteWithDetailsByIdAsync(int id);
        Task<SocieteDto> AddSocieteAsync(SocieteDto societeDto);
        Task<bool> UpdateSocieteAsync(int id, SocieteDto societeDto);
        Task<bool> DeleteSocieteAsync(int id);
    }
