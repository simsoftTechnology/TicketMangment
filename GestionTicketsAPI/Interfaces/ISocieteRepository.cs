using GestionTicketsAPI.Entities;
using GestionTicketsAPI.Helpers;

namespace GestionTicketsAPI.Interfaces
{
    public interface ISocieteRepository
    {
        Task<IEnumerable<Societe>> GetAllSocietesAsync(string? searchTerm = null);
        Task<PagedList<Societe>> GetSocietesPagedAsync(UserParams userParams);
        Task<Societe?> GetSocieteByIdAsync(int id);
        Task<Societe?> GetSocieteWithDetailsByIdAsync(int id);
        Task AddSocieteAsync(Societe societe);
        void UpdateSociete(Societe societe);
        void RemoveSociete(Societe societe);
        Task<bool> DeleteSocieteWithAssociationsAsync(int id);
        Task<bool> SaveAllAsync();
    }
}
