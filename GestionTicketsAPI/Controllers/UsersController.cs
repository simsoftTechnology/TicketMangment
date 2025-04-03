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
    [HttpGet("paged")]
    public async Task<ActionResult<PagedList<UserDto>>> GetUsers([FromQuery] UserParams userParams)
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
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
      var result = await _userService.DeleteUserAsync(id);
      if (!result)
        return NotFound();
      return NoContent();
    }

    [HttpGet("{userId:int}/projects/paged")]
    public async Task<ActionResult<PagedList<ProjetDto>>> GetUserProjectsPaged(int userId, [FromQuery] UserParams userParams)
    {
      var projets = await _userService.GetUserProjectsPagedAsync(userId, userParams);
      Response.AddPaginationHeader(projets);
      return Ok(projets);
    }

    [HttpGet("{userId:int}/tickets/paged")]
    public async Task<ActionResult<PagedList<TicketDto>>> GetUserTicketsPaged(int userId, [FromQuery] UserParams userParams)
    {
      var tickets = await _userService.GetUserTicketsPagedAsync(userId, userParams);
      Response.AddPaginationHeader(tickets);
      return Ok(tickets);
    }



    [HttpPut("{id:int}")]
    public async Task<ActionResult> UpdateUser(int id, UserUpdateDto userUpdateDto)
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

    [HttpGet("export")]
    public async Task<IActionResult> ExportUsers([FromQuery] UserParams userParams)
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
