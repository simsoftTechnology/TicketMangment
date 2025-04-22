import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NotificationService } from '../_services/notification.service';
import { AppNotification } from '../_models/notification';

@Component({
  selector: 'app-notifications',
  imports: [CommonModule],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css'
})
export class NotificationsComponent implements OnInit {
  notifications: AppNotification[] = [];
  userId!: string;

  constructor(private notifSvc: NotificationService) { }

  ngOnInit(): void {
    // 1) Récupération de l’historique avec isRead tel que renvoyé par l’API
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user?.id) {
        this.userId = user.id.toString();

        this.notifSvc.getNotifications(this.userId).subscribe({
          next: notifs => this.notifications = notifs,
          error: err => console.error('Erreur fetch notifs', err)
        });

        // 2) Souscription au flux SignalR : on préfixe chaque nouvelle notif avec isRead=false
        this.notifSvc.notification$.subscribe(msg => {
          const newNotif: AppNotification = {
            id: Date.now(),  // temporaire, ou récupérer l'ID renvoyé si possible
            message: msg,
            dateEnvoi: new Date().toISOString(),
            isRead: false    // ← on initialise à « non lu »
          };
          this.notifications.unshift(newNotif);
        });
      }
    }
  }

  /** Marquer toutes les notifications comme lues */
  markAllAsRead(): void {
    this.notifSvc.markAllAsRead(this.userId).subscribe(() => {
      this.notifications.forEach(n => n.isRead = true);
    });
  }

  /** Optionnel : marquer une notification individuelle comme lue */
  markAsRead(n: AppNotification): void {
    if (!n.isRead) {
      // vous pourriez implémenter un endpoint « POST /notifications/markasread/{id} »
      // mais ici on se contente de local :
      n.isRead = true;
    }
  }
}
