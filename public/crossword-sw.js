/**
 * Crossword PWA Service Worker
 * Handles caching and offline support for the crossword game
 * 
 * IMPORTANT: iOS Safari doesn't allow service workers to serve 
 * redirect responses for navigation requests.
 */

const CACHE_NAME = 'crossword-cache-v2'; // Increment version to force update
const STATIC_ASSETS = [
  '/crossword-icon-192.png',
  '/crossword-icon-512.png',
  '/crossword-manifest.json',
];

// Install event - cache static assets only (not HTML pages)
self.addEventListener('install', (event) => {
  console.log('[Crossword SW] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Crossword SW] Caching static assets');
      // Only cache static assets, not navigation pages
      return cache.addAll(STATIC_ASSETS);
    })
  );
  // Activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Crossword SW] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('crossword-') && name !== CACHE_NAME)
          .map((name) => {
            console.log('[Crossword SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  // Take control of all clients immediately
  self.clients.claim();
});

// Fetch event handler
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle requests from our origin
  if (url.origin !== location.origin) {
    return;
  }

  // CRITICAL: For navigation requests, ALWAYS go to network
  // iOS Safari throws error if SW serves redirect for navigation
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Only cache successful non-redirect responses
          if (response.ok && !response.redirected) {
            // Don't cache HTML pages to avoid stale content issues
            // Just return the network response
          }
          return response;
        })
        .catch((error) => {
          console.log('[Crossword SW] Navigation fetch failed:', error);
          // Return a simple offline page or let the browser handle it
          return new Response(
            `<!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <title>Offline - Daily Crossword</title>
              <style>
                body { 
                  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
                  display: flex; 
                  align-items: center; 
                  justify-content: center; 
                  min-height: 100vh; 
                  margin: 0;
                  background: #0f172a;
                  color: white;
                  text-align: center;
                  padding: 20px;
                }
                .container { max-width: 400px; }
                h1 { font-size: 3rem; margin-bottom: 1rem; }
                p { color: #94a3b8; margin-bottom: 2rem; }
                button {
                  background: #10b981;
                  color: white;
                  border: none;
                  padding: 12px 24px;
                  border-radius: 12px;
                  font-size: 1rem;
                  cursor: pointer;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>📴</h1>
                <h2>You're Offline</h2>
                <p>Please check your internet connection and try again.</p>
                <button onclick="location.reload()">Retry</button>
              </div>
            </body>
            </html>`,
            {
              status: 200,
              headers: { 'Content-Type': 'text/html' },
            }
          );
        })
    );
    return;
  }

  // For API calls, always use network (no caching)
  if (url.pathname.includes('/api/') || 
      url.pathname.includes('/crossword/puzzle') ||
      url.pathname.includes('/push/')) {
    // Don't intercept, let browser handle
    return;
  }

  // For static assets (images, manifest, etc.), use cache-first
  if (STATIC_ASSETS.some(asset => url.pathname.endsWith(asset.split('/').pop()))) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then((networkResponse) => {
          // Only cache if successful and not a redirect
          if (networkResponse.ok && !networkResponse.redirected) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // For everything else, network first (don't cache)
  // This prevents caching issues with Next.js chunks and dynamic content
});

// Handle push notifications
self.addEventListener('push', (event) => {
  console.log('[Crossword SW] Push notification received');
  
  let data = {
    title: '🧩 Daily Crossword',
    body: 'Time for your daily crossword challenge!',
    icon: '/crossword-icon-192.png',
    badge: '/crossword-icon-192.png',
    data: { url: '/games/crossword' },
  };
  
  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (e) {
      console.log('[Crossword SW] Error parsing push data:', e);
    }
  }
  
  const options = {
    body: data.body,
    icon: data.icon || '/crossword-icon-192.png',
    badge: data.badge || '/crossword-icon-192.png',
    vibrate: [100, 50, 100, 50, 100],
    tag: data.tag || 'crossword-notification',
    renotify: true,
    requireInteraction: data.type === 'streak-warning',
    data: data.data || { url: '/games/crossword' },
    actions: data.actions || [
      { action: 'play', title: '▶️ Play Now' },
      { action: 'dismiss', title: '❌ Later' },
    ],
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[Crossword SW] Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'dismiss') {
    return;
  }
  
  const urlToOpen = event.notification.data?.url || '/games/crossword';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes('/games/crossword') && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('[Crossword SW] Notification closed');
});
