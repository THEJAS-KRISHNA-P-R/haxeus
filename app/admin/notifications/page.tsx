"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Bell, Package, ShoppingCart, User as UserIcon } from "lucide-react";
import {
    AdminCard,
    AdminPageHeader
} from "@/components/admin/AdminUI";
import { cn } from "@/lib/utils";

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchNotifications() {
            // Fetch recent orders as notifications
            const { data: orders } = await supabase
                .from('orders')
                .select('id, created_at, payment_status, total_amount, user_id')
                .order('created_at', { ascending: false })
                .limit(20)

            const notifs = (orders || []).map(order => ({
                id: order.id,
                type: 'order',
                title: `New order #${order.id.slice(-8).toUpperCase()}`,
                description: `Received a new payment of ₹${order.total_amount?.toLocaleString("en-IN")}.`,
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
        <div className="space-y-6 max-w-3xl">
            <div className="mb-2">
                <AdminPageHeader
                    title="Notifications"
                    subtitle="Stay updated with the latest activity and events across your store."
                />
            </div>

            {loading ? (
                <div className="space-y-3">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }} className="h-20 rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : notifications.length === 0 ? (
                <AdminCard className="py-20 flex flex-col items-center justify-center text-center">
                    <div
                        style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-3)" }}
                        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                    >
                        <Bell size={32} className="opacity-20" />
                    </div>
                    <p style={{ color: "var(--text)" }} className="font-bold text-lg">All caught up!</p>
                    <p style={{ color: "var(--text-3)" }} className="text-sm mt-1">No new notifications or activities to show at the moment.</p>
                </AdminCard>
            ) : (
                <div className="space-y-3">
                    {notifications.map((notif, i) => {
                        const Icon = iconMap[notif.type] || iconMap.default
                        return (
                            <AdminCard
                                key={notif.id}
                                className="flex items-start gap-4 p-5 hover:bg-[var(--bg-elevated)] transition-all group"
                            >
                                <div
                                    style={{
                                        background: "color-mix(in srgb, var(--accent) 10%, transparent)",
                                        borderColor: "color-mix(in srgb, var(--accent) 20%, transparent)"
                                    }}
                                    className="p-3 rounded-xl border shrink-0"
                                >
                                    <Icon size={18} style={{ color: "var(--accent)" }} />
                                </div>
                                <div className="flex-1 min-w-0 pt-0.5">
                                    <div className="flex items-center justify-between gap-4">
                                        <p style={{ color: "var(--text)" }} className="text-sm font-bold">{notif.title}</p>
                                        <span style={{ color: "var(--text-3)" }} className="text-[10px] font-bold uppercase tracking-wider shrink-0">
                                            {new Date(notif.time).toLocaleDateString('en-IN', {
                                                day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                    <p style={{ color: "var(--text-2)" }} className="text-xs font-medium mt-1 leading-relaxed">{notif.description}</p>
                                </div>
                            </AdminCard>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
