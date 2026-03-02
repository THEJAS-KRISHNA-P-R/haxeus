import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      // ── HAXEUS brand colours ──────────────────────────────────────────
      colors: {
        hx: {
          black:       "#000000",
          zinc:        "#0a0a0a",
          muted:       "#141414",
          border:      "#1e1e1e",
          text:        "#e8e8e8",
          dim:         "#5a5a5a",
          cyan:        "#01f3f3",
          "cyan-dim":  "#009999",
          pink:        "#c23b9a",
          "pink-dim":  "#8a2a6e",
        },
      },

      // ── Fonts ─────────────────────────────────────────────────────────
      fontFamily: {
        display: ["var(--font-bebas)", "Impact", "sans-serif"],
        heading:  ["var(--font-clash)", "sans-serif"],
        body:     ["var(--font-dm-sans)", "system-ui", "sans-serif"],
        mono:     ["JetBrains Mono", "Fira Code", "monospace"],
      },

      // ── Shimmer button animations (required by shimmer-button.tsx) ────
      animation: {
        "shimmer-slide":
          "shimmer-slide var(--speed) ease-in-out infinite alternate",
        "spin-around":
          "spin-around calc(var(--speed) * 2) infinite linear",

        // Ambient / decorative
        "fade-up":  "fadeUp 0.6s ease-out forwards",
        float:      "float 6s ease-in-out infinite",
        "orb-drift":"orbDrift 12s ease-in-out infinite",
      },

      keyframes: {
        // ── ShimmerButton ───────────────────────────────────────────────
        "spin-around": {
          "0%":         { transform: "translateZ(0) rotate(0deg)" },
          "15%, 35%":   { transform: "translateZ(0) rotate(90deg)" },
          "65%, 85%":   { transform: "translateZ(0) rotate(270deg)" },
          "100%":       { transform: "translateZ(0) rotate(360deg)" },
        },
        "shimmer-slide": {
          to: { transform: "translate(calc(100cqw - 100%), 0)" },
        },

        // ── Utility ─────────────────────────────────────────────────────
        fadeUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%":      { transform: "translateY(-10px)" },
        },
        orbDrift: {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%":      { transform: "translate(24px, -16px) scale(1.04)" },
          "66%":      { transform: "translate(-16px, 24px) scale(0.96)" },
        },
      },

      // ── Box shadows ──────────────────────────────────────────────────
      boxShadow: {
        "glow-cyan":    "0 0 32px rgba(1,243,243,0.2), 0 0 64px rgba(1,243,243,0.06)",
        "glow-pink":    "0 0 32px rgba(194,59,154,0.2), 0 0 64px rgba(194,59,154,0.06)",
        "glow-dual":    "0 0 32px rgba(1,243,243,0.1), 0 0 48px rgba(194,59,154,0.1)",
        "card":         "0 1px 0 0 rgba(255,255,255,0.05), inset 0 1px 0 0 rgba(255,255,255,0.02)",
        "nav-pill":     "0 4px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.08)",
        "nav-scrolled": "0 8px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.05)",
      },

      // ── Background images ────────────────────────────────────────────
      backgroundImage: {
        "noise": "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E\")",
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "hx-gradient":     "linear-gradient(135deg, #01f3f3, #c23b9a)",
        "hx-dark-fade":    "linear-gradient(180deg, transparent 0%, #000000 100%)",
      },
    },
  },
  plugins: [],
}

export default config
