"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useTheme } from "@/components/ThemeProvider"
import { motion, AnimatePresence } from "framer-motion"
import { X, Copy } from "lucide-react"
import type { ExitPopupConfig } from "@/types/homepage"

interface ExitPopupProps {
  config?: ExitPopupConfig
}

const STORAGE_KEY = "haxeus_exit_popup_dismissed"

function shouldShowPopup(cooldownHours: number): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return true
    const dismissedAt = parseInt(raw, 10)
    if (isNaN(dismissedAt)) return true
    const hoursElapsed = (Date.now() - dismissedAt) / (1000 * 60 * 60)
    return hoursElapsed >= cooldownHours
  } catch {
    return true // if localStorage unavailable, show it
  }
}

function recordDismiss() {
  try {
    localStorage.setItem(STORAGE_KEY, Date.now().toString())
  } catch { /* silent fail */ }
}

export function ExitIntentPopup({ config }: ExitPopupProps) {
  if (!config) return null

  const [visible, setVisible] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const { theme } = useTheme()

  useEffect(() => {
    if (!config.enabled || !shouldShowPopup(config.cooldown_hours)) {
      return
    }

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !visible) {
        setTimeout(() => {
          // Final check before showing
          if (shouldShowPopup(config.cooldown_hours)) {
            setVisible(true)
          }
        }, config.trigger_delay_ms || 0)
      }
    }

    document.addEventListener("mouseleave", handleMouseLeave)
    return () => document.removeEventListener("mouseleave", handleMouseLeave)
  }, [config.enabled, config.cooldown_hours, config.trigger_delay_ms, visible])

  const handleDismiss = () => {
    setVisible(false)
    recordDismiss()
  }

  const handleCopy = () => {
    navigator.clipboard?.writeText(config.coupon_code)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 1500)
  }

  const shadowStrong = { textShadow: "0 2px 16px rgba(0,0,0,0.75), 0 1px 6px rgba(0,0,0,0.55)" }
  const accentColor = config.accent_color || "#e93a3a"

  return (
    <AnimatePresence>
      {visible && (
        <>
          <div
            className="fixed inset-0 z-[100]"
            style={{ backgroundColor: `rgba(0,0,0,${config.overlay_opacity || 0.75})` }}
            onClick={handleDismiss}
          />
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className={`relative ${config.image_url ? 'max-w-2xl' : 'max-w-md'} w-full ${theme === 'dark' ? 'bg-[#0f0f0f]' : 'bg-[#f5f4f0]'} rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl`}
            >
              <button onClick={handleDismiss} className="absolute top-4 right-4 text-white/40 hover:text-white/80 transition-colors z-10">
                <X size={20} />
              </button>

              <div className={config.image_url ? 'grid md:grid-cols-2' : ''}>
                {config.image_url && (
                  <div className="relative hidden md:block">
                    <Image 
                      src={config.image_url} 
                      alt={config.image_alt} 
                      fill 
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover" 
                    />
                  </div>
                )}

                <div className={`p-8 flex flex-col ${!config.image_url ? 'items-center text-center' : 'justify-center'}`}>
                  <h2 className="text-2xl font-bold text-white mb-2" style={shadowStrong}>{config.headline}</h2>
                  <p className="text-white/70 mb-4" style={shadowStrong}>{config.subtext}</p>
                  
                  <div className="my-4">
                    <p className="text-sm text-white/50 mb-2">{config.offer_label}</p>
                    <div
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-mono font-bold text-lg tracking-widest cursor-pointer select-all transition-all"
                      style={{ backgroundColor: `${accentColor}20`, border: `1.5px solid ${accentColor}`, color: accentColor }}
                      onClick={handleCopy}
                      title="Click to copy"
                    >
                      {isCopied ? "Copied!" : config.coupon_code}
                      {!isCopied && <Copy size={14} className="opacity-60" />}
                    </div>
                  </div>

                  <Link href={config.cta_href} onClick={handleDismiss} className={`w-full mt-4 ${!config.image_url ? 'max-w-xs' : ''}`}>
                    <button
                      className="w-full font-bold rounded-full py-3.5 text-white tracking-wide transition-opacity hover:opacity-90"
                      style={{ backgroundColor: accentColor }}
                    >
                      {config.cta_text}
                    </button>
                  </Link>

                  <p className="text-xs text-white/50 mt-4">{config.fine_print}</p>

                  <button
                    onClick={handleDismiss}
                    className="text-xs text-white/35 hover:text-white/60 transition-colors underline-offset-2 hover:underline mt-6"
                  >
                    {config.dismiss_text}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
