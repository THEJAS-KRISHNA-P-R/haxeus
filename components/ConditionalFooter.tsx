"use client"
import { usePathname } from "next/navigation"
import { Footer } from "@/components/footer"

export function ConditionalFooter() {
    const pathname = usePathname()

    // Hide global footer on all admin routes
    if (pathname?.startsWith("/admin")) return null

    return <Footer />
}
