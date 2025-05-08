// push-subscription.service.ts
import { Injectable } from '@angular/core';
import { HttpClient }   from '@angular/common/http'; 
import { environment } from 'src/environment/environment';

@Injectable({ providedIn: 'root' })
export class PushSubscriptionService {
  readonly VAPID_PUBLIC = environment.vapidPublicKey;

  async subscribeToPush(userId: string) {
    // 1) Attendre que le SW perso soit prêt
    const registration = await navigator.serviceWorker.ready;
    // 2) Demander la permission si besoin
    if (Notification.permission !== 'granted') {
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') { return; }
    }
    console.log(Notification.permission); // doit retourner "granted"
    // 3) (Ré)souscrire via pushManager
    const sub = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: this.urlBase64ToUint8Array(this.VAPID_PUBLIC)
    });
    // 4) Envoi au back
    const payload = {
      userId,
      endpoint: sub.endpoint,
      p256dh:    btoa(String.fromCharCode(...new Uint8Array(sub.getKey('p256dh')!))),
      auth:      btoa(String.fromCharCode(...new Uint8Array(sub.getKey('auth')!)))
    };
    await this.http.post(`${environment.URLAPI}notifications/subscribe`, payload).toPromise();
  }

  private urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const str     = (base64String + padding)
                    .replace(/\-/g, '+')
                    .replace(/_/g, '/');
    const rawData = window.atob(str);
    return new Uint8Array([...rawData].map(c => c.charCodeAt(0)));
  }

  constructor(private http: HttpClient) {}
}
