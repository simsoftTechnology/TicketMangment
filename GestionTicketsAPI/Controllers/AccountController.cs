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

      var user = new User
      {
        FirstName = registerDto.Firstname,
        LastName = registerDto.Lastname,
        Role = registerDto.Role,
        Email = registerDto.Email,
        PasswordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(registerDto.Password)),
        PasswordSalt = hmac.Key
      };

      context.Users.Add(user);
      await context.SaveChangesAsync();

      return new UserDto
      {
        Firstname = user.FirstName,
        Lastname = user.LastName,
        Email = user.Email,
        Role = user.Role,
        Token = tokenService.CreateToken(user) 
      };
    }

    [HttpPost("login")]
    public async Task<ActionResult<UserDto>> Login(LoginDto loginDto)
    {
      var user = await context.Users.FirstOrDefaultAsync(x => 
        x.Email == loginDto.Email);

      if (user == null) return Unauthorized("Invalid Email");

      using var hmac = new HMACSHA512(user.PasswordSalt);

      var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(loginDto.Password));

      for (int i = 0; i < computedHash.Length; i++)
      {
        if (computedHash[i] != user.PasswordHash[i]) return Unauthorized("Invalid password");
      }

      return new UserDto
      {
        Firstname = user.FirstName,
        Lastname = user.LastName,
        Email = user.Email,
        Role = user.Role,
        Token = tokenService.CreateToken(user) 
      };
    }

    private async Task<bool> UserExists(string firstname, string lastname, string email)
    {
        return await context.Users.AnyAsync(x => 
            x.FirstName.ToLower() == firstname.ToLower() &&
            x.LastName.ToLower() == lastname.ToLower() ||
            x.Email == email
        );
    }
}
