// GestionTicketsAPI/Services/NotificationService.cs
using GestionTicketsAPI.Data;
using GestionTicketsAPI.Entities;
using Microsoft.AspNetCore.SignalR;
using Lib.Net.Http.WebPush;
using Microsoft.EntityFrameworkCore;
using GestionTicketsAPI.DTOs;
using GestionTicketsAPI.hubs;
using System.Text.Json;

namespace GestionTicketsAPI.Services
{
  public interface INotificationService
  {
    Task NotifyRealtimeAsync(int userId, NotificationDto notification);
    Task NotifyPushAsync(int userId, NotificationDto notification);
    Task MarkAllAsReadAsync(int userId);
    Task MarkAsReadAsync(int notificationId);
    Task SoftDeleteAsync(int notificationId);
  }

  public class NotificationService : INotificationService
  {
    private readonly IHubContext<NotificationHub> _hub;
    private readonly DataContext _context;
    private readonly PushServiceClient _pushClient;
    private readonly ILogger<NotificationService> _logger; 
    public NotificationService(
        IHubContext<NotificationHub> hub,
        DataContext context,
        PushServiceClient pushClient,
        ILogger<NotificationService> logger)
    {
      _hub = hub;
      _context = context;
      _pushClient = pushClient;
      _logger     = logger;
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
      var subs = await _context
          .PushSubscriptions
          .Where(s => s.UserId == userId.ToString())
          .ToListAsync();

      // Génération du titre et de l'URL
      var title = dto.EntityType is not null && dto.EntityId.HasValue
          ? $"Nouvel {dto.EntityType} #{dto.EntityId}"
          : "Nouvelle notification";
      var url = dto.EntityType is not null && dto.EntityId.HasValue
          ? $"https://votre-client/#/{dto.EntityType.ToLower()}/{dto.EntityId}"
          : null;

      var payload = JsonSerializer.Serialize(new
      {
        title,
        message = dto.Message,
        url
      });

      var webPushMessage = new PushMessage(payload)
      {
        Urgency = PushMessageUrgency.High
      };

      foreach (var sub in subs)
      {
        var pushSubscription = new PushSubscription
        {
          Endpoint = sub.Endpoint,
          Keys = new Dictionary<string, string>
      {
        { PushEncryptionKeyName.P256DH.ToString().ToLower(), sub.P256DH },
        { PushEncryptionKeyName.Auth.ToString().ToLower(),    sub.Auth  }
      }
        };

        try
        {
          await _pushClient.RequestPushMessageDeliveryAsync(pushSubscription, webPushMessage);
        }
        catch (Exception ex)
        {
          _logger.LogError(ex, "Échec de l’envoi push à {Endpoint}", sub.Endpoint);
        }
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

    public async Task SoftDeleteAsync(int notificationId)
    {
      var notif = await _context.Notification
          .FirstOrDefaultAsync(n => n.Id == notificationId);
      if (notif == null)
        throw new KeyNotFoundException($"Notification {notificationId} introuvable.");

      notif.IsDeleted = true;
      await _context.SaveChangesAsync();
    }

  }
}
