"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"

const LightPillar = dynamic(
    () => import("@/components/ui/reactbits/LightPillar"),
    { ssr: false, loading: () => null }
)

export function LightPillarBackground() {
    const [isMobile, setIsMobile] = useState<boolean | null>(null)

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768)
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
                height: "100vh",
                zIndex: 0,
                pointerEvents: "none",
                overflow: "hidden",
            }}
            aria-hidden="true"
        >
            {isMobile ? (
                // Phone & Tablet (< 768px): portrait-optimised, tight pillarWidth = dense SDF patterns
                <LightPillar
                    topColor="rgb(0, 225, 255)"
                    bottomColor="#000000"
                    intensity={0.98}
                    rotationSpeed={0.09}
                    glowAmount={0.002}
                    pillarWidth={6.5}
                    pillarHeight={0.6}
                    noiseIntensity={0.0}
                    pillarRotation={220}
                    interactive={false}
                    mixBlendMode="screen"
                    quality="high"
                    className="w-full h-full"
                />
            ) : (
                // Laptop & Desktop (≥ 768px): wide landscape variant
                <LightPillar
                    topColor="#52f6ff"
                    bottomColor="#000000"
                    intensity={1.0}
                    rotationSpeed={0.036}
                    glowAmount={0.0042}
                    pillarWidth={8.5}
                    pillarHeight={0.55}
                    noiseIntensity={0.0}
                    pillarRotation={235}
                    interactive={false}
                    mixBlendMode="screen"
                    quality="high"
                    className="w-full h-full"
                />
            )}
        </div>
    )
}
