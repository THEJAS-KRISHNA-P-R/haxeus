"use client"

import { useEffect, useState } from "react"
import { 
    Plus, 
    Pencil, 
    Trash2, 
    X, 
    Check, 
    Loader2, 
    Image as ImageIcon, 
    Play, 
    Settings, 
    Layout, 
    Eye,
    ChevronRight,
    GripVertical
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import {
    AdminCard,
    AdminPageHeader,
    AdminButton,
    AdminInput,
} from "@/components/admin/AdminUI"
import { Toggle } from "@/components/ui/Toggle"
import { PromoPopup, PromoTextBlock, PromoButton } from "@/types/promo-popup"
import { PromoPopupRenderer } from "@/components/PromoPopupRenderer"
import { toast } from "sonner"

const defaultTextBlock: PromoTextBlock = {
    id: "",
    text: "New Offer!",
    position: "center",
    font_size: "2xl",
    font_weight: "bold",
    color: "#ffffff",
    bg_color: "transparent",
    bg_opacity: 0.5,
    padding: "md",
    border_radius: "md"
}

const defaultButton: PromoButton = {
    text: "Shop Now",
    href: "/products",
    color: "#ffffff",
    bg_color: "#e93a3a",
    position: "bottom-center",
    open_in_new_tab: false
}

const defaultPopup: Omit<PromoPopup, "id" | "created_at" | "updated_at"> = {
    name: "New Promo Popup",
    enabled: true,
    image_url: "",
    image_alt: "Promotional Banner",
    overlay_color: "#000000",
    overlay_opacity: 0.3,
    text_blocks: [],
    button: null,
    show_close_button: true,
    close_button_color: "#ffffff",
    trigger: "on_load",
    delay_ms: 2000,
    cooldown_hours: 24,
    show_once: true,
    max_width: 500,
    border_radius: 20
}

export default function PromoPopupsContent() {
    const [popups, setPopups] = useState<PromoPopup[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [editorOpen, setEditorOpen] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [form, setForm] = useState<Omit<PromoPopup, "id" | "created_at" | "updated_at">>(defaultPopup)
    const [activeTab, setActiveTab] = useState<"content" | "design" | "trigger">("content")
    const [previewVisible, setPreviewVisible] = useState(false)
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

    const fetchPopups = async () => {
        setLoading(true)
        try {
            const res = await fetch("/api/admin/promo-popups")
            const data = await res.json()
            setPopups(data || [])
        } catch (error) {
            toast.error("Failed to fetch promo popups")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchPopups() }, [])

    const openCreate = () => {
        setEditingId(null)
        setForm(defaultPopup)
        setActiveTab("content")
        setEditorOpen(true)
    }

    const openEdit = (p: PromoPopup) => {
        setEditingId(p.id)
        setForm({
            name: p.name,
            enabled: p.enabled,
            image_url: p.image_url,
            image_alt: p.image_alt,
            overlay_color: p.overlay_color,
            overlay_opacity: p.overlay_opacity,
            text_blocks: p.text_blocks,
            button: p.button,
            show_close_button: p.show_close_button,
            close_button_color: p.close_button_color,
            trigger: p.trigger,
            delay_ms: p.delay_ms,
            cooldown_hours: p.cooldown_hours,
            show_once: p.show_once,
            max_width: p.max_width,
            border_radius: p.border_radius,
        })
        setActiveTab("content")
        setEditorOpen(true)
    }

    const save = async () => {
        setSaving(true)
        try {
            const method = editingId ? "PATCH" : "POST"
            const url = editingId ? `/api/admin/promo-popups/${editingId}` : "/api/admin/promo-popups"
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form)
            })
            if (res.ok) {
                toast.success(`Popup ${editingId ? "updated" : "created"} successfully`)
                if (!editingId) setEditingId(null)
                fetchPopups()
                setEditorOpen(false)
            } else {
                toast.error("Failed to save popup")
            }
        } catch (error) {
            toast.error("An error occurred while saving")
        } finally {
            setSaving(false)
        }
    }

    const deletePopup = async (id: string) => {
        try {
            const res = await fetch(`/api/admin/promo-popups/${id}`, { method: "DELETE" })
            if (res.ok) {
                toast.success("Popup deleted")
                if (editingId === id) setEditingId(null)
                if (editingId === id) setEditorOpen(false)
                fetchPopups()
            } else {
                toast.error("Failed to delete popup")
            }
        } catch (error) {
            toast.error("An error occurred while deleting")
        } finally {
            setDeleteConfirm(null)
        }
    }

    const toggleEnabled = async (p: PromoPopup) => {
        try {
            const res = await fetch(`/api/admin/promo-popups/${p.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ enabled: !p.enabled })
            })
            if (res.ok) {
                fetchPopups()
            }
        } catch (error) {
            toast.error("Failed to toggle status")
        }
    }

    const addTextBlock = () => {
        const newBlock = { ...defaultTextBlock, id: crypto.randomUUID() }
        setForm(prev => ({ ...prev, text_blocks: [...prev.text_blocks, newBlock] }))
    }

    const removeTextBlock = (id: string) => {
        setForm(prev => ({ ...prev, text_blocks: prev.text_blocks.filter(b => b.id !== id) }))
    }

    const updateTextBlock = (id: string, updates: Partial<PromoTextBlock>) => {
        setForm(prev => ({
            ...prev,
            text_blocks: prev.text_blocks.map(b => b.id === id ? { ...b, ...updates } : b)
        }))
    }

    const moveTextBlock = (id: string, direction: "up" | "down") => {
        setForm(prev => {
            const index = prev.text_blocks.findIndex(block => block.id === id)
            if (index === -1) return prev

            const targetIndex = direction === "up" ? index - 1 : index + 1
            if (targetIndex < 0 || targetIndex >= prev.text_blocks.length) return prev

            const reordered = [...prev.text_blocks]
            const [moved] = reordered.splice(index, 1)
            reordered.splice(targetIndex, 0, moved)

            return { ...prev, text_blocks: reordered }
        })
    }

    return (
        <div className="flex flex-col lg:flex-row gap-8 min-h-[calc(100vh-120px)]">
            {/* List side */}
            <div className={`flex-1 space-y-6 transition-all duration-300 ${editorOpen ? 'lg:w-1/2' : 'w-full'}`}>
                <div className="flex items-center justify-between">
                    <AdminPageHeader
                        title="Promo Popups"
                        subtitle="Standalone image-based promotional popups."
                    />
                    <AdminButton onClick={openCreate} icon={Plus}>
                        New Popup
                    </AdminButton>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {loading ? (
                        <div className="col-span-full flex items-center justify-center py-20">
                            <Loader2 className="animate-spin text-[var(--accent)]" />
                        </div>
                    ) : popups.length === 0 ? (
                        <div className="col-span-full text-center py-20 border-2 border-dashed border-[var(--border)] rounded-3xl text-[var(--text-3)]">
                            No promo popups yet. Create your first campaign.
                        </div>
                    ) : (
                        popups.map(p => (
                            <AdminCard key={p.id} className="p-4 flex gap-4 items-center">
                                <div className="w-20 h-15 rounded-xl bg-[var(--bg-elevated)] overflow-hidden flex-shrink-0 border border-[var(--border)]">
                                    {p.image_url ? (
                                        <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[var(--text-3)]">
                                            <ImageIcon size={20} />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-sm truncate">{p.name}</h3>
                                    <p className="text-[10px] text-[var(--text-3)] uppercase tracking-widest font-bold mt-0.5">{p.trigger.replace('_', ' ')}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Toggle checked={p.enabled} onChange={() => toggleEnabled(p)} size="sm" />
                                    <button
                                        onClick={() => openEdit(p)}
                                        className="p-2 rounded-xl hover:bg-[var(--bg-elevated)] transition-all text-[var(--text-3)] hover:text-[var(--text)]"
                                    >
                                        <Pencil size={14} />
                                    </button>
                                    {deleteConfirm === p.id ? (
                                        <div className="flex items-center gap-1">
                                            <button onClick={() => deletePopup(p.id)} className="p-2 rounded-xl bg-rose-500 text-white"><Check size={14} /></button>
                                            <button onClick={() => setDeleteConfirm(null)} className="p-2 rounded-xl hover:bg-[var(--bg-elevated)]"><X size={14} /></button>
                                        </div>
                                    ) : (
                                        <button onClick={() => setDeleteConfirm(p.id)} className="p-2 rounded-xl hover:bg-rose-500/10 text-rose-500 transition-all"><Trash2 size={14} /></button>
                                    )}
                                </div>
                            </AdminCard>
                        ))
                    )}
                </div>
            </div>

            {/* Editor Panel side */}
            <AnimatePresence>
                {editorOpen && (
                    <motion.div
                        initial={{ x: 300, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 300, opacity: 0 }}
                        className="lg:w-[480px] space-y-6"
                    >
                        <AdminCard className="p-6 sticky top-24 max-h-[calc(100vh-140px)] overflow-y-auto custom-scrollbar">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-xl font-bold">{editingId ? "Edit Popup" : "New Popup"}</h2>
                                    <p className="text-xs text-[var(--text-3)] mt-1 italic">Customize image, content and triggers.</p>
                                </div>
                                <button
                                    onClick={() => { setEditorOpen(false); setEditingId(null); }}
                                    className="p-2 hover:bg-[var(--bg-elevated)] rounded-xl transition-all"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Tabs */}
                            <div className="flex gap-1 p-1 bg-[var(--bg-elevated)] rounded-xl mb-8">
                                {[
                                    { id: "content", label: "Content", icon: Layout },
                                    { id: "design", label: "Design", icon: Settings },
                                    { id: "trigger", label: "Trigger", icon: Play },
                                ].map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as any)}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                                            activeTab === tab.id 
                                                ? "bg-[var(--bg-card)] text-[var(--text)] shadow-sm" 
                                                : "text-[var(--text-3)] hover:text-[var(--text-2)]"
                                        }`}
                                    >
                                        <tab.icon size={12} />
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Tab Content */}
                            <div className="space-y-6">
                                {activeTab === "content" && (
                                    <div className="space-y-5">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-3)] px-1">Name (Admin Label)</label>
                                            <AdminInput value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Summer Sale Promo" />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-3)] px-1">Image URL</label>
                                            <AdminInput value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} placeholder="https://..." />
                                            {form.image_url && (
                                                <div className="mt-2 aspect-video rounded-xl border border-[var(--border)] overflow-hidden bg-[var(--bg-elevated)]">
                                                    <img src={form.image_url} className="w-full h-full object-cover" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-3)] px-1">Alt Text</label>
                                            <AdminInput value={form.image_alt} onChange={e => setForm(f => ({ ...f, image_alt: e.target.value }))} />
                                        </div>

                                        <div className="space-y-4 pt-4 border-t border-[var(--border)]">
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-xs font-bold uppercase tracking-widest">Text Blocks</h4>
                                                <AdminButton variant="secondary" onClick={addTextBlock} className="h-8 !px-3 font-semibold !text-[9px]">Add Block</AdminButton>
                                            </div>
                                            
                                            <div className="space-y-3">
                                                {form.text_blocks.map((block, idx) => (
                                                    <div key={block.id} className="p-4 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-2xl relative group">
                                                        <button onClick={() => removeTextBlock(block.id)} className="absolute -top-2 -right-2 p-1 bg-rose-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all scale-75 hover:scale-100"><X size={12} /></button>
                                                        <div className="space-y-3">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--text-3)]">
                                                                    <GripVertical size={12} />
                                                                    Block {idx + 1}
                                                                </div>
                                                                <div className="flex items-center gap-1">
                                                                    <button onClick={() => moveTextBlock(block.id, "up")} className="p-1 rounded-md hover:bg-[var(--bg-card)] transition-colors" disabled={idx === 0}>
                                                                        <ChevronRight size={12} className="-rotate-90" />
                                                                    </button>
                                                                    <button onClick={() => moveTextBlock(block.id, "down")} className="p-1 rounded-md hover:bg-[var(--bg-card)] transition-colors" disabled={idx === form.text_blocks.length - 1}>
                                                                        <ChevronRight size={12} className="rotate-90" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <AdminInput value={block.text} onChange={e => updateTextBlock(block.id, { text: e.target.value })} className="!bg-[var(--bg-card)] !py-2 !text-xs" />
                                                            <div className="grid grid-cols-2 gap-2">
                                                                <select 
                                                                    value={block.position} 
                                                                    onChange={e => updateTextBlock(block.id, { position: e.target.value as any })}
                                                                    className="bg-[var(--bg-card)] border border-[var(--border)] text-[10px] rounded-lg p-2 outline-none"
                                                                >
                                                                    <option value="top-left">Top Left</option>
                                                                    <option value="top-center">Top Center</option>
                                                                    <option value="top-right">Top Right</option>
                                                                    <option value="center">Center</option>
                                                                    <option value="bottom-left">Bottom Left</option>
                                                                    <option value="bottom-center">Bottom Center</option>
                                                                    <option value="bottom-right">Bottom Right</option>
                                                                </select>
                                                                <select 
                                                                    value={block.font_size} 
                                                                    onChange={e => updateTextBlock(block.id, { font_size: e.target.value as any })}
                                                                    className="bg-[var(--bg-card)] border border-[var(--border)] text-[10px] rounded-lg p-2 outline-none"
                                                                >
                                                                    <option value="sm">Small</option>
                                                                    <option value="base">Base</option>
                                                                    <option value="lg">Large</option>
                                                                    <option value="xl">XL</option>
                                                                    <option value="2xl">2XL</option>
                                                                    <option value="3xl">3XL</option>
                                                                    <option value="4xl">4XL</option>
                                                                </select>
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-2">
                                                                <select
                                                                    value={block.font_weight}
                                                                    onChange={e => updateTextBlock(block.id, { font_weight: e.target.value as any })}
                                                                    className="bg-[var(--bg-card)] border border-[var(--border)] text-[10px] rounded-lg p-2 outline-none"
                                                                >
                                                                    <option value="normal">Normal</option>
                                                                    <option value="semibold">Semibold</option>
                                                                    <option value="bold">Bold</option>
                                                                    <option value="extrabold">Extra Bold</option>
                                                                </select>
                                                                <select
                                                                    value={block.padding}
                                                                    onChange={e => updateTextBlock(block.id, { padding: e.target.value as any })}
                                                                    className="bg-[var(--bg-card)] border border-[var(--border)] text-[10px] rounded-lg p-2 outline-none"
                                                                >
                                                                    <option value="none">No Padding</option>
                                                                    <option value="sm">Small Padding</option>
                                                                    <option value="md">Medium Padding</option>
                                                                    <option value="lg">Large Padding</option>
                                                                </select>
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-2">
                                                                <select
                                                                    value={block.border_radius}
                                                                    onChange={e => updateTextBlock(block.id, { border_radius: e.target.value as any })}
                                                                    className="bg-[var(--bg-card)] border border-[var(--border)] text-[10px] rounded-lg p-2 outline-none"
                                                                >
                                                                    <option value="none">No Radius</option>
                                                                    <option value="sm">Small Radius</option>
                                                                    <option value="md">Medium Radius</option>
                                                                    <option value="full">Full Radius</option>
                                                                </select>
                                                                <div className="flex items-center justify-between gap-3 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2">
                                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-3)]">BG</span>
                                                                    <Toggle
                                                                        checked={block.bg_color !== "transparent"}
                                                                        onChange={(checked) => updateTextBlock(block.id, { bg_color: checked ? (block.bg_color === "transparent" ? "#000000" : block.bg_color) : "transparent" })}
                                                                        size="sm"
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="grid grid-cols-[auto_auto_1fr] gap-3 items-center">
                                                                <input type="color" value={block.color} onChange={e => updateTextBlock(block.id, { color: e.target.value })} className="w-8 h-8 rounded-md bg-transparent border-none cursor-pointer" />
                                                                <input type="color" value={block.bg_color === 'transparent' ? '#000000' : block.bg_color} onChange={e => updateTextBlock(block.id, { bg_color: e.target.value })} className="w-8 h-8 rounded-md bg-transparent border-none cursor-pointer" />
                                                                <div className="space-y-1">
                                                                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-[var(--text-3)]">
                                                                        <span>Background Opacity</span>
                                                                        <span>{block.bg_opacity.toFixed(2)}</span>
                                                                    </div>
                                                                    <input type="range" min="0" max="1" step="0.05" value={block.bg_opacity} onChange={e => updateTextBlock(block.id, { bg_opacity: Number(e.target.value) })} className="w-full h-1 bg-[var(--bg-card)] rounded-lg appearance-none cursor-pointer accent-[var(--accent)]" />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-4 pt-4 border-t border-[var(--border)]">
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-xs font-bold uppercase tracking-widest">Call to Action Button</h4>
                                                <Toggle checked={form.button !== null} onChange={checked => setForm(f => ({ ...f, button: checked ? defaultButton : null }))} size="sm" />
                                            </div>
                                            {form.button && (
                                                <div className="space-y-3 p-4 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-2xl">
                                                    <div className="grid grid-cols-1 gap-3">
                                                        <AdminInput value={form.button.text} onChange={e => setForm(f => ({ ...f, button: { ...f.button!, text: e.target.value } }))} placeholder="Button Text" className="!bg-[var(--bg-card)] !py-2 !text-xs" />
                                                        <AdminInput value={form.button.href} onChange={e => setForm(f => ({ ...f, button: { ...f.button!, href: e.target.value } }))} placeholder="/link..." className="!bg-[var(--bg-card)] !py-2 !text-xs" />
                                                        <div className="grid grid-cols-2 gap-2 items-center">
                                                            <div className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2">
                                                                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-3)]">Text</span>
                                                                <input type="color" value={form.button.color} onChange={e => setForm(f => ({ ...f, button: { ...f.button!, color: e.target.value } }))} className="w-8 h-8 rounded-md bg-transparent border-none cursor-pointer" />
                                                            </div>
                                                            <div className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2">
                                                                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-3)]">BG</span>
                                                                <input type="color" value={form.button.bg_color} onChange={e => setForm(f => ({ ...f, button: { ...f.button!, bg_color: e.target.value } }))} className="w-8 h-8 rounded-md bg-transparent border-none cursor-pointer" />
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-2">
                                                             <select 
                                                                value={form.button.position} 
                                                                onChange={e => setForm(f => ({ ...f, button: { ...f.button!, position: e.target.value as any } }))}
                                                                className="bg-[var(--bg-card)] border border-[var(--border)] text-[10px] rounded-lg p-2 outline-none"
                                                            >
                                                                <option value="bottom-left">Bottom Left</option>
                                                                <option value="bottom-center">Bottom Center</option>
                                                                <option value="bottom-right">Bottom Right</option>
                                                                <option value="center">Center</option>
                                                            </select>
                                                            <div className="flex items-center gap-4 px-2">
                                                                <Toggle checked={form.button.open_in_new_tab} onChange={c => setForm(f => ({ ...f, button: { ...f.button!, open_in_new_tab: c } }))} size="sm" />
                                                                <span className="text-[10px] font-bold text-[var(--text-3)]">NEW TAB</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {activeTab === "design" && (
                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <div className="flex justify-between px-1">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-3)]">Max Width ({form.max_width}px)</label>
                                            </div>
                                            <input type="range" min="300" max="900" step="10" value={form.max_width} onChange={e => setForm(f => ({ ...f, max_width: Number(e.target.value) }))} className="w-full h-1 bg-[var(--bg-elevated)] rounded-lg appearance-none cursor-pointer accent-[var(--accent)]" />
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex justify-between px-1">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-3)]">Border Radius ({form.border_radius}px)</label>
                                            </div>
                                            <input type="range" min="0" max="40" step="2" value={form.border_radius} onChange={e => setForm(f => ({ ...f, border_radius: Number(e.target.value) }))} className="w-full h-1 bg-[var(--bg-elevated)] rounded-lg appearance-none cursor-pointer accent-[var(--accent)]" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-3)] px-1">Overlay Color</label>
                                                <div className="flex items-center gap-3">
                                                    <input type="color" value={form.overlay_color} onChange={e => setForm(f => ({ ...f, overlay_color: e.target.value }))} className="w-8 h-8 rounded-xl bg-transparent border-none cursor-pointer" />
                                                    <span className="text-xs font-mono uppercase text-[var(--text-2)]">{form.overlay_color}</span>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-3)] px-1">Overlay Opacity</label>
                                                <input type="range" min="0" max="0.7" step="0.05" value={form.overlay_opacity} onChange={e => setForm(f => ({ ...f, overlay_opacity: Number(e.target.value) }))} className="w-full h-1 bg-[var(--bg-elevated)] rounded-lg appearance-none cursor-pointer accent-[var(--accent)]" />
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between p-4 bg-[var(--bg-elevated)] rounded-2xl">
                                            <div>
                                                <h4 className="text-xs font-bold uppercase tracking-widest">Show Close Button</h4>
                                                <p className="text-[9px] text-[var(--text-3)] font-medium mt-1">Include designated close icon</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                 <input type="color" value={form.close_button_color} onChange={e => setForm(f => ({ ...f, close_button_color: e.target.value }))} className="w-6 h-6 rounded-md bg-transparent border-none cursor-pointer" />
                                                 <Toggle checked={form.show_close_button} onChange={c => setForm(f => ({ ...f, show_close_button: c }))} size="sm" />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === "trigger" && (
                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-3)] px-1">Trigger type</label>
                                            <div className="grid grid-cols-1 gap-2">
                                                {[
                                                    { id: "on_load", label: "On Page Load", desc: "Shows after a set delay" },
                                                    { id: "exit_intent", label: "Exit Intent", desc: "Shows when mouse leaves viewport" },
                                                    { id: "manual", label: "Manual", desc: "Triggered via API / Preview only" },
                                                ].map(t => (
                                                    <button
                                                        key={t.id}
                                                        onClick={() => setForm(f => ({ ...f, trigger: t.id as "on_load" | "exit_intent" | "manual" }))}
                                                        className={`flex items-center p-4 rounded-2xl border transition-all text-left ${
                                                            form.trigger === t.id 
                                                                ? "bg-[var(--accent)]/10 border-[var(--accent)]/30" 
                                                                : "bg-[var(--bg-elevated)] border-[var(--border)] hover:border-[var(--text-3)]"
                                                        }`}
                                                    >
                                                        <div className={`w-4 h-4 rounded-full border-2 mr-4 flex items-center justify-center ${form.trigger === t.id ? "border-[var(--accent)]" : "border-[var(--text-3)]"}`}>
                                                            {form.trigger === t.id && <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />}
                                                        </div>
                                                        <div>
                                                            <div className={`text-xs font-bold ${form.trigger === t.id ? "text-[var(--text)]" : "text-[var(--text-2)]"}`}>{t.label}</div>
                                                            <div className="text-[10px] text-[var(--text-3)] font-medium mt-0.5">{t.desc}</div>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {form.trigger === "on_load" && (
                                            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-3)] px-1">Delay (ms)</label>
                                                <AdminInput type="number" step="500" value={form.delay_ms} onChange={e => setForm(f => ({ ...f, delay_ms: Number(e.target.value) }))} />
                                            </div>
                                        )}

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-3)] px-1">Cooldown (Hours)</label>
                                                <AdminInput type="number" value={form.cooldown_hours} onChange={e => setForm(f => ({ ...f, cooldown_hours: Number(e.target.value) }))} />
                                            </div>
                                            <div className="flex flex-col justify-end gap-2 pb-1">
                                                <div className="flex items-center gap-3 px-1">
                                                    <Toggle checked={form.show_once} onChange={c => setForm(f => ({ ...f, show_once: c }))} size="sm" />
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-3)]">Show Once Only</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col gap-3 mt-10">
                                <div className="flex gap-4">
                                    <AdminButton variant="outline" className="flex-1" onClick={() => setPreviewVisible(true)} icon={Eye}>Preview</AdminButton>
                                    <AdminButton className="flex-1" onClick={save} loading={saving}>
                                        {editingId ? "Save Changes" : "Create Popup"}
                                    </AdminButton>
                                </div>
                                <AdminButton variant="ghost" className="w-full !text-[9px]" onClick={() => { setEditorOpen(false); setEditingId(null); }}>
                                    Discard Changes
                                </AdminButton>
                            </div>
                        </AdminCard>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Live Preview Modal Overlay */}
            {previewVisible && (
                <PromoPopupRenderer
                    popup={{ ...form, id: "preview", created_at: "", updated_at: "" }}
                    isVisible={previewVisible}
                    onClose={() => setPreviewVisible(false)}
                    isPreview={true}
                />
            )}
        </div>
    )
}
