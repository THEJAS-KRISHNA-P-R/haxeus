// Service Worker for HAXEUS PWA (v1.1)
// handles site updates and offline fallbacks
const CACHE_NAME = 'haxeus-v1.1'
const RUNTIME_CACHE = 'haxeus-runtime-v1.1'

// Assets to cache on install
const PRECACHE_URLS = [
  '/',
  '/products',
  '/cart',
  '/orders',
  '/offline',
  '/manifest.json',
  '/favi/favicon-96x96.png',
  '/favi/web-app-manifest-192x192.png',
  '/favi/web-app-manifest-512x512.png'
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
    icon: '/favi/favicon-96x96.png',
    badge: '/favi/favicon-96x96.png',
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

// Service Worker cleanup complete
