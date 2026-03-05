"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Bell, Package, ShoppingCart, User } from "lucide-react"

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchNotifications() {
            // Fetch recent orders as notifications
            const { data: orders } = await supabase
                .from('orders')
                .select('id, created_at, status, total_amount, user_id')
                .order('created_at', { ascending: false })
                .limit(20)

            const notifs = (orders || []).map(order => ({
                id: order.id,
                type: 'order',
                title: `New order #${order.id.slice(0, 8)}`,
                description: `Status: ${order.status} — ₹${order.total_amount}`,
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
        user: User,
        default: Bell,
    }

    return (
        <div className="p-6 max-w-2xl">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-white">Notifications</h1>
                <p className="text-white/40 text-sm mt-1">Recent activity across your store</p>
            </div>

            {loading ? (
                <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-16 rounded-xl bg-white/[0.04] animate-pulse" />
                    ))}
                </div>
            ) : notifications.length === 0 ? (
                <div className="text-center py-16 text-white/30">
                    <Bell className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p>No notifications yet</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {notifications.map(notif => {
                        const Icon = iconMap[notif.type] || iconMap.default
                        return (
                            <div
                                key={notif.id}
                                className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] transition-colors"
                            >
                                <div className="p-2 rounded-lg bg-[#e93a3a]/10 shrink-0">
                                    <Icon className="h-4 w-4 text-[#e93a3a]" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white">{notif.title}</p>
                                    <p className="text-xs text-white/40 mt-0.5">{notif.description}</p>
                                </div>
                                <span className="text-xs text-white/30 shrink-0">
                                    {new Date(notif.time).toLocaleDateString('en-IN', {
                                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                                    })}
                                </span>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
