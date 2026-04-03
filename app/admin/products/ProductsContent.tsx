"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Product } from "@/types/supabase";
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
    AdminSearchInput,
    AdminButton,
    AdminTableHeader,
    AdminTableRow
} from "@/components/admin/AdminUI";

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

            setProducts(productsWithImages as Product[])
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
                <div className="p-2 overflow-x-auto">
                    <div className="min-w-[800px]">
                        <AdminTableHeader cols="grid-cols-[2.5fr_1.2fr_1fr_1fr_1.2fr] border-none !bg-transparent">
                            <div className="pl-4">Product Engine Item</div>
                            <div>Classification</div>
                            <div>Price Terminal</div>
                            <div>Runtime Status</div>
                            <div className="pr-4 text-right">System Actions</div>
                        </AdminTableHeader>

                        <div className="divide-y divide-[var(--border)]/50">
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <div key={i} className="px-6 py-8 flex items-center justify-between gap-4 animate-pulse">
                                        <div className="h-4 bg-[var(--bg-elevated)]/50 rounded-full w-full opacity-20" />
                                    </div>
                                ))
                            ) : filteredProducts.length === 0 ? (
                                <div className="py-24 text-center">
                                    <div className="flex flex-col items-center gap-3 opacity-20">
                                        <Search size={48} className="text-[var(--text-3)]" />
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em]">Zero assets matched search query</p>
                                    </div>
                                </div>
                            ) : (
                                filteredProducts.map((product) => (
                                    <AdminTableRow 
                                        key={product.id} 
                                        cols="grid-cols-[2.5fr_1.2fr_1fr_1fr_1.2fr]"
                                        className="py-4 hover:bg-white/[0.02]"
                                    >
                                        <div className="pl-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl overflow-hidden border border-[var(--border)] bg-black shrink-0 relative group-hover/row:border-[var(--accent)] transition-all">
                                                    <Image
                                                        src={product.front_image || "/placeholder.svg"}
                                                        alt={product.name}
                                                        fill
                                                        sizes="48px"
                                                        className="object-cover transition-transform duration-500 group-hover/row:scale-110"
                                                    />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[11px] font-black uppercase tracking-tight text-[var(--text)] truncate">{product.name}</p>
                                                    <p className="text-[9px] text-[var(--text-3)] font-black opacity-40 uppercase tracking-widest mt-0.5">ID: {String(product.id).padStart(4, '0')}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <span 
                                                className="inline-flex items-center px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-[0.2em] border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-3)] opacity-70"
                                            >
                                                {product.category || "UNCATEGORIZED"}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-[12px] font-black text-[var(--text)] tracking-tight">₹{product.price.toLocaleString("en-IN")}</p>
                                        </div>
                                        <div>
                                            {product.is_active ? (
                                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 border border-green-500/20 text-[8px] font-black uppercase tracking-widest">
                                                    <span className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                                                    LIVE
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20 text-[8px] font-black uppercase tracking-widest">
                                                    <span className="w-1 h-1 rounded-full bg-rose-500" />
                                                    INACTIVE
                                                </span>
                                            )}
                                        </div>
                                        <div className="pr-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link href={`/admin/products/${product.id}/edit`}>
                                                    <button className="p-2 rounded-xl text-[var(--text-3)] hover:text-[var(--text)] hover:border-[var(--text-3)] border border-transparent transition-all bg-[var(--bg-elevated)]/50 hover:bg-[var(--bg-elevated)]">
                                                        <Edit size={14} />
                                                    </button>
                                                </Link>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setDeleteProductId(product.id);
                                                    }}
                                                    className="p-2 rounded-xl transition-all bg-[var(--color-accent, #e93a3a)]/10 text-[var(--color-accent, #e93a3a)] hover:bg-[var(--color-accent, #e93a3a)]/20"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </AdminTableRow>
                                ))
                            )}
                        </div>
                    </div>
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

