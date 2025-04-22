import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, Subject } from 'rxjs';
import { AppNotification } from '../_models/notification';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private hubConnection!: signalR.HubConnection;
  public notification$ = new Subject<string>();
  private baseUrl = `${environment.apiUrl}notifications/`;

  constructor(private http: HttpClient) {}  // <-- utilisez bien Angular HttpClient

  public startConnection(userId: string) {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(
        `${environment.signalRHubUrl}?userId=${userId}`,
        {
          withCredentials: true,
          // accessTokenFactory: () => this.auth.getToken()  // si nécessaire
        }
      )
      .withAutomaticReconnect()
      .build();

    this.hubConnection
      .start()
      .catch(err => console.error('Erreur démarrage SignalR :', err));

    this.hubConnection.on('ReceiveNotification', (msg: string) => {
      this.notification$.next(msg);
    });
  }

  /** Récupère l'historique des notifications pour un utilisateur */
  getNotifications(userId: string): Observable<AppNotification[]> {
    return this.http.get<AppNotification[]>(`${this.baseUrl}user/${userId}`);
  }

  markAllAsRead(userId: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}markasread/${userId}`, {});
  }
}
