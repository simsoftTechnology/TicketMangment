using GestionTicketsAPI.Data;
using GestionTicketsAPI.sevices;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GestionTicketsAPI.Controllers
{
    [ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly DataContext _context;
    private readonly JwtService _jwtService;

    public AuthController(DataContext context, JwtService jwtService)
    {
        _context = context;
        _jwtService = jwtService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var user = await _context.Users.SingleOrDefaultAsync(u => u.Email == request.Email);
        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            return Unauthorized("Invalid credentials");
        }

        var token = _jwtService.GenerateToken(user.Email, user.Role);
        return Ok(new { Token = token, Role = user.Role, FullName = $"{user.FirstName} {user.LastName}" });
    }
}

public class LoginRequest
{
    public string Email { get; set; }
    public string Password { get; set; }
}

}
