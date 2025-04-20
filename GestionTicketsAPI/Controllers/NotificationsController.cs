using GestionTicketsAPI.Data;
using GestionTicketsAPI.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using GestionTicketsAPI.Entities;


namespace GestionTicketsAPI.Controllers
{
    [ApiController]
[Route("api/[controller]")]
public class NotificationsController : ControllerBase
{
    private readonly NotificationService _notifService;
    private readonly DataContext _context;

    public NotificationsController(NotificationService notifService, DataContext context)
    {
        _notifService = notifService;
        _context = context;
    }

    // Enregistrer la subscription Push venant du frontend
    [HttpPost("subscribe")]
    public async Task<IActionResult> Subscribe([FromBody] PushSubscriptionEntity sub)
    {
        _context.Add(sub);
        await _context.SaveChangesAsync();
        return Ok();
    }

    // Envoi manuel (exemple)
    [HttpPost("send/{userId}")]
    public async Task<IActionResult> Send(int userId, [FromBody] string message)
    {
        await _notifService.NotifyRealtimeAsync(userId, message);
        await _notifService.NotifyPushAsync(userId, message);
        return Ok();
    }
}
}
