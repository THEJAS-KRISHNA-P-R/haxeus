"use client"

export type DeviceTier = "high" | "low"

export function getDeviceTier(): DeviceTier {
  if (typeof window === "undefined") return "high"

  // Check 1 — hardware concurrency (CPU cores)
  // Higher bar: Many 8-core devices struggle with heavy WebGL/Glass
  const cores = navigator.hardwareConcurrency ?? 8
  if (cores <= 8) return "low"

  // Check 2 — device memory (GB RAM)
  // Higher bar: 8GB is often the minimum for smooth performance with many tabs
  const memory = (navigator as any).deviceMemory ?? 8
  if (memory <= 8) return "low"

  // Check 3 — connection speed
  const connection = (navigator as any).connection
  if (connection) {
    if (connection.saveData) return "low"  // user explicitly wants less data
    if (connection.effectiveType === "2g" || connection.effectiveType === "slow-2g") return "low"
  }

  // Check 4 — reduced motion preference
  // Accessibility setting that also indicates user wants less animation
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return "low"

  return "high"
}
