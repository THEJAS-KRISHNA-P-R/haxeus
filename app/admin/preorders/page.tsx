"use client"

import { useState, useEffect } from "react"
import { supabase, type Product } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Edit, Package, Users, CheckCircle2 } from "lucide-react"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { useTheme } from "@/components/ThemeProvider"
import Link from "next/link"

// --- Registrations Drawer ---
function RegistrationsDrawer({ productId, isDark, children }: { productId: number, isDark: boolean, children: React.ReactNode }) {
    const [registrations, setRegistrations] = useState<{ email: string, created_at: string }[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchRegistrations = async () => {
        setLoading(true);
        const { data } = await supabase.from('preorder_registrations')
            .select('email, created_at')
            .eq('product_id', productId)
            .order('created_at', { ascending: false });
        setRegistrations(data || []);
        setLoading(false);
    };

    return (
        <Drawer>
            <DrawerTrigger asChild onClick={fetchRegistrations}>{children}</DrawerTrigger>
            <DrawerContent className={isDark ? "bg-[#0f0f0f] border-t-white/[0.07] text-white" : "bg-[#ffffff] border-t-black/[0.07] text-black"}>
                <div className="container mx-auto py-8">
                    <DrawerHeader>
                        <DrawerTitle>Pre-Order Registrations</DrawerTitle>
                    </DrawerHeader>
                    {loading ? <p className="mt-4">Loading...</p> : (
                        <div className="mt-4">
                            {registrations.length > 0 ? (
                                <ul className="space-y-2">
                                    {registrations.map(reg => (
                                        <li key={reg.created_at + reg.email} className={`flex justify-between items-center p-3 rounded-lg ${isDark ? 'bg-white/[0.05]' : 'bg-black/[0.04]'}`}>
                                            <span>{reg.email}</span>
                                            <span className={`text-xs ${isDark ? 'text-white/50' : 'text-black/55'}`}>{new Date(reg.created_at).toLocaleString()}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : <p className="text-center text-sm opacity-50 mt-8 mb-4">No registrations yet.</p>}
                        </div>
                    )}
                </div>
            </DrawerContent>
        </Drawer>
    );
}

export default function PreordersAdminPage() {
    const { theme } = useTheme()
    const [mounted, setMounted] = useState(false)
    const [items, setItems] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const isDark = !mounted ? true : theme === "dark"

    useEffect(() => setMounted(true), [])

    async function fetchPreorders() {
        setLoading(true)
        const { data, error } = await supabase.from("products").select(`
            id, name, price, front_image,
            is_preorder, preorder_status,
            expected_date, max_preorders, preorder_count
        `).eq("is_preorder", true).order('id', { ascending: false });

        if (data) {
            setItems(data as Product[]);
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchPreorders()
    }, [])

    async function handleStatusChange(productId: number, newStatus: string) {
        const { error } = await supabase
            .from("products")
            .update({ preorder_status: newStatus })
            .eq("id", productId)
            .eq("is_preorder", true);
        
        if (error) {
            toast.error("Failed to update status");
        } else {
            toast.success("Status updated");
            fetchPreorders();
        }
    }

    const stats = {
        total: items.length,
        active: items.filter(i => i.preorder_status === 'active').length,
        totalRegs: items.reduce((sum, i) => sum + (i.preorder_count || 0), 0)
    }

    const statCards = [
        { title: "Total Pre-Orders", value: stats.total, icon: Package },
        { title: "Active Pre-Orders", value: stats.active, icon: CheckCircle2 },
        { title: "Total Registrations", value: stats.totalRegs, icon: Users },
    ]

    const statusClasses: { [key: string]: string } = {
        active: "bg-emerald-500/20 text-emerald-400",
        sold_out: "bg-red-500/20 text-red-400",
        stopped: isDark ? "bg-white/10 text-white/50" : "bg-black/10 text-black/55",
    }

    return (
        <div className={`min-h-screen ${isDark ? 'bg-[#0a0a0a] text-white' : 'bg-[#f5f4f0] text-black'}`}>
            <div className="flex justify-between items-center mb-8">
                <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>Pre-Orders</h1>
                <Link href="/admin/products/new?preorder=true">
                    <button className="bg-[#e93a3a] hover:bg-[#ff4a4a] text-white font-bold rounded-full px-6 h-10 text-sm tracking-wide shadow-lg shadow-[#e93a3a]/20">
                        + Add Pre-Order
                    </button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {statCards.map(card => (
                    <div key={card.title} className={`rounded-2xl p-6 flex items-center gap-6 border ${isDark ? 'bg-white/[0.03] border-white/[0.07]' : 'bg-black/[0.02] border-black/[0.07]'}`}>
                        <div className={`p-4 rounded-xl ${isDark ? 'bg-white/[0.05]' : 'bg-black/[0.04]'}`}>
                            <card.icon className={`h-6 w-6 ${isDark ? 'text-white/80' : 'text-black/65'}`} />
                        </div>
                        <div>
                            <p className={`text-sm font-medium ${isDark ? 'text-white/50' : 'text-black/55'}`}>{card.title}</p>
                            <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>{card.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-white/[0.03] border-white/[0.07]' : 'bg-black/[0.02] border-black/[0.07]'}`}>
                <table className="w-full">
                    <thead>
                        <tr className={`border-b ${isDark ? 'border-white/[0.07]' : 'border-black/[0.07]'}`}>
                            <th className={`p-4 text-left text-sm font-semibold ${isDark ? 'text-white/50' : 'text-black/55'}`}>Image</th>
                            <th className={`p-4 text-left text-sm font-semibold ${isDark ? 'text-white/50' : 'text-black/55'}`}>Name</th>
                            <th className={`p-4 text-left text-sm font-semibold ${isDark ? 'text-white/50' : 'text-black/55'}`}>Price</th>
                            <th className={`p-4 text-left text-sm font-semibold ${isDark ? 'text-white/50' : 'text-black/55'}`}>Status</th>
                            <th className={`p-4 text-left text-sm font-semibold ${isDark ? 'text-white/50' : 'text-black/55'}`}>Registrations</th>
                            <th className={`p-4 text-left text-sm font-semibold ${isDark ? 'text-white/50' : 'text-black/55'}`}>Expected Date</th>
                            <th className={`p-4 text-right text-sm font-semibold ${isDark ? 'text-white/50' : 'text-black/55'}`}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="p-8 text-center opacity-50">No pre-orders found.</td>
                            </tr>
                        ) : items.map(item => (
                            <tr key={item.id} className={`border-b last:border-b-0 ${isDark ? 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.04]' : 'bg-black/[0.01] border-black/[0.05] hover:bg-black/[0.03]'}`}>
                                <td className="p-4">
                                    <img src={item.front_image || '/placeholder.svg'} alt={item.name} className="w-12 h-12 object-cover rounded-lg bg-black/10" />
                                </td>
                                <td className={`p-4 font-medium ${isDark ? 'text-white' : 'text-black'}`}>{item.name}</td>
                                <td className={`p-4 ${isDark ? 'text-white' : 'text-black'}`}>₹{item.price}</td>
                                <td className="p-4">
                                    <Select 
                                        value={item.preorder_status || 'active'} 
                                        onValueChange={(val) => handleStatusChange(item.id, val)}
                                    >
                                        <SelectTrigger className={`h-8 text-xs font-bold rounded-full w-32 border-none ${statusClasses[item.preorder_status || 'active'] || 'bg-gray-500/20 text-gray-400'}`}>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className={isDark ? "bg-[#0f0f0f] border-white/[0.07] text-white" : "bg-[#ffffff] border-black/[0.07] text-black"}>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="sold_out">Sold Out</SelectItem>
                                            <SelectItem value="stopped">Stopped</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </td>
                                <td className="p-4 text-center">
                                    <RegistrationsDrawer productId={item.id} isDark={isDark}>
                                        <Button variant="link" className={isDark ? "text-white/80 hover:text-white" : "text-black/65 hover:text-black"}>
                                            {item.preorder_count || 0}
                                        </Button>
                                    </RegistrationsDrawer>
                                </td>
                                <td className={`p-4 ${isDark ? 'text-white/50' : 'text-black/55'}`}>{item.expected_date || 'N/A'}</td>
                                <td className="p-4 text-right">
                                    <Link href={`/admin/products/${item.id}/edit`}>
                                        <Button variant="ghost" className={`h-8 w-8 p-0 ${isDark ? "text-white/70 hover:text-white hover:bg-white/[0.06]" : "text-black/70 hover:text-black hover:bg-black/[0.06]"}`}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
