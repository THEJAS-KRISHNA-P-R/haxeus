"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function JoinMovementCTA() {
  return (
    <section className="relative overflow-hidden bg-[#c62828] py-24 md:py-32">
      {/* Enhanced Grid Overlay */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(12, 12, 12, 1) 1px, transparent 1px), 
                            linear-gradient(to bottom, rgba(12, 12, 12, 1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="flex flex-col items-center gap-8"
        >
          <div className="space-y-4">
            <h2 className="font-display text-5xl font-black uppercase tracking-[-0.04em] text-white md:text-8xl">
              The &nbsp;Movement <br className="hidden md:block" /> &nbsp;is &nbsp;Here
            </h2>
            <p className="mx-auto max-w-xl text-lg font-medium text-white/70 md:text-xl">
              Premium artistic streetwear, designed for the obsessive. Join us at the edge of culture.
            </p>
          </div>

          <Link
            href="/products"
            className="group relative flex items-center gap-3 overflow-hidden rounded-full bg-white px-8 py-4 text-sm font-bold uppercase tracking-widest text-[#7f1d1d] transition-all hover:pr-10 active:scale-95"
          >
            Shop the Collection
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
