using System;
using GestionTicketsAPI.Entities;

namespace GestionTicketsAPI.Interfaces;

public interface IContratRepository
    {
        Task<Contrat?> GetContratByIdAsync(int id);
        Task AddContratAsync(Contrat contrat);
        void UpdateContrat(Contrat contrat);
        Task<bool> DeleteContratAsync(Contrat contrat);
        Task<bool> SaveAllAsync();
    }
