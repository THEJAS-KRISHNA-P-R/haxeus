"use client"

import { useState } from "react"
import Navbar from "@/components/ui/navbar"
import { ShimmerButton, ShimmerButtonPink } from "@/components/ui/shimmer-button"
import { LiquidButton } from "@/components/ui/liquid-glass-button"
import { ShinyButton } from "@/components/ui/shiny-button"

// ── Section: wrapper ─────────────────────────────────────────────────────

function Section({
  id,
  label,
  children,
  className = "",
}: {
  id: string
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section id={id} className={`py-16 ${className}`}>
      <div className="max-w-4xl mx-auto px-6">
        {/* Section label */}
        <div className="flex items-center gap-3 mb-10">
          <span
            className="h-px flex-1 max-w-[40px]"
            style={{ background: "linear-gradient(90deg, #01f3f3, transparent)" }}
          />
          <span className="text-[10px] font-bold tracking-[0.25em] uppercase"
            style={{ color: "#01f3f3", textShadow: "0 0 12px rgba(1,243,243,0.4)" }}>
            {label}
          </span>
          <span
            className="h-px flex-1"
            style={{ background: "linear-gradient(90deg, transparent, rgba(194,59,154,0.4))" }}
          />
        </div>
        {children}
      </div>
    </section>
  )
}

// ── Usage pill ────────────────────────────────────────────────────────────

function UsagePill({ label, color }: { label: string; color: "cyan" | "pink" | "white" }) {
  const styles = {
    cyan:  { bg: "rgba(1,243,243,0.08)",   border: "rgba(1,243,243,0.2)",   text: "#01f3f3"  },
    pink:  { bg: "rgba(194,59,154,0.08)",  border: "rgba(194,59,154,0.2)",  text: "#c23b9a"  },
    white: { bg: "rgba(255,255,255,0.05)", border: "rgba(255,255,255,0.12)", text: "rgba(255,255,255,0.65)" },
  }
  const s = styles[color]
  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold tracking-[0.1em] uppercase"
      style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.text }}
    >
      {label}
    </span>
  )
}

// ── Demo card ─────────────────────────────────────────────────────────────

function DemoCard({
  children,
  title,
  description,
  tag,
  tagColor,
  code,
}: {
  children: React.ReactNode
  title: string
  description: string
  tag: string
  tagColor: "cyan" | "pink" | "white"
  code: string
}) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <UsagePill label={tag} color={tagColor} />
        <h3 className="text-base font-bold text-white mt-3 mb-1" style={{ fontFamily: "var(--font-clash)" }}>
          {title}
        </h3>
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>
          {description}
        </p>
      </div>

      {/* Preview */}
      <div
        className="mx-4 rounded-xl flex items-center justify-center flex-wrap gap-4 py-10 px-6"
        style={{
          background: "rgba(0,0,0,0.3)",
          border: "1px solid rgba(255,255,255,0.05)",
          backgroundImage: `
            radial-gradient(circle at 30% 50%, rgba(1,243,243,0.03) 0%, transparent 60%),
            radial-gradient(circle at 70% 50%, rgba(194,59,154,0.03) 0%, transparent 60%)
          `,
        }}
      >
        {children}
      </div>

      {/* Code snippet */}
      <div className="px-6 py-4">
        <code
          className="block text-xs leading-relaxed overflow-x-auto whitespace-pre"
          style={{ color: "rgba(1,243,243,0.65)", fontFamily: "JetBrains Mono, Fira Code, monospace" }}
        >
          {code}
        </code>
      </div>
    </div>
  )
}

// ── Color swatch ──────────────────────────────────────────────────────────

function Swatch({ hex, name, role }: { hex: string; name: string; role: string }) {
  return (
    <div className="flex flex-col gap-3">
      <div
        className="h-20 rounded-xl flex items-end p-3"
        style={{
          background: hex,
          border: hex === "#ffffff" ? "1px solid rgba(255,255,255,0.15)" : "none",
          boxShadow: hex === "#01f3f3"
            ? "0 0 24px rgba(1,243,243,0.3)"
            : hex === "#c23b9a"
            ? "0 0 24px rgba(194,59,154,0.3)"
            : "none",
        }}
      >
        <span
          className="font-mono text-xs font-semibold"
          style={{ color: hex === "#ffffff" || hex === "#01f3f3" ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.8)" }}
        >
          {hex}
        </span>
      </div>
      <div>
        <p className="text-sm font-semibold text-white">{name}</p>
        <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)", lineHeight: 1.5 }}>
          {role}
        </p>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────

export default function TestPage() {
  const [isDark, setIsDark] = useState(true)

  return (
    <div
      className={isDark ? "dark" : "light"}
      style={{
        minHeight: "100vh",
        background: isDark ? "#000" : "#f0f0f0",
        color: isDark ? "#e8e8e8" : "#0a0a0a",
        fontFamily: "var(--font-dm-sans), system-ui, sans-serif",
        position: "relative",
        overflowX: "hidden",
      }}
    >
      {/* Ambient orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" style={{ zIndex: 0 }}>
        <div
          className="absolute"
          style={{
            width: 700, height: 700,
            top: -200, right: -150,
            borderRadius: "50%",
            background: "#01f3f3",
            filter: "blur(120px)",
            opacity: isDark ? 0.06 : 0.04,
            animation: "orbDrift 14s ease-in-out infinite",
          }}
        />
        <div
          className="absolute"
          style={{
            width: 500, height: 500,
            bottom: 0, left: -100,
            borderRadius: "50%",
            background: "#c23b9a",
            filter: "blur(100px)",
            opacity: isDark ? 0.06 : 0.04,
            animation: "orbDrift 18s ease-in-out infinite reverse",
          }}
        />
        {/* Noise grain */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
            opacity: 0.4,
            mixBlendMode: "overlay",
          }}
        />
      </div>

      {/* Navbar */}
      <Navbar isDark={isDark} onToggleDark={() => setIsDark(!isDark)} />

      {/* Content */}
      <main style={{ position: "relative", zIndex: 1, paddingTop: 80 }}>

        {/* ── Hero ──────────────────────────────────────────────────── */}
        <section style={{ padding: "80px 24px 64px", textAlign: "center" }}>
          <div style={{ maxWidth: 640, margin: "0 auto" }}>

            {/* Status badge */}
            <div
              className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full text-[11px] font-bold tracking-[0.15em] uppercase"
              style={{
                background: "rgba(1,243,243,0.07)",
                border: "1px solid rgba(1,243,243,0.18)",
                color: "#01f3f3",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: "#01f3f3",
                  boxShadow: "0 0 8px #01f3f3",
                  animation: "pulse 2s infinite",
                }}
              />
              Component System · Clone Build
            </div>

            <h1
              style={{
                fontFamily: "var(--font-bebas), Impact, sans-serif",
                fontSize: "clamp(64px, 14vw, 110px)",
                letterSpacing: "0.1em",
                lineHeight: 1,
                marginBottom: 16,
                color: isDark ? "#fff" : "#000",
              }}
            >
              HAXEUS
              <br />
              <span
                style={{
                  background: "linear-gradient(135deg, #01f3f3, #c23b9a)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                UI KIT
              </span>
            </h1>

            <p
              style={{
                fontSize: 15,
                color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.45)",
                marginBottom: 40,
                lineHeight: 1.7,
              }}
            >
              Three-tier button system · Liquid glass pill navbar · Dark &amp; light mode ·
              <br />Copy-paste ready for your HAXEUS clone in Windsurf.
            </p>

            {/* Hero CTAs */}
            <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", alignItems: "center" }}>
              <ShinyButton onClick={() => document.getElementById("buttons")?.scrollIntoView({ behavior: "smooth" })}>
                Explore Components
              </ShinyButton>
              <LiquidButton size="xl">
                View on GitHub
              </LiquidButton>
            </div>
          </div>
        </section>

        {/* ── Buttons ───────────────────────────────────────────────── */}
        <Section id="buttons" label="Button System">
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* ShimmerButton */}
            <DemoCard
              tag="Primary"
              tagColor="cyan"
              title="ShimmerButton"
              description="All primary CTAs — Shop Now, Add to Cart, Checkout, Pay Now. Cyan shimmer by default; pink variant for accent uses."
              code={`import { ShimmerButton, ShimmerButtonPink } from "@/components/ui/shimmer-button"

<ShimmerButton>Shop Collection</ShimmerButton>
<ShimmerButton shimmerColor="#01f3f3">Add to Cart</ShimmerButton>
<ShimmerButtonPink>Limited Drop</ShimmerButtonPink>`}
            >
              <ShimmerButton>Shop Collection</ShimmerButton>
              <ShimmerButton>Add to Cart</ShimmerButton>
              <ShimmerButton>Pay ₹1,499</ShimmerButton>
              <ShimmerButtonPink>Limited Drop</ShimmerButtonPink>
            </DemoCard>

            {/* LiquidButton */}
            <DemoCard
              tag="Secondary"
              tagColor="white"
              title="LiquidButton"
              description="Secondary and ghost actions — Learn More, View Details, Cancel, Back, Explore. Refraction distortion via SVG filter."
              code={`import { LiquidButton } from "@/components/ui/liquid-glass-button"

<LiquidButton size="xl">Our Story</LiquidButton>
<LiquidButton size="xl">View Details</LiquidButton>
<LiquidButton size="lg" variant="cyan">Explore</LiquidButton>`}
            >
              <LiquidButton size="xl">Our Story</LiquidButton>
              <LiquidButton size="xl">View Details</LiquidButton>
              <LiquidButton size="lg" variant="cyan">Explore</LiquidButton>
              <LiquidButton size="sm">Cancel</LiquidButton>
            </DemoCard>

            {/* ShinyButton */}
            <DemoCard
              tag="Special — one per page"
              tagColor="pink"
              title="ShinyButton"
              description="Hero CTA only. Conic gradient border arc that animates on hover. Pink → Cyan highlight. Most visually dominant — use sparingly."
              code={`import { ShinyButton } from "@/components/ui/shiny-button"

// ONE per page — hero section only
<ShinyButton onClick={handleClick}>
  Get Exclusive Access
</ShinyButton>`}
            >
              <ShinyButton>Get Exclusive Access</ShinyButton>
            </DemoCard>

            {/* Usage rules */}
            <div
              className="rounded-2xl p-6"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <p
                className="text-[10px] font-bold tracking-[0.2em] uppercase mb-5"
                style={{ color: "rgba(255,255,255,0.25)" }}
              >
                Usage Hierarchy
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
                {[
                  {
                    label: "Primary",
                    name: "ShimmerButton",
                    uses: "Shop Now · Add to Cart · Pay · Submit · Save",
                    color: "rgba(1,243,243,0.08)",
                    border: "rgba(1,243,243,0.15)",
                    accent: "#01f3f3",
                  },
                  {
                    label: "Secondary",
                    name: "LiquidButton",
                    uses: "Learn More · View Details · Cancel · Explore",
                    color: "rgba(255,255,255,0.03)",
                    border: "rgba(255,255,255,0.08)",
                    accent: "rgba(255,255,255,0.5)",
                  },
                  {
                    label: "Special",
                    name: "ShinyButton",
                    uses: "Hero CTA — one per page maximum",
                    color: "rgba(194,59,154,0.07)",
                    border: "rgba(194,59,154,0.15)",
                    accent: "#c23b9a",
                  },
                ].map((r) => (
                  <div
                    key={r.name}
                    className="p-4 rounded-xl"
                    style={{ background: r.color, border: `1px solid ${r.border}` }}
                  >
                    <p className="text-[10px] font-bold uppercase tracking-[0.1em] mb-1"
                      style={{ color: "rgba(255,255,255,0.3)" }}>{r.label}</p>
                    <p className="text-sm font-bold text-white mb-1.5">{r.name}</p>
                    <p className="text-[11px] leading-relaxed"
                      style={{ color: "rgba(255,255,255,0.38)" }}>{r.uses}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* ── Navbar ────────────────────────────────────────────────── */}
        <Section id="navbar" label="Navbar">
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div
              className="rounded-2xl p-6"
              style={{
                background: "rgba(255,255,255,0.025)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <h3 className="text-base font-bold text-white mb-2"
                style={{ fontFamily: "var(--font-clash)" }}>
                Liquid Glass Pill Navbar
              </h3>
              <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>
                Fixed pill at the top of the page. Becomes denser on scroll. Mobile drawer with staggered
                link animation. Framer Motion animated active indicator. Press the moon/sun icon above to
                test light mode. Resize the window to test the mobile drawer.
              </p>

              {/* Feature chips */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
                {[
                  "Pill shape", "Scroll-aware glass", "Active route indicator", "Cart badge",
                  "Theme toggle", "Mobile drawer", "Framer Motion", "ARIA labels",
                ].map((f) => (
                  <span
                    key={f}
                    className="px-3 py-1 rounded-full text-[11px] font-medium"
                    style={{
                      background: "rgba(1,243,243,0.07)",
                      border: "1px solid rgba(1,243,243,0.14)",
                      color: "rgba(1,243,243,0.75)",
                    }}
                  >
                    {f}
                  </span>
                ))}
              </div>

              <code
                className="block text-xs leading-relaxed overflow-x-auto whitespace-pre p-4 rounded-xl"
                style={{
                  color: "rgba(1,243,243,0.65)",
                  fontFamily: "JetBrains Mono, Fira Code, monospace",
                  background: "rgba(0,0,0,0.4)",
                  border: "1px solid rgba(255,255,255,0.05)",
                }}
              >
{`// app/layout.tsx
import Navbar from "@/components/ui/navbar"

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  )
}

// With external theme control:
<Navbar isDark={isDark} onToggleDark={() => setIsDark(!isDark)} />`}
              </code>
            </div>

            {/* Toggle demo */}
            <div
              className="rounded-2xl p-6 flex items-center justify-between flex-wrap gap-4"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div>
                <p className="text-sm font-semibold text-white">Currently: {isDark ? "Dark" : "Light"} mode</p>
                <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
                  Toggle to see light-mode navbar glass
                </p>
              </div>
              <ShimmerButton
                onClick={() => setIsDark(!isDark)}
                className="text-sm"
                style={{ padding: "10px 20px" }}
              >
                Switch to {isDark ? "Light" : "Dark"}
              </ShimmerButton>
            </div>
          </div>
        </Section>

        {/* ── Colors ────────────────────────────────────────────────── */}
        <Section id="colors" label="Color System">
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Swatches */}
            <div
              className="rounded-2xl p-6"
              style={{
                background: "rgba(255,255,255,0.025)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 16 }}>
                <Swatch hex="#01f3f3" name="Cyan"  role="Primary accent · Shimmer · Glow · Active dot · Focus ring" />
                <Swatch hex="#c23b9a" name="Pink"  role="Secondary accent · Cart badge · ShinyButton arc · Special" />
                <Swatch hex="#000000" name="Black" role="Background · Button fill · Surface · Body" />
                <Swatch hex="#ffffff" name="White" role="Text · Sign In button · Highlight insets · Logo mark" />
              </div>
            </div>

            {/* Gradient combos */}
            <div
              className="rounded-2xl p-6"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase mb-4"
                style={{ color: "rgba(255,255,255,0.25)" }}>Approved Gradients</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10 }}>
                {[
                  { label: "Cyan → Pink",  bg: "linear-gradient(135deg, #01f3f3, #c23b9a)" },
                  { label: "Black → Cyan", bg: "linear-gradient(135deg, #000, #01f3f3)" },
                  { label: "Black → Pink", bg: "linear-gradient(135deg, #000, #c23b9a)" },
                  { label: "Conic dual",   bg: "conic-gradient(from 180deg, #c23b9a, #01f3f3, #c23b9a)" },
                ].map((g) => (
                  <div key={g.label} className="rounded-xl overflow-hidden">
                    <div className="h-16 w-full" style={{ background: g.bg }} />
                    <p className="text-[11px] font-medium mt-2 text-center"
                      style={{ color: "rgba(255,255,255,0.4)" }}>{g.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* CSS variables reference */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: "rgba(255,255,255,0.025)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <div className="px-6 pt-5 pb-2">
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase"
                  style={{ color: "rgba(255,255,255,0.25)" }}>CSS Variables</p>
              </div>
              <code
                className="block text-xs leading-7 overflow-x-auto whitespace-pre px-6 pb-5"
                style={{
                  color: "rgba(1,243,243,0.6)",
                  fontFamily: "JetBrains Mono, Fira Code, monospace",
                }}
              >
{`--hx-cyan:      #01f3f3;   /* primary accent */
--hx-pink:      #c23b9a;   /* secondary accent */
--hx-black:     #000000;   /* base background */
--hx-zinc:      #0a0a0a;   /* card surface */
--hx-muted:     #141414;   /* subtle surface */
--hx-border:    #1e1e1e;   /* border / divider */
--hx-text:      #e8e8e8;   /* body text */
--hx-dim:       #5a5a5a;   /* muted text */`}
              </code>
            </div>
          </div>
        </Section>

        {/* ── Setup ─────────────────────────────────────────────────── */}
        <Section id="setup" label="Setup Guide">
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.025)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <div className="px-6 pt-6 pb-3">
              <h3 className="text-base font-bold text-white mb-1"
                style={{ fontFamily: "var(--font-clash)" }}>
                Windsurf Setup — Step by Step
              </h3>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
                Copy these files into your HAXEUS clone project.
              </p>
            </div>
            <code
              className="block text-xs leading-7 overflow-x-auto whitespace-pre px-6 pb-6"
              style={{
                color: "rgba(1,243,243,0.6)",
                fontFamily: "JetBrains Mono, Fira Code, monospace",
              }}
            >
{`# 1. Install dependencies
npm install @radix-ui/react-slot class-variance-authority framer-motion lucide-react

# 2. Copy component files
components/ui/shimmer-button.tsx      ← Primary button
components/ui/liquid-glass-button.tsx ← Secondary button
components/ui/shiny-button.tsx        ← Special button
components/ui/navbar.tsx              ← Liquid glass navbar

# 3. Update tailwind.config.ts
#    Add shimmer-slide + spin-around keyframes + HAXEUS colours

# 4. Update app/globals.css
#    Add font imports + utility classes + CSS variables

# 5. Download Clash Display font
#    fontshare.com → ClashDisplay-Variable.woff2 → /public/fonts/

# 6. Wrap your layout
# app/layout.tsx
import Navbar from "@/components/ui/navbar"
<body>
  <Navbar />
  <main className="navbar-spacer">{children}</main>
</body>`}
            </code>
          </div>
        </Section>

        {/* Footer */}
        <footer
          style={{
            borderTop: "1px solid rgba(255,255,255,0.06)",
            padding: "32px 24px",
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", letterSpacing: "0.05em" }}>
            HAXEUS UI ·{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #01f3f3, #c23b9a)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Clone Build
            </span>
            {" "}· Made for Windsurf
          </p>
        </footer>
      </main>

      {/* Keyframe injection */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 8px #01f3f3; }
          50%       { opacity: 0.4; box-shadow: 0 0 4px #01f3f3; }
        }
        @keyframes orbDrift {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%       { transform: translate(28px, -18px) scale(1.05); }
          66%       { transform: translate(-18px, 28px) scale(0.96); }
        }
      `}</style>
    </div>
  )
}
