using System;
using Microsoft.AspNetCore.SignalR;

namespace GestionTicketsAPI.hubs;

 public class NotificationHub : Hub
    {
        // Connexion d'un client: on peut récupérer l'UserId via querystring
        public override Task OnConnectedAsync()
        {
            var userId = Context.GetHttpContext().Request.Query["userId"];
            if (!string.IsNullOrEmpty(userId))
                Groups.AddToGroupAsync(Context.ConnectionId, userId);
            return base.OnConnectedAsync();
        }

        // Méthode pour envoyer une notification à un utilisateur
        public Task SendNotification(string userId, string message)
        {
            return Clients.Group(userId).SendAsync("ReceiveNotification", message);
        }
    }
