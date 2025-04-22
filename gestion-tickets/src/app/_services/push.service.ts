import { Injectable } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PushService {
  constructor(private swPush: SwPush, private http: HttpClient) {}

  public subscribe(userId: string) {
    this.swPush.requestSubscription({
      serverPublicKey: environment.vapidPublicKey
    })
    .then(sub => {
      // Envoyer la sub au backend
      (sub as any).userId = userId;
      this.http.post('/api/notifications/subscribe', sub).subscribe();
    })
    .catch(err => console.error('Impossible de souscrire', err));
  }
}