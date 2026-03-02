"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase, type ProductImage, type ProductInventory } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { ImageGalleryManager } from "@/components/admin/ImageGalleryManager"
import { SizeInventoryManager } from "@/components/admin/SizeInventoryManager"

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
  const [saving, setSaving] = useState(false)
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
      console.log("=== CREATING NEW PRODUCT ===")
      console.log("Form Data:", formData)

      // Verify user is logged in
      const { data: { user } } = await supabase.auth.getUser()
      console.log("Current User:", user?.email, "UUID:", user?.id)

      if (!user) {
        alert("You must be logged in to add products")
        setSaving(false)
        return
      }

      // Calculate total stock from inventory
      const totalStock = formData.inventory.reduce((sum, inv) => sum + inv.stock_quantity, 0)
      const availableSizes = formData.inventory.map(inv => inv.size)

      console.log("Inserting product into database...")

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
          front_image: formData.images[0]?.image_url || null,
          back_image: formData.images[1]?.image_url || null,
        })
        .select('id')

      if (productError) {
        console.error("Product insert error:", productError)
        console.error("Error details:", {
          code: productError.code,
          message: productError.message,
          details: productError.details,
          hint: productError.hint,
        })
        throw productError
      }

      console.log("Insert result:", insertResult)
      const newProductId = insertResult?.[0]?.id
      console.log("Product created with ID:", newProductId)

      if (!newProductId) {
        console.warn("Product created but couldn't get ID - redirecting anyway")
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
        console.log("Inserting images:", imagesWithProductId)

        const { data: imgResult, error: imagesError } = await supabase
          .from("product_images")
          .insert(imagesWithProductId)
          .select()

        if (imagesError) {
          console.error("Images insert error:", imagesError)
        } else {
          console.log("Images inserted:", imgResult)
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
        console.log("Inserting inventory:", inventoryWithProductId)

        const { data: invResult, error: inventoryError } = await supabase
          .from("product_inventory")
          .insert(inventoryWithProductId)
          .select()

        if (inventoryError) {
          console.error("Inventory insert error:", inventoryError)
        } else {
          console.log("Inventory inserted:", invResult)
        }
      }

      console.log("Product creation complete! Redirecting...")
      router.refresh()
      router.push("/admin/products")
    } catch (error: any) {
      console.error("=== ERROR CREATING PRODUCT ===")
      console.error("Error:", error)
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
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/products">
          <Button variant="ghost" size="icon" className="hover:bg-white/5">
            <ArrowLeft size={20} />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white">
            Add New Product
          </h1>
          <p className="text-white/40 mt-1">
            Create a new product with images and inventory tracking
          </p>
        </div>
      </div>

      {/* Basic Product Info */}
      <Card className="bg-[#111] border border-white/[0.06] border-white/[0.06]">
        <CardHeader>
          <CardTitle className="text-white">Product Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Name & Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white/60">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., BUSTED Vintage Tee"
                className="bg-[#111] border-white/[0.06] text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-white/60">Category</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g., apparel"
                className="bg-[#111] border-white/[0.06] text-white"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-white/60">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed product description..."
              rows={4}
              className="bg-[#111] border-white/[0.06] text-white"
            />
          </div>

          {/* Price & Colors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="price" className="text-white/60">Price (₹) *</Label>
              <Input
                id="price"
                type="number"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                placeholder="2999"
                className="bg-[#111] border-white/[0.06] text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="colors" className="text-white/60">Available Colors</Label>
              <Input
                id="colors"
                value={formData.colors.join(", ")}
                onChange={(e) => updateColors(e.target.value)}
                placeholder="Black, White, Navy"
                className="bg-[#111] border-white/[0.06] text-white"
              />
              <p className="text-xs text-white/40">
                Separate multiple colors with commas
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

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

      {/* Actions */}
      <div className="flex justify-end gap-3 pb-8">
        <Link href="/admin/products">
          <Button variant="outline" className="border-white/[0.06] hover:bg-white/5">
            Cancel
          </Button>
        </Link>
        <Button
          onClick={handleSave}
          disabled={saving || !formData.name || formData.price <= 0}
          className="gap-2 bg-red-600 hover:bg-red-700"
        >
          <Save size={16} />
          {saving ? "Creating..." : "Create Product"}
        </Button>
      </div>
    </div>
  )
}
