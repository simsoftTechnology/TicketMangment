using AutoMapper;
using GestionTicketsAPI.Data;
using GestionTicketsAPI.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GestionTicketsAPI.Controllers;


public class UsersController(DataContext context, IMapper mapper) : BaseApiController
{
  [Authorize]
  [HttpGet]
  public async Task<ActionResult<IEnumerable<UserDto>>> GetUsers()
  {
    var users = await context.Users.ToListAsync();

    var usersToReturn = mapper.Map<IEnumerable<UserDto>>(users);

    return Ok(usersToReturn);
  }

  [Authorize]
  [HttpGet("{id:int}")]
  public async Task<ActionResult<UserDto>> GetUser(int id)
  {
    var user = await context.Users.FindAsync(id);

    if (user == null) return NotFound();

    return mapper.Map<UserDto>(user);
  }

  [Authorize]
  [HttpDelete("{id:int}")]
  public async Task<IActionResult> DeleteUser(int id)
  {
    var user = await context.Users
        .Include(u => u.ProjetUsers) // Inclure les relations ProjetUser
        .FirstOrDefaultAsync(u => u.Id == id);

    if (user == null)
    {
      return NotFound();
    }

    // Supprimer les associations dans ProjetUser
    context.ProjetUser.RemoveRange(user.ProjetUsers);

    // Supprimer l'utilisateur
    context.Users.Remove(user);

    await context.SaveChangesAsync();

    return NoContent();
  }



}

