self.addEventListener('push', event => {
  const data = event.data.json();
  const title = 'Nouvelle notification';
  const options = {
    body: data,
    icon: 'assets/icons/icon-72x72.png'
  };
  event.waitUntil(self.registration.showNotification(title, options));
});