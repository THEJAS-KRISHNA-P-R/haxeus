"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { useTheme } from "@/contexts/ThemeContext"

const LightPillarDesktop = dynamic(
    () => import("@/components/ui/reactbits/LightPillar"),
    { ssr: false, loading: () => null }
)
const LightPillarMobile = dynamic(
    () => import("@/components/ui/reactbits/LightPillarMobile"),
    { ssr: false, loading: () => null }
)

export function LightPillarBackground() {
    const { theme } = useTheme()
    const [isMobile, setIsMobile] = useState<boolean | null>(null)

    useEffect(() => {
        const check = () => {
            setIsMobile(
                window.innerWidth < 768 ||
                "ontouchstart" in window ||
                /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
            )
        }
        check()
        window.addEventListener("resize", check, { passive: true })
        return () => window.removeEventListener("resize", check)
    }, [])

    if (isMobile === null) return null

    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100dvh",
                zIndex: 0,
                pointerEvents: "none",
                overflow: "hidden",
                isolation: "isolate",
                background: theme === "dark" ? "#060606" : "#f5f4f0",
                opacity: theme === "light" ? 0.35 : 1,
                transition: "background 0.3s ease, opacity 0.3s ease",
            }}
            aria-hidden="true"
        >
            {isMobile ? (
                <LightPillarMobile
                    topColor="#d4d4d4"
                    bottomColor="#000000"
                    pillarWidth={3.2}
                    pillarHeight={0.3}
                    pillarRotation={35}
                    glowAmount={0.009}
                    noiseIntensity={0.0}
                    intensity={1.5}
                    rotationSpeed={0.12}
                    interactive={false}
                    mixBlendMode="normal"
                    quality="high"
                    className="w-full h-full"
                />
            ) : (
                <LightPillarDesktop
                    topColor="#d4d4d4"
                    bottomColor="#000000"
                    pillarWidth={3.2}
                    pillarHeight={0.3}
                    pillarRotation={35}
                    glowAmount={0.009}
                    noiseIntensity={0.0}
                    intensity={1.5}
                    rotationSpeed={0.25}
                    interactive={false}
                    mixBlendMode="normal"
                    quality="high"
                    className="w-full h-full"
                />
            )}
        </div>
    )
}
