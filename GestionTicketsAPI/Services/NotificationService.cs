using GestionTicketsAPI.Data;
using GestionTicketsAPI.Entities;
using Microsoft.AspNetCore.SignalR;
using Lib.Net.Http.WebPush;             // PushSubscription, PushMessage
using Lib.Net.Http.WebPush.Authentication;
using GestionTicketsAPI.hubs;
using Microsoft.EntityFrameworkCore;  // PushEncryptionKeyName

namespace GestionTicketsAPI.Services
{
  public class NotificationService
  {
    private readonly IHubContext<NotificationHub> _hub;
    private readonly DataContext _context;
    private readonly PushServiceClient _pushClient;

    public NotificationService(
        IHubContext<NotificationHub> hub,
        DataContext context,
        PushServiceClient pushClient)
    {
      _hub = hub;
      _context = context;
      _pushClient = pushClient;
    }

    public async Task NotifyRealtimeAsync(int utilisateurId, string message)
    {
      var notif = new Notification
      {
        UtilisateurId = utilisateurId,
        Message = message,
        DateEnvoi = DateTime.UtcNow
      };
      _context.Notification.Add(notif);
      await _context.SaveChangesAsync();

      await _hub
          .Clients
          .Group(utilisateurId.ToString())
          .SendAsync("ReceiveNotification", message);
    }

    public async Task NotifyPushAsync(int utilisateurId, string message)
    {
      var subs = _context
          .Set<PushSubscriptionEntity>()
          .Where(s => s.UserId == utilisateurId.ToString())
          .ToList();

      foreach (var sub in subs)
      {
        // Construire la subscription avec son dictionnaire de clés
        var pushSubscription = new PushSubscription
        {
          Endpoint = sub.Endpoint,
          Keys = new Dictionary<string, string>
                    {
                        // La clé doit être en minuscules : "p256dh" et "auth"
                        { PushEncryptionKeyName.P256DH.ToString().ToLowerInvariant(), sub.P256DH },
                        { PushEncryptionKeyName.Auth.ToString().ToLowerInvariant(),    sub.Auth   }
                    }
        };

        // Créez simplement le message
        var webPushMessage = new PushMessage(message);

        // Envoi : le client utilisera la config VAPID enregistrée via AddPushServiceClient
        await _pushClient.RequestPushMessageDeliveryAsync(pushSubscription, webPushMessage);
      }
    }

    public async Task MarkAllAsReadAsync(int userId)
    {
      var notifs = await _context.Notification
          .Where(n => n.UtilisateurId == userId && !n.IsRead)
          .ToListAsync();

      notifs.ForEach(n => n.IsRead = true);
      await _context.SaveChangesAsync();
    }
  }
}
