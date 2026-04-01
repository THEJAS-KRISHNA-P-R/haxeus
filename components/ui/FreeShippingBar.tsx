"use client"

import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { Truck, CheckCircle } from "lucide-react"
import { useTheme } from "@/components/ThemeProvider"
import { useStoreSettings } from "@/hooks/useStoreSettings"
import { cn } from "@/lib/utils"
import { formatPrice, CURRENCY_SYMBOL } from "@/lib/currency"

interface FreeShippingBarProps {
  subtotal: number
  className?: string
}

export function FreeShippingBar({ subtotal, className }: FreeShippingBarProps) {
  const { theme } = useTheme()
  const { settings } = useStoreSettings()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const isDark = !mounted ? true : theme === "dark"

  const threshold = settings?.free_shipping_above ?? 999
  const remaining = Math.max(0, threshold - subtotal)
  const progress = Math.min(100, (subtotal / threshold) * 100)
  const achieved = subtotal >= threshold

  if (!mounted) return null

  return (
    <div className={cn(
      "rounded-2xl p-4",
      isDark ? "bg-white/[0.03] border border-white/[0.07]" : "bg-black/[0.02] border border-black/[0.07]",
      className
    )}>
      {/* Message */}
      <div className="flex items-center gap-2 mb-3">
        {achieved ? (
          <CheckCircle size={16} className="text-emerald-400 flex-shrink-0" />
        ) : (
          <Truck size={16} className={cn("flex-shrink-0", isDark ? "text-white/50" : "text-black/50")} />
        )}
        <p className={cn("text-sm font-medium", isDark ? "text-white" : "text-black")}>
          {achieved ? (
            <span className="text-emerald-400">🎉 You've unlocked free shipping!</span>
          ) : (
            <>
              Add{" "}
              <span className="font-bold text-[#e93a3a]">
                {formatPrice(remaining)}
              </span>{" "}
              more for{" "}
              <span className="font-bold">free shipping</span>
            </>
          )}
        </p>
      </div>

      {/* Progress bar */}
      <div className={cn(
        "relative h-2 rounded-full overflow-hidden",
        isDark ? "bg-white/[0.08]" : "bg-black/[0.08]"
      )}>
        <motion.div
          className={cn(
            "absolute left-0 top-0 h-full rounded-full",
            achieved
              ? "bg-emerald-400"
              : "bg-gradient-to-r from-[#e93a3a] to-[#e7bf04]"
          )}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>

      {/* Threshold labels */}
      {!achieved && (
        <div className="flex justify-between mt-1.5">
          <span className={cn("text-xs", isDark ? "text-white/30" : "text-black/30")}>{CURRENCY_SYMBOL}0</span>
          <span className={cn("text-xs", isDark ? "text-white/30" : "text-black/30")}>
            {formatPrice(threshold)} free shipping
          </span>
        </div>
      )}
    </div>
  )
}
