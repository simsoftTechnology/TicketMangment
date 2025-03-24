using System;
using GestionTicketsAPI.DTOs;

namespace GestionTicketsAPI.Services;

public interface IPaysService
    {
        Task<IEnumerable<PaysDto>> GetPaysAsync();
        Task<IEnumerable<PaysDto>> GetPaysAsync(string searchTerm);
        Task<PaysDto?> GetPaysByIdAsync(int idPays);
        Task<bool> UpdatePaysAsync(int idPays, PaysUpdateDto paysUpdateDto, IFormFile? file);
        Task<PaysDto> AddPaysAsync(string nom, string? codeTel, IFormFile file);
        Task<bool> DeletePaysAsync(int idPays);
        Task<PhotoDto> AddPhotoAsync(int idPays, IFormFile file);
        Task<bool> PaysExists(string nom);
    }
