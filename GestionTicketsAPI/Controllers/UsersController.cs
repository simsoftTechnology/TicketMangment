using AutoMapper;
using GestionTicketsAPI.DTOs;
using GestionTicketsAPI.Entities;
using GestionTicketsAPI.Extensions;
using GestionTicketsAPI.Helpers;
using GestionTicketsAPI.Interfaces;
using GestionTicketsAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GestionTicketsAPI.Controllers
{
  [ApiController]
  [Authorize]
  public class UsersController : BaseApiController
  {
    private readonly IUserService _userService;
    private readonly ExcelExportServiceClosedXML _excelExportService;
    private readonly IMapper _mapper;

    public UsersController(ExcelExportServiceClosedXML excelExportService, IMapper mapper, IUserService userService)
    {
      _userService = userService;
      _mapper = mapper;
      _excelExportService = excelExportService;
    }

    // Récupérer les utilisateurs paginés
    [HttpPost("paged")]
    public async Task<ActionResult<PagedList<UserDto>>> GetUsers([FromBody] UserParams userParams)
    {
      var users = await _userService.GetAllUsersAsync(userParams);
      Response.AddPaginationHeader(users);
      return Ok(users);
    }

    // Récupérer tous les utilisateurs (sans pagination)
    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetAllUsers()
    {
      var users = await _userService.GetAllUsersNoPaginationAsync();
      return Ok(users);
    }

    // Récupérer un utilisateur par ID
    [HttpGet("{id:int}")]
    public async Task<ActionResult<UserDto>> GetUser(int id)
    {
      var user = await _userService.GetUserByIdAsync(id);
      if (user == null)
        return NotFound();
      return Ok(user);
    }

    // Supprimer un utilisateur
    [HttpGet("delete/{id:int}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
            try
            {
                var result = await _userService.DeleteUserAsync(id);
                Console.WriteLine(result);
                 if (!result)
                    return NotFound();
                return NoContent();

            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);

            }
    }

    [HttpPost("{userId:int}/projects/paged")]
    public async Task<ActionResult<PagedList<ProjetDto>>> GetUserProjectsPaged(int userId, [FromBody] UserParams userParams)
    {
      var projets = await _userService.GetUserProjectsPagedAsync(userId, userParams);
      Response.AddPaginationHeader(projets);
      return Ok(projets);
    }

    [HttpPost("{userId:int}/tickets/paged")]
    public async Task<ActionResult<PagedList<TicketDto>>> GetUserTicketsPaged(int userId, [FromBody] UserParams userParams)
    {
      var tickets = await _userService.GetUserTicketsPagedAsync(userId, userParams);
      Response.AddPaginationHeader(tickets);
      return Ok(tickets);
    }



    [HttpPost("{id:int}")]
    public async Task<ActionResult> UpdateUser(int id, [FromBody] UserUpdateDto userUpdateDto)
    {
      if (id != userUpdateDto.Id)
        return BadRequest("L'ID de l'URL ne correspond pas à celui du body.");

      var result = await _userService.UpdateUserAsync(userUpdateDto);
      if (!result)
        return NotFound("Utilisateur non trouvé.");

      return NoContent();
    }


    [HttpGet("role/{roleName}")]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetUsersByRole(string roleName)
    {
      var users = await _userService.GetUsersByRoleAsync(roleName);
      return Ok(users);
    }

    [HttpPost("export")]
    public async Task<IActionResult> ExportUsers([FromBody] UserParams userParams)
    {
      // Récupérer les utilisateurs filtrés (sans pagination)
      var users = await _userService.GetUsersFilteredAsync(userParams);

      // Mapper vers le DTO d'export avec AutoMapper
      var userExportDtos = _mapper.Map<IEnumerable<UserExportDto>>(users);

      // Générer le fichier Excel
      var content = _excelExportService.ExportToExcel(userExportDtos, "Users");
      return File(content,
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          $"UsersExport_{DateTime.Now:yyyyMMddHHmmss}.xlsx");
    }


  }
}
