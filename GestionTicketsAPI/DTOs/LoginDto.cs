using System;

namespace GestionTicketsAPI.DTOs;

public class LoginDto
{
    public required string Email { get; set; }
    public required string Password { get; set; }
}
