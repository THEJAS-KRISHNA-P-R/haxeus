"use client"

import { useTheme } from "@/components/ThemeProvider"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

const sizeData = {
  tshirts: {
    label: "T-Shirts / Hoodies",
    headers: ["Size", "Chest (in)", "Length (in)"],
    rows: [
      ["S", "40", "27.5"],
      ["M", "42", "28.5"],
      ["L", "44", "29.5"],
      ["XL", "46", "30.5"],
    ],
  },
}

const measureGuide = [
  {
    label: "Chest",
    desc: "Measure around the fullest part of your chest, keeping the tape parallel to the ground.",
  },
]

export default function SizeGuidePage() {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const isDark = mounted && theme === "dark"

  return (
    <main
      className={cn(
        "min-h-screen pt-[88px] pb-20 px-4 md:px-8 transition-colors duration-300",
        isDark ? "bg-[var(--bg)] text-white" : "bg-[var(--bg)] text-black"
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
            All measurements are in inches unless stated.
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
          <p className={cn(
            "text-sm",
            isDark ? "text-white/70" : "text-black/70"
          )}>
            Still unsure?{" "}
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

