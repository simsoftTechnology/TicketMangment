using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using GestionTicketsAPI.Entities;
using GestionTicketsAPI.Interfaces;
using Microsoft.IdentityModel.Tokens;

namespace GestionTicketsAPI.Services;

public class TokenService(IConfiguration config) : ITokenService
{
  public string CreateToken(User user)
{
  var tokenKey = config["TokenKey"] ?? throw new Exception("Cannot access tokenKey from appsettings");
  if (tokenKey.Length < 64) throw new Exception("Your tokenKey needs to be longer");
  var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(tokenKey));

  var claims = new List<Claim>
  {
    // Utiliser l'ID de l'utilisateur pour le NameIdentifier
    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
    // Optionnellement, ajouter d'autres claims comme l'e-mail
    new Claim(JwtRegisteredClaimNames.UniqueName, user.Email)
  };

  var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);

  var tokenDescriptor = new SecurityTokenDescriptor
  {
    Subject = new ClaimsIdentity(claims),
    Expires = DateTime.UtcNow.AddDays(7),
    SigningCredentials = creds
  };

  var tokenHandler = new JwtSecurityTokenHandler();
  var token = tokenHandler.CreateToken(tokenDescriptor);

  return tokenHandler.WriteToken(token);
}

}
