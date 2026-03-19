"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useTheme } from "@/components/ThemeProvider"
import { X, CheckCircle, AlertTriangle, Loader } from "lucide-react"
import type { Product } from "@/lib/supabase"
import { supabase } from "@/lib/supabase"

interface PreorderModalProps {
  item: Product
  isOpen: boolean
  onClose: () => void
}

type Status = "idle" | "loading" | "success" | "duplicate" | "error"

export function PreorderModal({ item, isOpen, onClose }: PreorderModalProps) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const isDark = !mounted ? true : theme === "dark"

  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [status, setStatus] = useState<Status>("idle")

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setEmail(user.email || "")
      }
    }
    checkUser()
  }, [])

  useEffect(() => {
    if (isOpen) {
      setStatus("idle")
      setSelectedSize(null)
    }
  }, [isOpen])

  const handleSubmit = async () => {
    if (!email) {
      setStatus("error")
      return
    }
    setStatus("loading")
    try {
      const response = await fetch("/api/preorders/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: item.id,
          email,
          name,
          size: selectedSize,
        }),
      })

      if (response.ok) {
        setStatus("success")
        setTimeout(() => {
          onClose()
        }, 3000)
      } else {
        const { error } = await response.json()
        if (error === "already_registered") {
          setStatus("duplicate")
        } else {
          setStatus("error")
        }
      }
    } catch (e) {
      setStatus("error")
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className={`relative rounded-2xl p-8 max-w-md w-full mx-4 ${isDark ? 'bg-[#0a0a0a]' : 'bg-[#f5f4f0]'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={onClose} className={`absolute top-4 right-4 ${isDark ? 'text-white/50' : 'text-black/55'} hover:text-[#e93a3a]`}>
              <X size={24} />
            </button>

            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>Register for: {item.name}</h2>
            <p className={`mt-2 ${isDark ? 'text-white/65' : 'text-black/65'}`}>You'll be notified when this item is available for purchase.</p>

            <div className="mt-6 space-y-4">
              <div>
                <label htmlFor="email" className={`block text-sm font-medium ${isDark ? 'text-white/50' : 'text-black/55'}`}>Email (required)</label>
                <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className={`mt-1 block w-full rounded-xl border px-4 py-2 ${isDark ? 'bg-transparent border-white/[0.12] text-white placeholder:text-white/30' : 'bg-transparent border-black/[0.12] text-black placeholder:text-black/30'} focus:border-[#e93a3a] focus:ring-[#e93a3a]`} />
              </div>
              <div>
                <label htmlFor="name" className={`block text-sm font-medium ${isDark ? 'text-white/50' : 'text-black/55'}`}>Name (optional)</label>
                <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className={`mt-1 block w-full rounded-xl border px-4 py-2 ${isDark ? 'bg-transparent border-white/[0.12] text-white placeholder:text-white/30' : 'bg-transparent border-black/[0.12] text-black placeholder:text-black/30'} focus:border-[#e93a3a] focus:ring-[#e93a3a]`} />
              </div>
              {item.available_sizes && item.available_sizes.length > 0 && (
                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-white/50' : 'text-black/55'}`}>Size (optional)</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {item.available_sizes.map(size => (
                      <button 
                        key={size}
                        onClick={() => setSelectedSize(size === selectedSize ? null : size)}
                        className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${selectedSize === size ? 'bg-[#e93a3a] text-white' : (isDark ? 'bg-white/10 text-white/80 hover:bg-white/20' : 'bg-black/10 text-black/80 hover:bg-black/20')}`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8">
              <button
                onClick={handleSubmit}
                disabled={status === 'loading'}
                className="w-full bg-[#e93a3a] hover:bg-[#ff4a4a] text-white font-bold rounded-full tracking-wide shadow-lg shadow-[#e93a3a]/20 py-3 flex items-center justify-center disabled:opacity-50"
              >
                {status === 'loading' ? <Loader className="animate-spin" /> : "Notify Me"}
              </button>
            </div>

            <AnimatePresence>
              {status === 'success' && (
                <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="mt-4 flex items-center gap-2 text-emerald-400">
                  <CheckCircle size={18} />
                  <p>🎉 You're on the list! We'll email you when it drops.</p>
                </motion.div>
              )}
              {status === 'duplicate' && (
                <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="mt-4 flex items-center gap-2 text-[#e7bf04]">
                  <AlertTriangle size={18} />
                  <p>You're already registered for this drop!</p>
                </motion.div>
              )}
              {status === 'error' && (
                <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="mt-4 flex items-center gap-2 text-[#e93a3a]">
                  <AlertTriangle size={18} />
                  <p>Something went wrong. Please check your email and try again.</p>
                </motion.div>
              )}
            </AnimatePresence>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
