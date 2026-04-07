const CACHE_NAME = 'sjfc-native-shell-v1';
const APP_SHELL_URLS = [
  '/',
  '/index.html',
  '/offline-app.html',
  '/brand-logo-light.png',
  '/brand-logo-dark.png',
  '/brand-logo.png',
  '/favicon.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL_URLS)).then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);

  if (url.origin !== self.location.origin || url.pathname.startsWith('/downloads/')) {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const cachedResponse = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put('/index.html', cachedResponse));
          return response;
        })
        .catch(async () => {
          const cache = await caches.open(CACHE_NAME);
          return (await cache.match(request)) || (await cache.match('/index.html')) || (await cache.match('/offline-app.html'));
        }),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const networkFetch = fetch(request)
        .then((response) => {
          if (response && response.status === 200 && url.origin === self.location.origin) {
            const cachedResponse = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, cachedResponse));
          }

          return response;
        })
        .catch(() => cached);

      return cached || networkFetch;
    }),
  );
});
