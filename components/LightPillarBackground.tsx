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

    const commonProps = {
        bottomColor: "#000000ff",
        noiseIntensity: 0.0,
        interactive: false,
        mixBlendMode: "screen" as React.CSSProperties["mixBlendMode"],
        className: "w-full h-full",
    }

    // Portrait/narrow — tighter SDF fields, compensated for 2×vert stretch + fewer GPU iterations
    const mobileProps = {
        ...commonProps,
        topColor: "rgb(0, 225, 255)",
        pillarWidth: 7.2,        // tight = dense SDF coverage on narrow portrait canvas
        pillarHeight: 0.99,      // slightly squished = avoids vertical string-like wisps
        pillarRotation: 220,     // diagonal sweep tuned for portrait
        glowAmount: 0.0028,      // compensates for portrait aspect stretch + iteration gap vs desktop
        intensity: 0.98,
        rotationSpeed: 0.09,
    }

    // Landscape/wide — spread wide, squished Y, tuned brightness
    const desktopProps = {
        ...commonProps,
        topColor: "#52f6ffff",
        pillarWidth: 8.5,        // wide = fills landscape with overlapping SDF fields
        pillarHeight: 0.55,      // squished Y = more horizontal layering on wide screen
        pillarRotation: 235,     // diagonal sweep
        glowAmount: 0.0042,      // correct brightness for width 8.5
        intensity: 1.0,
        rotationSpeed: 0.1,
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
                <LightPillarMobile {...mobileProps} quality="high" />
            ) : (
                <LightPillarDesktop {...desktopProps} quality="high" />
            )}
        </div>
    )
}
