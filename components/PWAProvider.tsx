'use client'

import { useEffect } from 'react'
import { registerServiceWorker } from '@/lib/pwa'

/**
 * PWA Provider Component
 * Registers service worker and handles PWA lifecycle
 */
export function PWAProvider() {
  useEffect(() => {
    // Register service worker
    registerServiceWorker()
    
    // Log PWA status
    console.log('🚀 PWA initialized')
  }, [])

  return null // This component doesn't render anything
}
