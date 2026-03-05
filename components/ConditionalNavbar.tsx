"use client"
import { usePathname } from "next/navigation"
import { Navbar } from "@/components/navbar"

export function ConditionalNavbar() {
    const pathname = usePathname()

    // Hide global navbar on all admin routes to prevent overlap
    if (pathname?.startsWith("/admin")) return null

    return <Navbar />
}
