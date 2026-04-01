"use client"

import { motion, useReducedMotion } from "framer-motion"
import { useEffect, useMemo, useState } from "react"

interface DropCountdownProps {
  targetDate: Date | string | null
  dropName?: string
}

interface CountdownState {
  days: string
  hours: string
  minutes: string
  seconds: string
  isLive: boolean
}

function buildCountdown(targetDate: Date): CountdownState {
  const diff = targetDate.getTime() - Date.now()

  if (diff <= 0) {
    return { days: "00", hours: "00", minutes: "00", seconds: "00", isLive: true }
  }

  const totalSeconds = Math.floor(diff / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return {
    days: String(days).padStart(2, "0"),
    hours: String(hours).padStart(2, "0"),
    minutes: String(minutes).padStart(2, "0"),
    seconds: String(seconds).padStart(2, "0"),
    isLive: false,
  }
}

export function DropCountdown({ targetDate, dropName }: DropCountdownProps) {
  const prefersReducedMotion = useReducedMotion()
  const resolvedTarget = useMemo(() => {
    if (!targetDate) {
      return null
    }

    const parsed = targetDate instanceof Date ? targetDate : new Date(targetDate)
    return Number.isNaN(parsed.getTime()) ? null : parsed
  }, [targetDate])
  const [countdown, setCountdown] = useState<CountdownState | null>(resolvedTarget ? buildCountdown(resolvedTarget) : null)

  useEffect(() => {
    if (!resolvedTarget) {
      setCountdown(null)
      return
    }

    setCountdown(buildCountdown(resolvedTarget))
    const interval = window.setInterval(() => {
      setCountdown(buildCountdown(resolvedTarget))
    }, 1000)

    return () => window.clearInterval(interval)
  }, [resolvedTarget])

  if (!resolvedTarget || !countdown) {
    return null
  }

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      layout="position"
      className="rounded-[30px] border p-5 sm:p-6"
      style={{
        borderColor: "var(--color-border)",
        background: "linear-gradient(135deg, color-mix(in srgb, var(--color-surface) 92%, transparent), color-mix(in srgb, var(--color-accent) 10%, transparent))",
      }}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.32em]" style={{ color: "var(--color-accent-warm)" }}>
        {dropName ? `${dropName} countdown` : "Next drop countdown"}
      </p>

      {countdown.isLive ? (
        <p className="mt-3 text-2xl font-bold tracking-tight" style={{ color: "var(--color-foreground)" }}>
          Drop is live!
        </p>
      ) : (
        <div className="mt-4 grid grid-cols-4 gap-3">
          {[
            { label: "Days", value: countdown.days },
            { label: "Hours", value: countdown.hours },
            { label: "Minutes", value: countdown.minutes },
            { label: "Seconds", value: countdown.seconds },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border px-3 py-4 text-center" style={{ borderColor: "var(--color-border)", background: "color-mix(in srgb, var(--color-surface-elevated) 86%, transparent)" }}>
              <div className="text-2xl font-bold sm:text-3xl">{item.value}</div>
              <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.24em]" style={{ color: "var(--color-foreground-subtle)" }}>
                {item.label}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
