'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, X, Smartphone, Zap } from 'lucide-react'
import { usePWA } from '@/lib/pwa'

export function InstallPrompt() {
  const { canInstall, install, isInstalled } = usePWA()
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Only show if the prompt is available, not already installed, and on a mobile device
    const isMobile = window.innerWidth < 1024
    
    if (canInstall && !isInstalled && isMobile) {
      // Delay to ensure user is engaged
      const timer = setTimeout(() => setShow(true), 3000)
      return () => clearTimeout(timer)
    }
  }, [canInstall, isInstalled])

  if (!show) return null

  const handleInstall = async () => {
    const success = await install()
    if (success) setShow(false)
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed bottom-6 left-4 right-4 z-[100] md:left-auto md:right-8 md:w-96"
        >
          <div className="relative overflow-hidden rounded-[2rem] bg-[#0d0d0d] border border-white/10 p-6 shadow-2xl shadow-black/50">
            {/* Background elements */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-[var(--accent)]/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[var(--accent-aqua)]/10 rounded-full blur-3xl" />

            <div className="relative z-10">
              <button 
                onClick={() => setShow(false)}
                className="absolute -top-2 -right-2 p-2 text-white/40 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-start gap-5">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 group">
                   <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent)] to-[#f00078] flex items-center justify-center text-white scale-110 shadow-lg group-hover:scale-125 transition-transform duration-500">
                      <Zap className="w-5 h-5 fill-current" />
                   </div>
                </div>

                <div className="space-y-1 pr-4">
                  <h3 className="text-lg font-black italic tracking-tighter text-white uppercase">
                    Install <span className="text-[var(--accent)]">HAXEUS</span>
                  </h3>
                  <p className="text-xs text-white/50 leading-relaxed font-medium italic">
                    Add to your home screen for faster access, offline shopping, and exclusive drops.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3">
                <button
                  onClick={handleInstall}
                  className="w-full bg-white text-black py-4 rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[var(--accent)] hover:text-white transition-all duration-500 flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  INSTALL NOW
                </button>
                
                <div className="flex items-center justify-center gap-2 text-[8px] font-bold text-white/30 uppercase tracking-widest pt-2">
                  <Smartphone className="w-3 h-3" />
                  No App Store Required
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
