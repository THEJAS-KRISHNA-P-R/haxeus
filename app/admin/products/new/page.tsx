"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase, type ProductImage, type ProductInventory } from "@/lib/supabase"
import { AdminCard, AdminPageHeader, AdminInput, AdminButton, AdminSelect } from "@/components/admin/AdminUI"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { ImageGalleryManager } from "@/components/admin/ImageGalleryManager"
import { SizeInventoryManager } from "@/components/admin/SizeInventoryManager"
import { Toggle } from "@/components/ui/Toggle"
import { motion } from "framer-motion"

interface ProductFormData {
  name: string
  description: string
  price: number
  category: string
  colors: string[]
  images: ProductImage[]
  inventory: ProductInventory[]
}

export default function NewProductPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [saving, setSaving] = useState(false)

  const [isPreorder, setIsPreorder] = useState(searchParams?.get("preorder") === "true")
  const [preorderStatus, setPreorderStatus] = useState<"active" | "sold_out" | "stopped">("active")
  const [expectedDate, setExpectedDate] = useState("")
  const [maxPreorders, setMaxPreorders] = useState<string>("")

  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    price: 0,
    category: "apparel",
    colors: ["Black"],
    images: [],
    inventory: [],
  })

  async function handleSave() {
    setSaving(true)
    try {

      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        alert("You must be logged in to add products")
        setSaving(false)
        return
      }

      // Calculate total stock from inventory
      const totalStock = formData.inventory.reduce((sum, inv) => sum + inv.stock_quantity, 0)
      const availableSizes = formData.inventory.map(inv => inv.size)


      // Create product
      const { data: insertResult, error: productError } = await supabase
        .from("products")
        .insert({
          name: formData.name,
          description: formData.description,
          price: formData.price,
          category: formData.category,
          colors: formData.colors,
          available_sizes: availableSizes.length > 0 ? availableSizes : ["S", "M", "L", "XL"],
          total_stock: totalStock,
          front_image: formData.images.find(img => img.is_primary)?.image_url || formData.images[0]?.image_url || null,
          back_image: formData.images.length > 1 ? (formData.images.find(img => !img.is_primary)?.image_url || formData.images[1]?.image_url) : null,
          // Preorder fields
          is_preorder: isPreorder,
          preorder_status: isPreorder ? preorderStatus : null,
          expected_date: isPreorder && expectedDate ? expectedDate : null,
          max_preorders: isPreorder && maxPreorders ? parseInt(maxPreorders) : null,
          preorder_count: 0,
        })
        .select('id')

      if (productError) throw productError

      const newProductId = insertResult?.[0]?.id

      if (!newProductId) {
        router.refresh()
        router.push("/admin/products")
        return
      }

      // Insert images if any
      if (formData.images.length > 0) {
        const imagesWithProductId = formData.images.map((img, index) => ({
          product_id: newProductId,
          image_url: img.image_url,
          display_order: index,
          is_primary: img.is_primary,
        }))

        const { error: imagesError } = await supabase
          .from("product_images")
          .insert(imagesWithProductId)

        if (imagesError) {
          console.error("Images insert error:", imagesError)
        }
      }

      // Insert inventory if any
      if (formData.inventory.length > 0) {
        const inventoryWithProductId = formData.inventory.map(inv => ({
          product_id: newProductId,
          size: inv.size,
          color: inv.color || "default",
          stock_quantity: inv.stock_quantity,
          low_stock_threshold: inv.low_stock_threshold,
          reserved_quantity: 0,
          sold_quantity: 0,
        }))

        const { error: inventoryError } = await supabase
          .from("product_inventory")
          .insert(inventoryWithProductId)

        if (inventoryError) {
          console.error("Inventory insert error:", inventoryError)
        }
      }

      router.refresh()
      router.push("/admin/products")
    } catch (error: any) {
      const errorMsg = error.message || "Unknown error occurred"
      alert(`Failed to create product: ${errorMsg}`)
    } finally {
      setSaving(false)
    }
  }

  function updateColors(colorsString: string) {
    const colorsArray = colorsString.split(",").map((c) => c.trim()).filter(c => c)
    setFormData({ ...formData, colors: colorsArray })
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="mb-2">
        <Link href="/admin/products" className="inline-flex mb-4">
          <AdminButton variant="ghost" icon={ArrowLeft} className="px-3 py-2 text-xs">
            Back to Products
          </AdminButton>
        </Link>
        <AdminPageHeader
          title="Add New Product"
          subtitle="Create a new product with images and inventory tracking"
        />
      </div>

      <div className="max-w-5xl space-y-6">

        {/* Basic Product Info */}
        <AdminCard className="p-6">
          <h2 style={{ color: "var(--text)" }} className="text-xl font-bold mb-6">Product Information</h2>
          <div className="space-y-6">
            {/* Name & Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AdminInput
                label="Product Name *"
                id="name"
                value={formData.name}
                onChange={(e: any) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., BUSTED Vintage Tee"
              />

              <div className="w-full">
                <AdminSelect
                  label="Category"
                  value={formData.category}
                  onChange={(e: any) => setFormData({ ...formData, category: e.target.value })}
                  options={[
                    { value: "tshirt", label: "T-Shirt" },
                    { value: "jersey", label: "Jersey" },
                    { value: "hoodie", label: "Hoodie" },
                    { value: "shorts", label: "Shorts" },
                    { value: "accessories", label: "Accessories" },
                    { value: "apparel", label: "Apparel" }
                  ]}
                />
              </div>
            </div>

            {/* Description */}
            <div className="w-full space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--text-3)] ml-2 opacity-70">Description</label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detailed product description..."
                rows={4}
                className="w-full p-4 rounded-2xl text-[11px] font-bold outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/10 transition-all placeholder:opacity-30 tracking-tight"
                style={{
                  background: "rgba(var(--bg-rgb), 0.05)",
                  border: "1px solid var(--border)",
                  color: "var(--text)",
                }}
              />
            </div>

            {/* Price & Colors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AdminInput
                label="Price (?) *"
                id="price"
                type="number"
                min={0}
                value={formData.price}
                onChange={(e: any) => setFormData({ ...formData, price: Number(e.target.value) })}
                placeholder="2999"
              />

              <div className="space-y-1">
                <AdminInput
                  label="Available Colors"
                  id="colors"
                  value={formData.colors.join(", ")}
                  onChange={(e: any) => updateColors(e.target.value)}
                  placeholder="Black, White, Navy"
                />
                <p style={{ color: "var(--text-3)" }} className="text-[9px] uppercase tracking-widest pl-2 pt-1 opacity-50">
                  Separate multiple colors with commas
                </p>
              </div>
            </div>
          </div>
        </AdminCard>

        {/* Image Gallery Manager */}
        <ImageGalleryManager
          images={formData.images}
          onChange={(images) => setFormData({ ...formData, images })}
        />

        {/* Size Inventory Manager */}
        <SizeInventoryManager
          inventory={formData.inventory}
          onChange={(inventory) => setFormData({ ...formData, inventory })}
        />

        {/* Preorder Section */}
        <AdminCard className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p style={{ color: "var(--text)" }} className="text-[14px] font-bold uppercase tracking-tight">
                Pre-Order
              </p>
              <p style={{ color: "var(--text-3)" }} className="text-[10px] font-black uppercase tracking-[0.2em] mt-1 opacity-70">
                List this product before it's in stock
              </p>
            </div>
            <Toggle
              checked={isPreorder}
              onChange={setIsPreorder}
              size="md"
            />
          </div>

          {/* Preorder fields — only visible when toggle is on */}
          {isPreorder && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 overflow-hidden"
              style={{ borderTop: "1px solid var(--border)" }}
            >
              <div className="w-full">
                <AdminSelect
                  label="Status"
                  value={preorderStatus}
                  onChange={(e: any) => setPreorderStatus(e.target.value as any)}
                  options={[
                    { value: "active", label: "Active — accepting registrations" },
                    { value: "sold_out", label: "Sold Out — no new registrations" },
                    { value: "stopped", label: "Stopped — hidden from public" }
                  ]}
                />
              </div>

              {/* Expected Date */}
              <div className="space-y-1">
                <AdminInput
                  label="Expected Date (optional)"
                  type="date"
                  value={expectedDate}
                  onChange={(e: any) => setExpectedDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>

              {/* Max Pre-orders */}
              <div className="space-y-1">
                <AdminInput
                  label="Max Pre-orders (optional)"
                  type="number"
                  value={maxPreorders}
                  onChange={(e: any) => setMaxPreorders(e.target.value)}
                  placeholder="e.g. 100"
                  min={1}
                />
              </div>
            </motion.div>
          )}
        </AdminCard>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4 pb-8">
          <Link href="/admin/products">
            <AdminButton variant="outline">
              Cancel
            </AdminButton>
          </Link>
          <AdminButton
            onClick={handleSave}
            disabled={saving || !formData.name || formData.price <= 0}
            variant="accent"
            icon={Save}
            loading={saving}
          >
            {saving ? "Creating..." : "Create Product"}
          </AdminButton>
        </div>
      </div>
    </div>
  )
}
