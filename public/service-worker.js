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
  '/favi/apple-touch-icon.png',
  '/favi/web-app-manifest-192x192.png',
  '/favi/web-app-manifest-512x512.png'
]

// 1. Install — Precache core UI with individualized error handling
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Use map to attempt adding each separately, so one 404 doesn't break everything
      return Promise.allSettled(
        PRECACHE_ASSETS.map((url) => 
          fetch(url).then((response) => {
            if (!response.ok) throw new Error(`Offline asset ${url} failed: ${response.status}`)
            return cache.put(url, response)
          })
        )
      )
    })
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

  // C. Page/API Strategy (Network First with fallback)
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache success navigation requests
        if (response.ok && request.mode === 'navigate') {
          const copy = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy))
        }
        return response
      })
      .catch(async () => {
        const cached = await caches.match(request)
        if (cached) return cached

        if (request.mode === 'navigate') {
          const offlinePage = await caches.match('/offline')
          return offlinePage || new Response('HAXEUS: Currently Offline', { 
            status: 503, 
            headers: { 'Content-Type': 'text/html' } 
          })
        }

        return new Response('Offline', { status: 503 })
      })
  )
})

// Cache trimming helper — non-recursive loop for stability
async function trimCache(cacheName, maxItems) {
  try {
    const cache = await caches.open(cacheName)
    const keys = await cache.keys()
    if (keys.length > maxItems) {
      for (let i = 0; i < keys.length - maxItems; i++) {
        await cache.delete(keys[i])
      }
    }
  } catch (err) {
    console.error('Cache trim failed:', err)
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
