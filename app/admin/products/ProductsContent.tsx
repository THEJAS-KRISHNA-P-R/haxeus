"use client";
import { useState, useEffect } from "react";
import { supabase, type Product } from "@/lib/supabase";
import { Plus, Search, Edit, Trash2, AlertCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    AdminCard,
    AdminPageHeader,
    AdminTableHeader,
    AdminTableRow,
    AdminSearchInput,
    AdminButton
} from "@/components/admin/AdminUI";
import { cn } from "@/lib/utils";

export default function ProductsManagementContent() {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [deleteProductId, setDeleteProductId] = useState<number | null>(null)

    useEffect(() => {
        loadProducts()
    }, [])

    // Also reload when the page regains focus (after returning from edit page)
    useEffect(() => {
        const handleFocus = () => {
            loadProducts()
        }
        window.addEventListener('focus', handleFocus)
        return () => window.removeEventListener('focus', handleFocus)
    }, [])

    async function loadProducts() {
        try {
            // Load products with their images
            const { data: productsData, error } = await supabase
                .from("products")
                .select(`
          *,
          images:product_images(id, image_url, is_primary, display_order)
        `)
                .order("created_at", { ascending: false })

            if (error) throw error

            // Type cast and add computed properties
            const productsWithImages = (productsData || []).map(p => ({
                ...p,
                images: p.images || []
            }))

            setProducts(productsWithImages as any)
        } catch (error) {
            console.error("Error loading products:", error)
        } finally {
            setLoading(false)
        }
    }

    async function handleDeleteProduct() {
        if (!deleteProductId) return

        try {
            // Soft delete — set is_active to false instead of permanent delete
            const { error } = await supabase
                .from("products")
                .update({ is_active: false })
                .eq("id", deleteProductId)

            if (error) throw error

            setProducts(products.filter((p) => p.id !== deleteProductId))
            setDeleteProductId(null)
        } catch (error) {
            console.error("Error deactivating product:", error)
            alert("Failed to deactivate product")
        }
    }

    const filteredProducts = products.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
                <AdminPageHeader
                    title="Products"
                    subtitle="Manage your product catalog, visibility and inventory"
                />
                <AdminButton
                    icon={Plus}
                    href="/admin/products/new"
                    className="shadow-xl shadow-red-500/10"
                >
                    Add Product
                </AdminButton>
            </div>

            {/* Search & Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
                <div className="lg:col-span-3">
                    <AdminSearchInput
                        value={searchQuery}
                        onChange={setSearchQuery}
                        onClear={() => setSearchQuery("")}
                        placeholder="Search products by name, category or status..."
                        className="w-full"
                    />
                </div>
                <AdminCard className="flex items-center justify-center p-3 bg-[var(--bg-elevated)]/50">
                    <div className="text-center">
                        <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-3)]">Total Live</p>
                        <p className="text-xl font-black text-[var(--accent)]">{products.filter(p => p.is_active).length}</p>
                    </div>
                </AdminCard>
            </div>

            {/* Products Table */}
            <AdminCard className="overflow-hidden border-[var(--border)] shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-[var(--border)] bg-[var(--bg-elevated)]/30 text-[var(--text-3)]">
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Product</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Category</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Price</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="px-6 py-8">
                                            <div className="h-4 bg-[var(--bg-elevated)] rounded-full w-full opacity-20" />
                                        </td>
                                    </tr>
                                ))
                            ) : filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3 opacity-20">
                                            <Search size={48} />
                                            <p className="text-sm font-bold uppercase tracking-widest">No products found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredProducts.map((product) => (
                                    <tr key={product.id} className="hover:bg-[var(--bg-elevated)]/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl overflow-hidden border border-[var(--border)] bg-black shrink-0 relative">
                                                    <Image
                                                        src={product.front_image || "/placeholder.svg"}
                                                        alt={product.name}
                                                        fill
                                                        sizes="48px"
                                                        className="object-cover transition-transform group-hover:scale-110"
                                                    />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-black text-[var(--text)] truncate">{product.name}</p>
                                                    <p className="text-[10px] text-[var(--text-3)] font-medium">ID: #{String(product.id).padStart(4, '0')}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-2)]">
                                                {product.category || "Uncategorized"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-black text-[var(--text)]">₹{product.price.toLocaleString("en-IN")}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            {product.is_active ? (
                                                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500 flex items-center gap-1.5">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                    Live
                                                </span>
                                            ) : (
                                                <span className="text-[9px] font-black uppercase tracking-widest text-rose-500 flex items-center gap-1.5">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                                    Inactive
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link href={`/admin/products/${product.id}/edit`}>
                                                    <button className="p-2.5 rounded-xl bg-[var(--bg-elevated)] text-[var(--text-3)] hover:text-[var(--text)] hover:border-[var(--text-3)] border border-transparent transition-all">
                                                        <Edit size={14} />
                                                    </button>
                                                </Link>
                                                <button
                                                    onClick={() => setDeleteProductId(product.id)}
                                                    className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </AdminCard>

            {/* Delete Confirmation */}
            <AlertDialog
                open={!!deleteProductId}
                onOpenChange={(open) => !open && setDeleteProductId(null)}
            >
                <AlertDialogContent className="bg-[var(--bg-card)] border-[var(--border)] rounded-2xl">
                    <AlertDialogHeader>
                        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 mb-4">
                            <AlertCircle size={24} />
                        </div>
                        <AlertDialogTitle className="text-xl font-black text-[var(--text)] uppercase tracking-tight">Deactivate Product?</AlertDialogTitle>
                        <AlertDialogDescription className="text-[var(--text-2)]">
                            This will hide the product from the storefront. You can reactivate it later from the edit page.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2">
                        <AlertDialogCancel className="rounded-xl border-[var(--border)] bg-transparent text-[var(--text-2)] font-bold uppercase tracking-widest text-[10px] h-11 px-6">
                            Skip
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteProduct}
                            className="rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold uppercase tracking-widest text-[10px] h-11 px-6 border-none shadow-lg shadow-rose-500/20"
                        >
                            Deactivate
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
