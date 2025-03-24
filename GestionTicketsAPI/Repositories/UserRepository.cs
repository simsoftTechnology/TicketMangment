using GestionTicketsAPI.Data;
using GestionTicketsAPI.Entities;
using GestionTicketsAPI.Helpers;
using GestionTicketsAPI.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace GestionTicketsAPI.Repositories
{
  public class UserRepository : IUserRepository
  {
    private readonly DataContext _context;

    public UserRepository(DataContext context)
    {
      _context = context;
    }

    public async Task<PagedList<User>> GetUsersAsync(UserParams userParams)
    {
      var query = _context.Users
                    .Include(u => u.Contrats)
                    .Include(u => u.Role)
                    .OrderByDescending(t => t.CreatedAt)
                    .AsQueryable();

      if (!string.IsNullOrEmpty(userParams.SearchTerm))
      {
        var lowerSearchTerm = userParams.SearchTerm.ToLower();
        query = query.Where(u => u.FirstName.ToLower().Contains(lowerSearchTerm)
                              || u.LastName.ToLower().Contains(lowerSearchTerm));
      }

      return await PagedList<User>.CreateAsync(query, userParams.PageNumber, userParams.PageSize);
    }

    public async Task<IEnumerable<User>> GetUsersNoPaginationAsync()
    {
      return await _context.Users.Include(u => u.Contrats).Include(u => u.Role).ToListAsync();
    }

    public async Task<User?> GetUserByIdAsync(int id)
    {
      return await _context.Users
          .Include(u => u.Contrats)
          .Include(u => u.Role)
          .FirstOrDefaultAsync(u => u.Id == id);
    }

    public async Task<User?> GetUserWithProjetUsersAsync(int id)
    {
      return await _context.Users
          .Include(u => u.ProjetUsers)
          .Include(u => u.Role)
          .FirstOrDefaultAsync(u => u.Id == id);
    }

    public async Task<bool> DeleteUserAsync(User user)
    {
      // Identifiant de l'utilisateur par défaut (à adapter ou récupérer depuis la configuration)
      int defaultUserId = 1;

      // Supprimer les tickets où l'utilisateur est owner
      var ownerTickets = await _context.Tickets
          .Where(t => t.OwnerId == user.Id)
          .ToListAsync();
      if (ownerTickets.Any())
      {
        _context.Tickets.RemoveRange(ownerTickets);
      }

      // Réassigner les tickets où l'utilisateur est responsable
      var responsibleTickets = await _context.Tickets
          .Where(t => t.ResponsibleId == user.Id)
          .ToListAsync();
      if (responsibleTickets.Any())
      {
        foreach (var ticket in responsibleTickets)
        {
          ticket.ResponsibleId = defaultUserId;
        }
      }

      // Supprimer les commentaires où l'utilisateur est assigné
      var userComments = await _context.Commentaires
          .Where(c => c.UtilisateurId == user.Id)
          .ToListAsync();
      if (userComments.Any())
      {
        _context.Commentaires.RemoveRange(userComments);
      }

      // Supprimer les contrats où l'utilisateur est assigné (en tant que Client)
      var userContracts = await _context.Contrats
          .Where(c => c.ClientId == user.Id)
          .ToListAsync();
      if (userContracts.Any())
      {
        _context.Contrats.RemoveRange(userContracts);
      }

  

      // Réassigner les projets où l'utilisateur est ChefProjet
      var projectsAsChef = await _context.Projets
          .Where(p => p.ChefProjetId == user.Id)
          .ToListAsync();
      if (projectsAsChef.Any())
      {
        foreach (var project in projectsAsChef)
        {
          project.ChefProjetId = defaultUserId;
        }
      }

      // Supprimer les enregistrements ProjetUser où l'utilisateur est assigné
      var projetUsers = await _context.ProjetUser
          .Where(pu => pu.UserId == user.Id)
          .ToListAsync();
      if (projetUsers.Any())
      {
        _context.ProjetUser.RemoveRange(projetUsers);
      }

      // Supprimer les enregistrements SocieteUser où l'utilisateur est assigné
      var societeUsers = await _context.SocieteUsers
          .Where(su => su.UserId == user.Id)
          .ToListAsync();
      if (societeUsers.Any())
      {
        _context.SocieteUsers.RemoveRange(societeUsers);
      }

      // Enfin, supprimer l'utilisateur
      _context.Users.Remove(user);

      return await _context.SaveChangesAsync() > 0;
    }



    public async Task<bool> SaveAllAsync()
    {
      return await _context.SaveChangesAsync() > 0;
    }

    // Implémentation de GetUserProjectsAsync
    public async Task<PagedList<Projet>> GetUserProjectsAsync(int userId, UserParams userParams)
    {
      var query = _context.ProjetUser
        .Include(pm => pm.Projet)
            .ThenInclude(p => p.Pays)
        .Include(pm => pm.Projet)
            .ThenInclude(p => p.Societe)
        .Where(pm => pm.UserId == userId)
        .Select(pm => pm.Projet)
        .AsQueryable();

      if (!string.IsNullOrEmpty(userParams.SearchTerm))
      {
        query = query.Where(p => p.Nom.Contains(userParams.SearchTerm));
      }

      return await PagedList<Projet>.CreateAsync(query, userParams.PageNumber, userParams.PageSize);
    }

    // Implémentation de GetUserTicketsAsync
    public async Task<PagedList<Ticket>> GetUserTicketsAsync(int userId, UserParams userParams)
    {
      var query = _context.Tickets
          .Where(t => t.OwnerId == userId) // Mise à jour : Utiliser OwnerId
          .AsQueryable();

      if (!string.IsNullOrEmpty(userParams.SearchTerm))
      {
        query = query.Where(t => t.Title.Contains(userParams.SearchTerm)); // Mise à jour : Utiliser Title
      }

      return await PagedList<Ticket>.CreateAsync(query, userParams.PageNumber, userParams.PageSize);
    }

    // Méthode Update pour marquer l'entité comme modifiée
    public void Update(User user)
    {
      _context.Entry(user).State = EntityState.Modified;
    }

    public async Task<IEnumerable<User>> GetUsersByRoleAsync(string roleName)
    {
      return await _context.Users
          .Include(u => u.Role)
          .Where(u => u.Role != null && u.Role.Name.ToLower() == roleName.ToLower())
          .ToListAsync();
    }
  }
}
