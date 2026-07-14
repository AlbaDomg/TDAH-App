// Service Worker para habilitar notificaciones nativas en segundo plano y PWA offline
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Manejar el clic en la notificación nativa
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  // Buscar si la pestaña de la app ya está abierta y enfocarla
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          return client.focus();
        }
      }
      // Si no está abierta, abrir la página de inicio de la app
      if (self.clients.openWindow) {
        return self.clients.openWindow('/');
      }
    })
  );
});

// Escuchar mensajes desde la app principal para mostrar notificaciones directamente desde el SW
// Esto evade el bloqueo de notificaciones en pestañas en segundo plano en Android
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    event.waitUntil(
      self.registration.showNotification(event.data.title, event.data.options)
    );
  }
});
