using System;
using AutoMapper;
using GestionTicketsAPI.DTOs;
using GestionTicketsAPI.Entities;
using GestionTicketsAPI.Interfaces;

namespace GestionTicketsAPI.Services;

public class ContratService : IContratService
    {
        private readonly IContratRepository _contratRepository;
        private readonly IMapper _mapper;

        public ContratService(IContratRepository contratRepository, IMapper mapper)
        {
            _contratRepository = contratRepository;
            _mapper = mapper;
        }

        public async Task<ContratDto?> GetContratByIdAsync(int id)
        {
            var contrat = await _contratRepository.GetContratByIdAsync(id);
            return contrat == null ? null : _mapper.Map<ContratDto>(contrat);
        }

        public async Task<ContratDto> AddContratAsync(ContratDto contratDto)
        {
            var contrat = _mapper.Map<Contrat>(contratDto);
            await _contratRepository.AddContratAsync(contrat);
            await _contratRepository.SaveAllAsync();
            return _mapper.Map<ContratDto>(contrat);
        }

        public async Task<bool> UpdateContratAsync(int id, ContratDto contratDto)
        {
            var existingContrat = await _contratRepository.GetContratByIdAsync(id);
            if (existingContrat == null)
                return false;

            _mapper.Map(contratDto, existingContrat);
            _contratRepository.UpdateContrat(existingContrat);
            return await _contratRepository.SaveAllAsync();
        }

        public async Task<bool> DeleteContratAsync(int id)
        {
            var contrat = await _contratRepository.GetContratByIdAsync(id);
            if (contrat == null)
                return false;

            return await _contratRepository.DeleteContratAsync(contrat);
        }
    }
