import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { NotificationService } from '../_services/notification.service';
import { AppNotification } from '../_models/notification';
import { Router } from '@angular/router';

@Component({
  selector: 'app-notifications',
  imports: [CommonModule],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css'
})
export class NotificationsComponent implements OnInit {
  @Output() closeSidenav = new EventEmitter<void>()
  notifications: AppNotification[] = [];
  userId!: string;

  constructor(
    private notifSvc: NotificationService,
    private router: Router
  ) { }

  ngOnInit(): void {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) return;
    this.userId = JSON.parse(storedUser).id.toString();

    // Chargement initial
    this.notifSvc.getNotifications(this.userId).subscribe({
      next: notifs => this.notifications = notifs,
      error: err => console.error(err)
    });

    // Réceptions temps-réel
    this.notifSvc.notification$.subscribe(dto => {
      this.notifications.unshift(dto);
    });
  }

  markAllAsRead(): void {
    this.notifSvc.markAllAsRead(this.userId).subscribe(() => {
      this.notifications.forEach(n => n.isRead = true);
    });
  }

  markAsRead(n: AppNotification): void {
    if (n.isRead) return;
    this.notifSvc.markAsRead(n.id).subscribe(() => {
      n.isRead = true;
    });
  }

  goTo(n: AppNotification) {
    // 1) Si pas de type, on sort
    if (!n.entityType) {
      console.warn('Notification sans entityType, on ne navigue pas', n);
      return;
    }
  
    // 2) Mapping entityType → segment de route EXACTEMENT comme dans AppRoutingModule
    const routeMap: Record<string,string> = {
      Projets: 'Projets',
      Societe: 'Societes',
      Tickets:  'Tickets',
    };
  
    const segment = routeMap[n.entityType];
    if (!segment) {
      console.warn(`Pas de route configurée pour entityType='${n.entityType}'`);
      return;
    }
  
    // 3) Construction du tableau de segments
    const commands = n.entityId
      ? ['/home', segment, 'details', n.entityId.toString()]
      : ['/home', segment];
  
    // 4) Navigation
    this.router.navigate(commands).then(success => {
      if (success) {
        this.markAsRead(n);
        this.closeSidenav.emit();
      }
    });
  }
  
  
}
