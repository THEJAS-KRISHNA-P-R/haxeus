"use client"

import { motion, useReducedMotion } from "framer-motion"
import { usePathname } from "next/navigation"
import { FaWhatsapp } from "react-icons/fa"
import { useState, useEffect, useRef } from "react"

const WHATSAPP_MESSAGE = "Hi, I have a question about HAXEUS"
const STORAGE_KEY = "haxeus_whatsapp_position"

function buildWhatsappUrl(phone: string) {
  const sanitizedPhone = phone.replace(/\D/g, "")
  return `https://wa.me/${sanitizedPhone}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`
}

export function WhatsAppButton() {
  const pathname = usePathname()
  const prefersReducedMotion = useReducedMotion()
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER
  const constraintsRef = useRef(null)
  
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [hasLoaded, setHasLoaded] = useState(false)
  const isDragging = useRef(false)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        setPosition(JSON.parse(saved))
      } catch (e) {
        console.error("Failed to load WhatsApp position", e)
      }
    }
    setHasLoaded(true)
  }, [])

  if (!phone) return null
  if (pathname?.startsWith("/checkout") || pathname?.includes("payment")) return null

  const handleDragEnd = (_: any, info: any) => {
    const newPos = {
      x: position.x + info.offset.x,
      y: position.y + info.offset.y,
    }
    setPosition(newPos)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newPos))
    
    // Tiny delay to ensure click doesn't trigger immediately after drag
    setTimeout(() => {
      isDragging.current = false
    }, 100)
  }

  const handleClick = () => {
    // Only open if we aren't currently dragging and haven't moved far
    if (!isDragging.current && phone) {
      window.open(buildWhatsappUrl(phone), "_blank", "noopener,noreferrer")
    }
  }

  return (
    <>
      <div 
        ref={constraintsRef} 
        className="fixed inset-4 pointer-events-none z-[-1] opacity-0" 
        aria-hidden="true" 
      />
      <motion.div
        drag
        dragListener={true}
        dragMomentum={false}
        onDragStart={() => {
          isDragging.current = true
        }}
        onDragEnd={handleDragEnd}
        dragConstraints={constraintsRef}
        dragElastic={0.05}
        whileDrag={{ scale: 1.1, cursor: "grabbing" }}
        animate={hasLoaded ? { x: position.x, y: position.y, opacity: 1 } : { opacity: 0 }}
        initial={{ opacity: 0 }}
        transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2 }}
        className="fixed bottom-8 right-8 z-[9999] touch-none"
      >
        <button
          type="button"
          onClick={handleClick}
          aria-label="Chat with HAXEUS on WhatsApp"
          className="flex h-[50px] w-[50px] items-center justify-center rounded-full border shadow-2xl transition-transform hover:scale-105 active:scale-95 select-none focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          style={{
            background: "var(--color-whatsapp)",
            borderColor: "color-mix(in srgb, var(--color-whatsapp) 70%, white)",
            color: "#ffffff",
          }}
        >
          <FaWhatsapp className="h-9 w-9 pointer-events-none" aria-hidden="true" />
        </button>
      </motion.div>
    </>
  )
}
