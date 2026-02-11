using System.Globalization;
using GestionTicketsAPI.Data;
using GestionTicketsAPI.Entities;
using GestionTicketsAPI.Helpers;
using GestionTicketsAPI.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Globalization;
using DocumentFormat.OpenXml.Bibliography;

namespace GestionTicketsAPI.Repositories
{
  public class TicketRepository : ITicketRepository
  {
    private readonly DataContext _context;

    public TicketRepository(DataContext context)
    {
      _context = context;
    }

    public async Task<Ticket?> GetTicketByIdAsync(int id)
    {
      return await _context.Tickets
          .Include(t => t.Owner)
          .Include(t => t.ProblemCategory)
          .Include(t => t.Projet)
          .ThenInclude(p => p.ChefProjet)
          .Include(t => t.Projet)
          .ThenInclude(p => p.Societe)
          .Include(t => t.Responsible)
          .Include(t => t.Priority)
          .Include(t => t.Qualification)
          .Include(t => t.Statut)
          .FirstOrDefaultAsync(t => t.Id == id);
    }

        public async Task<Ticket?> GetSimpleTicketByIdAsync(int id)
        {
            return await _context.Tickets.FirstOrDefaultAsync(t => t.Id == id);
        }

        public async Task<IEnumerable<Ticket>> GetTicketsAsync()
    {
      return await _context.Tickets
          .Include(t => t.Owner)
          .Include(t => t.ProblemCategory)
          .Include(t => t.Projet)
            .ThenInclude(p => p.ChefProjet)
          .Include(t => t.Projet)
            .ThenInclude(p => p.Societe)
          .Include(t => t.Responsible)
          .Include(t => t.Priority)
          .Include(t => t.Qualification)
          .Include(t => t.Statut)
          .ToListAsync();
    }

        public async Task<IEnumerable<Ticket>> GetexportedTickets(TicketFilterParams filterParams)
        {
            var query = _context.Tickets
                .Include(t => t.Owner)
                .Include(t => t.ProblemCategory)
                .Include(t => t.Projet)
                    .ThenInclude(p => p.ChefProjet)
                .Include(t => t.Projet)
                    .ThenInclude(p => p.Societe)
                .Include(t => t.Responsible)
                .Include(t => t.Priority)
                .Include(t => t.Qualification)
                .Include(t => t.Statut)

                .OrderByDescending(t => t.CreatedAt)
                .AsQueryable();

            // Filtrage par rôle et utilisateur (la logique existante reste inchangée)
            if (!(filterParams.Role?.Replace(" ", "").Equals("superadmin", StringComparison.OrdinalIgnoreCase) ?? false))
            {
                if (string.Equals(filterParams.Role, "client", StringComparison.OrdinalIgnoreCase))
                {
                    query = query.Where(t => t.OwnerId == filterParams.UserId);
                }
                else if (string.Equals(filterParams.Role, "chef de projet", StringComparison.OrdinalIgnoreCase) ||
                         string.Equals(filterParams.Role, "collaborateur", StringComparison.OrdinalIgnoreCase))
                {
                    if (!string.IsNullOrEmpty(filterParams.FilterType))
                    {
                        if (filterParams.FilterType.Equals("associated", StringComparison.OrdinalIgnoreCase))
                        {
                            query = query.Where(t => t.OwnerId == filterParams.UserId ||
                                                     t.ResponsibleId == filterParams.UserId ||
                                                     (t.Projet != null && t.Projet.ChefProjetId == filterParams.UserId));
                        }
                        else if (filterParams.FilterType.Equals("projetUser", StringComparison.OrdinalIgnoreCase))
                        {
                            query = query.Where(t => _context.ProjetUser.Any(pu => pu.ProjetId == t.Projet.Id && pu.UserId == filterParams.UserId));
                        }
                    }
                    else
                    {
                        query = query.Where(t =>
                            t.OwnerId == filterParams.UserId ||
                            t.ResponsibleId == filterParams.UserId ||
                            (t.Projet != null && t.Projet.ChefProjetId == filterParams.UserId) ||
                            _context.ProjetUser.Any(pu => pu.ProjetId == t.Projet.Id && pu.UserId == filterParams.UserId));
                    }
                }
            }

            // Filtres avancés avec les nouveaux champs
            if (filterParams.Client >= 0)
            {
                query = query.Where(t => t.OwnerId == filterParams.Client);
            }

            if (filterParams.Categorie >= 0)
            {
                query = query.Where(t => t.ProblemCategoryId == filterParams.Categorie);
            }

            if (filterParams.Priorite >= 0)
            {
                query = query.Where(t => t.PriorityId == filterParams.Priorite);
            }

            if (filterParams.Statut >= 0)
            {
                query = query.Where(t => t.StatutId == filterParams.Statut);
            }

            if (filterParams.Qualification >= 0)
            {
                query = query.Where(t => t.QualificationId == filterParams.Qualification);
            }

            if (filterParams.Projet >= 0)
            {
                query = query.Where(t => t.ProjetId == filterParams.Projet);
            }

            if (filterParams.Societe >= 0)
            {
                query = query.Where(t => t.Projet != null && t.Projet.SocieteId == filterParams.Societe);
            }
            if (filterParams.startDate.HasValue)
            {
                var start = filterParams.startDate.Value.Date;
                query = query.Where(t => t.CreatedAt.Date >= start);
            }

            //   if (filterParams.endDate.HasValue)
            // {
            //   var end = filterParams.endDate.Value.Date.AddDays(1);
            //   query = query.Where(t => t.CreatedAt < end);
            // }
            if (!string.IsNullOrWhiteSpace(filterParams.SearchTerm))
            {
                var term = filterParams.SearchTerm.ToLower();
                query = query.Where(t =>
                    t.Title.ToLower().Contains(term) ||
                    (t.Description != null && t.Description.ToLower().Contains(term))
                );
            }
            var items = await query.ToListAsync();
            return  items;
        }
         
        public async Task<PagedList<Ticket>> GetTicketsPagedAsync(TicketFilterParams filterParams)
        {
          var query = _context.Tickets
              .Include(t => t.Owner)
              .Include(t => t.ProblemCategory)
              .Include(t => t.Projet)
                  .ThenInclude(p => p.ChefProjet)
              .Include(t => t.Projet)
                  .ThenInclude(p => p.Societe)
              .Include(t => t.Responsible)
              .Include(t => t.Priority)
              .Include(t => t.Qualification)
              .Include(t => t.Statut)
         
              .OrderByDescending(t => t.CreatedAt)
              .AsQueryable();

          // Filtrage par rôle et utilisateur (la logique existante reste inchangée)
          if (!(filterParams.Role?.Replace(" ", "").Equals("superadmin", StringComparison.OrdinalIgnoreCase) ?? false))
          {
            if (string.Equals(filterParams.Role, "client", StringComparison.OrdinalIgnoreCase))
            {
              query = query.Where(t => t.OwnerId == filterParams.UserId);
            }
            else if (string.Equals(filterParams.Role, "chef de projet", StringComparison.OrdinalIgnoreCase) ||
                     string.Equals(filterParams.Role, "collaborateur", StringComparison.OrdinalIgnoreCase))
            {
              if (!string.IsNullOrEmpty(filterParams.FilterType))
              {
                if (filterParams.FilterType.Equals("associated", StringComparison.OrdinalIgnoreCase))
                {
                  query = query.Where(t => t.OwnerId == filterParams.UserId ||
                                           t.ResponsibleId == filterParams.UserId ||
                                           (t.Projet != null && t.Projet.ChefProjetId == filterParams.UserId));
                }
                else if (filterParams.FilterType.Equals("projetUser", StringComparison.OrdinalIgnoreCase))
                {
                  query = query.Where(t => _context.ProjetUser.Any(pu => pu.ProjetId == t.Projet.Id && pu.UserId == filterParams.UserId));
                }
              }
              else
              {
                query = query.Where(t =>
                    t.OwnerId == filterParams.UserId ||
                    t.ResponsibleId == filterParams.UserId ||
                    (t.Projet != null && t.Projet.ChefProjetId == filterParams.UserId) ||
                    _context.ProjetUser.Any(pu => pu.ProjetId == t.Projet.Id && pu.UserId == filterParams.UserId));
              }
            }
          }

            // Filtres avancés avec les nouveaux champs
            if (filterParams.Client >= 0)
            {
                query = query.Where(t => t.OwnerId == filterParams.Client);
            }

            if (filterParams.Categorie >= 0)
            {
                query = query.Where(t => t.ProblemCategoryId == filterParams.Categorie);
            }

            if (filterParams.Priorite >= 0)
            {
                query = query.Where(t => t.PriorityId == filterParams.Priorite);
            }

            if (filterParams.Statut >= 0)
            {
                query = query.Where(t => t.StatutId == filterParams.Statut);
            }

            if (filterParams.Qualification >= 0)
            {
                query = query.Where(t => t.QualificationId == filterParams.Qualification);
            }

            if (filterParams.Projet >= 0)
            {
                query = query.Where(t => t.ProjetId == filterParams.Projet);
            }

            if (filterParams.Societe >= 0)
            {
                query = query.Where(t => t.Projet != null && t.Projet.SocieteId == filterParams.Societe);
            }
            if (filterParams.startDate.HasValue)
            {
                var start = filterParams.startDate.Value.Date;
                query = query.Where(t => t.CreatedAt.Date >= start);
            }

            //   if (filterParams.endDate.HasValue)
            // {
            //   var end = filterParams.endDate.Value.Date.AddDays(1);
            //   query = query.Where(t => t.CreatedAt < end);
            // }
            if (!string.IsNullOrWhiteSpace(filterParams.SearchTerm))
            {
                var term = filterParams.SearchTerm.ToLower();
                query = query.Where(t =>
                    t.Title.ToLower().Contains(term) ||
                    (t.Description != null && t.Description.ToLower().Contains(term))
                );
            }

            return await PagedList<Ticket>.CreateAsync(query, filterParams.PageNumber, filterParams.PageSize);
        }


        public async Task AddTicketAsync(Ticket ticket)
    {
      await _context.Tickets.AddAsync(ticket);
    }

    public void UpdateTicket(Ticket ticket)
    {
      _context.Entry(ticket).State = EntityState.Modified;
    }

    public void DeleteTicket(Ticket ticket)
    {
      _context.Tickets.Remove(ticket);
    }

    public async Task<bool> SaveAllAsync()
    {
      return await _context.SaveChangesAsync() > 0;
    }

    public async Task<bool> DeleteMultipleTicketsAsync(IEnumerable<int> ticketIds)
    {
      var tickets = await _context.Tickets
          .Where(t => ticketIds.Contains(t.Id))
          .ToListAsync();

      if (!tickets.Any())
      {
        return false;
      }

      _context.Tickets.RemoveRange(tickets);
      return await SaveAllAsync();
    }

    public async Task<bool> TicketExists(string title)
    {
      return await _context.Tickets.AnyAsync(t => t.Title == title);
    }

    public async Task<StatutDesTicket?> GetStatusByNameAsync(string statusName)
    {
      return await _context.StatutsDesTickets.FirstOrDefaultAsync(s => s.Name == statusName);
    }

    public List<object> GetTicketCountByStatus(int userId, string role)
    {
      // Commence par récupérer tous les tickets
      IQueryable<Ticket> filteredTickets = _context.Tickets;

      // Si l'utilisateur n'est pas un superadmin, on filtre les tickets
      if (!string.Equals(role, "super admin", StringComparison.OrdinalIgnoreCase))
      {
        filteredTickets = filteredTickets.Where(t =>
            t.OwnerId == userId ||
            t.ResponsibleId == userId ||
            (t.Projet != null && t.Projet.ChefProjetId == userId)
        );
      }

      // Groupement par statut en utilisant uniquement les tickets filtrés
      var results = _context.StatutsDesTickets
           .GroupJoin(
                filteredTickets,
                statut => statut.Id,       // clé côté Statut
                ticket => ticket.StatutId, // clé côté Ticket
                (statut, ticketsGroup) => new
                {
                  Id = statut.Id,
                  Name = statut.Name,
                  Count = ticketsGroup.Count()
                }
           )
           .ToList();

      return results.Cast<object>().ToList();
    }
    public async Task<IEnumerable<Ticket>> GetTicketsFilteredAsync(TicketFilterParams filterParams)
    {
      var query = _context.Tickets
          .Include(t => t.Owner)
          .Include(t => t.ProblemCategory)
          .Include(t => t.Projet).ThenInclude(p => p.Societe)
          .Include(t => t.Responsible)
          .Include(t => t.Priority)
          .Include(t => t.Qualification)
          .Include(t => t.Statut)
          .OrderByDescending(t => t.CreatedAt)
          .AsQueryable();

      // Filtres existants
      if (!string.IsNullOrEmpty(filterParams.Id) && int.TryParse(filterParams.Id, out int ticketId))
      {
        query = query.Where(t => t.Id == ticketId);
      }
      if (!string.IsNullOrEmpty(filterParams.Titre))
      {
        var lowerTitre = filterParams.Titre.ToLower();
        query = query.Where(t => t.Title.ToLower().Contains(lowerTitre));
      }
            if (filterParams.Qualification >= 0)
            {
                query = query.Where(t => t.Qualification.Id.Equals(filterParams.Qualification));
            }
            if (filterParams.Projet >= 0)
            {
                query = query.Where(t => t.Projet.Id.Equals(filterParams.Projet));
            }
            if (filterParams.Societe >= 0)
            {
                query = query.Where(t => t.Projet.Societe.Id.Equals(filterParams.Societe));
            }
            if (!string.IsNullOrEmpty(filterParams.SearchTerm))
            {
                var lowerSearchTerm = filterParams.SearchTerm.ToLower();
                query = query.Where(t => t.Title.ToLower().Contains(lowerSearchTerm) ||
                                         t.Description.ToLower().Contains(lowerSearchTerm));
            }
            if (filterParams.Client >= 0)
            {

                query = query.Where(t => (t.Owner.Id).Equals(filterParams.Client));
            }
            if (filterParams.Categorie >= 0)
            {
                query = query.Where(t => t.ProblemCategory.Id.Equals(filterParams.Categorie));
            }
            if (filterParams.Priorite >= 0)
            {
                query = query.Where(t => t.Priority.Id.Equals(filterParams.Priorite));
            }
            if (filterParams.Statut >= 0)
            {
                // Supposons que le nom du statut se trouve dans t.Statut.Name
                query = query.Where(t => t.Statut.Id.Equals(filterParams.Statut));
            }

            return await query.ToListAsync();
    }

    public async Task<IEnumerable<Ticket>> GetTicketsByCategoryIdAsync(int categoryId)
    {
      return await _context.Tickets
          .Where(t => t.ProblemCategoryId == categoryId)
          .ToListAsync();
    }


  }
}
