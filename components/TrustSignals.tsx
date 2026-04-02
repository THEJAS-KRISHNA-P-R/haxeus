'use client'

import { useState, useEffect } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useTheme } from '@/components/ThemeProvider'

export function TrustSignals() {
  const prefersReducedMotion = useReducedMotion()
  const { theme } = useTheme()
  const isDark = theme === 'dark' || !theme
  const [shippingThreshold, setShippingThreshold] = useState<number>(1499)

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(data => {
        if (data.free_shipping_above) setShippingThreshold(data.free_shipping_above)
      })
      .catch(console.error)
  }, [])

  const items = [
    { text: `FREE SHIPPING ABOVE ₹${shippingThreshold}`, style: 'bold' },
    { text: '100% SECURE CHECKOUT', style: 'italic' },
    { text: '10-DAY REPLACEMENT', style: 'bold' },
    { text: 'PREMIUM 240 GSM COTTON', style: 'italic' },
    { text: 'SUPPORT ARTISTIC STREETWEAR', style: 'italic' },
  ]

  const track = [...items, ...items, ...items]

  return (
    /*
     * overflow-hidden on the SECTION clips horizontal bleed.
     * Extra vertical padding (py-10) gives the rotated band room
     * to breathe so the angled corners never get cut off.
     */
    <section
      className="w-full overflow-hidden"
      style={{ paddingBlock: '2.5rem' }}
      aria-label="Trust signals"
    >
      {/* Band is wider than viewport and rotated; translate centres it */}
      <div
        style={{
          width: '130vw',
          marginLeft: '-15vw',
          transform: 'rotate(-2.5deg)',
          background: isDark
            ? 'linear-gradient(90deg, #c0182a 0%, #e93a3a 50%, #c0182a 100%)'
            : 'linear-gradient(90deg, #d42030 0%, #e93a3a 50%, #d42030 100%)',
          boxShadow: isDark
            ? '0 6px 32px rgba(233,58,58,0.45), 0 1px 0 rgba(255,255,255,0.08) inset'
            : '0 6px 32px rgba(233,58,58,0.3)',
          padding: '14px 0',
        }}
      >
        <motion.div
          animate={prefersReducedMotion ? { x: 0 } : { x: ['0%', '-33.33%'] }}
          transition={prefersReducedMotion ? { duration: 0 } : {
            x: {
              repeat: Infinity,
              repeatType: 'loop',
              duration: 30,
              ease: 'linear',
            },
          }}
          className="flex whitespace-nowrap items-center w-max"
        >
          {track.map((item, i) => (
            <span key={i} className="flex items-center">
              <span
                style={{
                  fontFamily: "var(--font-barlow), Impact, sans-serif",
                  fontWeight: item.style === 'bold' ? 800 : 700,
                  fontStyle: item.style === 'italic' ? 'italic' : 'normal',
                  fontSize: '13px',
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  color: '#ffffff',
                  textShadow: '0 1px 4px rgba(0,0,0,0.35)',
                  padding: '0 1.5rem',
                  lineHeight: 1,
                }}
              >
                {item.text}
              </span>
              <span
                style={{
                  color: 'rgba(255,255,255,0.55)',
                  fontSize: '1.1rem',
                  lineHeight: 1,
                  userSelect: 'none',
                }}
                aria-hidden="true"
              >
                •
              </span>
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
