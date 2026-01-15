self.addEventListener('push', event => {
  let data = { title: 'Notification', message: '' };
  try {
    data = event.data.json();
  } catch {}  // fallback si ce n’est pas du JSON
  const options = {
    body: data.message,
    icon: '/assets/icons/icon-192x192.png',
    badge: '/assets/icons/badge-72x72.png',
    data: data.url
  };
  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener('notificationclick', event => {
  console.log('[sw-custom.js] Push reçu :');
  if (event.data) {
    console.log('[sw-custom.js] Payload :');
  }
  event.notification.close();
  const url = event.notification.data;
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(winList => {
      for (const win of winList) {
        if (win.url === url) return win.focus();
      }
      return clients.openWindow(url);
    })
  );
});
