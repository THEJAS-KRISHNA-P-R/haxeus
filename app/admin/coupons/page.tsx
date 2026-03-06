"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Plus, Pencil, Trash2, X, Check, Loader2 } from "lucide-react"

interface Coupon {
    id: number
    code: string
    description: string
    discount_type: "percentage" | "fixed"
    discount_value: number
    minimum_amount: number
    usage_limit: number | null
    used_count: number
    is_active: boolean
    valid_from: string
    valid_until: string
}

const empty: Omit<Coupon, "id" | "used_count"> = {
    code: "",
    description: "",
    discount_type: "percentage",
    discount_value: 10,
    minimum_amount: 0,
    usage_limit: null,
    is_active: true,
    valid_from: new Date().toISOString().slice(0, 10),
    valid_until: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
}

export default function CouponsPage() {
    const [coupons, setCoupons] = useState<Coupon[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [showForm, setShowForm] = useState(false)
    const [editing, setEditing] = useState<Coupon | null>(null)
    const [form, setForm] = useState(empty)
    const [error, setError] = useState<string | null>(null)
    const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)

    const fetchCoupons = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from("coupons")
            .select("*")
            .order("created_at", { ascending: false })
        if (error) setError(error.message)
        else setCoupons(data || [])
        setLoading(false)
    }

    useEffect(() => { fetchCoupons() }, [])

    const openCreate = () => {
        setEditing(null)
        setForm(empty)
        setError(null)
        setShowForm(true)
    }

    const openEdit = (c: Coupon) => {
        setEditing(c)
        setForm({
            code: c.code,
            description: c.description,
            discount_type: c.discount_type,
            discount_value: c.discount_value,
            minimum_amount: c.minimum_amount,
            usage_limit: c.usage_limit,
            is_active: c.is_active,
            valid_from: c.valid_from.slice(0, 10),
            valid_until: c.valid_until.slice(0, 10),
        })
        setError(null)
        setShowForm(true)
    }

    const save = async () => {
        if (!form.code.trim()) { setError("Coupon code is required"); return }
        if (form.discount_value <= 0) { setError("Discount value must be > 0"); return }
        setSaving(true)
        setError(null)

        const payload = {
            ...form,
            code: form.code.toUpperCase().trim(),
            valid_from: new Date(form.valid_from).toISOString(),
            valid_until: new Date(form.valid_until).toISOString(),
        }

        let err
        if (editing) {
            const { error: e } = await supabase
                .from("coupons").update(payload).eq("id", editing.id)
            err = e
        } else {
            const { error: e } = await supabase
                .from("coupons").insert({ ...payload, used_count: 0 })
            err = e
        }

        if (err) { setError(err.message); setSaving(false); return }
        setShowForm(false)
        setSaving(false)
        fetchCoupons()
    }

    const toggleActive = async (c: Coupon) => {
        await supabase.from("coupons").update({ is_active: !c.is_active }).eq("id", c.id)
        fetchCoupons()
    }

    const deleteCoupon = async (id: number) => {
        await supabase.from("coupons").delete().eq("id", id)
        setDeleteConfirm(null)
        fetchCoupons()
    }

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

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h1 style={{ color: "var(--text)" }} className="text-2xl font-bold">Coupons</h1>
                    <p style={{ color: "var(--text-2)" }} className="text-sm mt-1">
                        {coupons.filter(c => c.is_active).length} active promotion codes
                    </p>
                </div>
                <button
                    onClick={openCreate}
                    style={{ background: "var(--accent)", color: "#fff" }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                    <Plus size={16} /> CREATE COUPON
                </button>
            </div>

            {/* Table */}
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "1rem" }}>
                {/* Header row */}
                <div
                    style={{ borderBottom: "1px solid var(--border)", color: "var(--text-3)" }}
                    className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr] gap-4 px-6 py-3 text-xs font-medium uppercase tracking-wider"
                >
                    <span>Coupon Code</span>
                    <span>Discount</span>
                    <span>Status</span>
                    <span>Usage</span>
                    <span className="text-right">Actions</span>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 size={24} style={{ color: "var(--accent)" }} className="animate-spin" />
                    </div>
                ) : coupons.length === 0 ? (
                    <div className="text-center py-16" style={{ color: "var(--text-3)" }}>
                        No coupons yet. Create your first one.
                    </div>
                ) : (
                    coupons.map(c => (
                        <div
                            key={c.id}
                            style={{ borderBottom: "1px solid var(--border)" }}
                            className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr] gap-4 px-6 py-4 items-center hover:bg-[var(--bg-elevated)] transition-colors"
                        >
                            {/* Code */}
                            <div>
                                <span
                                    style={{ background: "var(--bg-elevated)", color: "var(--text)", border: "1px solid var(--border)" }}
                                    className="font-mono text-xs px-2 py-1 rounded font-bold tracking-widest"
                                >
                                    {c.code}
                                </span>
                                {c.description && (
                                    <p style={{ color: "var(--text-3)" }} className="text-xs mt-1">{c.description}</p>
                                )}
                            </div>

                            {/* Discount */}
                            <span style={{ color: "var(--text)" }} className="text-sm font-semibold">
                                {c.discount_type === "percentage"
                                    ? `${c.discount_value}% OFF`
                                    : `₹${c.discount_value} OFF`}
                                {c.minimum_amount > 0 && (
                                    <span style={{ color: "var(--text-3)" }} className="block text-xs font-normal">
                                        Min ₹{c.minimum_amount}
                                    </span>
                                )}
                            </span>

                            {/* Status toggle */}
                            <button
                                onClick={() => toggleActive(c)}
                                style={{
                                    background: c.is_active ? "rgba(34,197,94,0.1)" : "rgba(233,58,58,0.1)",
                                    color: c.is_active ? "#22c55e" : "var(--accent)",
                                    border: `1px solid ${c.is_active ? "rgba(34,197,94,0.3)" : "rgba(233,58,58,0.3)"}`,
                                }}
                                className="text-xs px-3 py-1 rounded-full font-medium w-fit hover:opacity-80 transition-opacity"
                            >
                                {c.is_active ? "ACTIVE" : "PAUSED"}
                            </button>

                            {/* Usage */}
                            <span style={{ color: "var(--text-2)" }} className="text-sm">
                                {c.used_count} / {c.usage_limit ?? "∞"}
                            </span>

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-2">
                                <button
                                    onClick={() => openEdit(c)}
                                    style={{ color: "var(--text-2)" }}
                                    className="p-1.5 rounded hover:bg-[var(--bg-elevated)] hover:text-[var(--text)] transition-colors"
                                >
                                    <Pencil size={15} />
                                </button>
                                {deleteConfirm === c.id ? (
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => deleteCoupon(c.id)}
                                            className="p-1.5 rounded bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                                        >
                                            <Check size={15} />
                                        </button>
                                        <button
                                            onClick={() => setDeleteConfirm(null)}
                                            style={{ color: "var(--text-3)" }}
                                            className="p-1.5 rounded hover:bg-[var(--bg-elevated)] transition-colors"
                                        >
                                            <X size={15} />
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setDeleteConfirm(c.id)}
                                        className="p-1.5 rounded text-red-500/60 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Create / Edit Modal */}
            {showForm && (
                <div
                    className="fixed inset-0 z-[200] flex items-center justify-center p-4"
                    style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
                    onClick={e => { if (e.target === e.currentTarget) setShowForm(false) }}
                >
                    <div
                        style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "1.25rem", width: "100%", maxWidth: "540px" }}
                        className="p-6"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 style={{ color: "var(--text)" }} className="text-lg font-bold">
                                {editing ? "Edit Coupon" : "Create Coupon"}
                            </h2>
                            <button onClick={() => setShowForm(false)} style={{ color: "var(--text-3)" }}
                                className="hover:text-[var(--text)] transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {error && (
                            <div className="mb-4 px-4 py-2 rounded-lg bg-red-500/10 text-red-500 text-sm border border-red-500/20">
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            {/* Code + Type row */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label style={{ color: "var(--text-2)" }} className="block text-xs mb-1.5">Coupon Code *</label>
                                    <input
                                        style={inputStyle}
                                        value={form.code}
                                        onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                                        placeholder="SAVE20"
                                        onFocus={e => (e.target.style.borderColor = "var(--accent)")}
                                        onBlur={e => (e.target.style.borderColor = "var(--border)")}
                                    />
                                </div>
                                <div>
                                    <label style={{ color: "var(--text-2)" }} className="block text-xs mb-1.5">Discount Type</label>
                                    <select
                                        style={{ ...inputStyle, cursor: "pointer" }}
                                        value={form.discount_type}
                                        onChange={e => setForm(f => ({ ...f, discount_type: e.target.value as "percentage" | "fixed" }))}
                                    >
                                        <option value="percentage">Percentage (%)</option>
                                        <option value="fixed">Fixed Amount (₹)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Value + Min order row */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label style={{ color: "var(--text-2)" }} className="block text-xs mb-1.5">
                                        Discount Value {form.discount_type === "percentage" ? "(%)" : "(₹)"} *
                                    </label>
                                    <input
                                        type="number" min={0} style={inputStyle}
                                        value={form.discount_value}
                                        onChange={e => setForm(f => ({ ...f, discount_value: Number(e.target.value) }))}
                                        onFocus={e => (e.target.style.borderColor = "var(--accent)")}
                                        onBlur={e => (e.target.style.borderColor = "var(--border)")}
                                    />
                                </div>
                                <div>
                                    <label style={{ color: "var(--text-2)" }} className="block text-xs mb-1.5">Min Order Amount (₹)</label>
                                    <input
                                        type="number" min={0} style={inputStyle}
                                        value={form.minimum_amount}
                                        onChange={e => setForm(f => ({ ...f, minimum_amount: Number(e.target.value) }))}
                                        onFocus={e => (e.target.style.borderColor = "var(--accent)")}
                                        onBlur={e => (e.target.style.borderColor = "var(--border)")}
                                    />
                                </div>
                            </div>

                            {/* Validity dates */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label style={{ color: "var(--text-2)" }} className="block text-xs mb-1.5">Valid From</label>
                                    <input
                                        type="date" style={inputStyle}
                                        value={form.valid_from}
                                        onChange={e => setForm(f => ({ ...f, valid_from: e.target.value }))}
                                        onFocus={e => (e.target.style.borderColor = "var(--accent)")}
                                        onBlur={e => (e.target.style.borderColor = "var(--border)")}
                                    />
                                </div>
                                <div>
                                    <label style={{ color: "var(--text-2)" }} className="block text-xs mb-1.5">Valid Until</label>
                                    <input
                                        type="date" style={inputStyle}
                                        value={form.valid_until}
                                        onChange={e => setForm(f => ({ ...f, valid_until: e.target.value }))}
                                        onFocus={e => (e.target.style.borderColor = "var(--accent)")}
                                        onBlur={e => (e.target.style.borderColor = "var(--border)")}
                                    />
                                </div>
                            </div>

                            {/* Usage limit + Description */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label style={{ color: "var(--text-2)" }} className="block text-xs mb-1.5">Usage Limit (blank = unlimited)</label>
                                    <input
                                        type="number" min={1} style={inputStyle}
                                        value={form.usage_limit ?? ""}
                                        placeholder="Unlimited"
                                        onChange={e => setForm(f => ({ ...f, usage_limit: e.target.value ? Number(e.target.value) : null }))}
                                        onFocus={e => (e.target.style.borderColor = "var(--accent)")}
                                        onBlur={e => (e.target.style.borderColor = "var(--border)")}
                                    />
                                </div>
                                <div>
                                    <label style={{ color: "var(--text-2)" }} className="block text-xs mb-1.5">Description (optional)</label>
                                    <input
                                        style={inputStyle}
                                        value={form.description}
                                        onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                        placeholder="Welcome discount"
                                        onFocus={e => (e.target.style.borderColor = "var(--accent)")}
                                        onBlur={e => (e.target.style.borderColor = "var(--border)")}
                                    />
                                </div>
                            </div>

                            {/* Active toggle */}
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))}
                                    style={{
                                        width: "40px", height: "22px", borderRadius: "11px",
                                        background: form.is_active ? "var(--accent)" : "var(--bg-elevated)",
                                        border: "1px solid var(--border)",
                                        position: "relative", transition: "background 0.2s",
                                        flexShrink: 0,
                                    }}
                                >
                                    <span style={{
                                        position: "absolute", top: "2px",
                                        left: form.is_active ? "19px" : "2px",
                                        width: "16px", height: "16px",
                                        background: "#fff", borderRadius: "50%",
                                        transition: "left 0.2s",
                                    }} />
                                </button>
                                <span style={{ color: "var(--text-2)" }} className="text-sm">
                                    {form.is_active ? "Active — customers can use this code" : "Paused — code is disabled"}
                                </span>
                            </div>
                        </div>

                        {/* Footer buttons */}
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowForm(false)}
                                style={{ border: "1px solid var(--border)", color: "var(--text-2)", background: "transparent" }}
                                className="flex-1 py-2.5 rounded-xl text-sm font-medium hover:bg-[var(--bg-elevated)] transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={save}
                                disabled={saving}
                                style={{ background: "var(--accent)", color: "#fff" }}
                                className="flex-1 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {saving && <Loader2 size={14} className="animate-spin" />}
                                {editing ? "Save Changes" : "Create Coupon"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
