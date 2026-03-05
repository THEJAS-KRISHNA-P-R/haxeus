"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"

const LightPillarDesktop = dynamic(
    () => import("@/components/ui/reactbits/LightPillar"),
    { ssr: false, loading: () => null }
)
const LightPillarMobile = dynamic(
    () => import("@/components/ui/reactbits/LightPillarMobile"),
    { ssr: false, loading: () => null }
)

export function LightPillarBackground() {
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

    // These props produce the dense smoke reference image exactly
    const sharedProps = {
        topColor: "#52f6ffff",
        bottomColor: "#000000ff",
        pillarWidth: 7.5,        // wide = fills screen with overlapping SDF fields
        pillarHeight: 0.6,       // squished Y = more horizontal layering
        pillarRotation: 235,     // diagonal sweep
        glowAmount: 0.004,       // correct brightness for width 7.5
        noiseIntensity: 0.0,
        intensity: 1.0,
        rotationSpeed: 0.1,
        interactive: false,
        mixBlendMode: "screen" as React.CSSProperties["mixBlendMode"],
        className: "w-full h-full",
    }

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
                // THE GOLDEN RULE: nothing else on this div
                // background  → covers canvas on dark mode
                // opacity     → any value < 1 blacks out WebGL canvas
                // isolation   → creates stacking context, flattens canvas to black
                // mixBlendMode on wrapper → same stacking context problem
            }}
            aria-hidden="true"
        >
            {isMobile ? (
                <LightPillarMobile {...sharedProps} quality="high" />
            ) : (
                <LightPillarDesktop {...sharedProps} quality="high" />
            )}
        </div>
    )
}
