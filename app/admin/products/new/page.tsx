"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase, type Product } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

export default function NewProductPage() {
  const router = useRouter()
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

  async function handleSave() {
    setSaving(true)
    try {
      const { error } = await supabase.from("products").insert([
        {
          ...formData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])

      if (error) throw error

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

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/products">
          <Button variant="ghost" size="icon">
            <ArrowLeft size={20} />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
          <p className="text-gray-500 mt-1">
            Create a new product for your store
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Product Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., BUSTED Vintage Tee"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                placeholder="e.g., apparel"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Detailed product description..."
              rows={4}
            />
          </div>

          {/* Price & Stock */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="price">Price (₹) *</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: Number(e.target.value) })
                }
                placeholder="2999"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">Total Stock *</Label>
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
              />
            </div>
          </div>

          {/* Images */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="front_image">Front Image URL *</Label>
              <Input
                id="front_image"
                value={formData.front_image}
                onChange={(e) =>
                  setFormData({ ...formData, front_image: e.target.value })
                }
                placeholder="/images/product-front.jpg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="back_image">Back Image URL</Label>
              <Input
                id="back_image"
                value={formData.back_image}
                onChange={(e) =>
                  setFormData({ ...formData, back_image: e.target.value })
                }
                placeholder="/images/product-back.jpg"
              />
            </div>
          </div>

          {/* Sizes */}
          <div className="space-y-2">
            <Label htmlFor="sizes">Available Sizes *</Label>
            <Input
              id="sizes"
              value={formData.available_sizes?.join(", ")}
              onChange={(e) => updateSizes(e.target.value)}
              placeholder="S, M, L, XL, XXL"
            />
            <p className="text-sm text-gray-500">
              Enter sizes separated by commas
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.available_sizes?.map((size) => (
                <Badge key={size} variant="secondary">
                  {size}
                </Badge>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div className="space-y-2">
            <Label htmlFor="colors">Available Colors</Label>
            <Input
              id="colors"
              value={formData.colors?.join(", ")}
              onChange={(e) => updateColors(e.target.value)}
              placeholder="Black, White, Navy"
            />
            <p className="text-sm text-gray-500">
              Enter colors separated by commas
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.colors?.map((color) => (
                <Badge key={color} variant="secondary">
                  {color}
                </Badge>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Link href="/admin/products">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              <Save size={16} />
              {saving ? "Saving..." : "Save Product"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
