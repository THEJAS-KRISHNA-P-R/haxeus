"use client";
import { useRef } from "react";
import { motion, useInView, useReducedMotion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { Shirt, Layers, Zap, ChevronRight, ArrowDown } from "lucide-react";
import Image from "next/image";
import { SparklesCore } from "@/components/ui/sparkles";
import { ShinyText } from "@/components/ui";
import { JoinMovementCTA } from "@/components/JoinMovementCTA";

// ─── Char-by-char blur dissolve (Zendra-style) ─────────────────────────────
function AnimatedText({
  text,
  className,
  style,
  delay = 0,
  justify = "center",
}: {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  delay?: number;
  justify?: "center" | "left" | "right";
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const words = text.split(" ");
  let globalCharIdx = 0;

  return (
    <span
      ref={ref}
      className={className}
      style={{ display: "flex", flexWrap: "wrap", justifyContent: justify, gap: "0 0.28em", ...style }}
    >
      {words.map((word, wIdx) => {
        const wordStart = globalCharIdx;
        globalCharIdx += word.length + 1;
        return (
          <span key={wIdx} style={{ display: "inline-block", whiteSpace: "nowrap" }}>
            {word.split("").map((char, cIdx) => (
              <motion.span
                key={`${char}-${cIdx}`}
                style={{ display: "inline-block", willChange: "transform, opacity, filter" }}
                initial={{ opacity: 0, y: 24, filter: "blur(12px)" }}
                animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
                transition={{ delay: delay + (wordStart + cIdx) * 0.025, duration: 0.55, ease: [0.215, 0.61, 0.355, 1] }}
              >
                {char}
              </motion.span>
            ))}
          </span>
        );
      })}
    </span>
  );
}

// ─── Spring-in paragraph (replaces hooks-in-map pattern) ───────────────────
function SpringParagraph({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.p
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 60 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ type: "spring", bounce: 0.15, delay, duration: 2 }}
    >
      {children}
    </motion.p>
  );
}



// ─── Floating pill ─────────────────────────────────────────────────────────
function FloatingPill({ label, delay, style, color = "rgba(255,255,255,0.08)", textColor = "rgba(255,255,255,0.7)" }: { label: string; delay: number; style?: React.CSSProperties; color?: string; textColor?: string }) {
  return (
    <motion.div className="absolute hidden md:block pointer-events-none select-none" style={style} initial={{ opacity: 0, scale: 0.85 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ type: "spring", bounce: 0.35, delay, duration: 1.4 }}>
      <motion.div className="flex items-center gap-2 rounded-full border border-white/10 backdrop-blur-md px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em]" style={{ background: color, color: textColor }} animate={{ y: [0, -7, 0] }} transition={{ repeat: Infinity, duration: 3 + delay, ease: "easeInOut" }}>
        <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: textColor }} />
        {label}
      </motion.div>
    </motion.div>
  );
}

// ─── Section label ─────────────────────────────────────────────────────────
function SectionLabel({ text, delay = 0 }: { text: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.div ref={ref} className="inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.25em] text-[var(--accent)] mb-4" initial={{ opacity: 0, y: 12 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ type: "spring", bounce: 0.3, delay, duration: 1.2 }}>
      <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] inline-block animate-pulse" />
      {text}
    </motion.div>
  );
}

// ─── Data ──────────────────────────────────────────────────────────────────
const differences = [
  { icon: Shirt, title: "Premium Fabrication", desc: "We exclusively use 240gsm–280gsm heavyweight cotton for a luxury drape that lasts years, not months." },
  { icon: Layers, title: "Artistic Depth", desc: "Every design is born from a physical canvas. We transform fine art into wearable rebellion." },
  { icon: Zap, title: "No Middlemen", desc: "We control the full cycle—from sourcing and dyeing to printing. Rare quality at an honest price." },
];

const team = [
  { name: "Founder 1", role: "Creative Direction", image: "/placeholder.svg" },
  { name: "Founder 2", role: "Production & Ops", image: "/placeholder.svg" },
];

// ─── Page ──────────────────────────────────────────────────────────────────
export default function AboutPageClient() {
  const prefersReducedMotion = useReducedMotion();

  // Parallax on origin section image
  const originRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: originScroll } = useScroll({ target: originRef, offset: ["start end", "end start"] });
  const originY = useTransform(originScroll, [0, 1], ["8%", "-8%"]);

  return (
    <main className="bg-theme min-h-screen">

      {/* ── 1. HERO ──────────────────────────────────────────────────── */}
      <section className="relative min-h-[100dvh] py-20 flex flex-col items-center justify-center overflow-hidden" style={{ backgroundColor: "#060606" }}>
        <div className="absolute inset-0 w-full h-full">
          <SparklesCore id="tsparticlesabout" background="transparent" minSize={0.4} maxSize={2.0} particleDensity={350} className="w-full h-full" particleColor="#e11d48" speed={0.5} />
        </div>



        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none overflow-visible">
          <div className="flex flex-col items-center text-center w-full max-w-none overflow-visible">
            <motion.p
              initial={prefersReducedMotion ? false : { opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={prefersReducedMotion ? { duration: 0 } : { type: "spring", bounce: 0.2, delay: 0.2, duration: 2 }}
              className="text-[var(--accent)] font-bold tracking-[0.3em] text-2xl md:text-xl mb-0 uppercase pointer-events-auto"
            >
              Our Story
            </motion.p>

            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.95, filter: "blur(20px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={prefersReducedMotion ? { duration: 0 } : { duration: 1.4, ease: [0.215, 0.61, 0.355, 1], delay: 0.1 }}
              className="-mt-4.5 md:-mt-11 mb-2 w-full flex items-center justify-center overflow-visible"
            >
              <div className="min-w-max overflow-visible pointer-events-auto">
                <ShinyText text="HAXEUS" disabled={false} speed={4} color="#d3d2d2ff" shineColor="#ffffff" className="text-[16vw] md:text-[15.5vw] font-black" />
              </div>
            </motion.div>

            <motion.p
              initial={prefersReducedMotion ? false : { opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={prefersReducedMotion ? { duration: 0 } : { type: "spring", bounce: 0.2, delay: 0.4, duration: 2 }}
              className="text-white/40 font-medium tracking-[0.5em] text-[10px] md:text-xs uppercase -mt-2 md:-mt-4 pointer-events-auto"
            >
              Art &middot; Identity &middot; Culture
            </motion.p>
          </div>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6, duration: 1 }} className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="text-white/30 text-[10px] tracking-[0.3em] font-bold uppercase">Scroll</span>
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
            <ArrowDown className="w-4 h-4 text-white/30" />
          </motion.div>
        </motion.div>

        {/* Removed gradient mask to ensure total particle persistence */}
      </section>

      {/* ── 2. ORIGIN STORY ──────────────────────────────────────────── */}
      <section className="py-32 px-6 lg:px-8 border-t border-theme relative overflow-hidden">
        <FloatingPill label="Since 2025" delay={0.3} style={{ top: "10%", right: "4%" }} color="rgba(225,29,72,0.08)" textColor="rgba(225,29,72,0.8)" />
        <FloatingPill label="Made in India" delay={0.55} style={{ bottom: "10%", left: "4%" }} color="rgba(225,29,72,0.08)" textColor="rgba(225,29,72,0.8)" />

        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <SectionLabel text="Chapter 01" />
            <h2 className="text-3xl md:text-5xl font-black italic">
              <AnimatedText text="The Origin Story" justify="left" delay={0.1} />
            </h2>
            <SpringParagraph className="text-theme-2 leading-relaxed text-lg italic" delay={0.2}>
              [ORIGIN STORY COPY GOES HERE - 200-300 WORDS]
            </SpringParagraph>
            <SpringParagraph className="text-theme-2 leading-relaxed text-lg italic" delay={0.35}>
              Placeholder content: HAXEUS began in a small studio in India, driven by the frustration of seeing the same generic designs in every mall. We wanted to build something that felt like art, something that didn&apos;t compromise on fabric weight or print quality. Our first 240gsm sample changed everything.
            </SpringParagraph>
          </div>

          {/* Parallax image */}
          <div ref={originRef} className="aspect-[4/5] rounded-3xl border border-theme overflow-hidden flex items-center justify-center relative group">
            <motion.div className="absolute inset-0" style={{ y: prefersReducedMotion ? 0 : originY }}>
              <Image src="/placeholder.svg" alt="Origin" fill className="object-cover opacity-50 grayscale group-hover:grayscale-0 transition-all duration-700 scale-110" />
            </motion.div>
            <motion.span className="relative z-10 text-xs font-bold tracking-widest uppercase" initial={{ opacity: 0 }} whileInView={{ opacity: 0.4 }} viewport={{ once: true }} transition={{ delay: 0.6, duration: 1 }}>
              Brand Archive 001
            </motion.span>
          </div>
        </div>
      </section>

      {/* ── 3. BUILT DIFFERENTLY ─────────────────────────────────────── */}
      <section className="py-32 px-6 lg:px-8 bg-black/5 dark:bg-white/5 relative overflow-hidden">


        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 space-y-4">
            <SectionLabel text="Chapter 02" />
            <h2 className="text-4xl md:text-6xl font-black">
              <AnimatedText text="Built Differently" justify="center" delay={0.1} />
            </h2>
            <motion.p className="text-theme-2 max-w-xl mx-auto text-lg italic" initial={{ opacity: 0, y: 60 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ type: "spring", bounce: 0.15, delay: 0.35, duration: 2 }}>
              No compromise. No corners cut. Just the best version of what you wear every day.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {differences.map((diff, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ type: "spring", bounce: 0.2, delay: index * 0.12, duration: 1.6 }}
                whileHover={prefersReducedMotion ? undefined : { y: -8, scale: 1.02 }}
                className="p-10 rounded-3xl border border-theme bg-theme hover:border-[var(--accent)] transition-colors duration-500 group cursor-default"
              >
                <motion.div className="w-14 h-14 rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-[var(--accent)]/20 transition-all duration-500">
                  <diff.icon className="w-7 h-7 text-[var(--accent)]" />
                </motion.div>
                <h3 className="text-2xl font-bold mb-4 italic uppercase">{diff.title}</h3>
                <p className="text-theme-2 leading-relaxed italic">{diff.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. THE STUDIO ────────────────────────────────────────────── */}
      <section className="py-32 px-6 lg:px-8 relative overflow-hidden">
        <FloatingPill label="Kerala, India" delay={0.4} style={{ top: "8%", right: "5%" }} color="rgba(225,29,72,0.08)" textColor="rgba(225,29,72,0.8)" />

        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
            <div className="space-y-4">
              <SectionLabel text="Chapter 03" />
              <h2 className="text-4xl md:text-6xl font-black italic">
                <AnimatedText text="The Studio." justify="left" delay={0.1} />
              </h2>
              <motion.p className="text-theme-2 text-xl italic max-w-md" initial={{ opacity: 0, y: 60 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ type: "spring", bounce: 0.15, delay: 0.3, duration: 2 }}>
                Our team is small, obsessed, and based out of our Kerala studio. We don&apos;t just design—we create.
              </motion.p>
            </div>
            <motion.div className="bg-[var(--accent)] text-white px-6 py-2 rounded-full text-xs font-black uppercase tracking-[0.2em]" initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ type: "spring", bounce: 0.4, delay: 0.4, duration: 1.4 }}>
              Coming Soon
            </motion.div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
            {team.map((member, i) => (
              <motion.div key={i} className="group cursor-wait" initial={{ opacity: 0, y: 40, filter: "blur(8px)" }} whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }} viewport={{ once: true, margin: "-60px" }} transition={{ type: "spring", bounce: 0.2, delay: i * 0.15, duration: 1.6 }} whileHover={prefersReducedMotion ? undefined : { y: -6 }}>
                <div className="aspect-[16/9] bg-theme-2/10 rounded-3xl overflow-hidden border border-theme mb-6 relative">
                  <div className="absolute inset-0 flex items-center justify-center text-[var(--accent)]/40 font-black text-4xl italic opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10">HAXEUS STUDIO</div>
                  <Image src={member.image} alt={member.name} fill className="object-cover grayscale group-hover:opacity-20 transition-all duration-700" />
                </div>
                <h4 className="text-2xl font-bold italic uppercase mb-1">{member.name}</h4>
                <p className="text-[var(--accent)] text-xs font-black uppercase tracking-widest">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. OWN YOUR REBELLION CTA ────────────────────────────────── */}
      <section className="py-24 px-6 lg:px-8 border-t border-theme">
        <div className="max-w-7xl mx-auto rounded-[4rem] bg-black text-white px-8 py-24 md:py-40 text-center overflow-hidden relative group">
          {/* Watermark */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[25rem] font-black opacity-[0.03] select-none italic pointer-events-none whitespace-nowrap group-hover:scale-110 transition-transform [transition-duration:20s] ease-linear">
            HAXEUS HAXEUS HAXEUS
          </div>



          <div className="relative z-10 space-y-12">
            <h2 className="text-5xl md:text-[8rem] font-black tracking-tighter italic leading-none">
              {prefersReducedMotion ? (
                <>OWN YOUR<br />REBELLION.</>
              ) : (
                <>
                  <AnimatedText text="OWN YOUR" justify="center" delay={0.1} />
                  <AnimatedText text="REBELLION." justify="center" delay={0.5} />
                </>
              )}
            </h2>

            <motion.div initial={prefersReducedMotion ? false : { opacity: 0, y: 60 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={prefersReducedMotion ? { duration: 0 } : { type: "spring", bounce: 0.25, delay: 0.9, duration: 2.2 }}>
              <Link href="/products" className="group/btn inline-flex items-center gap-4 bg-[var(--accent)] text-white px-16 py-7 rounded-full font-black uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all duration-700 shadow-2xl shadow-[var(--accent)]/20 text-lg">
                Shop the current collection
                <motion.span animate={{ x: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}>
                  <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-2 transition-transform" />
                </motion.span>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      <JoinMovementCTA />
    </main>
  );
}
