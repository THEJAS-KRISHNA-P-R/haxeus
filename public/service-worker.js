// Service Worker for PWA
// Handles offline functionality, caching, and push notifications

const CACHE_NAME = 'haxeus-v1'
const RUNTIME_CACHE = 'haxeus-runtime-v1'

// Assets to cache on install
const PRECACHE_URLS = [
  '/',
  '/products',
  '/cart',
  '/orders',
  '/offline',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
]

// Install event - cache essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE)
            .map(cacheName => caches.delete(cacheName))
        )
      })
      .then(() => self.clients.claim())
  )
})

// Fetch event - network first, then cache fallback
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return
  }

  // API requests - network only
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(request))
    return
  }

  // Images - cache first
  if (request.destination === 'image') {
    event.respondWith(
      caches.match(request)
        .then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse
          }
          return fetch(request).then(response => {
            if (response.status === 200) {
              const responseClone = response.clone()
              caches.open(RUNTIME_CACHE).then(cache => {
                cache.put(request, responseClone)
              })
            }
            return response
          })
        })
        .catch(() => {
          return new Response('Image not available offline', { status: 503 })
        })
    )
    return
  }

  // Pages - network first, cache fallback
  event.respondWith(
    fetch(request)
      .then(response => {
        if (response.status === 200) {
          const responseClone = response.clone()
          caches.open(RUNTIME_CACHE).then(cache => {
            cache.put(request, responseClone)
          })
        }
        return response
      })
      .catch(() => {
        return caches.match(request)
          .then(cachedResponse => {
            if (cachedResponse) {
              return cachedResponse
            }
            // Fallback to offline page
            if (request.mode === 'navigate') {
              return caches.match('/offline')
            }
            return new Response('Offline', { status: 503 })
          })
      })
  )
})

// Push notification event
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {}

  const options = {
    body: data.body || 'New notification from HAXEUS',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    image: data.image,
    data: {
      url: data.url || '/',
      dateOfArrival: Date.now()
    },
    actions: [
      { action: 'view', title: 'View' },
      { action: 'close', title: 'Close' }
    ],
    tag: data.tag || 'general',
    requireInteraction: false,
    vibrate: [200, 100, 200]
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'HAXEUS', options)
  )
})

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action === 'close') {
    return
  }

  const urlToOpen = event.notification.data?.url || '/'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(windowClients => {
        // Check if there's already a window open
        for (let client of windowClients) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus()
          }
        }
        // Open new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen)
        }
      })
  )
})

// Background sync for offline orders
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-orders') {
    event.waitUntil(syncOrders())
  }
})

async function syncOrders() {
  // Get pending orders from IndexedDB and sync with server
  try {
    const db = await openDB()
    const pendingOrders = await db.getAll('pending-orders')

    for (const order of pendingOrders) {
      try {
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(order)
        })

        if (response.ok) {
          await db.delete('pending-orders', order.id)
        }
      } catch (error) {
        console.error('Failed to sync order:', error)
      }
    }
  } catch (error) {
    console.error('Sync failed:', error)
  }
}

// IndexedDB helper
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('haxeus-db', 1)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = (event) => {
      const db = event.target.result
      if (!db.objectStoreNames.contains('pending-orders')) {
        db.createObjectStore('pending-orders', { keyPath: 'id' })
      }
    }
  })
}

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'check-updates') {
    event.waitUntil(checkForUpdates())
  }
})

async function checkForUpdates() {
  try {
    // Check for product updates, price changes, etc.
    const response = await fetch('/api/updates')
    if (response.ok) {
      const updates = await response.json()

      if (updates.priceDrops && updates.priceDrops.length > 0) {
        // Show notification for price drops on wishlisted items
        self.registration.showNotification('Price Drop Alert! 🔥', {
          body: `${updates.priceDrops.length} item(s) in your wishlist are now cheaper!`,
          icon: '/icons/icon-192x192.png',
          data: { url: '/wishlist' }
        })
      }
    }
  } catch (error) {
    console.error('Update check failed:', error)
  }
}
