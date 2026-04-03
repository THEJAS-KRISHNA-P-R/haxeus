"use client"

import dynamic from "next/dynamic"

import { usePathname } from "next/navigation"

const EmailCapturePopup = dynamic(() => import("@/components/EmailCapturePopup").then((mod) => mod.EmailCapturePopup), {
  ssr: false,
})
const WhatsAppButton = dynamic(() => import("@/components/WhatsAppButton").then((mod) => mod.WhatsAppButton), {
  ssr: false,
})

export function ClientOverlays() {
  const pathname = usePathname()
  const isAdminRoute = pathname?.startsWith("/admin")

  if (isAdminRoute) return null

  return (
    <>
      <EmailCapturePopup />
      <WhatsAppButton />
    </>
  )
}
