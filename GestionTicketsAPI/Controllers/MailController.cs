using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MailKit.Net.Smtp;
using MimeKit;
using System.Threading.Tasks;

namespace GestionTicketsAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MailController : ControllerBase
    {
        [HttpPost("send")]
        public async Task<IActionResult> SendEmail()
        {
            try
            {
                var message = new MimeMessage();
                message.From.Add(new MailboxAddress("yasmine yacoub", "yasmine.yaakoub@simsoft.com.tn"));
                message.To.Add(new MailboxAddress("Oumayma", "oumayma.torman@simsoft.com.tn"));
                message.Subject = "Test Email";

                var bodyBuilder = new BodyBuilder
                {
                    HtmlBody = "<h1>Hello from C# Web API</h1><p>This is a test email.</p>"
                };
                message.Body = bodyBuilder.ToMessageBody();

                using var client = new SmtpClient();
                await client.ConnectAsync("smtp.office365.com", 587, MailKit.Security.SecureSocketOptions.StartTls);
                //await client.AuthenticateAsync("yasmine.yaakoub@simsoft.com.tn", "yy@St1v2#50");
                await client.SendAsync(message);
                //await client.DisconnectAsync(true);
                return Ok("Email sent successfully.");
            }
            catch (Exception ex)
            {
                return BadRequest($"Failed to send email: {ex.Message}");
            }
        }
    }
}
