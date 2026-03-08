"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Bell, Package, ShoppingCart, User as UserIcon, ArrowRight } from "lucide-react";
import {
    AdminCard,
    AdminPageHeader
} from "@/components/admin/AdminUI";

export default function NotificationsContent() {
    const [notifications, setNotifications] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchNotifications() {
            const { data: orders } = await supabase
                .from('orders')
                .select('id, created_at, payment_status, total_amount, user_id')
                .order('created_at', { ascending: false })
                .limit(20)

            const notifs = (orders || []).map(order => ({
                id: order.id,
                type: 'order',
                title: `Incoming Order #${order.id.slice(-8).toUpperCase()}`,
                description: `Payment confirmed for ₹${order.total_amount?.toLocaleString("en-IN")}. Ready for dispatch.`,
                time: order.created_at,
                read: false,
                icon: 'order'
            }))

            setNotifications(notifs)
            setLoading(false)
        }
        fetchNotifications()
    }, [])

    const iconMap: Record<string, any> = {
        order: ShoppingCart,
        product: Package,
        user: UserIcon,
        default: Bell,
    }

    return (
        <div className="space-y-8 max-w-4xl mx-auto px-4">
            <AdminPageHeader
                title="Notifications"
                subtitle="Live activity stream from your customers and store operations."
            />

            {loading ? (
                <div className="space-y-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }} className="h-24 rounded-[2rem] animate-pulse" />
                    ))}
                </div>
            ) : notifications.length === 0 ? (
                <AdminCard className="py-24 flex flex-col items-center justify-center text-center">
                    <div
                        style={{ background: "color-mix(in srgb, var(--accent) 5%, transparent)", border: "1px solid var(--border)", color: "var(--text-3)" }}
                        className="w-20 h-20 rounded-[2rem] flex items-center justify-center mb-6"
                    >
                        <Bell size={40} className="opacity-10" />
                    </div>
                    <h3 style={{ color: "var(--text)" }} className="font-bold text-xl">All systems clear.</h3>
                    <p style={{ color: "var(--text-3)" }} className="text-sm mt-1 max-w-xs font-medium">No new alerts to attend to. Your dashboard is up to date.</p>
                </AdminCard>
            ) : (
                <div className="space-y-4">
                    {notifications.map((notif) => {
                        const Icon = iconMap[notif.type] || iconMap.default
                        return (
                            <AdminCard
                                key={notif.id}
                                className="flex items-center gap-6 p-6 hover:bg-[var(--bg-elevated)] transition-all group scale-100 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                            >
                                <div
                                    style={{
                                        background: "color-mix(in srgb, var(--accent) 10%, transparent)",
                                        borderColor: "color-mix(in srgb, var(--accent) 20%, transparent)"
                                    }}
                                    className="p-4 rounded-2xl border shrink-0 transition-colors group-hover:border-[var(--accent)]"
                                >
                                    <Icon size={20} style={{ color: "var(--accent)" }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-4 mb-1">
                                        <p style={{ color: "var(--text)" }} className="text-sm font-bold tracking-tight">{notif.title}</p>
                                        <span style={{ color: "var(--text-3)" }} className="text-[9px] font-black uppercase tracking-widest bg-[var(--bg-elevated)] px-2.5 py-1 rounded-full border border-[var(--border)] shrink-0 group-hover:bg-[var(--accent)] group-hover:text-white transition-colors">
                                            {formatTime(notif.time)}
                                        </span>
                                    </div>
                                    <p style={{ color: "var(--text-3)" }} className="text-[11px] font-medium leading-relaxed italic line-clamp-1">{notif.description}</p>
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ArrowRight size={16} className="text-[var(--text-3)]" />
                                </div>
                            </AdminCard>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

function formatTime(iso: string) {
    const d = new Date(iso)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const mins = Math.floor(diff / 60000)
    const hours = Math.floor(mins / 60)
    const days = Math.floor(hours / 24)

    if (mins < 1) return "Just Now"
    if (mins < 60) return `${mins}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
}
