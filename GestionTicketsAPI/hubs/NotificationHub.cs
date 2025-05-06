using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;

namespace GestionTicketsAPI.hubs
{
    public class NotificationHub : Hub
    {
        public override async Task OnConnectedAsync()
        {
            // Récupérer la query string "userId" (peut être un StringValues)
            var httpCtx = Context.GetHttpContext();
            var userId  = httpCtx.Request.Query["userId"].FirstOrDefault();

            if (!string.IsNullOrEmpty(userId))
            {
                // On attend bien l’ajout au groupe avant de continuer
                await Groups.AddToGroupAsync(Context.ConnectionId, userId);
            }

            await base.OnConnectedAsync();
        }

        // Méthode pour envoyer une notification à un utilisateur
        public Task SendNotification(string userId, string message)
        {
            // n’enverra QUE dans le groupe userId
            return Clients.Group(userId).SendAsync("ReceiveNotification", message);
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            // Facultatif : on peut aussi retirer du groupe à la déconnexion
            var userId = Context.GetHttpContext().Request.Query["userId"].FirstOrDefault();
            if (!string.IsNullOrEmpty(userId))
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, userId);
            }
            await base.OnDisconnectedAsync(exception);
        }
    }
}
