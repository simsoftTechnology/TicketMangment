using MailKit.Net.Smtp;

using MailKit.Security;

using MimeKit;

using System;

using System.Threading.Tasks;

 

namespace GestionTicketsAPI.Services

{

    public class EmailService

    {

        public async Task<bool> SendEmailAsync(string name, string email, string subject, string body)

        {

            try

            {

                var message = new MimeMessage();

                message.From.Add(new MailboxAddress("Simsoft Technologies", "simsoft87@gmail.com"));

                message.To.Add(new MailboxAddress(name, email));

                message.Subject = subject;

 

                var bodyBuilder = new BodyBuilder

                {

                    HtmlBody = $"<p>{body}</p>"

                };

                message.Body = bodyBuilder.ToMessageBody();

 

                using var client = new SmtpClient();

                await client.ConnectAsync("smtp.gmail.com", 587, SecureSocketOptions.StartTls);

                await client.AuthenticateAsync("simsoft87@gmail.com", "rqdg oyls pnuq qaub"); // Use an App Password

                await client.SendAsync(message);

                await client.DisconnectAsync(true);

 

                return true; // Success

            }

            catch (Exception)

            {

                return false; // Failure

            }

        }

    }

}