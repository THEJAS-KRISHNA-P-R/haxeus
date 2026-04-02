"use client"

import { useRef } from "react"
import { motion, useInView, useReducedMotion } from "framer-motion"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

// ─── Zendra-style char-by-char animated text ───────────────────────────────
// Each character flies in from below with a blur dissolve, staggered per-char.
function AnimatedText({
  text,
  className,
  style,
  delay = 0,
  justify = "center",
}: {
  text: string
  className?: string
  style?: React.CSSProperties
  delay?: number
  justify?: "center" | "left" | "right"
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: "-60px" })
  const words = text.split(" ")
  let globalCharIdx = 0

  return (
    <span
      ref={ref}
      className={className}
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: justify,
        gap: "0 0.28em",
        ...style,
      }}
    >
      {words.map((word, wIdx) => {
        const wordStart = globalCharIdx
        globalCharIdx += word.length + 1
        return (
          <span key={wIdx} style={{ display: "inline-block", whiteSpace: "nowrap" }}>
            {word.split("").map((char, cIdx) => (
              <motion.span
                key={`${char}-${cIdx}`}
                style={{ display: "inline-block", willChange: "transform, opacity, filter" }}
                initial={{ opacity: 0, y: 24, filter: "blur(12px)" }}
                animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
                transition={{
                  delay: delay + (wordStart + cIdx) * 0.028,
                  duration: 0.55,
                  ease: [0.215, 0.61, 0.355, 1],
                }}
              >
                {char}
              </motion.span>
            ))}
          </span>
        )
      })}
    </span>
  )
}

// ─── Spinning decorative asterisk ──────────────────────────────────────────
function SpinningAsterisk({ className }: { className?: string }) {
  return (
    <motion.div
      className={className}
      animate={{ rotate: 360 }}
      transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
      aria-hidden="true"
    >
      <svg width="56" height="56" viewBox="0 0 88 88" fill="none">
        <path
          d="M88 48H58.928L84.105 62.536L80.105 69.464L54.928 54.928L69.464 80.105L62.536 84.105L48 58.928V88H40V58.928L25.464 84.105L18.536 80.105L33.072 54.928L7.895 69.464L3.895 62.536L29.072 48H0V40H29.072L3.895 25.464L7.895 18.536L33.072 33.072L18.536 7.895L25.464 3.895L40 29.072V0H48V29.072L62.536 3.895L69.464 7.895L54.928 33.072L80.105 18.536L84.105 25.464L58.928 40H88V48Z"
          fill="rgba(255,255,255,0.25)"
        />
      </svg>
    </motion.div>
  )
}

// ─── Floating pill badge ────────────────────────────────────────────────────
function FloatingPill({
  label,
  delay,
  style,
}: {
  label: string
  delay: number
  style?: React.CSSProperties
}) {
  return (
    // Outer: entry animation (fade + scale in on scroll)
    <motion.div
      className="absolute hidden md:block pointer-events-none select-none"
      style={style}
      initial={{ opacity: 0, scale: 0.85 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ type: "spring", bounce: 0.35, delay, duration: 1.4 }}
    >
      {/* Inner: continuous float loop */}
      <motion.div
        className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-md px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-white"
        animate={{ y: [0, -7, 0] }}
        transition={{ repeat: Infinity, duration: 3 + delay, ease: "easeInOut" }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-white/60 inline-block" />
        {label}
      </motion.div>
    </motion.div>
  )
}

// ─── Main component ─────────────────────────────────────────────────────────
export function JoinMovementCTA() {
  const prefersReducedMotion = useReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)
  const inView = useInView(sectionRef, { once: true, margin: "-60px" })

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-[#c62828] py-24 md:py-32"
    >
      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(12,12,12,1) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(12,12,12,1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Subtle radial glow */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 1.5 }}
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 50%, rgba(255,90,90,0.18) 0%, transparent 70%)",
        }}
      />

      {/* Floating pills */}
      <FloatingPill label="Streetwear" delay={0.5} style={{ top: "18%", left: "7%" }} />
      <FloatingPill label="Limited Drops" delay={0.65} style={{ top: "18%", right: "7%" }} />
      <FloatingPill label="240 GSM Cotton" delay={0.8} style={{ bottom: "20%", left: "9%" }} />
      <FloatingPill label="Express Yourself" delay={0.9} style={{ bottom: "20%", right: "9%" }} />

      {/* Spinning asterisks — decorative */}
      <motion.div
        className="absolute top-[12%] left-[3%] hidden lg:block"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: 0.4, duration: 0.8 }}
      >
        <SpinningAsterisk />
      </motion.div>
      <motion.div
        className="absolute bottom-[12%] right-[3%] hidden lg:block"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: 0.6, duration: 0.8 }}
      >
        <SpinningAsterisk />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 text-center">
        <div className="flex flex-col items-center gap-8">

          <div className="space-y-4">
            {/* Animated headline — char-by-char blur dissolve */}
            <h2 className="font-display text-5xl font-black uppercase tracking-[-0.04em] text-white md:text-8xl leading-none">
              {prefersReducedMotion ? (
                <>The&nbsp;Movement<br className="hidden md:block" />&nbsp;is&nbsp;Here</>
              ) : (
                <>
                  <AnimatedText text="The Movement" delay={0.1} />
                  <AnimatedText text="is Here" delay={0.55} />
                </>
              )}
            </h2>

            {/* Subtext — spring in from below */}
            <motion.p
              className="mx-auto max-w-xl text-lg font-medium text-white/70 md:text-xl"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 800 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : { type: "spring", bounce: 0.2, delay: 0.9, duration: 2 }
              }
            >
              Premium artistic streetwear, designed for the obsessive. Join us at the edge of culture.
            </motion.p>
          </div>

          {/* CTA button — Zendra spring bounce */}
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 800 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : { type: "spring", bounce: 0.25, delay: 1.1, duration: 2.2 }
            }
          >
            <Link
              href="/products"
              className="group relative flex items-center gap-3 overflow-hidden rounded-full bg-white px-8 py-4 text-sm font-bold uppercase tracking-widest text-[#7f1d1d] transition-all hover:pr-12 active:scale-95"
            >
              Shop the Collection
              <motion.span
                animate={{ x: [0, 3, 0] }}
                transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
              >
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-2" />
              </motion.span>
            </Link>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
