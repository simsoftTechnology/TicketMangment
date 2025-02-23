using System;
using GestionTicketsAPI.Data;
using GestionTicketsAPI.Entities;
using GestionTicketsAPI.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace GestionTicketsAPI.Repositories;

public class ContratRepository : IContratRepository
    {
        private readonly DataContext _context;
        public ContratRepository(DataContext context)
        {
            _context = context;
        }

        public async Task<Contrat?> GetContratByIdAsync(int id)
        {
            return await _context.Contrats.FirstOrDefaultAsync(c => c.Id == id);
        }

        public async Task AddContratAsync(Contrat contrat)
        {
            await _context.Contrats.AddAsync(contrat);
        }

        public void UpdateContrat(Contrat contrat)
        {
            _context.Contrats.Update(contrat);
        }

        public async Task<bool> DeleteContratAsync(Contrat contrat)
        {
            _context.Contrats.Remove(contrat);
            return await SaveAllAsync();
        }

        public async Task<bool> SaveAllAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }
    }
