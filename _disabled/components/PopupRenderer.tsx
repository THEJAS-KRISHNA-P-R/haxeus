"use client"

import { AnimatePresence, motion } from "framer-motion"
import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { X, Copy, Check } from "lucide-react"
import { useTheme } from "next-themes"
import type { PopupCampaign, ContentBlock } from "@/types/popup"

interface PopupRendererProps {
  campaign: PopupCampaign
  isVisible: boolean
  onDismiss: () => void
  onEmailCapture: () => void
}

function BlockRenderer({ block, campaign, isDark, onDismiss, onEmailCapture }: {
    block: ContentBlock;
    campaign: PopupCampaign;
    isDark: boolean;
    onDismiss: () => void;
    onEmailCapture: () => void;
}) {
  const [emailValue, setEmailValue] = useState("")
  const [emailState, setEmailState] = useState<"idle"|"loading"|"success"|"error"|"duplicate"|"rate_limited">("idle")
  const [copiedCoupon, setCopiedCoupon] = useState("")
  const [isCopied, setIsCopied] = useState(false)

  const textColorClass = isDark ? "text-white" : "text-black"
  const mutedClass = isDark ? "text-white/50" : "text-black/55"

  const fontSizeMap = {
    "xs": "text-xs", "sm": "text-sm", "base": "text-base",
    "lg": "text-lg", "xl": "text-xl", "2xl": "text-2xl",
    "3xl": "text-3xl", "4xl": "text-4xl"
  }
  const fontWeightMap = {
    "normal": "font-normal", "semibold": "font-semibold",
    "bold": "font-bold", "extrabold": "font-extrabold"
  }
  const alignMap = { "left": "text-left", "center": "text-center", "right": "text-right" }

  const baseClasses = [
    fontSizeMap[block.font_size ?? "base"],
    fontWeightMap[block.font_weight ?? "normal"],
    alignMap[block.text_align ?? "left"]
  ].join(" ")

  async function handleEmailSubmit() {
    if (!emailValue || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) return
    setEmailState("loading")
    try {
      const res = await fetch("/api/popups/capture-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaign_id: campaign.id,
          email: emailValue,
          honeypot_value: ""
        })
      })
      const data = await res.json()

      if (!res.ok) {
        if (data.error === "already_captured") setEmailState("duplicate")
        else if (res.status === 429) setEmailState("rate_limited")
        else setEmailState("error")
        return
      }

      setEmailState("success")
      onEmailCapture()

      if (data.coupon_code) {
        setCopiedCoupon(data.coupon_code)
        if (campaign.coupon_auto_copy) {
          navigator.clipboard?.writeText(data.coupon_code)
          setIsCopied(true)
        }
      }
    } catch {
      setEmailState("error")
    }
  }

  function handleCouponCopy(code: string) {
    navigator.clipboard?.writeText(code)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 1500)
  }

  switch (block.type) {
    case "badge":
      return (
        <div className={`inline-block ${alignMap[block.text_align ?? 'left']}`}>
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase`}
            style={{ backgroundColor: block.bg_color ?? campaign.accent_color + "20", color: block.color ?? campaign.accent_color }}
          >
            {block.text}
          </span>
        </div>
      )
    case "headline":
      return <h2 className={`leading-tight ${baseClasses}`} style={{ color: block.color ?? (isDark ? "#ffffff" : "#000000") }}>{block.text}</h2>
    case "subtext":
      return <p className={`leading-relaxed ${baseClasses} ${mutedClass}`} style={block.color ? { color: block.color } : undefined}>{block.text}</p>
    case "coupon_chip":
      return (
        <div className={`flex ${alignMap[block.text_align ?? 'center'] === 'text-center' ? 'justify-center' : alignMap[block.text_align ?? 'left'] === 'text-right' ? 'justify-end' : 'justify-start'}`}>
            <div
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-mono font-bold tracking-widest cursor-pointer select-all"
              style={{
                backgroundColor: (block.bg_color ?? campaign.accent_color) + "20",
                border: `1.5px solid ${block.bg_color ?? campaign.accent_color}`,
                color: block.color ?? (block.bg_color ?? campaign.accent_color)
              }}
              onClick={() => handleCouponCopy(block.text)}
              title="Click to copy"
            >
              {block.text}
              {isCopied ? <Check size={14} /> : <Copy size={14} className="opacity-60" />}
            </div>
        </div>
      )
    case "cta_button":
      return (
        <Link href={block.href ?? "/"} onClick={onDismiss} className={`block ${alignMap[block.text_align ?? 'left']}`}>
          <button
            className={`w-full font-bold rounded-full py-3.5 px-6 tracking-wide transition-opacity hover:opacity-90 ${baseClasses}`}
            style={{
              backgroundColor: block.bg_color ?? campaign.accent_color,
              color: block.color ?? "#ffffff"
            }}
          >
            {block.text}
          </button>
        </Link>
      )
    case "email_capture":
      if (emailState === "success" && copiedCoupon) {
        return (
          <div className="flex flex-col gap-3">
            <p className="text-emerald-400 font-semibold text-sm">🎉 Here's your code!</p>
            <div
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-mono font-bold tracking-widest cursor-pointer select-all"
              style={{
                backgroundColor: campaign.accent_color + "20",
                border: `1.5px solid ${campaign.accent_color}`,
                color: campaign.accent_color
              }}
              onClick={() => handleCouponCopy(copiedCoupon)}
            >
              {copiedCoupon}
              {isCopied ? <Check size={14} /> : <Copy size={14} className="opacity-60" />}
            </div>
            {isCopied && <p className={`text-xs ${isDark ? "text-white/30" : "text-black/35"}`}>Copied to clipboard!</p>}
          </div>
        )
      }
      return (
        <div className="flex flex-col gap-2 w-full">
          <div className={`flex rounded-full overflow-hidden border ${isDark ? "border-white/[0.12]" : "border-black/[0.12]"}`}>
            <input
              type="email"
              value={emailValue}
              onChange={(e) => setEmailValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleEmailSubmit()}
              placeholder={block.placeholder ?? "your@email.com"}
              disabled={emailState === "loading"}
              className={`flex-1 px-5 py-3 bg-transparent text-sm focus:outline-none min-w-0 ${isDark ? 'text-white placeholder:text-white/30' : 'text-black placeholder:text-black/30'}`}
            />
            <button
              onClick={handleEmailSubmit}
              disabled={emailState === "loading"}
              className="px-6 py-3 font-semibold text-sm text-white rounded-full shrink-0 disabled:opacity-50 transition-opacity hover:opacity-90"
              style={{ backgroundColor: block.bg_color ?? campaign.accent_color }}
            >
              {emailState === "loading" ? "..." : block.text}
            </button>
          </div>
          {emailState === "duplicate" && <p className="text-xs text-[#e7bf04]">You're already on the list!</p>}
          {emailState === "error" && <p className="text-xs text-[#e93a3a]">Something went wrong. Try again.</p>}
          {emailState === "rate_limited" && <p className="text-xs text-[#e93a3a]">Too many attempts. Try again later.</p>}
        </div>
      )
    case "dismiss_link":
      return (
        <button onClick={onDismiss} className={`transition-colors underline-offset-2 hover:underline ${baseClasses} ${isDark ? 'text-white/35 hover:text-white/60' : 'text-black/35 hover:text-black/60'}`} style={block.color ? { color: block.color } : undefined}>
          {block.text}
        </button>
      )
    case "fine_print":
      return <p className={`${mutedClass} ${baseClasses}`} style={block.color ? { color: block.color } : undefined}>{block.text}</p>
    default:
      return null
  }
}

function ImageCanvasLayout({ campaign, isDark, onDismiss, onEmailCapture }: Omit<PopupRendererProps, 'isVisible'> & { isDark: boolean }) {
  return (
    <div className="relative w-full" style={{ aspectRatio: '1 / 1', minHeight: 400 }}>
      {campaign.image_url && <Image src={campaign.image_url} alt={campaign.image_alt} fill className="object-cover" priority />}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
      {campaign.blocks.map(block => (
        <div key={block.id} className="absolute" style={{ left: `${block.canvas_x ?? 5}%`, top: `${block.canvas_y ?? 5}%`, width: `${block.canvas_width ?? 90}%` }}>
          <BlockRenderer block={block} campaign={campaign} isDark={isDark} onDismiss={onDismiss} onEmailCapture={onEmailCapture} />
        </div>
      ))}
    </div>
  )
}

function SplitLayout({ campaign, isDark, onDismiss, onEmailCapture }: Omit<PopupRendererProps, 'isVisible'> & { isDark: boolean }) {
  const imageLeft = campaign.image_position !== "right"
  return (
    <div className={`flex ${imageLeft ? "flex-row" : "flex-row-reverse"} min-h-[400px]`}>
      {campaign.image_url && (
        <div className="w-1/2 relative hidden sm:block">
          <Image src={campaign.image_url} alt={campaign.image_alt} fill className="object-cover" />
        </div>
      )}
      <div className={`${campaign.image_url ? "w-full sm:w-1/2" : "w-full"} flex flex-col justify-center gap-4 p-8`}>
        {campaign.blocks.map(block => (
          <BlockRenderer key={block.id} block={block} campaign={campaign} isDark={isDark} onDismiss={onDismiss} onEmailCapture={onEmailCapture} />
        ))}
      </div>
    </div>
  )
}

function CenteredLayout({ campaign, isDark, onDismiss, onEmailCapture }: Omit<PopupRendererProps, 'isVisible'> & { isDark: boolean }) {
  return (
    <div className="flex flex-col items-center gap-4 p-8 text-center">
      {campaign.blocks.map(block => (
        <BlockRenderer key={block.id} block={block} campaign={campaign} isDark={isDark} onDismiss={onDismiss} onEmailCapture={onEmailCapture} />
      ))}
    </div>
  )
}

function BannerLayout({ campaign, isDark, onDismiss, onEmailCapture }: Omit<PopupRendererProps, 'isVisible'> & { isDark: boolean }) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 px-8 w-full">
        {campaign.blocks.map(block => (
          <div key={block.id} className="flex-grow basis-full sm:basis-auto">
            <BlockRenderer block={block} campaign={campaign} isDark={isDark} onDismiss={onDismiss} onEmailCapture={onEmailCapture} />
          </div>
        ))}
      </div>
    )
  }

export function PopupRenderer({ campaign, isVisible, onDismiss, onEmailCapture }: PopupRendererProps) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!campaign) return null;

  const isDark = !mounted ? true : (campaign.dark_panel || theme === "dark" || (theme === "system" && typeof window !== 'undefined' && window.matchMedia("(prefers-color-scheme: dark)").matches))
  const isBanner = campaign.layout === 'banner';

  const panelBg = isDark ? "bg-[#0f0f0f]" : "bg-[#f5f4f0]"
  const panelBorder = isDark ? "border-white/[0.07]" : "border-black/[0.07]"

  const containerClasses = isBanner
    ? "fixed bottom-0 left-0 right-0 z-[101] flex justify-center"
    : "fixed inset-0 z-[101] flex items-center justify-center p-4";
  
  const panelMotionProps = isBanner 
    ? { initial:{ y: "100%" }, animate:{ y: 0 }, exit:{ y: "100%" } }
    : { initial:{ opacity: 0, scale: 0.92, y: 24 }, animate:{ opacity: 1, scale: 1, y: 0 }, exit:{ opacity: 0, scale: 0.95, y: 12 } };

  const panelClasses = isBanner
    ? `relative w-full ${panelBg} border-t ${panelBorder} shadow-2xl overflow-hidden`
    : `relative w-full ${panelBg} border ${panelBorder} shadow-2xl overflow-hidden`;

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-[100]"
            style={{ backgroundColor: `rgba(0,0,0,${campaign.overlay_opacity})` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onDismiss}
          />
          <div className={containerClasses} >
            <motion.div
              key="panel-container"
              className={panelClasses}
              style={{
                maxWidth: isBanner ? '100%' : campaign.max_width,
                borderRadius: isBanner ? 0 : campaign.border_radius
              }}
              {...panelMotionProps}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={onDismiss} className={`absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full transition-all ${isDark ? "bg-black/20 hover:bg-black/40 text-white/60 hover:text-white" : "bg-black/10 hover:bg-black/20 text-black/55 hover:text-black"}`}>
                <X size={16} />
              </button>

              {campaign.layout === "image_canvas" && <ImageCanvasLayout campaign={campaign} isDark={isDark} onDismiss={onDismiss} onEmailCapture={onEmailCapture} />}
              {campaign.layout === "split" && <SplitLayout campaign={campaign} isDark={isDark} onDismiss={onDismiss} onEmailCapture={onEmailCapture} />}
              {campaign.layout === "centered" && <CenteredLayout campaign={campaign} isDark={isDark} onDismiss={onDismiss} onEmailCapture={onEmailCapture} />}
              {campaign.layout === "banner" && <BannerLayout campaign={campaign} isDark={isDark} onDismiss={onDismiss} onEmailCapture={onEmailCapture} />}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
