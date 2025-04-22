import { Injectable } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PushSubscriptionService {
  // Clé publique VAPID en Base64 URL‑safe (sans retours à la ligne)
  private readonly VAPID_PUBLIC_KEY = environment.vapidPublicKey;

  constructor(
    private swPush: SwPush,
    private http: HttpClient
  ) { }

  public subscribeToPush(userId: string): void {
    if (!this.swPush.isEnabled) {
      console.warn('Service Worker Push non supporté');
      return;
    }

    this.swPush.requestSubscription({
      serverPublicKey: this.VAPID_PUBLIC_KEY
    })
    .then(subscription => {
      // subscription.getKey() renvoie un ArrayBuffer
      const p256dh = this.arrayBufferToBase64(subscription.getKey('p256dh')!);
      const auth   = this.arrayBufferToBase64(subscription.getKey('auth')!);

      const payload = {
        endpoint: subscription.endpoint,
        p256dh,
        auth,
        userId
      };

      return this.http
        .post(`${environment.apiUrl}notifications/subscribe`, payload)
        .toPromise();
    })
    .catch(err => console.error('Erreur d’abonnement Push :', err));
  }

  // Convertit un ArrayBuffer en Base64 (standard)
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (const b of bytes) {
      binary += String.fromCharCode(b);
    }
    return window.btoa(binary);
  }

  // Si vous devez absolument prendre une clé URL‑safe en entrée :
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64   = (base64String + padding)
                      .replace(/-/g, '+')
                      .replace(/_/g, '/');
    const rawData  = window.atob(base64);
    const output   = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      output[i]  = rawData.charCodeAt(i);
    }
    return output;
  }
}
