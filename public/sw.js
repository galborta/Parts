self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  event.waitUntil(
    self.registration.showNotification(data.title || 'Baseline', {
      body: data.body || 'Your 3 daily sessions are ready.',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      data: { url: '/dashboard' },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data?.url || '/dashboard'));
});
