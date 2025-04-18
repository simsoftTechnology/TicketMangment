using GestionTicketsAPI.Entities;
using GestionTicketsAPI.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace GestionTicketsAPI.Controllers
{
  [ApiController]
  public class RolesController : BaseApiController
  {
    private readonly IRoleService _roleService;
    public RolesController(IRoleService roleService)
    {
      _roleService = roleService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Role>>> GetRoles()
    {
      var roles = await _roleService.GetAllRolesAsync();
      return Ok(roles);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Role>> GetRole(int id)
    {
      var role = await _roleService.GetRoleByIdAsync(id);
      if (role == null)
        return NotFound();
      return Ok(role);
    }

    [HttpPost]
    public async Task<ActionResult<Role>> CreateRole([FromBody] Role role)
    {
      // Vérifier l'existence d'un rôle avec le même nom
      if (await _roleService.RoleExists(role.Name))
        return BadRequest("Le rôle existe déjà");

      var createdRole = await _roleService.CreateRoleAsync(role);
      return CreatedAtAction(nameof(GetRole), new { id = createdRole.Id }, createdRole);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateRole(int id, [FromBody] Role role)
    {
      if (id != role.Id)
        return BadRequest();
      await _roleService.UpdateRoleAsync(role);
      return NoContent();
    }


    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteRole(int id)
    {
      await _roleService.DeleteRoleAsync(id);
      return NoContent();
    }
  }
}
