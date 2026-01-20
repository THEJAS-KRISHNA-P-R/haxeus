'use client'

import { useEffect } from 'react'

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

      console.log('✅ Service Worker registered:', registration.scope)

      // Check for updates every hour
      setInterval(() => {
        registration.update()
      }, 60 * 60 * 1000)

      // Request notification permission
      if ('Notification' in window && Notification.permission === 'default') {
        // Will prompt user later with context
      }
    } catch (error) {
      console.error('❌ Service Worker registration failed:', error)
    }
  })
}

export async function subscribeToPushNotifications(userId: string): Promise<boolean> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.log('Push notifications not supported')
    return false
  }

  try {
    const registration = await navigator.serviceWorker.ready

    // Request permission
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      console.log('Notification permission denied')
      return false
    }

    // Subscribe to push
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    })

    // Send subscription to server
    await fetch('/api/push-subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        subscription
      })
    })

    console.log('✅ Subscribed to push notifications')
    return true
  } catch (error) {
    console.error('❌ Push subscription failed:', error)
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
      console.log('✅ Unsubscribed from push notifications')
      return true
    }

    return false
  } catch (error) {
    console.error('❌ Unsubscribe failed:', error)
    return false
  }
}

// Add to Home Screen
let deferredPrompt: any = null

export function setupAddToHomeScreen(onPromptAvailable?: () => void) {
  if (typeof window === 'undefined') return

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt = e

    if (onPromptAvailable) {
      onPromptAvailable()
    }
  })

  window.addEventListener('appinstalled', () => {
    console.log('✅ PWA installed')
    deferredPrompt = null
  })
}

export async function showAddToHomeScreen(): Promise<boolean> {
  if (!deferredPrompt) {
    console.log('Add to home screen not available')
    return false
  }

  deferredPrompt.prompt()
  const { outcome } = await deferredPrompt.userChoice

  console.log(`User response: ${outcome}`)
  deferredPrompt = null

  return outcome === 'accepted'
}

// Offline detection
export function useOnlineStatus() {
  if (typeof window === 'undefined') {
    return true
  }

  const [isOnline, setIsOnline] = React.useState(navigator.onLine)

  React.useEffect(() => {
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
export async function queueOfflineOrder(orderData: any): Promise<void> {
  if (!('serviceWorker' in navigator)) {
    throw new Error('Service Worker not supported')
  }

  try {
    // Store order in IndexedDB
    const db = await openDB()
    const transaction = db.transaction(['pending-orders'], 'readwrite')
    const store = transaction.objectStore('pending-orders')

    await new Promise((resolve, reject) => {
      const request = store.add({
        ...orderData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      })
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })

    // Register sync if available
    const registration = await navigator.serviceWorker.ready
    if ('sync' in registration) {
      await (registration as any).sync.register('sync-orders')
      console.log('✅ Order queued for sync')
    } else {
      console.log('✅ Order saved offline (background sync not available)')
    }
  } catch (error) {
    console.error('❌ Failed to queue order:', error)
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
    (window.navigator as any).standalone === true
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
      console.error('Share failed:', error)
    }
    return false
  }
}

// Periodic background sync (if supported)
export async function registerPeriodicSync(): Promise<boolean> {
  if (!('serviceWorker' in navigator) || !('periodicSync' in navigator.serviceWorker)) {
    console.log('Periodic sync not supported')
    return false
  }

  try {
    const registration = await navigator.serviceWorker.ready
    const status = await (navigator as any).permissions.query({
      name: 'periodic-background-sync'
    })

    if (status.state === 'granted') {
      await (registration as any).periodicSync.register('check-updates', {
        minInterval: 24 * 60 * 60 * 1000 // Once per day
      })
      console.log('✅ Periodic sync registered')
      return true
    }

    return false
  } catch (error) {
    console.error('❌ Periodic sync registration failed:', error)
    return false
  }
}

// React hook for easy integration
export function usePWA() {
  const [isInstalled, setIsInstalled] = React.useState(false)
  const [canInstall, setCanInstall] = React.useState(false)
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

import React from 'react'
