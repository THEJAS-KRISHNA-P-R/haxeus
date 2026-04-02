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
    <div className="w-full py-12 bg-card overflow-hidden">
      <div className="container mx-auto px-4 mb-4">
         {/* Grid for desktop */}
         <div className="hidden lg:grid grid-cols-3 gap-8">
            {USPs.slice(0, 3).map((usp, i) => (
              <div key={i} className="flex items-center justify-center gap-5 group">
                <div className="p-3.5 rounded-2xl bg-theme-2/5 border border-theme-hover group-hover:bg-theme-2/10 transition-all duration-500 hover:scale-105">
                  <usp.icon className={`w-6 h-6 ${usp.color}`} />
                </div>
                <span className="text-[11px] font-black tracking-[0.25em] uppercase italic text-theme group-hover:text-accent transition-colors duration-500">
                  {usp.label}
                </span>
              </div>
            ))}
         </div>
      </div>

      {/* Marquee for mobile/tablet and extra USPs */}
      <div className="relative flex overflow-hidden pt-4 mask-fade-edges">
        <motion.div
          animate={prefersReducedMotion ? { x: 0 } : { x: ["0%", "-50%"] }}
          transition={prefersReducedMotion ? { duration: 0 } : {
            x: {
              repeat: Infinity,
              repeatType: 'loop',
              duration: 35,
              ease: 'linear',
            },
          }}
          className="flex whitespace-nowrap gap-16 items-center w-max"
        >
          {/* Double the array for seamless looping */}
          {[...USPs, ...USPs].map((usp, i) => (
            <div key={i} className="flex items-center gap-6">
              <usp.icon className={`w-5 h-5 ${usp.color}`} />
              <span className="text-[10px] font-extrabold tracking-[0.3em] uppercase italic text-theme-2">
                {usp.label}
              </span>
              <span className="w-2 h-2 rounded-full bg-accent/20 border border-accent/30" />
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
