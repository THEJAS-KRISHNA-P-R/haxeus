"use client"

import { useState, useEffect } from "react"

export interface StoreSettings {
  free_shipping_above: number
  shipping_rate: number
}

// Aligning defaults with the Supabase seeded values
const DEFAULTS: StoreSettings = { free_shipping_above: 1000, shipping_rate: 150 }

export function useStoreSettings() {
  const [settings, setSettings] = useState<StoreSettings>(DEFAULTS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        setSettings({
          free_shipping_above: data.free_shipping_above ?? DEFAULTS.free_shipping_above,
          shipping_rate: data.shipping_rate ?? DEFAULTS.shipping_rate,
        })
      })
      .catch(() => {
        console.warn("[useStoreSettings] Sync failed, using DEFAULTS")
      })
      .finally(() => setLoading(false))
  }, [])

  return { settings, loading }
}
