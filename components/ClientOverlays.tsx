"use client"

import dynamic from "next/dynamic"

const EmailCapturePopup = dynamic(() => import("@/components/EmailCapturePopup").then((mod) => mod.EmailCapturePopup), {
  ssr: false,
})
const WhatsAppButton = dynamic(() => import("@/components/WhatsAppButton").then((mod) => mod.WhatsAppButton), {
  ssr: false,
})

export function ClientOverlays() {
  return (
    <>
      <EmailCapturePopup />
      <WhatsAppButton />
    </>
  )
}
