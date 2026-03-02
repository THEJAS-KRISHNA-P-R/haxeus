# HAXEUS Clone — Component Integration Guide
### For Windsurf · Next.js 15 · shadcn/ui · Tailwind · TypeScript

---

## Files Delivered

```
components/ui/
├── shimmer-button.tsx        ← PRIMARY button
├── liquid-glass-button.tsx   ← SECONDARY button (+ base Button)
├── shiny-button.tsx          ← SPECIAL button (hero CTA only)
└── navbar.tsx                ← Liquid glass pill navbar

app/
├── globals.css               ← Brand tokens, font imports, utilities
└── test-components/page.tsx  ← Full test & showcase page

tailwind.config.ts            ← Complete config with shimmer animations
```

---

## Step 1 — Install dependencies

```bash
npm install @radix-ui/react-slot class-variance-authority framer-motion lucide-react
```

If you already have some of these, that's fine — npm will skip them.

---

## Step 2 — Copy files

Copy each file to the path shown above inside your HAXEUS clone project root.

> **Why `/components/ui`?**  
> shadcn/ui resolves all component imports to this path. If your project uses a different alias (e.g. `@/src/components/ui`), update the import paths in each file accordingly.

---

## Step 3 — Replace `tailwind.config.ts`

Replace your existing config entirely with the delivered `tailwind.config.ts`.  
It adds:
- `shimmer-slide` + `spin-around` keyframes (required by ShimmerButton)
- HAXEUS colour tokens under `colors.hx`
- Box shadow presets: `glow-cyan`, `glow-pink`, `nav-pill`
- Font family slots: `display`, `heading`, `body`

---

## Step 4 — Update `app/globals.css`

**Option A (clean slate):** Replace your existing `globals.css` with the delivered one.  
**Option B (merge):** Paste the delivered content below your existing Tailwind directives.

The file adds:
- Google Fonts import (Bebas Neue + DM Sans)
- `@font-face` for Clash Display
- CSS custom properties for the full HAXEUS palette
- Utility classes: `.gradient-text`, `.gradient-border`, `.glass`, `.noise-overlay`
- Global border colour override (kills default browser light borders)
- Scrollbar, selection, and focus ring styles

---

## Step 5 — Download Clash Display font

1. Go to **fontshare.com** → search "Clash Display"
2. Download the variable font → `ClashDisplay-Variable.woff2`
3. Place at: `public/fonts/ClashDisplay-Variable.woff2`

> Without this font, headings fall back to Impact — functional but not ideal.

---

## Step 6 — Add Navbar to layout

```tsx
// app/layout.tsx
import Navbar from "@/components/ui/navbar"
import "./globals.css"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main className="navbar-spacer">
          {children}
        </main>
      </body>
    </html>
  )
}
```

The `navbar-spacer` class (defined in globals.css) adds `padding-top: 72px` so page content sits below the fixed pill.

---

## Step 7 — Test everything

Navigate to `/test-components` in your browser.  
You should see:
- ✅ Liquid glass pill navbar fixed at top
- ✅ All three button variants rendering
- ✅ Shimmer animation on ShimmerButton
- ✅ Glass refraction on LiquidButton  
- ✅ Conic gradient arc on ShinyButton
- ✅ Dark/light mode toggle working
- ✅ Mobile drawer at < 768px

---

## Button Usage Quick Reference

| Situation | Use |
|-----------|-----|
| Shop Now, Add to Cart, Pay, Submit, Save | `<ShimmerButton>` |
| Learn More, View Details, Cancel, Back | `<LiquidButton>` |
| Hero CTA (one per page) | `<ShinyButton>` |
| Accent/limited drop call-out | `<ShimmerButtonPink>` |

---

## Color Reference

| Variable | Hex | Role |
|----------|-----|------|
| `--hx-cyan` | `#01f3f3` | Primary accent · Shimmer · Glow · Active dot |
| `--hx-pink` | `#c23b9a` | Secondary accent · Badge · ShinyButton arc |
| `--hx-black` | `#000000` | Background · Button fill |
| White | `#ffffff` | Text · Sign In · Highlights |

---

## Navbar Cart Count

The navbar uses a stub `useCartCount()` hook that returns `2`.  
Replace it with your real cart context:

```tsx
// In navbar.tsx — find this function and replace:
function useCartCount() {
  // Replace with your real hook:
  const { items } = useCart()
  return items.reduce((sum, item) => sum + item.quantity, 0)
}
```

---

## Troubleshooting

**Shimmer animation not running**  
→ Check `tailwind.config.ts` has `shimmer-slide` and `spin-around` keyframes. Run `npm run dev` after any config change.

**LiquidButton glass effect not visible**  
→ The SVG filter (`GlassFilter`) must be rendered in the DOM. It's auto-included inside `LiquidButton`. Make sure the parent has a visible background for the distortion to be apparent.

**Navbar not floating / not fixed**  
→ Make sure you haven't applied `overflow: hidden` to `<html>` or `<body>` — this breaks `position: fixed`.

**Fonts not loading**  
→ Check the Google Fonts import is at the top of `globals.css` (before Tailwind directives).

**TypeScript errors on `variant` prop**  
→ Run `npm install class-variance-authority` — the `cva` types are shipped with the package.
