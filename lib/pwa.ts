'use client'

import { useEffect, useState } from 'react'

/**
 * PWA Utilities
 * - Service Worker registration
 * - Push notification subscription
 * - Add to Home Screen prompt
 * - Offline detection
 */

export function registerServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return
  }

  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/'
      })

      // Check for updates every hour
      setInterval(() => {
        registration.update()
      }, 60 * 60 * 1000)
    } catch (error) {
      console.error('Service Worker registration failed:', (error as Error).message ?? 'Unknown error')
    }
  })
}

export async function subscribeToPushNotifications(userId: string): Promise<boolean> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return false
  }

  try {
    const registration = await navigator.serviceWorker.ready
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      return false
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    })

    await fetch('/api/push-subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, subscription })
    })

    return true
  } catch (error) {
    console.error('Push subscription failed:', (error as Error).message ?? 'Unknown error')
    return false
  }
}

export async function unsubscribeFromPushNotifications(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) {
    return false
  }

  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()

    if (subscription) {
      await subscription.unsubscribe()
      return true
    }

    return false
  } catch (error) {
    console.error('Unsubscribe failed:', (error as Error).message ?? 'Unknown error')
    return false
  }
}

// Add to Home Screen — uses typed global from types/global.d.ts
export function setupAddToHomeScreen(onPromptAvailable?: () => void) {
  if (typeof window === 'undefined') return

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    window.deferredPrompt = e as BeforeInstallPromptEvent

    if (onPromptAvailable) {
      onPromptAvailable()
    }
  })

  window.addEventListener('appinstalled', () => {
    window.deferredPrompt = null
  })
}

export async function showAddToHomeScreen(): Promise<boolean> {
  if (typeof window === 'undefined' || !window.deferredPrompt) {
    return false
  }

  const prompt = window.deferredPrompt
  await prompt.prompt()
  const { outcome } = await prompt.userChoice
  window.deferredPrompt = null

  return outcome === 'accepted'
}

// Offline detection
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(
    typeof window !== 'undefined' ? navigator.onLine : true
  )

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOnline
}

// Background sync for offline orders
interface OfflineOrderData {
  [key: string]: unknown
}

export async function queueOfflineOrder(orderData: OfflineOrderData): Promise<void> {
  if (!('serviceWorker' in navigator)) {
    throw new Error('Service Worker not supported')
  }

  try {
    const db = await openDB()
    const transaction = db.transaction(['pending-orders'], 'readwrite')
    const store = transaction.objectStore('pending-orders')

    await new Promise<void>((resolve, reject) => {
      const request = store.add({
        ...orderData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      })
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })

    const registration = await navigator.serviceWorker.ready
    if (registration.sync) {
      await registration.sync.register('sync-orders')
    }
  } catch (error) {
    console.error('Failed to queue order:', (error as Error).message ?? 'Unknown error')
    throw error
  }
}

// IndexedDB helper
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('haxeus-db', 1)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains('pending-orders')) {
        db.createObjectStore('pending-orders', { keyPath: 'id' })
      }
    }
  })
}

// Check if PWA is installed
export function isPWAInstalled(): boolean {
  if (typeof window === 'undefined') return false

  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

// Share API
export async function shareProduct(data: {
  title: string
  text: string
  url: string
}): Promise<boolean> {
  if (typeof window === 'undefined' || !navigator.share) {
    return false
  }

  try {
    await navigator.share(data)
    return true
  } catch (error) {
    if ((error as Error).name !== 'AbortError') {
      console.error('Share failed:', (error as Error).message ?? 'Unknown error')
    }
    return false
  }
}

// Periodic background sync (if supported)
export async function registerPeriodicSync(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) {
    return false
  }

  try {
    const registration = await navigator.serviceWorker.ready

    if (!registration.periodicSync) {
      return false
    }

    const status = await navigator.permissions.query({
      name: 'periodic-background-sync' as PermissionName
    })

    if (status.state === 'granted') {
      await registration.periodicSync.register('check-updates', {
        minInterval: 24 * 60 * 60 * 1000
      })
      return true
    }

    return false
  } catch (error) {
    console.error('Periodic sync registration failed:', (error as Error).message ?? 'Unknown error')
    return false
  }
}

// React hook for easy integration
export function usePWA() {
  const [isInstalled, setIsInstalled] = useState(false)
  const [canInstall, setCanInstall] = useState(false)
  const isOnline = useOnlineStatus()

  useEffect(() => {
    setIsInstalled(isPWAInstalled())

    const handler = () => setCanInstall(true)
    window.addEventListener('beforeinstallprompt', handler)

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  return {
    isInstalled,
    canInstall,
    isOnline,
    install: showAddToHomeScreen
  }
}
