"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Ticket, Plus, Trash2, Edit } from "lucide-react"

export default function CouponsPage() {
    const [coupons, setCoupons] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchCoupons() {
            const { data, error } = await supabase
                .from('coupons')
                .select('*')
                .order('created_at', { ascending: false })

            if (!error) {
                setCoupons(data || [])
            }
            setLoading(false)
        }
        fetchCoupons()
    }, [])

    return (
        <div className="p-6">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Coupons</h1>
                    <p className="text-white/40 text-sm mt-1">{coupons.length} active promotions</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-[#e93a3a] hover:bg-[#e93a3a]/80 text-white text-sm font-bold rounded-xl transition-all">
                    <Plus size={16} /> Create Coupon
                </button>
            </div>

            <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
                <div className="grid grid-cols-5 gap-4 px-6 py-3 text-xs font-medium text-white/30 uppercase tracking-wider border-b border-white/[0.06]">
                    <span>Code</span>
                    <span>Discount</span>
                    <span>Status</span>
                    <span>Usage</span>
                    <span className="text-right">Actions</span>
                </div>

                {loading ? (
                    [...Array(3)].map((_, i) => (
                        <div key={i} className="h-14 mx-4 my-2 rounded-lg bg-white/[0.03] animate-pulse" />
                    ))
                ) : coupons.length === 0 ? (
                    <div className="text-center py-16 text-white/30">
                        <Ticket className="h-10 w-10 mx-auto mb-3 opacity-30" />
                        <p>No coupons created yet</p>
                    </div>
                ) : (
                    coupons.map(c => (
                        <div key={c.id} className="grid grid-cols-5 gap-4 px-6 py-4 border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors text-sm">
                            <span className="text-white font-mono font-bold tracking-wider">{c.code}</span>
                            <span className="text-white/70">{c.discount_type === 'percentage' ? `${c.discount_value}%` : `₹${c.discount_value}`} OFF</span>
                            <span>
                                <span className={`text-xs px-2 py-1 rounded-full ${c.active ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                    {c.active ? 'Active' : 'Inactive'}
                                </span>
                            </span>
                            <span className="text-white/40">{c.usage_count || 0} / {c.max_usage || '∞'}</span>
                            <div className="flex items-center justify-end gap-2">
                                <button className="p-2 rounded-lg hover:bg-white/[0.05] text-white/40 hover:text-white transition-colors">
                                    <Edit size={14} />
                                </button>
                                <button className="p-2 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-colors">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
