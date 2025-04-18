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
        // Exemple de mapping statique, à adapter à votre logique
        int roleId = destination.RoleId; // valeur par défaut

        switch(source.Role.ToLower())
        {
            case "Super Admin":
                roleId = 1;
                break;
            case "Chef de Projet":
                roleId = 2;
                break;
            case "Collaborateur":
                roleId = 3;
                break;
            case "Client":
                roleId = 4;
                break;
            default:
                // Si aucun match n'est trouvé, vous pouvez décider de conserver la valeur existante
                break;
        }

        // Mettre à jour RoleId dans l'entité
        destination.RoleId = roleId;
        
        // Récupérer le Role depuis le DbContext : 
        // Cela retourne l'instance déjà suivie (ou la récupère en base si ce n'est pas déjà en cache)
        var role = _context.Roles.Find(roleId);
        return role;
    }
}
