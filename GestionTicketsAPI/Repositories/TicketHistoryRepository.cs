using GestionTicketsAPI.Entities;
using System;
using GestionTicketsAPI.Data; 
using GestionTicketsAPI.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using GestionTicketsAPI.Interfaces;
using DocumentFormat.OpenXml.Office2010.Excel;

namespace GestionTicketsAPI.Repositories
{
    public class TicketHistoryRepository : ITicketHistoryRepository
    {

        private readonly DataContext _context; // your DbContext

        public TicketHistoryRepository(DataContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public async Task<Result> AddAsync(TicketHistory history)
        {
                Result ret = new Result();
            try
            {
                await _context.TicketHistories.AddAsync(history);
                ret.statut = true;
                ret.reslut = "success";
                return ret;
            }
            catch (Exception ex)
            {               
                ret.statut = false;
                ret.reslut = $"Erreur lors de l ajout history : {ex.Message}";
                return ret; // Retourne false si erreur
            }
        }
    }
}