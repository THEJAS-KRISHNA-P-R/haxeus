import { createPortal } from "react-dom"
import { useRef, useState, useEffect } from "react"
import {
  motion,
  useAnimate,
  useReducedMotion,
  useMotionValue,
  useAnimationFrame,
} from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { staggerContainer, fadeInRight, hoverScale, tapScale } from "@/lib/animations"
import type { AboutConfig } from "@/types/homepage"
import { DEFAULT_HOMEPAGE_CONFIG } from "@/lib/homepage-defaults"

type AnimPhase = 'idle' | 'popping' | 'zooming' | 'snapping-back'

interface AboutSectionProps {
  config: AboutConfig
  isDark?: boolean
}

function TextHeading({
  heading,
  headingAccent,
  headingSuffix,
  isDark,
  opacity,
}: {
  heading: string
  headingAccent: string
  headingSuffix: string
  isDark: boolean
  opacity: number
}) {
  return (
    <motion.div style={{ opacity }} className="mb-6 lg:mb-8 text-center lg:text-left">
      <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-bold break-words ${isDark ? "text-white" : "text-black"}`}>
        {heading} <span style={{ color: "var(--accent)" }}>{headingAccent}</span> {headingSuffix}
      </h2>
    </motion.div>
  )
}

function TextBody({
  body1,
  body2,
  features,
  ctaText,
  ctaHref,
  isDark,
  opacity,
}: {
  body1: string
  body2: string
  features: { label: string; color: string }[]
  ctaText: string
  ctaHref: string
  isDark: boolean
  opacity: number
}) {
  return (
    <motion.div
      style={{ opacity }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={staggerContainer}
      className="text-center lg:text-left"
    >
      <motion.div variants={fadeInRight}>
        <p className={`mb-4 leading-relaxed text-base sm:text-lg ${isDark ? "text-white/90" : "text-black/99"}`}>
          {body1}
        </p>
      </motion.div>
      <motion.div variants={fadeInRight}>
        <p className={`mb-6 leading-relaxed text-base sm:text-lg ${isDark ? "text-white/90" : "text-black/99"}`}>
          {body2}
        </p>
      </motion.div>

      <motion.div variants={fadeInRight} className="grid grid-cols-2 gap-4 sm:gap-6 mb-8 max-w-sm mx-auto lg:mx-0">
        {features.map((feature, index) => (
          <motion.div key={index} className="flex items-center" whileHover={{ x: 5 }}>
            <div className="w-2.5 h-2.5 rounded-full mr-2.5 flex-shrink-0" style={{ backgroundColor: feature.color }} />
            <span className={`text-sm font-semibold ${isDark ? "text-white/80" : "text-black/80"}`}>{feature.label}</span>
          </motion.div>
        ))}
      </motion.div>

      <motion.div variants={fadeInRight}>
        <Link href={ctaHref}>
          <motion.div whileHover={hoverScale} whileTap={tapScale}>
            <Button className="bg-[var(--accent)] hover:opacity-90 text-white px-8 py-5 rounded-full text-base font-semibold shadow-lg shadow-[var(--accent)]/20 transition-all duration-300">
              {ctaText}
            </Button>
          </motion.div>
        </Link>
      </motion.div>
    </motion.div>
  )
}

// ─── Original static layout (mobile + reduced-motion fallback) ────────────────

function OriginalAboutLayout({ config, isDark = true }: AboutSectionProps) {
  const imageUrl = config.image_url ?? DEFAULT_HOMEPAGE_CONFIG.about.image_url

  return (
    <section className="relative z-10 border-t border-theme">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-8 items-center">
          <div className="order-1 lg:col-start-1 lg:row-start-1">
            <TextHeading
              heading={config.heading ?? DEFAULT_HOMEPAGE_CONFIG.about.heading}
              headingAccent={config.heading_accent ?? DEFAULT_HOMEPAGE_CONFIG.about.heading_accent}
              headingSuffix={config.heading_suffix ?? DEFAULT_HOMEPAGE_CONFIG.about.heading_suffix}
              isDark={isDark}
              opacity={1}
            />
          </div>

          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="order-2 lg:col-start-2 lg:row-span-2 relative h-64 sm:h-80 lg:h-[500px]"
          >
            <motion.div
              whileHover={{ scale: 1.05, rotate: 1 }}
              transition={{ duration: 0.4 }}
              className="relative h-full rounded-2xl overflow-hidden"
            >
              <Image
                src={imageUrl}
                alt="HAXEUS Quality"
                fill
                sizes="(max-width: 640px) 100vw, 50vw"
                className="object-cover"
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = "/placeholder.svg?height=400&width=600&text=About+HAXEUS"
                }}
              />
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#e7bf04] via-[#c03c9d] to-[#07e4e1]" />
            </motion.div>
          </motion.div>

          <div className="order-3 lg:col-start-1 lg:row-start-2">
            <TextBody
              body1={config.body1 ?? DEFAULT_HOMEPAGE_CONFIG.about.body1}
              body2={config.body2 ?? DEFAULT_HOMEPAGE_CONFIG.about.body2}
              features={config.features ?? DEFAULT_HOMEPAGE_CONFIG.about.features}
              ctaText={config.cta_text ?? DEFAULT_HOMEPAGE_CONFIG.about.cta_text}
              ctaHref={config.cta_href ?? DEFAULT_HOMEPAGE_CONFIG.about.cta_href}
              isDark={isDark}
              opacity={1}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Scroll-zoom variant (desktop, motion OK) ─────────────────────────────────
//
// WHY useScroll WITHOUT target:
// useScroll({ target: containerRef }) tracks when the container enters/leaves
// the viewport — progress goes 0→1 as it scrolls THROUGH the screen.
// For a sticky sequence we need progress 0→1 while the section is PINNED,
// to get this is to read raw scrollY from the window and map it manually
// against the container's offsetTop (which stays fixed while sticky).
// Update: Switched to manual scroll-lock trigger architecture.

function ScrollZoomAboutSection({ config, isDark = true }: AboutSectionProps) {
  const imageUrl = config.image_url ?? DEFAULT_HOMEPAGE_CONFIG.about.image_url
  const prefersReduced = useReducedMotion()

  const imageContainerRef = useRef<HTMLDivElement>(null)
  const savedScrollY = useRef(0)
  const isLocked = useRef(false)
  const lastSnapTime = useRef(0)
  const phase = useRef<AnimPhase>('idle')
  const originalRect = useRef<DOMRect | null>(null)

  // wheelValue = target (accumulated scroll input)
  // visualValue = what we actually see (advances at constant speed)
  const wheelValue = useMotionValue(0)
  const visualValue = useMotionValue(0)
  const lastFrameTime = useRef(0)
  const lastScrollY = useRef(0)
  const isArmed = useRef(false)
  const isTriggering = useRef(false)

  const [cloneVisible, setCloneVisible] = useState(false)
  const [cloneStyle, setCloneStyle] = useState<React.CSSProperties>({})
  const [hideOriginal, setHideOriginal] = useState(false)

  const [scope, animate] = useAnimate()

  const DESKTOP_BUDGET = 2200
  const MOBILE_BUDGET = 1200

  useEffect(() => {
    if (prefersReduced) return
    const el = imageContainerRef.current
    if (!el) return

    const onScroll = () => {
      // 1. SAFETY: Skip if already locked or triggering
      if (isLocked.current || phase.current !== 'idle' || isTriggering.current) return
      
      const currentY = window.scrollY
      if (currentY === lastScrollY.current) return // Skip tiny jitter
      const isDown = currentY > lastScrollY.current
      lastScrollY.current = currentY

      const rect = el.getBoundingClientRect()
      const centerY = rect.top + rect.height / 4 // Wider 'trigger' zone for fast flicks
      const triggerY = window.innerHeight / 2

      // 2. ARM: Ready it whenever we are on the 'Hero-side' (above center)
      if (centerY > triggerY + 50) {
        isArmed.current = true
      }

      // 3. FIRE: Catch the crossing if armed, moving DOWN, and threshold reached
      // We check centerY <= triggerY to catch the 'jump' between frames
      if (isArmed.current && isDown && centerY <= triggerY) {
        isArmed.current = false
        triggerAnimation()
      }
    }

    // Attach immediately on mount for maximum reliability
    window.addEventListener('scroll', onScroll, { passive: true })
    // Initial check on mount
    onScroll()

    return () => window.removeEventListener('scroll', onScroll)
  }, [prefersReduced])

  // ─── Animation Sequence ──────────────────────────────────────────────────
  const triggerAnimation = async () => {
    if (isLocked.current || phase.current !== 'idle' || isTriggering.current) return
    if (!imageContainerRef.current) return

    // Prevent immediate re-trigger after snapping back
    if (Date.now() - lastSnapTime.current < 400) return
    isTriggering.current = true
    isArmed.current = false

    // Capture rect BEFORE movement
    const rect = imageContainerRef.current.getBoundingClientRect()
    originalRect.current = rect
    
    // Lock body & PREVENT JUMP by neutralizing smooth-scroll on both HTML and BODY
    savedScrollY.current = window.scrollY
    
    document.documentElement.style.scrollBehavior = 'auto'
    document.body.style.scrollBehavior = 'auto'
    
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.top = `-${savedScrollY.current}px`
    document.body.style.width = '100%'
    
    isLocked.current = true
    isTriggering.current = false
    wheelValue.set(0)
    
    // Unify: Desktop/Mobile both start "in place" and move via scroll
    phase.current = 'zooming'
    
    // Show clone at exact spot
    setCloneStyle({
      position: 'fixed' as const,
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      borderRadius: 20,
      zIndex: 9999,
    })
    setHideOriginal(true)
    setCloneVisible(true)
    
    // Wait for Portal match - lowered wait for better 'pop' feel
    await new Promise(r => requestAnimationFrame(r))
    if (!scope.current) return
  }

  const updateZoom = () => {
    if (!scope.current || phase.current !== 'zooming' || !originalRect.current) return

    const current = visualValue.get()
    const vw = window.innerWidth
    const vh = window.innerHeight
    const isMobile = vw < 1024
    const rect = originalRect.current
    const budget = isMobile ? MOBILE_BUDGET : DESKTOP_BUDGET

    const peakW = vw * 0.94
    const peakH = vh * 0.94

    let targetTop, targetLeft, targetW, targetH

    // Single Continuous Keyframe Engine (Mappings: 0% -> 25% -> 50% -> 75% -> 100%)
    const t = Math.max(0, Math.min(1, current / budget))
    
    // Smooth linear interpolation (Lerp factor handles the cushions)
    const getPoint = (t: number, stops: number[], values: number[]) => {
      if (t <= stops[0]) return values[0]
      if (t >= stops[stops.length - 1]) return values[values.length - 1]
      for (let i = 0; i < stops.length - 1; i++) {
        if (t <= stops[i+1]) {
          const p = (t - stops[i]) / (stops[i+1] - stops[i])
          return values[i] + (values[i+1] - values[i]) * p
        }
      }
      return values[values.length - 1]
    }

    const stops = [0, 0.4, 1.0]
    const peakT = (vh - peakH) / 2
    const peakL = (vw - peakW) / 2
    
    targetW = getPoint(t, stops, [rect.width, peakW, rect.width])
    targetH = getPoint(t, stops, [rect.height, peakH, rect.height])
    targetTop = getPoint(t, stops, [rect.top, peakT, rect.top])
    targetLeft = getPoint(t, stops, [rect.left, peakL, rect.left])

    scope.current.style.top = `${targetTop}px`
    scope.current.style.left = `${targetLeft}px`
    scope.current.style.width = `${targetW}px`
    scope.current.style.height = `${targetH}px`
    scope.current.style.borderRadius = `20px`

    // --- Completion Check (The Brake) ---
    if (t >= 0.99 && wheelValue.get() >= budget) {
      snapBack()
    }
    if (t <= 0.01 && wheelValue.get() <= -10) {
      snapBack()
    }
  }

  // Constant Velocity Accumulator
  useAnimationFrame((time) => {
    if (phase.current !== 'zooming') {
      lastFrameTime.current = time
      return
    }

    const target = wheelValue.get()
    const current = visualValue.get()
    const diff = target - current

    // Momentum Lerp: High-Gravity tracking for ultimate smoothness
    const factor = 0.07
    const move = diff * factor

    if (Math.abs(move) > 0.01) {
      visualValue.set(current + move)
      updateZoom()
    } else if (Math.abs(diff) > 0) {
      visualValue.set(target)
      updateZoom()
    }

    lastFrameTime.current = time
  })

  const snapBack = async (immediate = false) => {
    if (!isLocked.current) return
    phase.current = 'snapping-back'

    if (!immediate && originalRect.current && scope.current) {
      const rect = originalRect.current
      await animate(scope.current, {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        borderRadius: 20
      }, { duration: 0.5, ease: [0.16, 1, 0.3, 1] })
    }

    // Restore
    setCloneVisible(false)
    setHideOriginal(false)
    isLocked.current = false
    phase.current = 'idle'
    wheelValue.set(0)
    visualValue.set(0)

    // 1. CLEAR LOCK & UNLOCK Document
    document.documentElement.style.overflow = ''
    document.body.style.overflow = ''
    document.body.style.position = ''
    document.body.style.top = ''
    document.body.style.width = ''

    // 2. INSTANTLY JUMP back to where we started to hide the Hero-snap flash
    window.scrollTo(0, savedScrollY.current)

    // 3. RESTORE native scroll settings
    document.documentElement.style.scrollBehavior = ''
    document.body.style.scrollBehavior = ''

    lastSnapTime.current = Date.now()
  }

  // ─── Global Event Listeners (Wheel, Touch, Resize, Unmount) ──────────────
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (!isLocked.current || phase.current !== 'zooming') return
      e.preventDefault()

      const isMobile = window.innerWidth < 1024
      const budget = isMobile ? MOBILE_BUDGET : DESKTOP_BUDGET
      const currentTarget = wheelValue.get()

      // We don't clamp the delta here anymore because the loop handles the speed limit
      // But we still use a multiplier for responsiveness
      const multiplier = 1.0
      const next = Math.max(-100, Math.min(budget, currentTarget + e.deltaY * multiplier))
      wheelValue.set(next)

      // Snap back if we hit limits AND animation has caught up
      const visualCurrent = visualValue.get()
      if (next >= budget && visualCurrent >= budget - 1) snapBack()
      if (next <= -10 && visualCurrent <= -5) snapBack()
    }

    const onResize = () => {
      if (isLocked.current) snapBack(true)
    }

    let touchStartY = 0
    const onTouchStart = (e: TouchEvent) => { touchStartY = e.touches[0].clientY }
    const onTouchMove = (e: TouchEvent) => {
      if (!isLocked.current || phase.current !== 'zooming') return
      e.preventDefault()
      const delta = touchStartY - e.touches[0].clientY
      touchStartY = e.touches[0].clientY
      const synth = new WheelEvent('wheel', { deltaY: delta * 1 }) // multiplied by 1 for iOS momentum
      onWheel(synth)
    }

    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('resize', onResize)
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: false })

    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      // Safety unmount: ensure body isn't left locked
      if (isLocked.current) {
        document.body.style.overflow = ''
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.width = ''
      }
    }
  }, [])

  return (
    <>
      <section className="relative z-10 border-t border-theme py-12 md:py-20 bg-[var(--bg)] transition-colors duration-500 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-8 items-center">

            {/* Heading Part */}
            <div className="order-1 lg:col-start-1 lg:row-start-1 lg:self-end">
              <TextHeading
                heading={config.heading}
                headingAccent={config.heading_accent}
                headingSuffix={config.heading_suffix}
                isDark={isDark}
                opacity={1}
              />
            </div>

            {/* Image Column */}
            <div
              ref={imageContainerRef}
              className="relative order-2 lg:col-start-2 lg:row-span-2 h-[220px] sm:h-[280px] lg:h-auto lg:aspect-square w-full"
              style={{ opacity: hideOriginal ? 0 : 1 }}
            >
              <div className="relative h-full rounded-[20px] overflow-hidden shadow-2xl">
                <Image
                  src={imageUrl}
                  alt="HAXEUS Quality"
                  fill
                  className="object-cover"
                  priority
                  onError={(e) => {
                    const t = e.target as HTMLImageElement
                    t.src = "/placeholder.svg?height=800&width=600&text=About+HAXEUS"
                  }}
                />
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--accent)]" />
              </div>
            </div>

            {/* Body Column */}
            <div className="order-3 lg:col-start-1 lg:row-start-2 lg:self-start">
              <TextBody
                body1={config.body1}
                body2={config.body2}
                features={config.features}
                ctaText={config.cta_text}
                ctaHref={config.cta_href}
                isDark={isDark}
                opacity={1}
              />
            </div>

          </div>
        </div>
      </section>

      {cloneVisible && createPortal(
        <div
          ref={scope}
          style={{
            zIndex: 9999,
            pointerEvents: 'none',
            overflow: 'hidden',
            backgroundColor: '#00000005', // Subtle underlay
            ...cloneStyle,
          }}
        >
          <div className="relative w-full h-full">
            <Image
              src={imageUrl}
              alt="Haxeus Focus"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--accent)]" />
          </div>
        </div>,
        document.body
      )}
    </>
  )
}

// ─── Public export — picks variant based on device/motion prefs ───────────────

export function AboutSection({ config, isDark = true }: AboutSectionProps) {
  const prefersReduced = useReducedMotion()

  if (prefersReduced) {
    return <OriginalAboutLayout config={config} isDark={isDark} />
  }

  return <ScrollZoomAboutSection config={config} isDark={isDark} />
}
