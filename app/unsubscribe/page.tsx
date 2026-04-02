"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Mail, CheckCircle2, AlertCircle, Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"

function UnsubscribeContent() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const emailParam = searchParams.get("email")
    if (emailParam) {
      setEmail(emailParam)
    }
  }, [searchParams])

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!email) return

    setStatus("loading")
    try {
      const res = await fetch("/api/newsletter/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to unsubscribe")

      setStatus("success")
      setMessage(data.message || "You've been successfully unsubscribed from our newsletter.")
    } catch (err) {
      console.error(err)
      setStatus("error")
      setMessage((err as Error).message)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-white flex items-center justify-center p-6 selection:bg-[#e93a3a]/30">
      {/* Background Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#e93a3a]/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#e93a3a]/5 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="mb-10 text-center">
          <Link href="/" className="inline-block group">
            <h1 className="text-3xl font-black tracking-tighter italic mb-1 group-hover:text-[#e93a3a] transition-colors">HAXEUS</h1>
          </Link>
        </div>

        <div className="bg-[var(--bg)] border border-white/[0.05] rounded-[32px] p-8 md:p-10 shadow-2xl shadow-black">
          {status === "success" ? (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="text-green-500" size={32} />
              </div>
              <h2 className="text-2xl font-bold mb-4">You're unsubscribed</h2>
              <p className="text-white/60 text-sm leading-relaxed mb-8">
                {message} We're sorry to see you go, but we respect your inbox.
              </p>
              <Link href="/products" className="block w-full py-4 bg-white text-black rounded-2xl font-bold hover:bg-white/90 transition-all text-center">
                Back to Shop
              </Link>
            </motion.div>
          ) : (
            <>
              <h2 className="text-2xl font-bold mb-2">Unsubscribe</h2>
              <p className="text-white/50 text-sm mb-8">
                Enter your email address to stop receiving updates from HAXEUS.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-[#e93a3a] transition-colors">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-white/[0.03] border border-white/[0.08] focus:border-[#e93a3a] rounded-2xl py-4 pl-12 pr-4 outline-none transition-all placeholder:text-white/20"
                  />
                </div>

                {status === "error" && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm"
                  >
                    <AlertCircle size={16} />
                    <span>{message}</span>
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={status === "loading" || !email}
                  className="w-full h-14 bg-[#e93a3a] text-white rounded-2xl font-bold hover:bg-[#e93a3a]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {status === "loading" ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    "Confirm Unsubscribe"
                  )}
                </button>
              </form>

              <div className="mt-8 pt-8 border-t border-white/[0.05] text-center">
                <Link href="/" className="text-white/40 text-sm hover:text-white transition-colors flex items-center justify-center gap-2">
                  <ArrowLeft size={14} />
                  Return to Home
                </Link>
              </div>
            </>
          )}
        </div>

        <p className="text-center mt-10 text-white/20 text-[10px] uppercase tracking-widest font-medium">
          © 2026 HAXEUS · MADE WITH OBSESSION IN INDIA
        </p>
      </motion.div>
    </div>
  )
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--bg)] flex items-center justify-center"><Loader2 className="text-[#e93a3a] animate-spin" size={40} /></div>}>
      <UnsubscribeContent />
    </Suspense>
  )
}

