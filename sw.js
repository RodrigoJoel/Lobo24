// Service worker mínimo: solo habilita que el sitio sea instalable como app.
// No cachea nada a propósito, para no arriesgar servir HTML/JS/precios
// desactualizados en un sitio de venta en vivo.

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
