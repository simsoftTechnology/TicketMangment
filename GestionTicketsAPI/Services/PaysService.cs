using System;
using AutoMapper;
using GestionTicketsAPI.DTOs;
using GestionTicketsAPI.Entities;
using GestionTicketsAPI.Interfaces;

namespace GestionTicketsAPI.Services;

public class PaysService : IPaysService
    {
        private readonly IPaysRepository _paysRepository;
        private readonly IPhotoService _photoService;
        private readonly IMapper _mapper;

        public PaysService(IPaysRepository paysRepository, IPhotoService photoService, IMapper mapper)
        {
            _paysRepository = paysRepository;
            _photoService = photoService;
            _mapper = mapper;
        }

        public async Task<IEnumerable<PaysDto>> GetPaysAsync()
        {
            var paysList = await _paysRepository.GetPaysAsync();
            return _mapper.Map<IEnumerable<PaysDto>>(paysList);
        }

        public async Task<IEnumerable<PaysDto>> GetPaysAsync(string searchTerm)
        {
            var paysList = await _paysRepository.GetPaysAsync(searchTerm);
            return _mapper.Map<IEnumerable<PaysDto>>(paysList);
        }

        public async Task<PaysDto?> GetPaysByIdAsync(int idPays)
        {
            var pays = await _paysRepository.GetPaysByIdAsync(idPays);
            if (pays == null) return null;
            return _mapper.Map<PaysDto>(pays);
        }

        public async Task<bool> UpdatePaysAsync(int idPays, PaysUpdateDto paysUpdateDto, IFormFile? file)
        {
            var pays = await _paysRepository.GetPaysByIdAsync(idPays);
            if (pays == null) return false;

            // Mettre à jour le nom si fourni
            if (!string.IsNullOrWhiteSpace(paysUpdateDto.Nom))
                pays.Nom = paysUpdateDto.Nom;

            // Mettre à jour la photo si un fichier est fourni
            if (file != null && file.Length > 0)
            {
                if (pays.paysPhoto != null)
                {
                    var deleteResult = await _photoService.DeletePhotoAsync(pays.paysPhoto.PublicId);
                    if (deleteResult.Error != null) return false;
                    // Suppression de l'enregistrement de la photo est gérée par le DataContext via la relation
                }

                var result = await _photoService.AddPhotoAsync(file);
                if (result.Error != null) return false;

                var newPhoto = new Photo
                {
                    Url = result.SecureUrl.AbsoluteUri,
                    PublicId = result.PublicId,
                    PaysId = idPays
                };

                pays.paysPhoto = newPhoto;
            }

            return await _paysRepository.SaveAllAsync();
        }

        public async Task<PaysDto> AddPaysAsync(string nom, IFormFile file)
        {
            if (string.IsNullOrWhiteSpace(nom))
                throw new Exception("Le nom du pays est requis.");
            if (file == null || file.Length == 0)
                throw new Exception("Veuillez fournir une photo valide.");

            var result = await _photoService.AddPhotoAsync(file);
            if (result.Error != null)
                throw new Exception(result.Error.Message);

            var photo = new Photo
            {
                Url = result.SecureUrl.AbsoluteUri,
                PublicId = result.PublicId
            };

            var pays = new Pays
            {
                Nom = nom,
                paysPhoto = photo
            };

            await _paysRepository.AddPaysAsync(pays);
            if (!await _paysRepository.SaveAllAsync())
                throw new Exception("Erreur lors de l'ajout du pays.");

            return _mapper.Map<PaysDto>(pays);
        }

        public async Task<bool> DeletePaysAsync(int idPays)
        {
            var pays = await _paysRepository.GetPaysByIdAsync(idPays);
            if (pays == null) return false;

            if (pays.paysPhoto != null)
            {
                var deleteResult = await _photoService.DeletePhotoAsync(pays.paysPhoto.PublicId);
                if (deleteResult.Error != null) return false;
            }

            _paysRepository.RemovePays(pays);
            return await _paysRepository.SaveAllAsync();
        }

        public async Task<PhotoDto> AddPhotoAsync(int idPays, IFormFile file)
        {
            if (file == null || file.Length == 0)
                throw new Exception("Le fichier fourni est invalide.");

            var pays = await _paysRepository.GetPaysByIdAsync(idPays);
            if (pays == null)
                throw new Exception("Le pays spécifié n'existe pas.");

            var result = await _photoService.AddPhotoAsync(file);
            if (result.Error != null)
                throw new Exception(result.Error.Message);

            var photo = new Photo
            {
                Url = result.SecureUrl.AbsoluteUri,
                PublicId = result.PublicId,
                PaysId = idPays
            };

            pays.paysPhoto = photo;
            if (!await _paysRepository.SaveAllAsync())
                throw new Exception("Erreur lors de l'ajout de la photo.");

            return _mapper.Map<PhotoDto>(photo);
        }
    }
