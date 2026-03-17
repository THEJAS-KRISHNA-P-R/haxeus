"use client";
import { cn } from "@/lib/utils";

const testimonials = [
  { name: "Arjun Sharma",  role: "Fashion Enthusiast", text: "The quality is absolutely incredible. Most comfortable T-shirts I've ever owned.", rating: 5, initial: "A" },
  { name: "Priya Patel",   role: "Creative Director",  text: "They maintain their shape and softness even after countless washes. Worth every penny.", rating: 5, initial: "P" },
  { name: "Rohit Kumar",   role: "Software Engineer",  text: "Professional enough for work, comfortable enough for weekends. Remarkable detail.", rating: 5, initial: "R" },
];

export function TestimonialsSection() {
  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-transparent" />
      <div className="relative z-10 max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-xs font-bold text-white/50 uppercase tracking-[0.3em]">What people say</span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-7xl text-white mt-3 tracking-tight">LOVED BY MANY</h2>
        </div>
        <div className="flex gap-6 overflow-hidden">
          <div className="flex gap-6 animate-marquee will-change-transform">
            {[...testimonials, ...testimonials].map((t, i) => (
              <div key={i} className={cn("flex-shrink-0 w-72 sm:w-80 p-5 sm:p-6 rounded-2xl bg-white/[0.03] border border-white/[0.07] hover:border-white/[0.15] transition-colors relative overflow-hidden group")}>
                <div className="absolute inset-0 bg-[radial-gradient(300px_at_50%_50%,rgba(128,128,128,0.05),transparent)] opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex gap-1 mb-4">{Array.from({ length: t.rating }).map((_, j) => <span key={j} className="text-[#e93a3a] text-sm">★</span>)}</div>
                <p className="text-white/65 text-sm leading-relaxed mb-6">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-xs font-bold text-white border border-white/10">{t.initial}</div>
                  <div>
                    <div className="text-sm font-semibold text-white">{t.name}</div>
                    <div className="text-xs text-white/50">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default TestimonialsSection;