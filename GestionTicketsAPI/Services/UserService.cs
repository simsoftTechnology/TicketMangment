using System;
using AutoMapper;
using Azure;
using GestionTicketsAPI.DTOs;
using GestionTicketsAPI.Helpers;
using GestionTicketsAPI.Interfaces;
using Microsoft.AspNetCore.Http.HttpResults;

namespace GestionTicketsAPI.Services;

public class UserService : IUserService
{
  private readonly IUserRepository _userRepository;
  private readonly IMapper _mapper;

  public UserService(IUserRepository userRepository, IMapper mapper)
  {
    _userRepository = userRepository;
    _mapper = mapper;
  }

  public async Task<PagedList<UserDto>> GetAllUsersAsync(UserParams userParams)
{
    // Récupération des entités paginées
    var users = await _userRepository.GetUsersAsync(userParams);
    
    // Transformation des entités en DTOs
    var userDtos = _mapper.Map<IEnumerable<UserDto>>(users);
    
    // Création d’une PagedList<UserDto> en préservant les métadonnées de pagination
    var pagedUserDtos = new PagedList<UserDto>(
        userDtos.ToList(),
        users.TotalCount,
        users.CurrentPage,
        users.PageSize
    );
    
    return pagedUserDtos;
}


public async Task<IEnumerable<UserDto>> GetAllUsersNoPaginationAsync()
{
    // Récupère tous les utilisateurs sans pagination
    var users = await _userRepository.GetUsersNoPaginationAsync(); // Tu auras besoin d'ajouter cette méthode dans ton repository
    return _mapper.Map<IEnumerable<UserDto>>(users);
}



  public async Task<UserDto?> GetUserByIdAsync(int id)
  {
    var user = await _userRepository.GetUserByIdAsync(id);
    if (user == null)
      return null;

    return _mapper.Map<UserDto>(user);
  }

  public async Task<bool> DeleteUserAsync(int id)
  {
    // Récupérer l'utilisateur avec ses associations pour supprimer les liens
    var user = await _userRepository.GetUserWithProjetUsersAsync(id);
    if (user == null)
      return false;

    return await _userRepository.DeleteUserAsync(user);
  }
}
