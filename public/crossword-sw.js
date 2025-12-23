/**
 * Crossword PWA Service Worker
 * Handles caching and offline support for the crossword game
 */

const CACHE_NAME = 'crossword-cache-v1';
const STATIC_ASSETS = [
  '/games/crossword',
  '/crossword-icon-192.png',
  '/crossword-icon-512.png',
  '/crossword-manifest.json',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[Crossword SW] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Crossword SW] Caching static assets');
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

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle requests from our origin
  if (url.origin !== location.origin) {
    return;
  }

  // For API calls, always use network
  if (url.pathname.includes('/api/') || url.pathname.includes('/crossword/puzzle')) {
    event.respondWith(
      fetch(request).catch(() => {
        // Return cached puzzle data if offline
        return caches.match(request);
      })
    );
    return;
  }

  // For page navigations and static assets, use stale-while-revalidate
  if (url.pathname.startsWith('/games/crossword')) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(request);
        
        const fetchPromise = fetch(request).then((networkResponse) => {
          if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // Default: network first
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
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
    requireInteraction: data.type === 'streak-warning', // Keep streak warnings visible
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
  
  // Handle different actions
  if (event.action === 'dismiss') {
    // User clicked "Later" - do nothing
    return;
  }
  
  // For "play" action or clicking the notification itself, open the game
  const urlToOpen = event.notification.data?.url || '/games/crossword';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window open with the crossword game
        for (const client of clientList) {
          if (client.url.includes('/games/crossword') && 'focus' in client) {
            return client.focus();
          }
        }
        // If not, open a new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Handle notification close (dismissed without clicking)
self.addEventListener('notificationclose', (event) => {
  console.log('[Crossword SW] Notification closed');
});

