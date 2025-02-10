using System.Security.Cryptography;
using System.Text;
using GestionTicketsAPI.Data;
using GestionTicketsAPI.DTOs;
using GestionTicketsAPI.Entities;
using GestionTicketsAPI.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GestionTicketsAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AccountController : BaseApiController
{
  private readonly IAccountService _accountService;

  public AccountController(IAccountService accountService)
  {
    _accountService = accountService;
  }

  [HttpPost("register")]
  public async Task<ActionResult<UserDto>> Register(RegisterDto registerDto)
  {
    try
    {
      var userDto = await _accountService.RegisterAsync(registerDto);
      return Ok(userDto);
    }
    catch (Exception ex)
    {
      return BadRequest(ex.Message);
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
      // Ici, vous pouvez retourner des réponses plus détaillées en fonction du type d'erreur
      return Unauthorized(new { message = ex.Message });
    }
  }
}