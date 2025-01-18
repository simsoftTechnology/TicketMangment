using System;

namespace GestionTicketsAPI.Entities;

public class User
{
    public int Id { get; set; }
    public required string Email { get; set; }
    public required byte[] PasswordHash { get; set; }
    public required byte[] PasswordSalt { get; set; }
    public required string Role { get; set; }
    public required string FirstName { get; set; }
    public required string LastName { get; set; }
}
