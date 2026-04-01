"use client"

import Link from "next/link"
import { motion, useReducedMotion } from "framer-motion"
import { usePathname } from "next/navigation"
import { FaWhatsapp } from "react-icons/fa"

const WHATSAPP_MESSAGE = "Hi, I have a question about HAXEUS"

function buildWhatsappUrl(phone: string) {
  return `https://wa.me/${phone}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`
}

export function WhatsAppButton() {
  const pathname = usePathname()
  const prefersReducedMotion = useReducedMotion()
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER

  if (!phone) {
    return null
  }

  if (pathname?.startsWith("/checkout") || pathname?.includes("payment")) {
    return null
  }

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      layout="position"
      className="fixed bottom-5 right-5 z-[72]"
    >
      <Link
        href={buildWhatsappUrl(phone)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with HAXEUS on WhatsApp"
        className="flex h-14 w-14 items-center justify-center rounded-full border shadow-lg transition-transform hover:scale-105"
        style={{
          background: "var(--color-whatsapp)",
          borderColor: "color-mix(in srgb, var(--color-whatsapp) 70%, white)",
          color: "#ffffff",
        }}
      >
        <FaWhatsapp className="h-8 w-8" aria-hidden="true" />
      </Link>
    </motion.div>
  )
}
