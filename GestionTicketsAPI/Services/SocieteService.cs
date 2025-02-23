using AutoMapper;
using GestionTicketsAPI.DTOs;
using GestionTicketsAPI.Entities;
using GestionTicketsAPI.Helpers;
using GestionTicketsAPI.Interfaces;
using GestionTicketsAPI.Repositories;

namespace GestionTicketsAPI.Services
{
  public class SocieteService : ISocieteService
  {
    private readonly ISocieteRepository _societeRepository;
    private readonly IAccountRepository _accountRepository;
    private readonly IMapper _mapper;

    public SocieteService(ISocieteRepository societeRepository, IAccountRepository accountRepository, IMapper mapper)
    {
      _societeRepository = societeRepository;
      _accountRepository = accountRepository;
      _mapper = mapper;
    }

    public async Task<IEnumerable<SocieteDto>> GetAllSocietesAsync(string? searchTerm = null)
    {
      var societes = await _societeRepository.GetAllSocietesAsync(searchTerm);
      return _mapper.Map<IEnumerable<SocieteDto>>(societes);
    }

    public async Task<PagedList<SocieteDto>> GetSocietesPagedAsync(UserParams userParams)
    {
      var societesPaged = await _societeRepository.GetSocietesPagedAsync(userParams);
      var societesDto = _mapper.Map<IEnumerable<SocieteDto>>(societesPaged);
      var pagedSocieteDtos = new PagedList<SocieteDto>(
          societesDto.ToList(),
          societesPaged.TotalCount,
          societesPaged.CurrentPage,
          societesPaged.PageSize
      );
      return pagedSocieteDtos;
    }

    public async Task<SocieteDto?> GetSocieteByIdAsync(int id)
    {
      var societe = await _societeRepository.GetSocieteByIdAsync(id);
      return societe == null ? null : _mapper.Map<SocieteDto>(societe);
    }

    public async Task<SocieteDetailsDto?> GetSocieteWithDetailsByIdAsync(int id)
    {
      var societe = await _societeRepository.GetSocieteWithDetailsByIdAsync(id);
      return societe == null ? null : _mapper.Map<SocieteDetailsDto>(societe);
    }

    public async Task<SocieteDto> AddSocieteAsync(SocieteDto societeDto)
    {
      // Création de la société partenaire
      var societe = _mapper.Map<Societe>(societeDto);
      await _societeRepository.AddSocieteAsync(societe);
      await _societeRepository.SaveAllAsync(); // À ce stade, societe.Id est généré

      // Création optionnelle d'un contrat avec la société partenaire
      if (societeDto.Contract != null)
      {
        var contrat = new Contrat
        {
          DateDebut = societeDto.Contract.DateDebut,
          DateFin = societeDto.Contract.DateFin,
          Type = societeDto.Contract.Type,
          // Vous pouvez définir le TypeContrat selon votre logique,
          // par exemple "Societe-Societe" pour un contrat avec une société partenaire
          TypeContrat = "Societe-Societe",
          // Affectation automatique de l'ID de la société partenaire créée
          SocietePartenaireId = societe.Id
        };

        await _accountRepository.AddContractAsync(contrat);
        await _societeRepository.SaveAllAsync();
      }

      return _mapper.Map<SocieteDto>(societe);
    }


    public async Task<bool> UpdateSocieteAsync(int id, SocieteDto societeDto)
    {
      var existingSociete = await _societeRepository.GetSocieteByIdAsync(id);
      if (existingSociete == null)
        return false;

      _mapper.Map(societeDto, existingSociete);
      _societeRepository.UpdateSociete(existingSociete);
      return await _societeRepository.SaveAllAsync();
    }

    public async Task<bool> DeleteSocieteAsync(int id)
    {
      return await _societeRepository.DeleteSocieteWithAssociationsAsync(id);
    }

    public async Task<bool> DeleteSocietesAsync(List<int> ids)
    {
      foreach (var id in ids)
      {
        var deleted = await DeleteSocieteAsync(id);
        if (!deleted)
          return false;
      }
      return true;
    }
  }
}
