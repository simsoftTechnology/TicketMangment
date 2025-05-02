using System;
using GestionTicketsAPI.DTOs;

namespace GestionTicketsAPI.Services;

public interface IPaysService
    {
        Task<IEnumerable<PaysDto>> GetPaysAsync();
        Task<IEnumerable<PaysDto>> GetPaysAsync(string searchTerm);
        Task<PaysDto?> GetPaysByIdAsync(int idPays);
        Task<bool> UpdatePaysAsync(int idPays, PaysUpdateDto paysUpdateDto, IFormFile? file);
        Task<PaysDto> AddPaysAsync(string nom, string? codeTel, string? fileBase64);

        Task<bool> DeletePaysAsync(int idPays);
        Task<bool> PaysExists(string nom);
    }
