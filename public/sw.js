const CACHE_NAME = 'shorepay-pwa-v1';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(['/', '/index.html', '/manifest.webmanifest', '/pwa-icon.svg']))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (req.mode === 'navigate') {
    event.respondWith(
      caches.match('/index.html').then((cached) => cached || fetch(req).catch(() => caches.match('/index.html')))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
        return res;
      });
    })
  );
});

