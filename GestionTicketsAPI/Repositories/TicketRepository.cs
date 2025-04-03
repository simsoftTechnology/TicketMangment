using GestionTicketsAPI.Data;
using GestionTicketsAPI.Entities;
using GestionTicketsAPI.Helpers;
using GestionTicketsAPI.Interfaces;
using Microsoft.EntityFrameworkCore;

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
      if (!string.IsNullOrEmpty(filterParams.Client))
      {
        var lowerClient = filterParams.Client.ToLower();
        query = query.Where(t => (t.Owner.FirstName + " " + t.Owner.LastName).ToLower().Contains(lowerClient));
      }

      if (!string.IsNullOrEmpty(filterParams.Categorie))
      {
        var lowerCategorie = filterParams.Categorie.ToLower();
        // Supposons que le nom de la catégorie se trouve dans t.ProblemCategory.Name
        query = query.Where(t => t.ProblemCategory.Nom.ToLower().Contains(lowerCategorie));
      }
      if (!string.IsNullOrEmpty(filterParams.Priorite))
      {
        var lowerPriorite = filterParams.Priorite.ToLower();
        // Supposons que le nom de la priorité se trouve dans t.Priority.Name
        query = query.Where(t => t.Priority.Name.ToLower().Contains(lowerPriorite));
      }
      if (!string.IsNullOrEmpty(filterParams.Statut))
      {
        var lowerStatut = filterParams.Statut.ToLower();
        // Supposons que le nom du statut se trouve dans t.Statut.Name
        query = query.Where(t => t.Statut.Name.ToLower().Contains(lowerStatut));
      }
      if (!string.IsNullOrEmpty(filterParams.Qualification))
      {
        var lowerQualif = filterParams.Qualification.ToLower();
        query = query.Where(t => t.Qualification.Name.ToLower().Contains(lowerQualif));
      }
      if (!string.IsNullOrEmpty(filterParams.Projet))
      {
        var lowerProjet = filterParams.Projet.ToLower();
        query = query.Where(t => t.Projet.Nom.ToLower().Contains(lowerProjet));
      }
      if (!string.IsNullOrEmpty(filterParams.Societe))
      {
        var lowerSociete = filterParams.Societe.ToLower();
        query = query.Where(t => t.Projet.Societe.Nom.ToLower().Contains(lowerSociete));
      }
      if (!string.IsNullOrEmpty(filterParams.SearchTerm))
      {
        var lowerSearchTerm = filterParams.SearchTerm.ToLower();
        query = query.Where(t => t.Title.ToLower().Contains(lowerSearchTerm) ||
                                 t.Description.ToLower().Contains(lowerSearchTerm));
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
      if (!string.IsNullOrEmpty(filterParams.Qualification))
      {
        var lowerQualif = filterParams.Qualification.ToLower();
        query = query.Where(t => t.Qualification.Name.ToLower().Contains(lowerQualif));
      }
      if (!string.IsNullOrEmpty(filterParams.Projet))
      {
        var lowerProjet = filterParams.Projet.ToLower();
        query = query.Where(t => t.Projet.Nom.ToLower().Contains(lowerProjet));
      }
      if (!string.IsNullOrEmpty(filterParams.Societe))
      {
        var lowerSociete = filterParams.Societe.ToLower();
        query = query.Where(t => t.Projet.Societe.Nom.ToLower().Contains(lowerSociete));
      }
      if (!string.IsNullOrEmpty(filterParams.SearchTerm))
      {
        var lowerSearchTerm = filterParams.SearchTerm.ToLower();
        query = query.Where(t => t.Title.ToLower().Contains(lowerSearchTerm) ||
                                 t.Description.ToLower().Contains(lowerSearchTerm));
      }

      // Nouveaux filtres
      if (!string.IsNullOrEmpty(filterParams.Client))
      {
        var lowerClient = filterParams.Client.ToLower();
        query = query.Where(t => (t.Owner.FirstName + " " + t.Owner.LastName).ToLower().Contains(lowerClient));
      }
      if (!string.IsNullOrEmpty(filterParams.Categorie))
      {
        var lowerCategorie = filterParams.Categorie.ToLower();
        query = query.Where(t => t.ProblemCategory.Nom.ToLower().Contains(lowerCategorie));
      }
      if (!string.IsNullOrEmpty(filterParams.Priorite))
      {
        var lowerPriorite = filterParams.Priorite.ToLower();
        query = query.Where(t => t.Priority.Name.ToLower().Contains(lowerPriorite));
      }
      if (!string.IsNullOrEmpty(filterParams.Statut))
      {
        var lowerStatut = filterParams.Statut.ToLower();
        query = query.Where(t => t.Statut.Name.ToLower().Contains(lowerStatut));
      }

      return await query.ToListAsync();
    }


  }
}
