using System.Security.Claims;
using GestionTicketsAPI.DTOs;
using GestionTicketsAPI.Interfaces;
using GestionTicketsAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GestionTicketsAPI.Controllers;

[ApiController]
[Route("api/[controller]")]



public class AccountController : BaseApiController
{
  private readonly IAccountService _accountService;
  private readonly IUserService _userService;

  public AccountController(IAccountService accountService, IUserService userService)
  {
    _accountService = accountService;
    _userService = userService;
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