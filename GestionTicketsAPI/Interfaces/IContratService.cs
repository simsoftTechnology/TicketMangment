using System;
using GestionTicketsAPI.DTOs;

namespace GestionTicketsAPI.Interfaces;

public interface IContratService
    {
        Task<ContratDto?> GetContratByIdAsync(int id);
        Task<ContratDto> AddContratAsync(ContratDto contratDto);
        Task<bool> UpdateContratAsync(int id, ContratDto contratDto);
        Task<bool> DeleteContratAsync(int id);
    }
