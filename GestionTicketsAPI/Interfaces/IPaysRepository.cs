using System;
using GestionTicketsAPI.Entities;

namespace GestionTicketsAPI.Interfaces;

public interface IPaysRepository
    {
        Task<IEnumerable<Pays>> GetPaysAsync();
        Task<IEnumerable<Pays>> GetPaysAsync(string searchTerm);
        Task<Pays?> GetPaysByIdAsync(int idPays);
        Task AddPaysAsync(Pays pays);
        void RemovePays(Pays pays);
        Task<bool> PaysExists(string nom);
        Task<bool> SaveAllAsync();
    }
