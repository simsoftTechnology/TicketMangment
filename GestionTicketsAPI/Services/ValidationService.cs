using GestionTicketsAPI.Entities;
using GestionTicketsAPI.Repositories.Interfaces;
using GestionTicketsAPI.Services.Interfaces;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace GestionTicketsAPI.Services
{
  public class ValidationService : IValidationService
  {
    private readonly IValidationRepository _repository;
    public ValidationService(IValidationRepository repository)
    {
      _repository = repository;
    }

    public async Task<IEnumerable<Validation>> GetAllValidationsAsync()
    {
      return await _repository.GetAllAsync();
    }

    public async Task<Validation> GetValidationByIdAsync(int id)
    {
      return await _repository.GetByIdAsync(id);
    }

    public async Task<Validation> CreateValidationAsync(Validation validation)
    {
      return await _repository.CreateAsync(validation);
    }

    public async Task UpdateValidationAsync(Validation validation)
    {
      await _repository.UpdateAsync(validation);
    }

    public async Task DeleteValidationAsync(int id)
    {
      await _repository.DeleteAsync(id);
    }

    public async Task<bool> ValidationExists(string uniqueField)
    {
      return await _repository.ValidationExists(uniqueField);
    }
  }
}
