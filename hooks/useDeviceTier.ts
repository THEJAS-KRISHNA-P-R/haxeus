"use client"

import { useState, useEffect } from "react"
import { getDeviceTier, type DeviceTier } from "@/lib/device-capability"

export function useDeviceTier(): DeviceTier {
  // Default to "high" on server — hydrates correctly after mount
  const [tier, setTier] = useState<DeviceTier>("high")

  useEffect(() => {
    setTier(getDeviceTier())
  }, [])

  return tier
}
