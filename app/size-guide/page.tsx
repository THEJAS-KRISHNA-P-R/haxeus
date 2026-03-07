"use client"

import { useTheme } from "@/components/ThemeProvider"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

const sizeData = {
  tshirts: {
    label: "T-Shirts / Hoodies",
    headers: ["Size", "Chest (cm)", "Length (cm)", "Shoulder (cm)", "Sleeve (cm)"],
    rows: [
      ["XS", "84–88", "66", "41", "59"],
      ["S", "88–92", "69", "43", "61"],
      ["M", "96–100", "72", "46", "63"],
      ["L", "104–108", "75", "49", "65"],
      ["XL", "112–116", "78", "52", "67"],
      ["XXL", "120–124", "81", "55", "69"],
    ],
  },
  bottoms: {
    label: "Pants / Shorts",
    headers: ["Size", "Waist (cm)", "Hip (cm)", "Inseam (cm)", "Rise (cm)"],
    rows: [
      ["XS", "68–72", "88–92", "74", "24"],
      ["S", "72–76", "92–96", "76", "25"],
      ["M", "80–84", "100–104", "78", "26"],
      ["L", "88–92", "108–112", "80", "27"],
      ["XL", "96–100", "116–120", "82", "28"],
      ["XXL", "104–108", "124–128", "84", "29"],
    ],
  },
  footwear: {
    label: "Footwear",
    headers: ["EU", "US Men", "US Women", "UK", "CM"],
    rows: [
      ["38", "5.5", "7", "4.5", "24"],
      ["39", "6.5", "8", "5.5", "25"],
      ["40", "7", "8.5", "6", "25.5"],
      ["41", "8", "9.5", "7", "26.5"],
      ["42", "9", "10.5", "8", "27"],
      ["43", "10", "11.5", "9", "28"],
      ["44", "10.5", "12", "9.5", "28.5"],
      ["45", "11.5", "13", "10.5", "29.5"],
    ],
  },
}

const measureGuide = [
  {
    label: "Chest",
    desc: "Measure around the fullest part of your chest, keeping the tape parallel to the ground.",
  },
  {
    label: "Waist",
    desc: "Measure around your natural waistline, the narrowest part of your torso.",
  },
  {
    label: "Hip",
    desc: "Stand with feet together. Measure around the fullest part of your hips and seat.",
  },
  {
    label: "Inseam",
    desc: "Measure from the crotch seam down to the bottom of the leg along the inner seam.",
  },
  {
    label: "Shoulder",
    desc: "Measure from the edge of one shoulder across the back to the edge of the other.",
  },
  {
    label: "Foot Length",
    desc: "Place your foot on paper, trace around it, and measure the longest distance heel to toe.",
  },
]

export default function SizeGuidePage() {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const isDark = mounted && (
    theme === "dark" ||
    (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)
  )

  return (
    <main
      className={cn(
        "min-h-screen pt-[88px] pb-20 px-4 md:px-8 transition-colors duration-300",
        isDark ? "bg-[#0a0a0a] text-white" : "bg-[#f5f4f0] text-black"
      )}
    >
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-12 pt-4">
          <p className={cn("text-xs tracking-[0.25em] font-medium mb-3 uppercase",
            isDark ? "text-white/30" : "text-black/35"
          )}>
            HAXEUS — Fit Guide
          </p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Size Guide
          </h1>
          <p className={cn("text-sm leading-relaxed max-w-xl",
            isDark ? "text-white/50" : "text-black/55"
          )}>
            All HAXEUS garments are cut for an oversized streetwear silhouette. If you prefer a closer fit, size down one. All measurements are in centimetres unless stated.
          </p>
        </div>

        {/* Tables */}
        {Object.entries(sizeData).map(([key, section]) => (
          <section key={key} className="mb-12">
            <h2 className={cn(
              "text-sm font-bold tracking-[0.2em] uppercase mb-4",
              isDark ? "text-white/40" : "text-black/45"
            )}>
              {section.label}
            </h2>

            <div className={cn(
              "rounded-2xl overflow-hidden border",
              isDark ? "border-white/[0.07]" : "border-black/[0.08]"
            )}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className={cn(
                      isDark ? "bg-white/[0.05]" : "bg-black/[0.04]"
                    )}>
                      {section.headers.map((h) => (
                        <th
                          key={h}
                          className={cn(
                            "px-5 py-3.5 text-left font-semibold tracking-wide text-xs uppercase whitespace-nowrap",
                            isDark ? "text-white/50" : "text-black/50"
                          )}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {section.rows.map((row, i) => (
                      <tr
                        key={i}
                        className={cn(
                          "border-t transition-colors",
                          isDark
                            ? "border-white/[0.05] hover:bg-white/[0.03]"
                            : "border-black/[0.06] hover:bg-black/[0.02]"
                        )}
                      >
                        {row.map((cell, j) => (
                          <td
                            key={j}
                            className={cn(
                              "px-5 py-3.5 whitespace-nowrap",
                              j === 0
                                ? cn("font-bold", isDark ? "text-white" : "text-black")
                                : isDark ? "text-white/65" : "text-black/65"
                            )}
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        ))}

        {/* Divider */}
        <div className={cn("border-t my-12", isDark ? "border-white/[0.07]" : "border-black/[0.07]")} />

        {/* How to measure */}
        <section className="mb-12">
          <h2 className="text-xl font-bold tracking-tight mb-6">How to Measure</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {measureGuide.map((item) => (
              <div
                key={item.label}
                className={cn(
                  "rounded-xl p-5 border",
                  isDark
                    ? "bg-white/[0.03] border-white/[0.06]"
                    : "bg-black/[0.02] border-black/[0.06]"
                )}
              >
                <p className={cn(
                  "text-xs font-bold tracking-[0.15em] uppercase mb-2",
                  "text-[#e93a3a]"
                )}>
                  {item.label}
                </p>
                <p className={cn(
                  "text-sm leading-relaxed",
                  isDark ? "text-white/55" : "text-black/60"
                )}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Fit note */}
        <div className={cn(
          "rounded-2xl p-6 border",
          isDark
            ? "bg-[#e93a3a]/[0.06] border-[#e93a3a]/20"
            : "bg-[#e93a3a]/[0.04] border-[#e93a3a]/15"
        )}>
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-[#e93a3a] mb-2">Fit Note</p>
          <p className={cn("text-sm leading-relaxed", isDark ? "text-white/60" : "text-black/65")}>
            HAXEUS pieces are intentionally oversized. Our fits are designed to drape — not cling.
            When between sizes always go with your smaller measurement. Still unsure?{" "}
            <a href="/contact" className="text-[#e93a3a] hover:underline font-medium">
              Contact us
            </a>{" "}
            and we'll personally help you find your size.
          </p>
        </div>

      </div>
    </main>
  )
}
