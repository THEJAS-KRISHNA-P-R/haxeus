"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Save, Check, Shield, Bell, Truck, Store, LucideIcon } from "lucide-react"
import {
    AdminCard,
    AdminPageHeader,
    AdminButton,
    AdminInput
} from "@/components/admin/AdminUI"
import { cn } from "@/lib/utils"

interface SettingsState {
    store_name: string
    store_email: string
    currency: string
    shipping_rate: number
    free_shipping_above: number
    cod_enabled: boolean
    maintenance_mode: boolean
    notification_email: string
    // Email Capture Settings
    email_popup_enabled: boolean
    email_popup_title: string
    email_popup_subtitle: string
    email_popup_coupon_id: string 
}

const defaults: SettingsState = {
    store_name: "HAXEUS",
    store_email: "haxeus.in@gmail.com",
    currency: "INR",
    shipping_rate: 150,
    free_shipping_above: 1000,
    cod_enabled: false,
    maintenance_mode: false,
    notification_email: "haxeus.in@gmail.com",
    email_popup_enabled: true,
    email_popup_title: "Get 10% off your first order",
    email_popup_subtitle: "Join the list for early drop access and your welcome code.",
    email_popup_coupon_id: "",
}

export default function SettingsContent() {
    const [settings, setSettings] = useState<SettingsState>(defaults)
    const [coupons, setCoupons] = useState<{ id: string; code: string }[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            // 1. Fetch Settings
            const { data: settingsData } = await supabase.from("store_settings").select("key, value")
            if (settingsData) {
                const merged = { ...defaults }
                settingsData.forEach(row => {
                    let v = row.value
                    if (typeof v === "string") {
                        try { v = JSON.parse(v) } catch { }
                    }
                    if (row.key in merged) {
                        Object.assign(merged, { [row.key]: v });
                    }
                })
                setSettings(merged)
            }

            // 2. Fetch Active Coupons
            const { data: couponsData } = await supabase
                .from("coupons")
                .select("id, code")
                .eq("is_active", true)
            
            if (couponsData) {
                setCoupons(couponsData)
            }

            setLoading(false)
        }
        fetchData()
    }, [])

    const save = async () => {
        setSaving(true)
        setError(null)
        const rows = Object.entries(settings).map(([key, value]) => ({
            key,
            value, // Let Supabase client handle jsonb serialization
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

    const set = (k: keyof SettingsState, v: string | number | boolean) =>
        setSettings(s => ({ ...s, [k]: v }))

    const Toggle = ({ k, label }: { k: "cod_enabled" | "maintenance_mode", label: string }) => (
        <div className="flex items-center justify-between p-4 bg-[var(--bg-elevated)] rounded-2xl border border-[var(--border)]">
            <div>
                <p style={{ color: "var(--text)" }} className="text-sm font-bold">{label}</p>
                <p style={{ color: "var(--text-3)" }} className="text-[10px] font-medium mt-0.5">
                    {k === "cod_enabled" ? "Allow customers to pay on delivery." : "Restrict store access to admins only."}
                </p>
            </div>
            <button
                onClick={() => set(k, !settings[k])}
                className={cn(
                    "relative w-12 h-6 rounded-full transition-colors border border-[var(--border)]",
                    settings[k] ? "bg-[var(--accent)]" : "bg-[var(--bg-elevated)]"
                )}
            >
                <div className={cn(
                    "absolute top-1 w-3.5 h-3.5 bg-white rounded-full transition-all",
                    settings[k] ? "left-7" : "left-1"
                )} />
            </button>
        </div>
    )

    if (loading) return (
        <div className="p-8 flex items-center justify-center min-h-[60vh]">
            <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
        </div>
    )

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8 pb-20">
            <div className="flex items-start justify-between">
                <AdminPageHeader
                    title="Settings"
                    subtitle="Global configuration for your e-commerce engine."
                />
                <AdminButton
                    onClick={save}
                    loading={saving}
                    icon={saved ? Check : Save}
                    className={cn(saved && "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20 shadow-lg")}
                >
                    {saved ? "Saved!" : "Save Changes"}
                </AdminButton>
            </div>

            {error && (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold uppercase tracking-widest text-center">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Store Info */}
                <div className="space-y-6">
                    <SectionTitle icon={Store} title="Store Profile" />
                    <AdminCard className="p-6 space-y-5">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-3)] px-1">Store Name</label>
                            <AdminInput
                                value={settings.store_name}
                                onChange={e => set("store_name", e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-3)] px-1">Public Support Email</label>
                            <AdminInput
                                type="email"
                                value={settings.store_email}
                                onChange={e => set("store_email", e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-3)] px-1">Base Currency</label>
                            <select
                                style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text)", borderRadius: "1rem", padding: "0.875rem 1.25rem", fontSize: "0.875rem", outline: "none", width: "100%", cursor: "pointer" }}
                                className="focus:border-[var(--accent)] transition-all font-medium"
                                value={settings.currency}
                                onChange={e => set("currency", e.target.value)}
                            >
                                <option value="INR">INR — Indian Rupee (₹)</option>
                                <option value="USD">USD — US Dollar ($)</option>
                                <option value="EUR">EUR — Euro (€)</option>
                            </select>
                        </div>
                    </AdminCard>

                    <SectionTitle icon={Bell} title="Notifications" />
                    <AdminCard className="p-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-3)] px-1">Admin Alert Email</label>
                            <AdminInput
                                type="email"
                                value={settings.notification_email}
                                onChange={e => set("notification_email", e.target.value)}
                                placeholder="alerts@haxeus.in"
                            />
                        </div>
                    </AdminCard>
                </div>

                {/* Logistics & Safety */}
                <div className="space-y-6">
                    <SectionTitle icon={Truck} title="Logistics & Payments" />
                    <AdminCard className="p-6 space-y-5">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-3)] px-1">Standard Shipping Rate (₹)</label>
                            <AdminInput
                                type="number"
                                value={settings.shipping_rate}
                                onChange={e => set("shipping_rate", Number(e.target.value))}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-3)] px-1">Free Shipping Threshold (₹)</label>
                            <AdminInput
                                type="number"
                                value={settings.free_shipping_above}
                                onChange={e => set("free_shipping_above", Number(e.target.value))}
                            />
                        </div>
                        <Toggle k="cod_enabled" label="Enable Cash on Delivery" />
                    </AdminCard>

                    <SectionTitle icon={Bell} title="Marketing & Promos" />
                    <AdminCard className="p-6 space-y-5">
                        <div className="flex items-center justify-between p-4 bg-[var(--bg-elevated)] rounded-2xl border border-[var(--border)]">
                            <div>
                                <p style={{ color: "var(--text)" }} className="text-sm font-bold">Email Signup Popup</p>
                                <p style={{ color: "var(--text-3)" }} className="text-[10px] font-medium mt-0.5">Show a discount popup to new visitors.</p>
                            </div>
                            <button
                                onClick={() => set("email_popup_enabled", !settings.email_popup_enabled)}
                                className={cn(
                                    "relative w-12 h-6 rounded-full transition-colors border border-[var(--border)]",
                                    settings.email_popup_enabled ? "bg-[var(--accent)]" : "bg-[var(--bg-elevated)]"
                                )}
                            >
                                <div className={cn(
                                    "absolute top-1 w-3.5 h-3.5 bg-white rounded-full transition-all",
                                    settings.email_popup_enabled ? "left-7" : "left-1"
                                )} />
                            </button>
                        </div>

                        {settings.email_popup_enabled && (
                            <>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-3)] px-1">Popup Title</label>
                                    <AdminInput
                                        value={settings.email_popup_title}
                                        onChange={e => set("email_popup_title", e.target.value)}
                                        placeholder="Get 10% off..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-3)] px-1">Popup Subtitle</label>
                                    <AdminInput
                                        value={settings.email_popup_subtitle}
                                        onChange={e => set("email_popup_subtitle", e.target.value)}
                                        placeholder="Join the list..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-3)] px-1">Select Linked Coupon</label>
                                    <select
                                        style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text)", borderRadius: "1rem", padding: "0.875rem 1.25rem", fontSize: "0.875rem", outline: "none", width: "100%", cursor: "pointer" }}
                                        className="focus:border-[var(--accent)] transition-all font-medium"
                                        value={settings.email_popup_coupon_id}
                                        onChange={e => set("email_popup_coupon_id", e.target.value)}
                                    >
                                        <option value="">Select an active coupon...</option>
                                        {coupons.map(c => (
                                            <option key={c.id} value={c.id}>{c.code}</option>
                                        ))}
                                    </select>
                                    {coupons.length === 0 && (
                                        <p className="text-[10px] text-rose-500 font-bold px-1 mt-1">No active coupons found! Create one first.</p>
                                    )}
                                </div>
                            </>
                        )}
                    </AdminCard>

                    <SectionTitle icon={Shield} title="System Security" />
                    <AdminCard className="p-6">
                        <Toggle k="maintenance_mode" label="Maintenance Mode" />
                        {settings.maintenance_mode && (
                            <div className="mt-4 p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 flex gap-3 items-center">
                                <span className="text-[10px] font-bold text-orange-500 uppercase tracking-tight">Warning: Store is currently invisible to customers.</span>
                            </div>
                        )}
                    </AdminCard>
                </div>
            </div>
        </div>
    )
}

function SectionTitle({ icon: Icon, title }: { icon: LucideIcon; title: string }) {
    return (
        <div className="flex items-center gap-2 px-1">
            <div style={{ background: "color-mix(in srgb, var(--accent) 10%, transparent)" }} className="p-1.5 rounded-lg border border-[var(--border)]">
                <Icon size={14} className="text-[var(--accent)]" />
            </div>
            <h3 style={{ color: "var(--text)" }} className="text-xs font-bold uppercase tracking-[0.2em]">{title}</h3>
        </div>
    )
}

