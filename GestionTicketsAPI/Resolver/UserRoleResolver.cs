using AutoMapper;
using GestionTicketsAPI.Data;
using GestionTicketsAPI.DTOs;
using GestionTicketsAPI.Entities;

public class UserRoleResolver : IValueResolver<UserUpdateDto, User, Role>
{

  private readonly DataContext _context;

  public UserRoleResolver(DataContext context)
  {
    _context = context ?? throw new ArgumentNullException(nameof(context));
  }
  public Role Resolve(UserUpdateDto source, User destination, Role destMember, ResolutionContext context)
  {
    int roleId = destination.RoleId; // valeur par défaut
    // Normaliser la valeur reçue
    var roleName = source.Role?.Trim().ToLower() ?? string.Empty;

    switch (roleName)
    {
      case "super admin":
        roleId = 1;
        break;
      case "chef de projet":
        roleId = 2;
        break;
      case "collaborateur":
        roleId = 3;
        break;
      case "client":
        roleId = 4;
        break;
      default:
        // Conserver la valeur existante ou lever une exception
        break;
    }

    // Mettre à jour l'entité
    destination.RoleId = roleId;
    // Retourner le Role correspondant (pour la navigation)
    var role = _context.Roles.Find(roleId);
    return role;
  }

}
