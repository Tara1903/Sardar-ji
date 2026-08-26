self.addEventListener('push', (event) => {
  let data = {};

  try {
    data = event.data?.json() || {};
  } catch {
    data = {
      title: 'Order Update',
      message: event.data?.text() || 'You have a new update from Sardar Ji Food Corner.',
    };
  }

  const title = data.title || 'Order Update';
  const options = {
    body: data.message || 'You have a new update from Sardar Ji Food Corner.',
    icon: data.icon || '/brand-logo-light.png',
    badge: data.badge || '/brand-logo-light.png',
    data: data.data || {
      url: '/profile',
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/profile';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if ('focus' in client) {
          if (client.url.includes(self.location.origin)) {
            return client.focus().then(() => {
              if ('navigate' in client) {
                return client.navigate(targetUrl);
              }

              return undefined;
            });
          }
        }
      }

      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }

      return undefined;
    }),
  );
});
