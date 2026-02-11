using GestionTicketsAPI.Data;
using GestionTicketsAPI.Entities;
using GestionTicketsAPI.Interfaces;
using GestionTicketsAPI.Repositories;
using GestionTicketsAPI.Repositories.Interfaces;

namespace GestionTicketsAPI.Services
{
    public class TicketHistryService 
    {
        private readonly ITicketRepository _ticketRepository;
        private readonly ITicketHistoryRepository _ticketHistoryRepository;
        private readonly DataContext _context;

        public TicketHistryService(DataContext context, ITicketRepository ticketRepository, ITicketHistoryRepository ticketHistoryRepository)
        {
            _context = context;
            _ticketRepository = ticketRepository ;
            _ticketHistoryRepository = ticketHistoryRepository;

        }
        public async Task<Result> ReOpenTicketAsync(int id)
        {
            Result ret = new Result();
            try
            {
                //var ticket = await _ticketRepository.GetSimpleTicketByIdAsync(id);

                //if (ticket == null)
                //   { ret.statut = false;
                //    ret.reslut = "null ticket";
                //    return ret;
                //}

                // 🔄 Mettre à jour le statut
                //ticket.StatutId = 4; // Reopened
                //ticket.UpdatedAt = DateTime.UtcNow;

                // 📝 Ajouter l'historique
                var history = new TicketHistory
                {
                    TicketId = id,
                    Description = "Ticket reopened",
                    CreatedAt = DateTime.UtcNow
                };

                ret = await _ticketHistoryRepository.AddAsync(history);

                //// 💾 Sauvegarder tout en une fois
                //await _ticketRepository.SaveAllAsync(); // ou _context.SaveChangesAsync()
              
                return ret;
            }
            catch (Exception ex)
            {
                // 🔹 Ici tu peux logger l'erreur pour debugger
                // Exemple: Console.WriteLine ou ILogger
                Console.WriteLine($"Erreur lors de la réouverture du ticket {id}: {ex.Message}");

                ret.statut = false;
                ret.reslut = $"Erreur lors de la réouverture du ticket {id}: {ex.Message}";
                return ret; // Retourne false si erreur
            }
        }

    }
}
