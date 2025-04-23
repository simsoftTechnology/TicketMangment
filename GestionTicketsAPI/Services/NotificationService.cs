// GestionTicketsAPI/Services/NotificationService.cs
using GestionTicketsAPI.Data;
using GestionTicketsAPI.Entities;
using Microsoft.AspNetCore.SignalR;
using Lib.Net.Http.WebPush;
using Microsoft.EntityFrameworkCore;
using GestionTicketsAPI.DTOs;
using GestionTicketsAPI.hubs;

namespace GestionTicketsAPI.Services
{
  public interface INotificationService
  {
    Task NotifyRealtimeAsync(int userId, NotificationDto notification);
    Task NotifyPushAsync(int userId, NotificationDto notification);
    Task MarkAllAsReadAsync(int userId);
    Task MarkAsReadAsync(int notificationId);
  }

  public class NotificationService : INotificationService
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

    public async Task NotifyRealtimeAsync(int userId, NotificationDto dto)
    {
      // 1) Persister
      var notif = new Notification
      {
        UtilisateurId = userId,
        Message = dto.Message,
        DateEnvoi = dto.DateEnvoi,
        IsRead = false,
        EntityType = dto.EntityType,
        EntityId = dto.EntityId
      };
      _context.Notification.Add(notif);
      await _context.SaveChangesAsync();

      // 2) Récupérer l’ID généré
      dto.Id = notif.Id;

      // 3) Envoyer via SignalR
      await _hub
          .Clients
          .Group(userId.ToString())
          .SendAsync("ReceiveNotification", dto);
    }

    public async Task NotifyPushAsync(int userId, NotificationDto dto)
    {
      // Idem persistance si besoin (ou seulement push)
      var subs = await _context
          .Set<PushSubscriptionEntity>()
          .Where(s => s.UserId == userId.ToString())
          .ToListAsync();

      var webPushMessage = new PushMessage(dto.Message);
      foreach (var sub in subs)
      {
        var pushSubscription = new PushSubscription
        {
          Endpoint = sub.Endpoint,
          Keys = new Dictionary<string, string>
                    {
                        { PushEncryptionKeyName.P256DH.ToString().ToLowerInvariant(), sub.P256DH },
                        { PushEncryptionKeyName.Auth.ToString().ToLowerInvariant(),    sub.Auth   }
                    }
        };
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

    public async Task MarkAsReadAsync(int notificationId)
    {
      var notif = await _context.Notification
          .FirstOrDefaultAsync(n => n.Id == notificationId);
      if (notif == null)
        throw new KeyNotFoundException($"Notification {notificationId} introuvable.");

      notif.IsRead = true;
      await _context.SaveChangesAsync();
    }
  }
}
