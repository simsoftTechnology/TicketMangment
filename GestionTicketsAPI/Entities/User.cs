using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GestionTicketsAPI.Entities
{
  public class User
  {
    public int Id { get; set; }

    [EmailAddress]
    public required string Email { get; set; }

    public byte[] PasswordHash { get; set; } = new byte[0];
    public byte[] PasswordSalt { get; set; } = new byte[0];

    [ForeignKey("RoleId")]
    public int RoleId { get; set; }
    public Role Role { get; set; }
    public required string FirstName { get; set; }
    public required string LastName { get; set; }

    [Phone]
    public required string NumTelephone { get; set; }
    public required bool Actif { get; set; }

    [ForeignKey("id_pays")]
    public required int Pays { get; set; }
    public Pays? PaysNavigation { get; set; }

    // L'utilisateur peut appartenir à une société ou non.
    public int? SocieteId { get; set; }
    public Societe? Societe { get; set; }

    // Autres relations (tickets, commentaires, etc.) selon vos besoins.
    public ICollection<ProjetUser> ProjetUsers { get; set; } = new List<ProjetUser>();

    // Navigation vers les contrats si l'utilisateur est le client (pour Client-Societe).
    [InverseProperty("Client")]
    public ICollection<Contrat>? Contrats { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? DeletedAt { get; set; }
  }
}
