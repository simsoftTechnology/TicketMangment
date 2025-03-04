using GestionTicketsAPI.Entities;
using GestionTicketsAPI.Interfaces;

namespace GestionTicketsAPI.Services
{
    public class QualificationService : IQualificationService
    {
        private readonly IQualificationRepository _qualificationRepository;

        public QualificationService(IQualificationRepository qualificationRepository)
        {
            _qualificationRepository = qualificationRepository;
        }

        public async Task<IEnumerable<Qualification>> GetAllAsync()
        {
            return await _qualificationRepository.GetAllAsync();
        }

        public async Task<Qualification?> GetByIdAsync(int id)
        {
            return await _qualificationRepository.GetByIdAsync(id);
        }

        public async Task<Qualification> AddAsync(Qualification qualification)
        {
            await _qualificationRepository.AddAsync(qualification);
            await _qualificationRepository.SaveAllAsync();
            return qualification;
        }

        public async Task<bool> UpdateAsync(int id, Qualification qualification)
        {
            var existing = await _qualificationRepository.GetByIdAsync(id);
            if (existing == null)
                return false;
            existing.Name = qualification.Name;
            _qualificationRepository.Update(existing);
            return await _qualificationRepository.SaveAllAsync();
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var existing = await _qualificationRepository.GetByIdAsync(id);
            if (existing == null)
                return false;
            _qualificationRepository.Delete(existing);
            return await _qualificationRepository.SaveAllAsync();
        }
    }
}
