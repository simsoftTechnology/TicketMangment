self.addEventListener('push', event => {
  // on récupère le payload JSON envoyé
  const data = event.data?.json() || {};
  const title   = data.title   || 'Nouvelle notification';
  const options = {
    body:    data.body    || data.message,
    icon:    '/assets/icons/icon-192x192.png',
    badge:   '/assets/icons/badge-72x72.png',
    data:    data        // utile pour ouvrir la bonne URL ensuite
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.openWindow(url)
  );
});