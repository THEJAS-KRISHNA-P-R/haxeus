import Link from "next/link";

export function Footer() {
  return (
    <footer className="relative border-t border-white/[0.06] bg-hx-black overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-50" />
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          <div className="col-span-2 md:col-span-1">
            <span className="font-display text-2xl tracking-widest text-white">HAXEUS</span>
            <p className="mt-3 text-sm text-white/30 leading-relaxed max-w-xs">
              Art you can wear. Limited drops by underground artists.
            </p>
            <div className="flex gap-3 mt-5">
              <a href="https://www.instagram.com/haxeus.in/" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.1] transition-all"
                aria-label="Instagram">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
            </div>
          </div>
          {[
            { title: "Shop", links: [{ label: "Products", href: "/products" }, { label: "Size Guide", href: "/size-guide" }] },
            { title: "Company", links: [{ label: "About", href: "/about" }, { label: "Contact", href: "/contact" }] },
            { title: "Legal", links: [{ label: "Privacy Policy", href: "/privacy-policy" }, { label: "Returns", href: "/returns-refunds" }, { label: "Terms", href: "/terms-conditions" }] },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-bold text-white/25 uppercase tracking-[0.2em] mb-4">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}><Link href={link.href} className="text-sm text-white/40 hover:text-white transition-colors">{link.label}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/20">© 2026 HAXEUS. All rights reserved.</p>
          <p className="text-xs text-white/15">Made with obsession in India</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;