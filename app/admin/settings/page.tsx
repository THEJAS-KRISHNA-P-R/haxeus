"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Save, Loader2, Check } from "lucide-react"

interface SettingsState {
  store_name: string
  store_email: string
  currency: string
  shipping_rate: number
  free_shipping_above: number
  cod_enabled: boolean
  maintenance_mode: boolean
  notification_email: string
}

const defaults: SettingsState = {
  store_name: "HAXEUS",
  store_email: "admin@haxeus.com",
  currency: "INR",
  shipping_rate: 99,
  free_shipping_above: 999,
  cod_enabled: true,
  maintenance_mode: false,
  notification_email: "admin@haxeus.com",
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsState>(defaults)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase.from("store_settings").select("key, value")
      if (data) {
        const merged = { ...defaults }
        data.forEach(row => {
          const v = row.value
          if (row.key in merged) {
            (merged as any)[row.key] = typeof v === "string" ? v : v
          }
        })
        setSettings(merged)
      }
      setLoading(false)
    }
    fetchSettings()
  }, [])

  const save = async () => {
    setSaving(true)
    setError(null)
    const rows = Object.entries(settings).map(([key, value]) => ({
      key,
      value: typeof value === "string" ? `"${value}"` : JSON.stringify(value),
      updated_at: new Date().toISOString(),
    }))

    const { error: e } = await supabase
      .from("store_settings")
      .upsert(rows, { onConflict: "key" })

    if (e) { setError(e.message); setSaving(false); return }
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const set = (k: keyof SettingsState, v: any) =>
    setSettings(s => ({ ...s, [k]: v }))

  const inputStyle = {
    background: "var(--bg-elevated)",
    border: "1px solid var(--border)",
    color: "var(--text)",
    borderRadius: "0.5rem",
    padding: "0.5rem 0.75rem",
    fontSize: "0.875rem",
    outline: "none",
    width: "100%",
  }

  const Toggle = ({ k }: { k: "cod_enabled" | "maintenance_mode" }) => (
    <button
      onClick={() => set(k, !settings[k])}
      style={{
        width: "40px", height: "22px", borderRadius: "11px",
        background: settings[k] ? "var(--accent)" : "var(--bg-elevated)",
        border: "1px solid var(--border)",
        position: "relative", transition: "background 0.2s", flexShrink: 0,
      }}
    >
      <span style={{
        position: "absolute", top: "2px",
        left: settings[k] ? "19px" : "2px",
        width: "16px", height: "16px",
        background: "#fff", borderRadius: "50%",
        transition: "left 0.2s",
      }} />
    </button>
  )

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-[60vh]">
      <Loader2 size={32} style={{ color: "var(--accent)" }} className="animate-spin" />
    </div>
  )

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 style={{ color: "var(--text)" }} className="text-2xl font-bold">Settings</h1>
          <p style={{ color: "var(--text-2)" }} className="text-sm mt-1">Store configuration — saved to database</p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          style={{ background: saved ? "#22c55e" : "var(--accent)", color: "#fff" }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <Check size={14} /> : <Save size={14} />}
          {saved ? "Saved!" : saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {error && (
        <div className="mb-4 px-4 py-2 rounded-lg bg-red-500/10 text-red-500 text-sm border border-red-500/20">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* Store Info */}
        <Section title="Store Information">
          <Field label="Store Name">
            <input style={inputStyle} value={settings.store_name}
              onChange={e => set("store_name", e.target.value)}
              onFocus={e => (e.target.style.borderColor = "var(--accent)")}
              onBlur={e => (e.target.style.borderColor = "var(--border)")} />
          </Field>
          <Field label="Store Email">
            <input type="email" style={inputStyle} value={settings.store_email}
              onChange={e => set("store_email", e.target.value)}
              onFocus={e => (e.target.style.borderColor = "var(--accent)")}
              onBlur={e => (e.target.style.borderColor = "var(--border)")} />
          </Field>
          <Field label="Currency">
            <select style={{ ...inputStyle, cursor: "pointer" }}
              value={settings.currency}
              onChange={e => set("currency", e.target.value)}>
              <option value="INR">INR — Indian Rupee (₹)</option>
              <option value="USD">USD — US Dollar ($)</option>
              <option value="EUR">EUR — Euro (€)</option>
            </select>
          </Field>
        </Section>

        {/* Shipping */}
        <Section title="Shipping">
          <Field label="Standard Shipping Rate (₹)">
            <input type="number" min={0} style={inputStyle}
              value={settings.shipping_rate}
              onChange={e => set("shipping_rate", Number(e.target.value))}
              onFocus={e => (e.target.style.borderColor = "var(--accent)")}
              onBlur={e => (e.target.style.borderColor = "var(--border)")} />
          </Field>
          <Field label="Free Shipping Above (₹)">
            <input type="number" min={0} style={inputStyle}
              value={settings.free_shipping_above}
              onChange={e => set("free_shipping_above", Number(e.target.value))}
              onFocus={e => (e.target.style.borderColor = "var(--accent)")}
              onBlur={e => (e.target.style.borderColor = "var(--border)")} />
          </Field>
          <Field label="Cash on Delivery">
            <div className="flex items-center gap-3">
              <Toggle k="cod_enabled" />
              <span style={{ color: "var(--text-2)" }} className="text-sm">
                {settings.cod_enabled ? "Enabled" : "Disabled"}
              </span>
            </div>
          </Field>
        </Section>

        {/* Notifications */}
        <Section title="Notifications">
          <Field label="Admin Notification Email">
            <input type="email" style={inputStyle}
              value={settings.notification_email}
              onChange={e => set("notification_email", e.target.value)}
              onFocus={e => (e.target.style.borderColor = "var(--accent)")}
              onBlur={e => (e.target.style.borderColor = "var(--border)")} />
          </Field>
        </Section>

        {/* Danger zone */}
        <Section title="Danger Zone">
          <Field label="Maintenance Mode"
            description="Hides the store from customers — only admins can access">
            <div className="flex items-center gap-3">
              <Toggle k="maintenance_mode" />
              <span style={{
                color: settings.maintenance_mode ? "var(--accent)" : "var(--text-2)"
              }} className="text-sm font-medium">
                {settings.maintenance_mode ? "ACTIVE — Store is hidden" : "Disabled"}
              </span>
            </div>
          </Field>
        </Section>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "1rem" }}
      className="p-6">
      <h3 style={{ color: "var(--text)", borderBottom: "1px solid var(--border)" }}
        className="text-sm font-semibold uppercase tracking-wider pb-3 mb-4">
        {title}
      </h3>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

function Field({ label, description, children }: {
  label: string; description?: string; children: React.ReactNode
}) {
  return (
    <div>
      <label style={{ color: "var(--text-2)" }} className="block text-xs font-medium mb-1.5">
        {label}
      </label>
      {children}
      {description && (
        <p style={{ color: "var(--text-3)" }} className="text-xs mt-1">{description}</p>
      )}
    </div>
  )
}
