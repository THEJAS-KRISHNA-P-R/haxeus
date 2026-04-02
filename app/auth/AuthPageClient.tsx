"use client"
import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Eye, EyeOff, Loader2, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function AuthPageClient() {
  const searchParams = useSearchParams()
  const [tab, setTab] = useState<"signin" | "signup">("signin")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const redirectTo = searchParams?.get("redirect") || "/"

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message === "Invalid login credentials"
        ? "Incorrect email or password."
        : error.message)
      setLoading(false)
      return
    }

    if (redirectTo) {
      window.location.href = redirectTo
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // Fire-and-forget welcome email — never block signup on failure
    fetch("/api/auth/welcome", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name: name || null }),
    }).catch(() => { })

    setSuccess("Check your email for a confirmation link.")
    setLoading(false)
  }

  const handleGoogle = async () => {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${siteUrl}/auth/callback?redirect=${redirectTo}` },
    })
  }

  return (
    <div className="min-h-screen lg:h-screen lg:max-h-screen flex w-full bg-theme text-theme lg:overflow-hidden">
      {/* LEFT PANE - CLASSIC HAXEUS BRANDING */}
      <div className="hidden lg:flex w-1/2 h-full flex-col justify-center items-center px-12 pb-12 pt-[88px] border-r border-theme relative bg-theme">
        {/* Top Logo */}
        <div className="absolute top-[88px] left-12 z-10 w-fit">
          <Link href="/" className="text-xl font-bold tracking-widest text-[#e93a3a] inline-block hover:scale-105 transition-transform">HAXEUS</Link>
        </div>

        {/* Center Text */}
        <div className="relative z-10 max-w-lg w-full text-left">
          <h1 className="text-4xl lg:text-6xl font-black italic tracking-tighter leading-[0.95] mb-6 uppercase" style={{ fontFamily: 'var(--font-clash)' }}>
            THE
            <br />
            <span className="text-[var(--accent)]">MOVEMENT</span>
            <br />
            HAS&nbsp; BEGUN.
          </h1>
          <p className="text-theme-2 italic leading-relaxed text-lg font-medium pr-10">
            Join the collective to access exclusive drops, early releases, and limited edition premium streetwear.
          </p>
        </div>

        {/* Bottom Mantra */}
        <div className="absolute bottom-12 left-12 z-10 text-theme-3 font-semibold tracking-[0.4em] uppercase text-xs">
          Art &middot; Identity &middot; Culture
        </div>
      </div>

      {/* RIGHT PANE - AUTHENTICATION */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 lg:w-1/2 h-full relative bg-theme pt-[100px] lg:pt-[88px] pb-8 lg:overflow-y-auto">
        <div className="w-full max-w-[360px] mx-auto z-10 lg:my-auto">

          {/* Mobile Logo Header */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-block hover:scale-105 transition-transform">
              <span className="text-xl font-bold tracking-widest text-[#e93a3a]">HAXEUS</span>
            </Link>
            <h2 className="text-lg font-black italic uppercase mt-3 text-theme" style={{ fontFamily: 'var(--font-clash)' }}>THE MOVEMENT HAS BEGUN.</h2>
          </div>

          <div className="bg-card border border-theme rounded-[1.5rem] p-5 sm:p-6 shadow-2xl relative overflow-hidden">
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-theme mb-1.5 tracking-tight">
                {tab === "signin" ? "Welcome back" : "Create an account"}
              </h2>
              <p className="text-theme-2 text-xs italic">
                {tab === "signin"
                  ? "Enter your details to access your account."
                  : "Join the collective and unlock exclusive access."}
              </p>
            </div>

            {/* Tabs Pill Switcher */}
            <div className="flex p-1 bg-elevated rounded-full mb-6 border border-theme">
              <button
                type="button"
                onClick={() => { setTab("signin"); setError(null); setSuccess(null) }}
                className={`flex-1 py-2 px-4 rounded-full text-sm font-semibold transition-all ${tab === "signin"
                  ? "bg-card text-theme shadow-sm border border-theme/50"
                  : "text-theme-3 hover:text-theme-2"
                  }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setTab("signup"); setError(null); setSuccess(null) }}
                className={`flex-1 py-2 px-4 rounded-full text-sm font-semibold transition-all ${tab === "signup"
                  ? "bg-card text-theme shadow-sm border border-theme/50"
                  : "text-theme-3 hover:text-theme-2"
                  }`}
              >
                Sign Up
              </button>
            </div>

            {/* Error / Success banners */}
            {error && (
              <div className="bg-[#e93a3a]/10 border border-[#e93a3a]/20 text-[#e93a3a] rounded-xl p-4 text-sm mb-6 flex items-center">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-[#22c55e]/10 border border-[#22c55e]/20 text-[#22c55e] rounded-xl p-4 text-sm mb-6 flex items-center">
                {success}
              </div>
            )}

            {/* Form */}
            <form onSubmit={tab === "signin" ? handleSignIn : handleSignUp} className="space-y-4">
              {/* Name */}
              {tab === "signup" && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-theme-2 uppercase tracking-wider ml-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Your name"
                    required
                    className="w-full bg-elevated border border-theme text-theme text-sm placeholder:text-theme-3 rounded-xl px-3.5 py-2.5 focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/30 transition-all outline-none"
                  />
                </div>
              )}

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-theme-2 uppercase tracking-wider ml-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full bg-elevated border border-theme text-theme text-sm placeholder:text-theme-3 rounded-xl px-3.5 py-2.5 focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/30 transition-all outline-none"
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5 relative">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-[10px] font-semibold text-theme-2 uppercase tracking-wider">
                    Password
                  </label>
                  {tab === "signin" && (
                    <button
                      type="button"
                      onClick={async () => {
                        if (!email) { setError("Enter your email first"); return }
                        const { error } = await supabase.auth.resetPasswordForEmail(email)
                        if (error) setError(error.message)
                        else setSuccess("Password reset email sent.")
                      }}
                      className="text-[var(--accent)] hover:opacity-80 transition-opacity text-[10px] tracking-normal font-semibold"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder={tab === "signup" ? "Min. 8 characters" : "Your password"}
                    required
                    minLength={tab === "signup" ? 8 : undefined}
                    className="w-full bg-elevated border border-theme text-theme text-sm placeholder:text-theme-3 rounded-xl px-3.5 py-2.5 pr-10 focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/30 transition-all outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(s => !s)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-theme-3 hover:text-theme-2 transition-colors"
                    tabIndex={-1}
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-[#e93a3a] hover:bg-[#ff4a4a] text-white text-sm font-bold rounded-full py-3 px-5 tracking-widest uppercase shadow-lg shadow-[#e93a3a]/20 hover:-translate-y-0.5 transition-all outline-none disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : (
                  <>
                    {tab === "signin" ? "Access Account" : "Join Collective"}
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-theme border-t border-theme"></div>
              <span className="text-theme-3 text-[10px] font-semibold uppercase tracking-widest">Or</span>
              <div className="flex-1 h-px bg-theme border-t border-theme"></div>
            </div>

            {/* Google */}
            <button
              onClick={handleGoogle}
              className="w-full bg-theme hover:bg-elevated border border-theme hover:border-theme-hover text-theme text-sm font-semibold rounded-full py-2.5 px-5 transition-all flex flex-row items-center justify-center gap-2.5"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" />
                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
                <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" />
                <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" />
              </svg>
              Sign in with Google
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
