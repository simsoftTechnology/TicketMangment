using System;
using GestionTicketsAPI.Entities;

namespace GestionTicketsAPI.Interfaces;

public interface IPaysRepository
    {
        Task<IEnumerable<Pays>> GetPaysAsync();
        Task<Pays?> GetPaysByIdAsync(int idPays);
        Task AddPaysAsync(Pays pays);
        void RemovePays(Pays pays);
        Task<bool> SaveAllAsync();
    }
