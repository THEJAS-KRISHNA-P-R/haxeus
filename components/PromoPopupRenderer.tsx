"use client"

import { AnimatePresence, motion } from "framer-motion"
import { useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { X } from "lucide-react"
import type { PromoPopup } from "@/types/promo-popup"

interface PromoPopupRendererProps {
  popup: PromoPopup
  isVisible: boolean
  onClose: () => void
  isPreview?: boolean  // if true, always render regardless of cooldown
}

function hexToRgba(color: string, opacity: number) {
  const hex = color.replace("#", "")
  if (hex.length !== 6) return color

  const red = parseInt(hex.slice(0, 2), 16)
  const green = parseInt(hex.slice(2, 4), 16)
  const blue = parseInt(hex.slice(4, 6), 16)
  return `rgba(${red}, ${green}, ${blue}, ${opacity})`
}

export function PromoPopupRenderer({
  popup,
  isVisible,
  onClose,
  isPreview = false
}: PromoPopupRendererProps) {
  if (!popup) return null

  const alphaColor = useMemo(() => {
    const color = popup.overlay_color || "#000000"
    const opacity = Math.max(0, Math.min(1, popup.overlay_opacity ?? 0))
    return hexToRgba(color, opacity)
  }, [popup.overlay_color, popup.overlay_opacity])

  const positionClasses = {
    "top-left": "top-4 left-4",
    "top-center": "top-4 left-1/2 -translate-x-1/2",
    "top-right": "top-4 right-4",
    "center": "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
    "bottom-left": "bottom-16 left-4",
    "bottom-center": "bottom-16 left-1/2 -translate-x-1/2",
    "bottom-right": "bottom-16 right-4",
  }

  const fontSizeClasses = {
    sm: "text-sm",
    base: "text-base",
    lg: "text-lg",
    xl: "text-xl",
    "2xl": "text-2xl",
    "3xl": "text-3xl",
    "4xl": "text-4xl",
  }

  const fontWeightClasses = {
    normal: "font-normal",
    semibold: "font-semibold",
    bold: "font-bold",
    extrabold: "font-extrabold",
  }

  const borderRadiusClasses = {
    none: "rounded-none",
    sm: "rounded-sm",
    md: "rounded-md",
    full: "rounded-full",
  }

  const paddingClasses = {
    none: "p-0",
    sm: "p-2",
    md: "p-4",
    lg: "p-6",
  }

  return (
    <AnimatePresence>
      {(isVisible || isPreview) && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            className="relative w-full overflow-hidden shadow-2xl"
            style={{ 
              maxWidth: `${popup.max_width}px`,
              borderRadius: `${popup.border_radius}px`
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full" style={{ aspectRatio: '1/1' }}>
              {popup.image_url && (
                <Image
                  src={popup.image_url}
                  alt={popup.image_alt || "Promo"}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                  priority
                />
              )}
              
              {/* Overlay */}
              <div 
                className="absolute inset-0"
                style={{ 
                  backgroundColor: alphaColor,
                }}
              />

              {/* Text Blocks */}
              {popup.text_blocks.map((block) => {
                const blockOpacity = Math.max(0, Math.min(1, block.bg_opacity ?? 0))
                const backgroundColor = block.bg_color === "transparent"
                  ? "transparent"
                  : hexToRgba(block.bg_color, blockOpacity)

                return (
                <div
                  key={block.id}
                  className={`absolute ${positionClasses[block.position]} ${fontSizeClasses[block.font_size]} ${fontWeightClasses[block.font_weight]} ${borderRadiusClasses[block.border_radius]} ${paddingClasses[block.padding]}`}
                  style={{
                    color: block.color,
                    backgroundColor,
                    maxWidth: "85%"
                  }}
                >
                  {block.text}
                </div>
                )
              })}

              {/* Button */}
              {popup.button && (
                <div className={`absolute ${positionClasses[popup.button.position || "bottom-center"]}`}>
                  <Link 
                    href={popup.button.href}
                    target={popup.button.open_in_new_tab ? "_blank" : "_self"}
                    className="inline-block px-8 py-3 font-bold rounded-full transition-transform hover:scale-105 active:scale-95"
                    style={{
                      backgroundColor: popup.button.bg_color,
                      color: popup.button.color
                    }}
                    onClick={onClose}
                  >
                    {popup.button.text}
                  </Link>
                </div>
              )}

              {/* Close Button */}
              {popup.show_close_button && (
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 rounded-full transition-colors hover:bg-black/20"
                  style={{ color: popup.close_button_color }}
                >
                  <X size={24} />
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
