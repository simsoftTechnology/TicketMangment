using GestionTicketsAPI.DTOs;
using GestionTicketsAPI.Extensions;
using GestionTicketsAPI.Helpers;
using GestionTicketsAPI.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GestionTicketsAPI.Controllers;


[ApiController]
[Route("api/[controller]")]
public class UsersController : BaseApiController
{
  private readonly IUserService _userService;

  public UsersController(IUserService userService)
  {
    _userService = userService;
  }

  [Authorize]
  [HttpGet]
  public async Task<ActionResult<PagedList<UserDto>>> GetUsers([FromQuery] UserParams userParams)
  {
    var users = await _userService.GetAllUsersAsync(userParams);
    Response.AddPaginationHeader(users); // Les métadonnées sont maintenant disponibles
    return Ok(users);
  }

  [Authorize]
  [HttpGet("all")]
  public async Task<ActionResult<IEnumerable<UserDto>>> GetAllUsers()
  {
    var users = await _userService.GetAllUsersNoPaginationAsync();
    return Ok(users);
  }


  [Authorize]
  [HttpGet("{id:int}")]
  public async Task<ActionResult<UserDto>> GetUser(int id)
  {
    var user = await _userService.GetUserByIdAsync(id);
    if (user == null) return NotFound();
    return Ok(user);
  }

  [Authorize]
  [HttpDelete("{id:int}")]
  public async Task<IActionResult> DeleteUser(int id)
  {
    var result = await _userService.DeleteUserAsync(id);
    if (!result) return NotFound();
    return NoContent();
  }
}
