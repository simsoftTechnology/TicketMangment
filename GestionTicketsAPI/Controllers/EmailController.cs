using GestionTicketsAPI.Entities;
using Microsoft.AspNetCore.Mvc;
using System.Net;
using System.Net.Mail;

namespace EmailApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EmailController : ControllerBase
    {
        [HttpPost("send")]
        public IActionResult SendEmail([FromBody] EmailRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                // Création du message email
                var mail = new MailMessage
                {
                    From = new MailAddress("drgaieg@gmail.com"), 
                    Subject = request.Subject,
                    Body = request.Body,
                    IsBodyHtml = request.IsBodyHtml
                };

                mail.To.Add(request.To);

                // Configuration du client SMTP pour Gmail
                using (var smtpClient = new SmtpClient("smtp.gmail.com", 587))
                {
                    // Fournir l'adresse Gmail et le mot de passe d'application
                    smtpClient.Credentials = new NetworkCredential("drgaieg@gmail.com", "kibc tnnd hoew kmcc");
                    smtpClient.EnableSsl = true; // Active le chiffrement SSL/TLS

                    smtpClient.Send(mail);
                }

                return Ok("Email envoyé avec succès.");
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, $"Erreur lors de l'envoi de l'email : {ex.Message}");
            }
        }
    }
}
