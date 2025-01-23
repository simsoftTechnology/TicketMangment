using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace GestionTicketsAPI.Entities;

public class User
{
    public int Id { get; set; }
    public required string Email { get; set; }
    public  byte[] PasswordHash { get; set; } = [];
    public  byte[] PasswordSalt { get; set; } = [];
    public required string Role { get; set; }
    public required string FirstName { get; set; }
    public required string LastName { get; set; }

    public required string NumTelephone { get; set; }
    public required bool Actif { get; set; }

    
    [ForeignKey("id_pays")]
    public required int Pays { get; set; }

    public Pays? PaysNavigation { get; set; } 
}
