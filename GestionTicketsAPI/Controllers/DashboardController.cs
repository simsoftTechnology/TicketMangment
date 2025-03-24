using System.Security.Claims;
using GestionTicketsAPI.DTOs;
using GestionTicketsAPI.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace GestionTicketsAPI.Controllers
{
  [ApiController]
  [Route("api/[controller]")]
  public class DashboardController : ControllerBase
  {
    private readonly IDashboardService _dashboardService;

    public DashboardController(IDashboardService dashboardService)
    {
      _dashboardService = dashboardService;
    }

    [HttpGet("counts")]
    public ActionResult<DashboardCountsDto> GetDashboardCounts()
    {
      var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
      var roleClaim = User.FindFirst(ClaimTypes.Role);

      if (userIdClaim == null || roleClaim == null)
      {
        return BadRequest("Les claims nécessaires (NameIdentifier et Role) ne sont pas présents dans le token.");
      }

      int userId = int.Parse(userIdClaim.Value);
      string role = roleClaim.Value;

      var result = _dashboardService.GetDashboardCounts(userId, role);
      return Ok(result);
    }

  }

}
