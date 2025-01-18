using System;

namespace GestionTicketsAPI.DTOs;

public class UserDto
{
  public required string Email { get; set; }      
  public required string Role { get; set; }
  public required string Firstname { get; set; }
  public required string Lastname { get; set; }
  public required string Token { get; set; }
}
