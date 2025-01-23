using GestionTicketsAPI.Data;
using GestionTicketsAPI.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GestionTicketsAPI.Controllers;


public class UsersController(DataContext context) : BaseApiController
    {
        [Authorize]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<User>>> GetUsers()
        {
          var users = await context.Users.ToListAsync();

          return users;
        }

        [Authorize]
        [HttpGet("{id:int}")]
        public async Task<ActionResult<User>> GetUser(int id)
        {
          var user = await context.Users.FindAsync(id);

          if (user == null) return NotFound();

          return user;
        }

        [Authorize]
        [HttpGet("pays")]
        public async Task<ActionResult<IEnumerable<Pays>>> GetPays()
        {
            var pays = await context.Pays.ToListAsync();
            return pays;
        }
}

