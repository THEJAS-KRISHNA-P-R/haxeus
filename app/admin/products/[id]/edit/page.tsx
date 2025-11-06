"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { supabase, type Product } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<Partial<Product>>({
    name: "",
    description: "",
    price: 0,
    front_image: "",
    back_image: "",
    available_sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Black", "White"],
    total_stock: 100,
    category: "apparel",
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
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .single()

      if (error) throw error
      if (data) {
        setFormData(data)
      }
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
      if (productId === "new") {
        // Create new product
        const { error } = await supabase.from("products").insert([
          {
            ...formData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])

        if (error) throw error
      } else {
        // Update existing product
        const { error } = await supabase
          .from("products")
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", productId)

        if (error) throw error
      }

      router.push("/admin/products")
    } catch (error) {
      console.error("Error saving product:", error)
      alert("Failed to save product")
    } finally {
      setSaving(false)
    }
  }

  function updateSizes(sizesString: string) {
    const sizesArray = sizesString.split(",").map((s) => s.trim())
    setFormData({ ...formData, available_sizes: sizesArray })
  }

  function updateColors(colorsString: string) {
    const colorsArray = colorsString.split(",").map((c) => c.trim())
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
    <div className="max-w-4xl space-y-6">
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
              ? "Create a new product for your store"
              : "Update product details and inventory"}
          </p>
        </div>
      </div>

      {/* Form */}
      <Card className="bg-white dark:bg-gray-900 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="dark:text-white">Product Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="dark:text-gray-300">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., BUSTED Vintage Tee"
                className="dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder:text-gray-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="dark:text-gray-300">Category</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                placeholder="e.g., apparel"
                className="dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder:text-gray-500"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="dark:text-gray-300">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Detailed product description..."
              rows={4}
              className="dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder:text-gray-500"
            />
          </div>

          {/* Price & Stock */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="price" className="dark:text-gray-300">Price (₹) *</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: Number(e.target.value) })
                }
                placeholder="2999"
                className="dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder:text-gray-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock" className="dark:text-gray-300">Total Stock *</Label>
              <Input
                id="stock"
                type="number"
                value={formData.total_stock}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    total_stock: Number(e.target.value),
                  })
                }
                placeholder="100"
                className="dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder:text-gray-500"
              />
            </div>
          </div>

          {/* Images */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="front_image" className="dark:text-gray-300">Front Image URL *</Label>
              <Input
                id="front_image"
                value={formData.front_image}
                onChange={(e) =>
                  setFormData({ ...formData, front_image: e.target.value })
                }
                placeholder="/images/product-front.jpg"
                className="dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder:text-gray-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="back_image" className="dark:text-gray-300">Back Image URL</Label>
              <Input
                id="back_image"
                value={formData.back_image}
                onChange={(e) =>
                  setFormData({ ...formData, back_image: e.target.value })
                }
                placeholder="/images/product-back.jpg"
                className="dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder:text-gray-500"
              />
            </div>
          </div>

          {/* Sizes */}
          <div className="space-y-2">
            <Label htmlFor="sizes" className="dark:text-gray-300">Available Sizes *</Label>
            <Input
              id="sizes"
              value={formData.available_sizes?.join(", ")}
              onChange={(e) => updateSizes(e.target.value)}
              placeholder="S, M, L, XL, XXL"
              className="dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder:text-gray-500"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter sizes separated by commas
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.available_sizes?.map((size) => (
                <Badge key={size} variant="secondary" className="dark:bg-gray-800 dark:text-gray-300">
                  {size}
                </Badge>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div className="space-y-2">
            <Label htmlFor="colors" className="dark:text-gray-300">Available Colors</Label>
            <Input
              id="colors"
              value={formData.colors?.join(", ")}
              onChange={(e) => updateColors(e.target.value)}
              placeholder="Black, White, Navy"
              className="dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder:text-gray-500"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter colors separated by commas
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.colors?.map((color) => (
                <Badge key={color} variant="secondary" className="dark:bg-gray-800 dark:text-gray-300">
                  {color}
                </Badge>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t dark:border-gray-800">
            <Link href="/admin/products">
              <Button variant="outline" className="dark:border-gray-700 dark:hover:bg-gray-800">Cancel</Button>
            </Link>
            <Button onClick={handleSave} disabled={saving} className="gap-2 bg-red-600 hover:bg-red-700">
              <Save size={16} />
              {saving ? "Saving..." : "Save Product"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
