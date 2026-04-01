"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Plus, Pencil, Trash2, X, Check, Loader2 } from "lucide-react"
import {
    AdminCard,
    AdminPageHeader,
    AdminTableHeader,
    AdminTableRow,
    AdminButton,
    AdminInput,
    AdminSearchInput
} from "@/components/admin/AdminUI"
import { Toggle } from "@/components/ui/Toggle"
import { cn } from "@/lib/utils"

interface Coupon {
    id: string
    code: string
    description: string
    discount_type: "percentage" | "fixed"
    discount_value: number
    min_purchase_amount: number
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
    min_purchase_amount: 0,
    usage_limit: null,
    is_active: true,
    valid_from: new Date().toISOString().slice(0, 10),
    valid_until: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
}

export default function CouponsContent() {
    const [coupons, setCoupons] = useState<Coupon[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [showForm, setShowForm] = useState(false)
    const [editing, setEditing] = useState<Coupon | null>(null)
    const [form, setForm] = useState(empty)
    const [error, setError] = useState<string | null>(null)
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
    const [search, setSearch] = useState("")

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
            min_purchase_amount: c.min_purchase_amount,
            usage_limit: c.usage_limit,
            is_active: c.is_active,
            valid_from: c.valid_from?.slice(0, 10) ?? '',
            valid_until: c.valid_until?.slice(0, 10) ?? '',
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

    const deleteCoupon = async (id: string) => {
        await supabase.from("coupons").delete().eq("id", id)
        setDeleteConfirm(null)
        fetchCoupons()
    }

    const filtered = coupons.filter(c =>
        c.code.toLowerCase().includes(search.toLowerCase()) ||
        c.description.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-2">
                <AdminPageHeader
                    title="Coupons"
                    subtitle={`${coupons.filter(c => c.is_active).length} active promotion codes currently live.`}
                />
                <AdminButton onClick={openCreate} icon={Plus}>
                    Create Coupon
                </AdminButton>
            </div>

            <AdminCard>
                <div style={{ borderBottom: "1px solid var(--border)" }} className="px-6 py-4">
                    <AdminSearchInput
                        placeholder="Search coupons by code or description..."
                        value={search}
                        onChange={setSearch}
                        onClear={() => setSearch("")}
                        className="max-w-sm"
                    />
                </div>

                <div className="overflow-x-auto">
                    <AdminTableHeader cols="grid-cols-[2fr_1.5fr_1fr_1fr_1fr] px-6 py-4">
                        <span>Coupon Code</span>
                        <span>Discount</span>
                        <span>Status</span>
                        <span>Usage</span>
                        <span className="text-right">Actions</span>
                    </AdminTableHeader>

                    <div className="divide-y" style={{ borderColor: "var(--border)" }}>
                        {loading ? (
                            <div className="flex items-center justify-center py-16">
                                <Loader2 size={24} className="animate-spin text-[var(--accent)]" />
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="text-center py-16" style={{ color: "var(--text-3)" }}>
                                {coupons.length === 0 ? "No coupons yet. Create your first one." : "No coupons match your search."}
                            </div>
                        ) : (
                            filtered.map(c => (
                                <AdminTableRow
                                    key={c.id}
                                    cols="grid-cols-[2fr_1.5fr_1fr_1fr_1fr] px-6 py-4 items-center"
                                >
                                    <div>
                                        <span
                                            style={{ background: "var(--bg-elevated)", color: "var(--text)", border: "1px solid var(--border)" }}
                                            className="font-mono text-xs px-2 py-1 rounded font-bold tracking-widest"
                                        >
                                            {c.code}
                                        </span>
                                        {c.description && (
                                            <p style={{ color: "var(--text-3)" }} className="text-[10px] mt-1 font-medium">{c.description}</p>
                                        )}
                                    </div>

                                    <div className="flex flex-col">
                                        <span style={{ color: "var(--text)" }} className="text-sm font-bold">
                                            {c.discount_type === "percentage" ? `${c.discount_value}% OFF` : `₹${c.discount_value} OFF`}
                                        </span>
                                        {c.min_purchase_amount > 0 && (
                                            <span style={{ color: "var(--text-3)" }} className="text-[10px] font-medium">
                                                Min. ₹{c.min_purchase_amount}
                                            </span>
                                        )}
                                    </div>

                                    <div>
                                        <button
                                            onClick={() => toggleActive(c)}
                                            className={cn(
                                                "px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider border transition-all",
                                                c.is_active
                                                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500 hover:text-white"
                                                    : "bg-rose-500/10 text-rose-500 border-rose-500/20 hover:bg-rose-500 hover:text-white"
                                            )}
                                        >
                                            {c.is_active ? "Active" : "Paused"}
                                        </button>
                                    </div>

                                    <div style={{ color: "var(--text-2)" }} className="text-xs font-bold tabular-nums">
                                        {c.used_count} <span style={{ color: "var(--text-3)" }} className="font-medium text-[10px]">/ {c.usage_limit ?? "∞"}</span>
                                    </div>

                                    <div className="flex items-center justify-end gap-1">
                                        <button
                                            onClick={() => openEdit(c)}
                                            style={{ color: "var(--text-3)" }}
                                            className="p-2 rounded-xl hover:bg-[var(--bg-elevated)] hover:text-[var(--text)] transition-all"
                                        >
                                            <Pencil size={14} />
                                        </button>

                                        {deleteConfirm === c.id ? (
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => deleteCoupon(c.id)}
                                                    className="p-2 rounded-xl bg-rose-500 text-white shadow-lg shadow-rose-500/20"
                                                >
                                                    <Check size={14} />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteConfirm(null)}
                                                    style={{ color: "var(--text-3)" }}
                                                    className="p-2 rounded-xl hover:bg-[var(--bg-elevated)]"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setDeleteConfirm(c.id)}
                                                style={{ color: "var(--text-3)" }}
                                                className="p-2 rounded-xl hover:bg-rose-500/10 hover:text-rose-500 transition-all"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                </AdminTableRow>
                            ))
                        )}
                    </div>
                </div>
            </AdminCard>

            {showForm && (
                <div
                    className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={e => { if (e.target === e.currentTarget) setShowForm(false) }}
                >
                    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[2rem] w-full max-w-lg p-8 shadow-2xl">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 style={{ color: "var(--text)" }} className="text-xl font-bold">
                                    {editing ? "Edit Coupon" : "Create New Coupon"}
                                </h2>
                                <p style={{ color: "var(--text-3)" }} className="text-xs mt-1 font-medium italic">Configure discount and restrictions.</p>
                            </div>
                            <button onClick={() => setShowForm(false)} className="p-2 hover:bg-[var(--bg-elevated)] rounded-xl transition-all text-[var(--text-3)]">
                                <X size={20} />
                            </button>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold uppercase tracking-widest text-center">
                                {error}
                            </div>
                        )}

                        <div className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-3)] px-1">Coupon Code</label>
                                    <AdminInput
                                        value={form.code}
                                        onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                                        placeholder="HAXEUS20"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-3)] px-1">Type</label>
                                    <select
                                        style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text)", borderRadius: "0.75rem", padding: "0.75rem 1rem", fontSize: "0.875rem", outline: "none", width: "100%", cursor: "pointer" }}
                                        className="focus:border-[var(--accent)] transition-all font-medium"
                                        value={form.discount_type}
                                        onChange={e => setForm(f => ({ ...f, discount_type: e.target.value as "percentage" | "fixed" }))}
                                    >
                                        <option value="percentage">Percentage (%)</option>
                                        <option value="fixed">Fixed Amount (₹)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-3)] px-1">Discount Value</label>
                                    <AdminInput
                                        type="number"
                                        value={form.discount_value}
                                        onChange={e => setForm(f => ({ ...f, discount_value: Number(e.target.value) }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-3)] px-1">Min. Order (₹)</label>
                                    <AdminInput
                                        type="number"
                                        value={form.min_purchase_amount}
                                        onChange={e => setForm(f => ({ ...f, min_purchase_amount: Number(e.target.value) }))}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-3)] px-1">Valid From</label>
                                    <AdminInput
                                        type="date"
                                        value={form.valid_from}
                                        onChange={e => setForm(f => ({ ...f, valid_from: e.target.value }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-3)] px-1">Valid Until</label>
                                    <AdminInput
                                        type="date"
                                        value={form.valid_until}
                                        onChange={e => setForm(f => ({ ...f, valid_until: e.target.value }))}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-3)] px-1">Usage Limit</label>
                                <AdminInput
                                    type="number"
                                    value={form.usage_limit ?? ""}
                                    placeholder="No limit"
                                    onChange={e => setForm(f => ({ ...f, usage_limit: e.target.value ? Number(e.target.value) : null }))}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-3)] px-1">Description</label>
                                <AdminInput
                                    value={form.description}
                                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                    placeholder="Summer Sale 2026"
                                />
                            </div>

                            <div className="flex items-center gap-4 pt-2">
                                <Toggle checked={form.is_active} onChange={(checked) => setForm(f => ({ ...f, is_active: checked }))} />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-2)]">
                                    {form.is_active ? "Active" : "Paused"}
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-4 mt-10">
                            <AdminButton variant="ghost" className="flex-1" onClick={() => setShowForm(false)}>
                                Cancel
                            </AdminButton>
                            <AdminButton className="flex-1" onClick={save} loading={saving}>
                                {editing ? "Save Changes" : "Create Coupon"}
                            </AdminButton>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
