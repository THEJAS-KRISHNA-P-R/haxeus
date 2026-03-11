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
        // Detect once on mount only — never re-check on resize.
        // If we re-checked on resize, rotating a phone to landscape would flip
        // isMobile→false, remount the desktop variant with different props, and
        // change the color/brightness mid-session.
        const isMobileDevice =
            /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
            (window.innerWidth < 768 && "ontouchstart" in window)
        setIsMobile(isMobileDevice)
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
