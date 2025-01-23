using System.Security.Cryptography;
using System.Text;
using GestionTicketsAPI.Data;
using GestionTicketsAPI.DTOs;
using GestionTicketsAPI.Entities;
using GestionTicketsAPI.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GestionTicketsAPI.Controllers;

public class AccountController(DataContext context, ITokenService tokenService) : BaseApiController
{
  [HttpPost("register")]

  public async Task<ActionResult<UserDto>> Register(RegisterDto registerDto)
  {
    if (await UserExists(registerDto.Firstname, registerDto.Lastname, registerDto.Email)) return BadRequest("User already exists");

    using var hmac = new HMACSHA512();

    // Récupération de l'entité Pays à partir de l'ID fourni dans le DTO
    var pays = await context.Pays.FindAsync(registerDto.Pays);
    if (pays == null) 
        return BadRequest("Le pays spécifié est introuvable.");
    
    var user = new User
    {
      FirstName = registerDto.Firstname,
      LastName = registerDto.Lastname,
      Role = registerDto.Role,
      Email = registerDto.Email,
      NumTelephone = registerDto.Numtelephone,
      Pays = registerDto.Pays,
      PaysNavigation = pays,
      Actif = registerDto.Actif,
      PasswordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(registerDto.Password)),
      PasswordSalt = hmac.Key
    };

    context.Users.Add(user);
    await context.SaveChangesAsync();

    return new UserDto
        {
            FirstName = user.FirstName,
            LastName = user.LastName,
            Email = user.Email,
            Role = user.Role,
            NumTelephone = user.NumTelephone,
            Pays = user.PaysNavigation?.Nom ?? "Non défini",
            Actif = registerDto.Actif,
            Token = tokenService.CreateToken(user)
        };
  }

  [HttpPost("login")]
  public async Task<ActionResult<UserDto>> Login(LoginDto loginDto)
  {
      var user = await context.Users
          .Include(u => u.PaysNavigation) // Charge la relation Pays
          .FirstOrDefaultAsync(x => x.Email == loginDto.Email);

      if (user == null) 
          return Unauthorized(new { message = "L'adresse e-mail est incorrecte", errorType = "email" });

      using var hmac = new HMACSHA512(user.PasswordSalt);
      var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(loginDto.Password));

      for (int i = 0; i < computedHash.Length; i++)
      {
          if (computedHash[i] != user.PasswordHash[i]) 
              return Unauthorized(new { message = "Le mot de passe est incorrect", errorType = "password" });
      }

       return new UserDto
        {
            FirstName = user.FirstName,
            LastName = user.LastName,
            Email = user.Email,
            Role = user.Role,
            NumTelephone = user.NumTelephone,
            Pays = user.PaysNavigation?.Nom ?? "Non défini",
            Actif = user.Actif,
            Token = tokenService.CreateToken(user)
        };
  }



  private async Task<bool> UserExists(string firstname, string lastname, string email)
  {
    return await context.Users.AnyAsync(x =>
      (x.FirstName.ToLower() == firstname.ToLower() &&
      x.LastName.ToLower() == lastname.ToLower()) ||
      x.Email.ToLower() == email.ToLower()
      );

  }
}
