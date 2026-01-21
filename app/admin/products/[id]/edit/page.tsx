"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { supabase, type Product, type ProductImage, type ProductInventory } from "@/lib/supabase"
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

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string

  const [loading, setLoading] = useState(true)
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

  useEffect(() => {
    if (productId && productId !== "new") {
      loadProduct()
    } else {
      setLoading(false)
    }
  }, [productId])

  async function loadProduct() {
    try {
      // Load product details
      const { data: product, error: productError } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .single()

      if (productError) throw productError

      // Load product images
      const { data: images, error: imagesError } = await supabase
        .from("product_images")
        .select("*")
        .eq("product_id", productId)
        .order("display_order")

      if (imagesError) console.error("Error loading images:", imagesError)

      // Load product inventory
      const { data: inventory, error: inventoryError } = await supabase
        .from("product_inventory")
        .select("*")
        .eq("product_id", productId)

      if (inventoryError) console.error("Error loading inventory:", inventoryError)

      setFormData({
        name: product.name,
        description: product.description || "",
        price: product.price,
        category: product.category || "apparel",
        colors: product.colors || ["Black"],
        images: images || [],
        inventory: inventory || [],
      })
    } catch (error) {
      console.error("Error loading product:", error)
      alert("Failed to load product")
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      console.log("=== STARTING PRODUCT SAVE ===")

      // Verify user is logged in
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        alert("You must be logged in to save products")
        return
      }

      // Calculate total stock from inventory
      const totalStock = formData.inventory.reduce((sum, inv) => sum + inv.stock_quantity, 0)
      const availableSizes = formData.inventory.map(inv => inv.size)

      if (productId === "new") {
        // Create new product
        console.log("Creating new product...")
        const { data: newProduct, error: productError } = await supabase
          .from("products")
          .insert([
            {
              name: formData.name,
              description: formData.description,
              price: formData.price,
              category: formData.category,
              colors: formData.colors,
              available_sizes: availableSizes,
              total_stock: totalStock,
              front_image: null, // Deprecated
              back_image: null, // Deprecated
            },
          ])
          .select()
          .single()

        if (productError) throw productError
        console.log("Product created:", newProduct)

        // Insert images
        if (formData.images.length > 0) {
          const imagesWithProductId = formData.images.map((img, index) => ({
            product_id: newProduct.id,
            image_url: img.image_url,
            display_order: index,
            is_primary: img.is_primary,
          }))

          const { error: imagesError } = await supabase
            .from("product_images")
            .insert(imagesWithProductId)

          if (imagesError) throw imagesError
          console.log("Images inserted:", imagesWithProductId.length)
        }

        // Insert inventory
        if (formData.inventory.length > 0) {
          const inventoryWithProductId = formData.inventory.map(inv => ({
            product_id: newProduct.id,
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

          if (inventoryError) throw inventoryError
          console.log("Inventory inserted:", inventoryWithProductId.length)
        }
      } else {
        // Update existing product
        console.log("Updating product with ID:", productId)
        console.log("Data to update:", {
          name: formData.name,
          description: formData.description,
          price: formData.price,
          category: formData.category,
          colors: formData.colors,
          available_sizes: availableSizes,
          total_stock: totalStock,
        })

        const { data: updateResult, error: productError } = await supabase
          .from("products")
          .update({
            name: formData.name,
            description: formData.description,
            price: formData.price,
            category: formData.category,
            colors: formData.colors,
            available_sizes: availableSizes,
            total_stock: totalStock,
            updated_at: new Date().toISOString(),
          })
          .eq("id", productId)
          .select()

        if (productError) {
          console.error("Product update error:", productError)
          throw productError
        }
        console.log("Product update result:", updateResult)
        console.log("Product updated successfully!")

        // Update images - delete old first
        console.log("Deleting old images for product:", productId)
        const { error: imageDeleteError } = await supabase
          .from("product_images")
          .delete()
          .eq("product_id", productId)

        if (imageDeleteError) {
          console.error("Image delete error:", imageDeleteError)
          // Don't throw - continue with insert attempt
        } else {
          console.log("Old images deleted successfully")
        }

        // Insert new images
        if (formData.images.length > 0) {
          const imagesWithProductId = formData.images.map((img, index) => ({
            product_id: Number(productId),
            image_url: img.image_url,
            display_order: index,
            is_primary: img.is_primary,
          }))
          console.log("Inserting new images:", imagesWithProductId)

          const { data: imageInsertResult, error: imagesError } = await supabase
            .from("product_images")
            .insert(imagesWithProductId)
            .select()

          if (imagesError) {
            console.error("Image insert error:", imagesError)
            throw imagesError
          }
          console.log("Images inserted:", imageInsertResult)
        }

        // Update inventory - delete old first
        console.log("Deleting old inventory for product:", productId)
        const { error: invDeleteError } = await supabase
          .from("product_inventory")
          .delete()
          .eq("product_id", productId)

        if (invDeleteError) {
          console.error("Inventory delete error:", invDeleteError)
          // Don't throw - continue with insert attempt
        } else {
          console.log("Old inventory deleted successfully")
        }

        // Insert new inventory
        if (formData.inventory.length > 0) {
          const inventoryWithProductId = formData.inventory.map(inv => ({
            product_id: Number(productId),
            size: inv.size,
            color: inv.color || "default",
            stock_quantity: inv.stock_quantity,
            low_stock_threshold: inv.low_stock_threshold,
            reserved_quantity: 0,
            sold_quantity: 0,
          }))
          console.log("Inserting new inventory:", inventoryWithProductId)

          const { data: invInsertResult, error: inventoryError } = await supabase
            .from("product_inventory")
            .insert(inventoryWithProductId)
            .select()

          if (inventoryError) {
            console.error("Inventory insert error:", inventoryError)
            throw inventoryError
          }
          console.log("Inventory inserted:", invInsertResult)
        }
      }

      console.log("Redirecting to /admin/products")
      router.refresh()
      router.push("/admin/products")
    } catch (error: any) {
      console.error("=== ERROR SAVING PRODUCT ===")
      console.error("Error:", error)

      const errorMsg = error.message || "Unknown error occurred"
      alert(`Failed to save product: ${errorMsg}\n\nCheck console for details.`)
    } finally {
      setSaving(false)
      console.log("=== SAVE PROCESS COMPLETE ===")
    }
  }

  function updateColors(colorsString: string) {
    const colorsArray = colorsString.split(",").map((c) => c.trim()).filter(c => c)
    setFormData({ ...formData, colors: colorsArray })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 dark:border-gray-100"></div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/products">
          <Button variant="ghost" size="icon" className="dark:hover:bg-gray-800">
            <ArrowLeft size={20} />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {productId === "new" ? "Add New Product" : "Edit Product"}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {productId === "new"
              ? "Create a new product with images and inventory tracking"
              : "Update product details, images, and inventory"}
          </p>
        </div>
      </div>

      {/* Basic Product Info */}
      <Card className="bg-white dark:bg-gray-900 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="dark:text-white">Product Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Name & Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="dark:text-gray-300">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., BUSTED Vintage Tee"
                required
                className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="dark:text-gray-300">Category</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g., apparel"
                className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="dark:text-gray-300">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed product description..."
              rows={4}
              className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>

          {/* Price & Colors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="price" className="dark:text-gray-300">Price (₹) *</Label>
              <Input
                id="price"
                type="number"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                placeholder="2999"
                required
                className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="colors" className="dark:text-gray-300">Available Colors</Label>
              <Input
                id="colors"
                value={formData.colors.join(", ")}
                onChange={(e) => updateColors(e.target.value)}
                placeholder="Black, White, Navy"
                className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
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
          <Button variant="outline" className="dark:border-gray-700 dark:hover:bg-gray-800">
            Cancel
          </Button>
        </Link>
        <Button
          onClick={handleSave}
          disabled={saving || !formData.name || formData.price <= 0}
          className="gap-2 bg-red-600 hover:bg-red-700"
        >
          <Save size={16} />
          {saving ? "Saving..." : "Save Product"}
        </Button>
      </div>
    </div>
  )
}
