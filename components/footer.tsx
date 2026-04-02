import Link from "next/link"
import { useState } from "react"
import { FaInstagram } from "react-icons/fa"
import { isValidEmail } from "@/lib/validation"

export function Footer() {
  return (
    <footer style={{ background: "var(--bg-card)", borderTop: "1px solid var(--border)" }} className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-10" />
      <div className="relative z-10 mx-auto max-w-7xl px-6 py-6 sm:py-10">
        <div className="mb-6 flex items-start justify-between gap-4 py-2">
          <div className="space-y-0.5">
            <span className="block font-display text-2xl uppercase tracking-widest text-[var(--accent)]">HAXEUS</span>
            <p style={{ color: "var(--text-2)" }} className="text-xs font-medium italic leading-none opacity-80 sm:text-sm">
              Art you can wear. Limited drops by HAXEUS.
            </p>
          </div>
          <a
            href="https://www.instagram.com/haxeus.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-[-2px] flex h-10 w-10 items-center justify-center rounded-full border border-[#f00078]/20 bg-[#f00078]/10 text-[#f00078] shadow-[0_0_15px_rgba(240,0,120,0.1)] transition-all duration-300 hover:scale-110 hover:bg-[#f00078]/20 active:scale-95"
            aria-label="Instagram"
          >
            <FaInstagram className="h-5 w-5" aria-hidden="true" />
          </a>
        </div>

        <div className="space-y-8 border-t border-white/5 pt-8">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
            <div className="space-y-4">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--accent-yellow)]/60 sm:text-xs">Join the movement</h4>
              <p style={{ color: "var(--text-3)" }} className="max-w-xs text-[11px] leading-tight opacity-60">
                Get early drop access and exclusive member-only releases.
              </p>
              <FooterNewsletter />
            </div>

            <div className="grid grid-cols-3 gap-6 sm:gap-10">
              {[
                { title: "Shop", links: [{ label: "New Arrivals", href: "/products" }, { label: "Limited Drops", href: "/drops" }, { label: "All Items", href: "/products" }] },
                { title: "Help", links: [{ label: "Contact Us", href: "/contact" }, { label: "Size Guide", href: "/size-guide" }] },
                { title: "Brand", links: [{ label: "About HAXEUS", href: "/about" }, { label: "The Journal", href: "/journal" }] },
                { title: "Legal", links: [{ label: "Replacements", href: "/returns-refunds" }, { label: "Privacy", href: "/privacy-policy" }, { label: "Terms", href: "/terms-conditions" }] },
              ].map((column) => (
                <div key={column.title}>
                  <h4 className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--accent-yellow)]/60 sm:text-xs">{column.title}</h4>
                  <ul className="space-y-2">
                    {column.links.map((link) => (
                      <li key={link.label}>
                        <Link href={link.href} style={{ color: "var(--text-2)" }} className="text-sm transition-colors duration-300 hover:text-[var(--accent)]">
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ borderColor: "var(--border)" }} className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-6 sm:flex-row sm:pt-8">
          <p style={{ color: "var(--text-2)" }} className="text-xs opacity-60">© 2026 HAXEUS. All rights reserved.</p>
          <div className="text-[10px] uppercase tracking-[0.2em] opacity-40">
            <span style={{ color: "var(--text-2)" }}>Made with obsession in India</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

function FooterNewsletter() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState("idle")

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    const trimmedEmail = email.trim().toLowerCase()
    if (!trimmedEmail) return

    // 1. Local Strict Validation
    if (!isValidEmail(trimmedEmail)) {
      setStatus("invalid")
      return
    }

    setStatus("loading")

    try {
      // 2. Real-time Deliverability Check
      const vRes = await fetch("/api/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail })
      })

      if (vRes.ok) {
        const { isValid } = await vRes.json()
        if (!isValid) {
          setStatus("invalid")
          return
        }
      }

      // 3. Final Subscription
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail }),
      })

      if (response.ok) {
        setStatus("success")
        setEmail("")
        return
      }

      const payload = await response.json()
      setStatus(payload.error === "already_subscribed" ? "duplicate" : "error")
    } catch {
      setStatus("error")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="group relative max-w-[280px]">
        <input
          type="email"
          placeholder="email@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          className="w-full rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-2.5 text-xs text-[var(--text)] outline-none transition-all placeholder:text-[var(--text-3)]/30 focus:border-[var(--accent)]/60 shadow-inner"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="absolute bottom-1 right-1 top-1 rounded-full bg-[var(--accent)] px-4 text-[10px] font-black uppercase tracking-wider text-white shadow-lg shadow-[var(--accent)]/20 transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
        >
          {status === "loading" ? "..." : "Join"}
        </button>
      </div>

      {status === "success" && <p className="ml-2 text-[10px] font-bold uppercase tracking-widest italic text-emerald-500">Subscribed!</p>}
      {status === "duplicate" && <p className="ml-2 text-[10px] font-bold uppercase tracking-widest italic text-yellow-500">Already with us!</p>}
      {status === "invalid" && <p className="ml-2 text-[10px] font-bold uppercase tracking-widest italic text-red-500">Invalid inbox. Use real email.</p>}
      {status === "error" && <p className="ml-2 text-[10px] font-bold uppercase tracking-widest italic text-red-500">Error. Try again.</p>}
    </form>
  )
}

export default Footer
