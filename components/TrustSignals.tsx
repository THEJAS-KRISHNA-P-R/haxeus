'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { Truck, ShieldCheck, RefreshCcw, CreditCard, Award, Heart } from 'lucide-react'

const USPs = [
  { icon: Truck, label: 'FREE SHIPPING ABOVE ₹1499', color: 'text-[var(--accent)]' },
  { icon: ShieldCheck, label: '100% SECURE CHECKOUT', color: 'text-[var(--accent-aqua)]' },
  { icon: RefreshCcw, label: '10-DAY REPLACEMENT', color: 'text-[#e7bf04]' },
  { icon: Award, label: 'PREMIUM 240GSM COTTON', color: 'text-[#c03c9d]' },
  { icon: CreditCard, label: 'COD AVAILABLE ACROSS INDIA', color: 'text-white' },
  { icon: Heart, label: 'SUPPORT ARTISTIC STREETWEAR', color: 'text-[var(--accent)]' },
]

export function TrustSignals() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <div className="w-full py-12 bg-black/50 border-y border-white/[0.04] overflow-hidden">
      <div className="container mx-auto px-4 mb-2">
         {/* Grid for desktop */}
         <div className="hidden lg:grid grid-cols-3 gap-8">
            {USPs.slice(0, 3).map((usp, i) => (
              <div key={i} className="flex items-center justify-center gap-4 group">
                <div className={`p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] group-hover:bg-white/[0.06] transition-all duration-500 scale-110`}>
                  <usp.icon className={`w-5 h-5 ${usp.color}`} />
                </div>
                <span className="text-[10px] font-black tracking-[0.2em] uppercase italic text-white/50 group-hover:text-white transition-colors duration-500">
                  {usp.label}
                </span>
              </div>
            ))}
         </div>
      </div>

      {/* Marquee for mobile/tablet and extra USPs */}
      <div className="relative flex overflow-x-hidden pt-4">
        <motion.div
          animate={prefersReducedMotion ? { x: 0 } : { x: [0, -1000] }}
          transition={prefersReducedMotion ? { duration: 0 } : {
            x: {
              repeat: Infinity,
              repeatType: 'loop',
              duration: 30,
              ease: 'linear',
            },
          }}
          layout="position"
          className="flex whitespace-nowrap gap-12 items-center"
        >
          {[...USPs, ...USPs].map((usp, i) => (
            <div key={i} className="flex items-center gap-4">
              <usp.icon className={`w-4 h-4 ${usp.color}`} />
              <span className="text-[9px] font-bold tracking-[0.25em] uppercase italic text-white/40">
                {usp.label}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-white/10" />
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
