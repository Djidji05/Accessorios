const CACHE_NAME = 'accessorio-pwa-v17';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json?v=17',
  '/favicon.png?v=17',
  '/apple-touch-icon.png?v=17',
  '/images/logo1.png',
  '/icon-192.png?v=17',
  '/icon-512.png?v=17'
];

// 1. Install Event: Cache Core Static Shell Assets
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[PWA Service Worker] Pre-caching App Shell v8');
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// 2. Activate Event: Clean up Old Caches immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[PWA Service Worker] Removing old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Écouteur pour forcer la mise à jour immédiate
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// 3. Fetch Event
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // Laisser toutes les requêtes API et requêtes non-GET passer directement au réseau
  if (
    requestUrl.pathname.startsWith('/api') || 
    event.request.method !== 'GET' ||
    !event.request.url.startsWith('http')
  ) {
    return;
  }

  // Pour la page HTML principale (navigation / index.html) : STRATÉGIE NETWORK FIRST
  // Garantit que le navigateur charge toujours les derniers assets CSS/JS hashés sans erreur 404
  if (event.request.mode === 'navigate' || requestUrl.pathname === '/' || requestUrl.pathname === '/index.html') {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match('/index.html').then((cached) => cached || caches.match('/'));
        })
    );
    return;
  }

  // Assets Statiques (CSS, JS, images) : Cache First avec Network Fallback (en vérifiant que la réponse n'est pas du HTML par erreur)
  const isImageRequest = /\.(png|jpg|jpeg|svg|webp|ico|gif)$/i.test(requestUrl.pathname);
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        const ct = cachedResponse.headers.get('content-type') || '';
        if (!isImageRequest || ct.startsWith('image/')) {
          return cachedResponse;
        }
      }
      return fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const ct = networkResponse.headers.get('content-type') || '';
          if (!isImageRequest || ct.startsWith('image/')) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
        }
        return networkResponse;
      }).catch(() => {
        return new Response('Ressource indisponible', { status: 503, statusText: 'Service Unavailable' });
      });
    })
  );
});
