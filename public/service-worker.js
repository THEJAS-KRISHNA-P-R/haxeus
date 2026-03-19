// HAXEUS Service Worker (v1.3)
// Objective: Network-first for dynamic content, Cache-first for assets & images.
// Improved handling for Next.js and Supabase assets.

const CACHE_NAME = 'haxeus-static-v1.3'
const IMAGE_CACHE = 'haxeus-images-v1.3'
const MAX_IMAGES = 100 // Cache trimming limit

const PRECACHE_ASSETS = [
  '/offline',
  '/manifest.json',
  '/favi/favicon-96x96.png',
  '/favi/apple-touch-icon.png'
]

// 1. Install — Precache core UI
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS))
  )
  self.skipWaiting()
})

// 2. Activate — Clean up legacy caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME && key !== IMAGE_CACHE)
          .map((key) => caches.delete(key))
      )
    })
  )
  self.clients.claim()
})

// 3. Fetch Strategy
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // A. Skip non-GET, Next.js internals, and browser extensions
  if (
    request.method !== 'GET' ||
    url.pathname.startsWith('/_next/') ||
    url.protocol.startsWith('chrome-extension')
  ) {
    return
  }

  // B. Image Strategy (Cache First)
  if (request.destination === 'image' || url.pathname.match(/\.(png|jpg|jpeg|webp|gif|svg|avif)$/)) {
    event.respondWith(
      caches.open(IMAGE_CACHE).then((cache) => {
        return cache.match(request).then((cached) => {
          if (cached) return cached
          return fetch(request).then((response) => {
            if (response.ok) {
              cache.put(request, response.clone())
              trimCache(IMAGE_CACHE, MAX_IMAGES)
            }
            return response
          })
        })
      })
    )
    return
  }

  // C. Page/API Strategy (Network First)
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok && request.mode === 'navigate') {
          const copy = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy))
        }
        return response
      })
      .catch(() => {
        return caches.match(request).then((cached) => {
          if (cached) return cached
          if (request.mode === 'navigate') return caches.match('/offline')
          return new Response('Offline', { status: 503 })
        })
      })
  )
})

// Cache trimming helper
async function trimCache(cacheName, maxItems) {
  const cache = await caches.open(cacheName)
  const keys = await cache.keys()
  if (keys.length > maxItems) {
    await cache.delete(keys[0])
    trimCache(cacheName, maxItems)
  }
}

// Push notifications
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {}
  const options = {
    body: data.body || 'New update from HAXEUS',
    icon: '/favi/favicon-96x96.png',
    badge: '/favi/favicon-96x96.png',
    data: { url: data.url || '/' }
  }
  event.waitUntil(self.registration.showNotification(data.title || 'HAXEUS', options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      const url = event.notification.data.url
      for (const client of clients) {
        if (client.url === url && 'focus' in client) return client.focus()
      }
      return self.clients.openWindow(url)
    })
  )
})
