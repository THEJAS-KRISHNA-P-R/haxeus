'use client'

import { useEffect } from 'react'
import { registerServiceWorker, setupAddToHomeScreen } from '@/lib/pwa'
import { InstallPrompt } from './InstallPrompt'

/**
 * PWA Provider Component
 * Registers service worker and handles PWA lifecycle
 */
export function PWAProvider() {
  useEffect(() => {
    // Register service worker
    registerServiceWorker()
    // Setup PWA installation listeners
    setupAddToHomeScreen()
  }, [])

  return <InstallPrompt />
}
