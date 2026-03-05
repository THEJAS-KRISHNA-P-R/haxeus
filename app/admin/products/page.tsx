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
  AdminTableRow
} from "@/components/admin/AdminUI";
import { cn } from "@/lib/utils";

export default function ProductsManagementPage() {
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
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", deleteProductId)

      if (error) throw error

      setProducts(products.filter((p) => p.id !== deleteProductId))
      setDeleteProductId(null)
    } catch (error) {
      console.error("Error deleting product:", error)
      alert("Failed to delete product")
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
          subtitle="Manage your product inventory and stock levels."
        />
        <Link href="/admin/products/new">
          <button
            data-testid="add-product-btn"
            className="flex items-center gap-2 bg-[var(--accent)] text-white px-5 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider hover:brightness-110 transition-all shadow-lg shadow-red-500/20"
          >
            <Plus size={16} />
            Add Product
          </button>
        </Link>
      </div>

      <AdminCard>
        {/* Search Bar */}
        <div
          style={{ borderBottom: "1px solid var(--border)" }}
          className="px-6 py-4"
        >
          <div className="relative max-w-sm">
            <Search
              style={{ color: "var(--text-3)" }}
              className="absolute left-3 top-1/2 transform -translate-y-1/2"
              size={16}
            />
            <input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border)",
                color: "var(--text)",
              }}
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl focus:outline-none focus:border-[var(--accent)] transition-all placeholder:opacity-30"
            />
          </div>
        </div>

        {/* Products Table Content */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center gap-4">
              <div
                style={{ borderColor: "var(--border)", borderTopColor: "var(--accent)" }}
                className="w-8 h-8 rounded-full border-2 animate-spin"
              />
              <p style={{ color: "var(--text-3)" }} className="text-[10px] font-bold uppercase tracking-widest">Loading Inventory...</p>
            </div>
          ) : (
            <div className="min-w-[900px]">
              <AdminTableHeader cols="grid-cols-[80px_2fr_1fr_1fr_1fr_1fr_0.8fr] !py-4">
                <div>Image</div>
                <div>Product Info</div>
                <div>Price</div>
                <div>Inventory</div>
                <div>Sizes</div>
                <div>Status</div>
                <div className="text-right">Actions</div>
              </AdminTableHeader>

              <div className="divide-y" style={{ borderColor: "var(--border)" }}>
                {filteredProducts.length === 0 ? (
                  <div style={{ color: "var(--text-3)" }} className="px-6 py-16 text-center text-sm font-medium">
                    No products matching your search.
                  </div>
                ) : (
                  filteredProducts.map((product) => (
                    <AdminTableRow key={product.id} cols="grid-cols-[80px_2fr_1fr_1fr_1fr_1fr_0.8fr]" className="items-center py-4">
                      <div>
                        <div
                          style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}
                          className="relative h-14 w-14 rounded-xl overflow-hidden p-1"
                        >
                          <Image
                            src={product.front_image || "/placeholder.jpg"}
                            alt={product.name}
                            fill
                            className="object-contain p-1"
                          />
                        </div>
                      </div>
                      <div className="pr-4">
                        <p style={{ color: "var(--text)" }} className="font-bold text-xs truncate">{product.name}</p>
                        <p style={{ color: "var(--text-3)" }} className="text-[10px] font-bold uppercase tracking-wider mt-0.5">
                          {product.category || "Apparel"}
                        </p>
                      </div>
                      <div>
                        <p style={{ color: "var(--text)" }} className="font-bold text-xs tabular-nums">
                          ₹{product.price.toLocaleString("en-IN")}
                        </p>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span style={{ color: "var(--text)" }} className="text-xs font-bold">{product.total_stock}</span>
                          {product.total_stock < 20 && (
                            <span title="Low stock">
                              <AlertCircle
                                size={12}
                                className="text-orange-500"
                              />
                            </span>
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="flex flex-wrap gap-1">
                          {product.available_sizes?.slice(0, 3).map((size) => (
                            <span
                              key={size}
                              style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-2)" }}
                              className="text-[9px] font-bold px-1.5 py-0.5 rounded-md border"
                            >
                              {size}
                            </span>
                          ))}
                          {product.available_sizes?.length > 3 && (
                            <span
                              style={{ color: "var(--text-3)" }}
                              className="text-[9px] font-bold"
                            >
                              +{product.available_sizes.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                      <div>
                        <span
                          className={cn(
                            "inline-flex items-center px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider border",
                            product.total_stock > 0 ? "text-emerald-500" : "text-rose-500"
                          )}
                          style={{
                            background: product.total_stock > 0
                              ? "color-mix(in srgb, #10b981 10%, transparent)"
                              : "color-mix(in srgb, #f43f5e 10%, transparent)",
                            borderColor: product.total_stock > 0
                              ? "color-mix(in srgb, #10b981 20%, transparent)"
                              : "color-mix(in srgb, #f43f5e 20%, transparent)"
                          }}
                        >
                          {product.total_stock > 0 ? "Active" : "OOS"}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/admin/products/${product.id}/edit`}>
                            <button
                              style={{ color: "var(--text-3)" }}
                              className="p-2 hover:bg-[var(--bg-elevated)] hover:text-[var(--text)] transition-all rounded-xl"
                            >
                              <Edit size={16} />
                            </button>
                          </Link>
                          <button
                            onClick={() => setDeleteProductId(product.id)}
                            className="p-2 hover:bg-rose-500/10 text-[var(--accent)] transition-all rounded-xl"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </AdminTableRow>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </AdminCard>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteProductId !== null}
        onOpenChange={(open) => !open && setDeleteProductId(null)}
      >
        <AlertDialogContent style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }} className="rounded-2xl shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle style={{ color: "var(--text)" }} className="font-bold">Permanently delete product?</AlertDialogTitle>
            <AlertDialogDescription style={{ color: "var(--text-3)" }}>
              This action cannot be undone. This will remove the product and all its history from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 mt-4">
            <AlertDialogCancel
              style={{ background: "var(--bg-elevated)", color: "var(--text-3)", border: "1px solid var(--border)" }}
              className="rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-[var(--bg-card)] transition-all"
            >
              Wait, Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProduct}
              className="bg-[var(--accent)] text-white hover:brightness-110 rounded-xl font-bold text-xs uppercase tracking-wider transition-all"
            >
              Yes, Delete Product
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
