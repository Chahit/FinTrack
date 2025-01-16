const CACHE_NAME = 'fintrack-v1';
const OFFLINE_URL = '/offline.html';

const STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/styles/globals.css',
  '/favicon.ico',
  '/manifest.json'
];

const CACHE_STRATEGIES = {
  cacheFirst: async (request) => {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }

    try {
      const networkResponse = await fetch(request);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    } catch (error) {
      return new Response('Network error happened', {
        status: 408,
        headers: { 'Content-Type': 'text/plain' },
      });
    }
  },

  networkFirst: async (request) => {
    try {
      const networkResponse = await fetch(request);
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    } catch (error) {
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }
      return new Response('Network error happened', {
        status: 408,
        headers: { 'Content-Type': 'text/plain' },
      });
    }
  },

  staleWhileRevalidate: async (request) => {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    const networkResponsePromise = fetch(request).then(response => {
      cache.put(request, response.clone());
      return response;
    });

    return cachedResponse || networkResponsePromise;
  }
};

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(STATIC_ASSETS);
      await cache.add(new Request(OFFLINE_URL, { cache: 'reload' }));
    })()
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      if ('navigationPreload' in self.registration) {
        await self.registration.navigationPreload.enable();
      }
      
      // Clean up old caches
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter(cacheName => cacheName !== CACHE_NAME)
          .map(cacheName => caches.delete(cacheName))
      );
    })()
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const preloadResponse = await event.preloadResponse;
          if (preloadResponse) {
            return preloadResponse;
          }

          return await CACHE_STRATEGIES.networkFirst(event.request);
        } catch (error) {
          const cache = await caches.open(CACHE_NAME);
          return await cache.match(OFFLINE_URL);
        }
      })()
    );
    return;
  }

  // API requests
  if (event.request.url.includes('/api/')) {
    event.respondWith(CACHE_STRATEGIES.networkFirst(event.request));
    return;
  }

  // Static assets
  if (event.request.destination === 'style' ||
      event.request.destination === 'script' ||
      event.request.destination === 'image') {
    event.respondWith(CACHE_STRATEGIES.cacheFirst(event.request));
    return;
  }

  // Other requests
  event.respondWith(CACHE_STRATEGIES.staleWhileRevalidate(event.request));
});

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-transactions') {
    event.waitUntil(syncTransactions());
  }
});

self.addEventListener('push', (event) => {
  const options = {
    body: event.data.text(),
    icon: '/icons/notification-icon.png',
    badge: '/icons/notification-badge.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Details'
      },
      {
        action: 'close',
        title: 'Close'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('FinTrack Update', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

async function syncTransactions() {
  try {
    const db = await openDB();
    const pendingTransactions = await db
      .transaction('pendingTransactions')
      .objectStore('pendingTransactions')
      .getAll();

    for (const transaction of pendingTransactions) {
      try {
        await fetch('/api/transactions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(transaction)
        });

        await db
          .transaction('pendingTransactions', 'readwrite')
          .objectStore('pendingTransactions')
          .delete(transaction.id);
      } catch (error) {
        console.error('Error syncing transaction:', error);
      }
    }
  } catch (error) {
    console.error('Error in syncTransactions:', error);
  }
}

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('FinTrackOffline', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pendingTransactions')) {
        db.createObjectStore('pendingTransactions', { keyPath: 'id' });
      }
    };
  });
}
