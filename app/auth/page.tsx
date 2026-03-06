"use client"
import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Eye, EyeOff, Loader2 } from "lucide-react"

function AuthForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [tab, setTab] = useState<"signin" | "signup">("signin")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const redirectTo = searchParams.get("redirect") || "/"

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "var(--bg-elevated, #f5f5f5)",
    border: "1px solid var(--border, #e0e0e0)",
    borderRadius: "0.625rem",
    padding: "0.75rem 1rem",
    fontSize: "0.9375rem",
    color: "var(--text, #0a0a0a)",
    outline: "none",
    transition: "border-color 0.15s",
  }

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

    router.push(redirectTo)
    router.refresh()
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

    setSuccess("Check your email for a confirmation link.")
    setLoading(false)
  }

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?redirect=${redirectTo}` },
    })
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--bg, #f5f4f0)" }}
    >
      <div
        style={{
          background: "var(--bg-card, #ffffff)",
          border: "1px solid var(--border, #e8e8e8)",
          borderRadius: "1.25rem",
          boxShadow: "0 4px 32px rgba(0,0,0,0.08)",
          width: "100%",
          maxWidth: "440px",
          padding: "2.5rem",
        }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1
            style={{ color: "var(--text, #0a0a0a)", fontSize: "1.5rem", fontWeight: 700 }}
            className="mb-1"
          >
            Welcome to{" "}
            <span style={{ color: "var(--accent, #e93a3a)" }}>HAXEUS</span>
          </h1>
          <p style={{ color: "var(--text-2, #52525b)", fontSize: "0.9rem" }}>
            {tab === "signin"
              ? "Sign in to your account"
              : "Create a new account"}
          </p>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            background: "var(--bg-elevated, #f0f0ec)",
            borderRadius: "0.75rem",
            padding: "4px",
            marginBottom: "1.75rem",
          }}
        >
          {(["signin", "signup"] as const).map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(null); setSuccess(null) }}
              style={{
                padding: "0.5rem",
                borderRadius: "0.5rem",
                fontSize: "0.875rem",
                fontWeight: 600,
                transition: "all 0.15s",
                background: tab === t ? "var(--bg-card, #ffffff)" : "transparent",
                color: tab === t ? "var(--text, #0a0a0a)" : "var(--text-3, rgba(0,0,0,0.4))",
                boxShadow: tab === t ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              {t === "signin" ? "Sign In" : "Sign Up"}
            </button>
          ))}
        </div>

        {/* Error / Success banners */}
        {error && (
          <div
            style={{
              background: "rgba(233,58,58,0.08)",
              border: "1px solid rgba(233,58,58,0.25)",
              borderRadius: "0.625rem",
              padding: "0.75rem 1rem",
              color: "var(--accent, #e93a3a)",
              fontSize: "0.875rem",
              marginBottom: "1.25rem",
            }}
          >
            {error}
          </div>
        )}
        {success && (
          <div
            style={{
              background: "rgba(34,197,94,0.08)",
              border: "1px solid rgba(34,197,94,0.25)",
              borderRadius: "0.625rem",
              padding: "0.75rem 1rem",
              color: "#16a34a",
              fontSize: "0.875rem",
              marginBottom: "1.25rem",
            }}
          >
            {success}
          </div>
        )}

        {/* Form */}
        <form onSubmit={tab === "signin" ? handleSignIn : handleSignUp}>
          <div className="space-y-4">

            {/* Name — sign up only */}
            {tab === "signup" && (
              <div>
                <label
                  style={{
                    display: "block",
                    color: "var(--text-2, #52525b)",
                    fontSize: "0.8125rem",
                    fontWeight: 500,
                    marginBottom: "0.375rem",
                  }}
                >
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your name"
                  required
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = "var(--accent, #e93a3a)")}
                  onBlur={e => (e.target.style.borderColor = "var(--border, #e0e0e0)")}
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label
                style={{
                  display: "block",
                  color: "var(--text-2, #52525b)",
                  fontSize: "0.8125rem",
                  fontWeight: 500,
                  marginBottom: "0.375rem",
                }}
              >
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = "var(--accent, #e93a3a)")}
                onBlur={e => (e.target.style.borderColor = "var(--border, #e0e0e0)")}
              />
            </div>

            {/* Password */}
            <div>
              <label
                style={{
                  display: "block",
                  color: "var(--text-2, #52525b)",
                  fontSize: "0.8125rem",
                  fontWeight: 500,
                  marginBottom: "0.375rem",
                }}
              >
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={tab === "signup" ? "Min. 8 characters" : "Your password"}
                  required
                  minLength={tab === "signup" ? 8 : undefined}
                  style={{ ...inputStyle, paddingRight: "2.75rem" }}
                  onFocus={e => (e.target.style.borderColor = "var(--accent, #e93a3a)")}
                  onBlur={e => (e.target.style.borderColor = "var(--border, #e0e0e0)")}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(s => !s)}
                  style={{
                    position: "absolute",
                    right: "0.75rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--text-3, rgba(0,0,0,0.35))",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    display: "flex",
                  }}
                  tabIndex={-1}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Forgot password — sign in only */}
            {tab === "signin" && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={async () => {
                    if (!email) { setError("Enter your email first"); return }
                    const { error } = await supabase.auth.resetPasswordForEmail(email)
                    if (error) setError(error.message)
                    else setSuccess("Password reset email sent.")
                  }}
                  style={{
                    color: "var(--accent, #e93a3a)",
                    fontSize: "0.8125rem",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                background: "var(--accent, #e93a3a)",
                color: "#ffffff",
                border: "none",
                borderRadius: "0.75rem",
                padding: "0.875rem",
                fontSize: "0.9375rem",
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                transition: "opacity 0.15s",
                marginTop: "0.5rem",
              }}
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {tab === "signin" ? "Sign In" : "Create Account"}
            </button>
          </div>
        </form>

        {/* Divider */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            margin: "1.5rem 0",
          }}
        >
          <div style={{ flex: 1, height: "1px", background: "var(--border, #e0e0e0)" }} />
          <span style={{ color: "var(--text-3, rgba(0,0,0,0.35))", fontSize: "0.8125rem" }}>
            Or continue with
          </span>
          <div style={{ flex: 1, height: "1px", background: "var(--border, #e0e0e0)" }} />
        </div>

        {/* Google */}
        <button
          onClick={handleGoogle}
          style={{
            width: "100%",
            background: "var(--bg-card, #ffffff)",
            border: "1px solid var(--border, #e0e0e0)",
            borderRadius: "0.75rem",
            padding: "0.75rem",
            fontSize: "0.9375rem",
            fontWeight: 600,
            color: "var(--text, #0a0a0a)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.625rem",
            transition: "border-color 0.15s, background 0.15s",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-elevated, #f5f5f5)")}
          onMouseLeave={e => (e.currentTarget.style.background = "var(--bg-card, #ffffff)")}
        >
          {/* Google SVG icon */}
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" />
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
            <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" />
            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" />
          </svg>
          Sign in with Google
        </button>
      </div>
    </div>
  )
}

// Suspense required because useSearchParams needs it in Next.js 14+
export default function AuthPage() {
  return (
    <Suspense>
      <AuthForm />
    </Suspense>
  )
}
