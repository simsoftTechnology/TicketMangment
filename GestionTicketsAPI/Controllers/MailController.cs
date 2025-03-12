using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MailKit.Net.Smtp;
using MimeKit;
using System.Threading.Tasks;
using GestionTicketsAPI.Services;


namespace GestionTicketsAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MailController : ControllerBase


    {
        private readonly EmailService _emailService;

        public MailController(EmailService emailService)
        {
            _emailService = emailService;
        }

        [HttpPost("send")]
        public async Task<IActionResult> SendEmail(string name, string email, string subject, string body)
        {
            bool result = await _emailService.SendEmailAsync(name, email, subject, body);

            if (result)
                return Ok("Email sent successfully.");
            else
                return BadRequest("Failed to send email.");
        }
    }
}
