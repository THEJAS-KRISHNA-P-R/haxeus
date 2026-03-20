import Link from "next/link";
import { useState } from "react";

export function Footer() {
  return (
    <footer style={{ background: "var(--bg-card)", borderTop: "1px solid var(--border)" }} className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-10" />
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-6 sm:py-10">

        {/* Branding Row - Full Width */}
        <div className="flex items-start justify-between gap-4 mb-6 py-2">
          <div className="space-y-0.5">
            <span className="font-display text-2xl tracking-widest text-[var(--accent)] uppercase block">HAXEUS</span>
            <p style={{ color: "var(--text-2)" }} className="text-xs sm:text-sm leading-none font-medium opacity-80 italic">
              Art you can wear. Limited drops by HAXEUS.
            </p>
          </div>
          <a href="https://www.instagram.com/haxeuz.in/" target="_blank" rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-[#f00078]/10 flex items-center justify-center text-[#f00078] hover:bg-[#f00078]/20 transition-all duration-300 border border-[#f00078]/20 shadow-[0_0_15px_rgba(240,0,120,0.1)] hover:scale-110 active:scale-95 mt-[-2px]"
            aria-label="Instagram">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771-4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
          </a>
        </div>

        <div className="space-y-8 border-t border-white/5 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Newsletter Column */}
            <div className="space-y-4">
              <h4 className="text-[10px] sm:text-xs font-bold text-[var(--accent-yellow)]/60 uppercase tracking-[0.2em]">Join the movement</h4>
              <p style={{ color: "var(--text-3)" }} className="text-[11px] max-w-xs opacity-60 leading-tight">
                Get early drop access and exclusive member-only releases.
              </p>
              <FooterNewsletter />
            </div>

            {/* Links Columns (3 Total) */}
            <div className="grid grid-cols-3 gap-6 sm:gap-10">
              {[
                { title: "Shop", links: [{ label: "Products", href: "/products" }, { label: "Size Guide", href: "/size-guide" }] },
                { title: "Company", links: [{ label: "About", href: "/about" }, { label: "Journal", href: "/journal" }, { label: "Contact", href: "/contact" }] },
                { title: "Legal", links: [{ label: "Privacy Policy", href: "/privacy-policy" }, { label: "Returns", href: "/returns-refunds" }, { label: "Terms", href: "/terms-conditions" }, { label: "Shipping", href: "/shipping-policy" }] },
              ].map((col) => (
                <div key={col.title}>
                  <h4 className="text-[10px] sm:text-xs font-bold text-[var(--accent-yellow)]/60 uppercase tracking-[0.2em] mb-4">{col.title}</h4>
                  <ul className="space-y-2">
                    {col.links.map((link) => (
                      <li key={link.href}>
                        <Link href={link.href} style={{ color: "var(--text-2)" }} className="text-sm hover:text-[var(--accent)] transition-colors duration-300">
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

        {/* Bottom Bar */}
        <div style={{ borderColor: "var(--border)" }} className="pt-6 sm:pt-8 mt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p style={{ color: "var(--text-2)" }} className="text-xs opacity-60">© 2026 HAXEUS. All rights reserved.</p>
          <div className="text-[10px] opacity-40 uppercase tracking-[0.2em]">
            <span style={{ color: "var(--text-2)" }}>Made with obsession in India</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterNewsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() })
      });
      if (res.ok) {
        setStatus("success");
        setEmail("");
      } else {
        const data = await res.json();
        setStatus(data.error === "already_subscribed" ? "duplicate" : "error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="relative group max-w-[280px]">
        <input
          type="email"
          placeholder="email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-full px-4 py-2.5 text-xs text-[var(--text)] outline-none focus:border-[var(--accent)]/60 transition-all placeholder:text-[var(--text-3)]/30 shadow-inner"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="absolute right-1 top-1 bottom-1 px-4 bg-[var(--accent)] text-white text-[10px] font-black rounded-full hover:opacity-90 disabled:opacity-50 transition-all uppercase tracking-wider shadow-lg shadow-[var(--accent)]/20 active:scale-95"
        >
          {status === "loading" ? "..." : "Join"}
        </button>
      </div>
      {status === "success" && <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest italic ml-2">Subscribed!</p>}
      {status === "duplicate" && <p className="text-[10px] text-yellow-500 font-bold uppercase tracking-widest italic ml-2">Already in!</p>}
      {status === "error" && <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest italic ml-2">Error. Try again.</p>}
    </form>
  );
}

export default Footer;