using System;
using System.ComponentModel.DataAnnotations;

namespace GestionTicketsAPI.DTOs;

public class RegisterDto
{
      [Required]
      public required string Email { get; set; }
      [Required]
      public required string Role { get; set; }
      [Required]
      public required string Firstname { get; set; }
      [Required]
      public required string Lastname { get; set; }
      [Required]
      public required string Password { get; set; }
}
