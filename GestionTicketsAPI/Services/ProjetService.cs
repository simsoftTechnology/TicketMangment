using System;
using AutoMapper;
using GestionTicketsAPI.DTOs;
using GestionTicketsAPI.Entities;
using GestionTicketsAPI.Helpers;
using GestionTicketsAPI.Interfaces;

namespace GestionTicketsAPI.Services;

public class ProjetService : IProjetService
    {
        private readonly IProjetRepository _projetRepository;
        private readonly IMapper _mapper;

        public ProjetService(IProjetRepository projetRepository, IMapper mapper)
        {
            _projetRepository = projetRepository;
            _mapper = mapper;
        }

        public async Task<IEnumerable<ProjetDto>> GetProjetsAsync()
        {
            var projets = await _projetRepository.GetProjetsAsync();
            return _mapper.Map<IEnumerable<ProjetDto>>(projets);
        }


        // Nouvelle méthode pour la récupération paginée
        public async Task<PagedList<ProjetDto>> GetProjetsPagedAsync(UserParams projetParams)
        {
            var projetsPaged = await _projetRepository.GetProjetsPagedAsync(projetParams);
            var projetsDto = _mapper.Map<IEnumerable<ProjetDto>>(projetsPaged);

            // Création d'une PagedList de ProjetDto en préservant les métadonnées de pagination
            var pagedProjetDtos = new PagedList<ProjetDto>(
                projetsDto.ToList(),
                projetsPaged.TotalCount,
                projetsPaged.CurrentPage,
                projetsPaged.PageSize
            );

            return pagedProjetDtos;
        }

        public async Task<ProjetDto?> GetProjetByIdAsync(int id)
        {
            var projet = await _projetRepository.GetProjetByIdAsync(id);
            if (projet == null) return null;
            return _mapper.Map<ProjetDto>(projet);
        }

        public async Task<ProjetDto> AddProjetAsync(ProjetDto projetDto)
        {
            var projet = _mapper.Map<Projet>(projetDto);
            await _projetRepository.AddProjetAsync(projet);
            await _projetRepository.SaveAllAsync();
            return _mapper.Map<ProjetDto>(projet);
        }

        public async Task<bool> UpdateProjetAsync(int id, ProjetDto projetDto)
        {
            if (id != projetDto.Id)
                return false;

            var projet = _mapper.Map<Projet>(projetDto);
            _projetRepository.UpdateProjet(projet);
            try
            {
                return await _projetRepository.SaveAllAsync();
            }
            catch (Exception)
            {
                if (!await _projetRepository.ProjetExistsAsync(id))
                {
                    return false;
                }
                else
                {
                    throw;
                }
            }
        }

        public async Task<bool> DeleteProjetAsync(int id)
        {
            var projet = await _projetRepository.GetProjetByIdAsync(id);
            if (projet == null) return false;

            // Supprimer les associations dans ProjetUser, s'il y en a
            if (projet.ProjetUsers != null && projet.ProjetUsers.Any())
            {
                foreach (var pu in projet.ProjetUsers)
                {
                    _projetRepository.RemoveProjetUser(pu);
                }
            }
            _projetRepository.RemoveProjet(projet);
            return await _projetRepository.SaveAllAsync();
        }

        public async Task<bool> AjouterUtilisateurAuProjetAsync(int projetId, ProjetUserDto projetUserDto)
        {
            var projet = await _projetRepository.GetProjetByIdAsync(projetId);
            if (projet == null) return false;
            // On considère que la vérification de l'existence de l'utilisateur est effectuée ailleurs
            var projetUser = new ProjetUser
            {
                ProjetId = projetId,
                UserId = projetUserDto.UserId,
                Role = projetUserDto.Role
            };
            await _projetRepository.AddProjetUserAsync(projetUser);
            return await _projetRepository.SaveAllAsync();
        }

        public async Task<object> AssignerRoleAsync(int projetId, int userId, string role)
        {
            var projetUser = await _projetRepository.GetProjetUserAsync(projetId, userId);
            if (projetUser == null)
            {
                // Création d'une nouvelle association
                projetUser = new ProjetUser
                {
                    ProjetId = projetId,
                    UserId = userId,
                    Role = role
                };
                await _projetRepository.AddProjetUserAsync(projetUser);
            }
            else
            {
                // Mise à jour du rôle existant
                projetUser.Role = role;
            }
            await _projetRepository.SaveAllAsync();
            return projetUser;
        }

        public async Task<IEnumerable<dynamic>> GetMembresProjetAsync(int projetId)
        {
            return await _projetRepository.GetMembresProjetAsync(projetId);
        }

        public async Task<bool> SupprimerUtilisateurDuProjetAsync(int projetId, int userId)
        {
            var projetUser = await _projetRepository.GetProjetUserAsync(projetId, userId);
            if (projetUser == null) return false;
            _projetRepository.RemoveProjetUser(projetUser);
            return await _projetRepository.SaveAllAsync();
        }
    }
