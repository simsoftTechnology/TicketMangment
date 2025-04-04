using System.Security.Claims;
using GestionTicketsAPI.DTOs;
using GestionTicketsAPI.Interfaces;
using GestionTicketsAPI.Services;
using Hangfire; // N'oubliez pas d'ajouter la référence à Hangfire
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GestionTicketsAPI.Controllers;

[ApiController]
public class AccountController : BaseApiController
{
  private readonly IAccountService _accountService;
  private readonly IUserService _userService;
  private readonly EmailService _emailService; // Injection du service email

  public AccountController(
      IAccountService accountService,
      IUserService userService,
      EmailService emailService)
  {
    _accountService = accountService;
    _userService = userService;
    _emailService = emailService;
  }

  [HttpPost("register")]
  public async Task<ActionResult<UserDto>> Register(RegisterDto registerDto)
  {
    try
    {
      // Appel au service d'inscription
      var userDto = await _accountService.RegisterAsync(registerDto);

      // Préparation du corps de l'e-mail en HTML, avec un formatage plus professionnel
      var body = $@"
<html>
  <body style='font-family: Arial, sans-serif; color: #333;'>
    <p>Bonjour {userDto.FirstName} {userDto.LastName},</p>
    
    <p>Nous sommes ravis de vous accueillir au sein de notre plateforme. Votre compte a été créé avec succès et vous pouvez dès à présent accéder à votre espace personnel.</p>
    
    <p><strong>Vos identifiants de connexion :</strong></p>
    <ul>
      <li><strong>Email :</strong> {userDto.Email}</li>
      <li><strong>Mot de passe :</strong> {registerDto.Password}</li>
      <li><strong>Rôle :</strong> {userDto.Role}</li>
    </ul>
    
    <p>Pour accéder à l'application, cliquez sur le lien ci-dessous :</p>
    <p>
      <a href='https://simsoft-gt.tn/' style='color: #007BFF; text-decoration: none;' target='_blank'>
        Accéder à l'application
      </a>
    </p>
    
    <p>Nous vous remercions de votre confiance et restons à votre disposition pour toute information complémentaire.</p>
    
    <p>Cordialement,<br>L'équipe Simsoft</p>
  </body>
</html>";

      // Envoi de l'e-mail en tâche de fond via Hangfire.
      BackgroundJob.Enqueue(() => _emailService.SendEmailAsync(
          $"{userDto.FirstName} {userDto.LastName}",
          userDto.Email,
          "Bienvenue dans notre application",
          body // Utilisation du corps en HTML
      ));

      return Ok(userDto);
    }
    catch (Exception ex)
    {
      var inner = ex.InnerException?.Message;
      return BadRequest(new { message = ex.Message, inner });
    }
  }


  [HttpPost("login")]
  public async Task<ActionResult<UserDto>> Login(LoginDto loginDto)
  {
    try
    {
      var userDto = await _accountService.LoginAsync(loginDto);
      return Ok(userDto);
    }
    catch (Exception ex)
    {
      return Unauthorized(new { message = ex.Message });
    }
  }

  [HttpGet("validate")]
  public async Task<ActionResult> Validate()
  {
    var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    if (userIdClaim == null || !int.TryParse(userIdClaim, out int userId))
    {
      return Unauthorized();
    }

    var user = await _userService.GetUserByIdAsync(userId);
    if (user == null)
      return Unauthorized();

    return Ok();
  }
}
