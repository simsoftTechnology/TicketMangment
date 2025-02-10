using AutoMapper;
using GestionTicketsAPI.DTOs;
using GestionTicketsAPI.Entities;
using GestionTicketsAPI.Helpers;
using GestionTicketsAPI.Interfaces;

namespace GestionTicketsAPI.Services;

public class SocieteService : ISocieteService
{
  private readonly ISocieteRepository _societeRepository;
  private readonly IMapper _mapper;

  public SocieteService(ISocieteRepository societeRepository, IMapper mapper)
  {
    _societeRepository = societeRepository;
    _mapper = mapper;
  }

  public async Task<IEnumerable<SocieteDto>> GetAllSocietesAsync()
  {
    var societes = await _societeRepository.GetAllSocietesAsync();
    return _mapper.Map<IEnumerable<SocieteDto>>(societes);
  }

  public async Task<PagedList<SocieteDto>> GetSocietesPagedAsync(UserParams userParams)
  {
    var societesPaged = await _societeRepository.GetSocietesPagedAsync(userParams);
    var societesDto = _mapper.Map<IEnumerable<SocieteDto>>(societesPaged);

    // Création d'une PagedList de ProjetDto en préservant les métadonnées de pagination
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
    var societe = _mapper.Map<Societe>(societeDto);
    await _societeRepository.AddSocieteAsync(societe);
    await _societeRepository.SaveAllAsync();
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
    var societe = await _societeRepository.GetSocieteByIdAsync(id);
    if (societe == null)
      return false;

    _societeRepository.RemoveSociete(societe);
    return await _societeRepository.SaveAllAsync();
  }
}