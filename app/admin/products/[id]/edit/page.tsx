"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useTheme } from "@/components/ThemeProvider"
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
import { cn } from "@/lib/utils"
import { Toggle } from "@/components/ui/Toggle"
import { motion, AnimatePresence } from "framer-motion"
import { Star, Trash2, Plus, X } from "lucide-react"

interface ProductFormData {
  name: string
  description: string
  price: number
  category: string
  colors: string[]
  images: ProductImage[]
  inventory: ProductInventory[]
  tagline: string
}

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string

  const [mounted, setMounted] = useState(false)
  const { theme } = useTheme()

  // IMPORTANT: while not mounted, render with dark styles as default
  // This prevents flash and ensures admin feels dark on first load
  const isDark = !mounted ? true : theme === 'dark'

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [sendingAlert, setSendingAlert] = useState(false)

  const [isPreorder, setIsPreorder] = useState(false)
  const [preorderStatus, setPreorderStatus] = useState<"active" | "sold_out" | "stopped">("active")
  const [expectedDate, setExpectedDate] = useState("")
  const [maxPreorders, setMaxPreorders] = useState<string>("")
  
  const [reviews, setReviews] = useState<any[]>([])
  const [showAddReview, setShowAddReview] = useState(false)
  const [newReview, setNewReview] = useState({
    reviewer_name: "",
    rating: 5,
    body: "",
    verified_purchase: true
  })
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    price: 0,
    category: "apparel",
    colors: ["Black"],
    images: [],
    inventory: [],
    tagline: "",
  })

  useEffect(() => {
    setMounted(true)
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
        tagline: product.tagline || "",
      })
      
      setIsPreorder(product.is_preorder ?? false)
      setPreorderStatus(product.preorder_status ?? "active")
      setExpectedDate(product.expected_date ?? "")
      setMaxPreorders(product.max_preorders?.toString() ?? "")

      // Load reviews
      const { data: revs } = await supabase
        .from("reviews")
        .select("*")
        .eq("product_id", productId)
        .order("created_at", { ascending: false })
      
      setReviews(revs || [])
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
              front_image: formData.images.find(img => img.is_primary)?.image_url || formData.images[0]?.image_url || null,
              back_image: formData.images.length > 1 ? (formData.images.find(img => !img.is_primary)?.image_url || formData.images[1]?.image_url) : null,
              tagline: formData.tagline || null,
              // Preorder fields
              is_preorder: isPreorder,
              preorder_status: isPreorder ? preorderStatus : null,
              expected_date: isPreorder && expectedDate ? expectedDate : null,
              max_preorders: isPreorder && maxPreorders ? parseInt(maxPreorders) : null,
              preorder_count: 0,
            },
          ])
          .select()
          .single()

        if (productError) throw productError

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
        }
      } else {
        // Update existing product

        const { error: productError } = await supabase
          .from("products")
          .update({
            name: formData.name,
            description: formData.description,
            price: formData.price,
            category: formData.category,
            colors: formData.colors,
            available_sizes: availableSizes,
            total_stock: totalStock,
            front_image: formData.images.find(img => img.is_primary)?.image_url || formData.images[0]?.image_url || null,
            back_image: formData.images.length > 1 ? (formData.images.find(img => !img.is_primary)?.image_url || formData.images[1]?.image_url) : null,
            updated_at: new Date().toISOString(),
            tagline: formData.tagline || null,
            // Preorder fields
            is_preorder: isPreorder,
            preorder_status: isPreorder ? preorderStatus : null,
            expected_date: isPreorder && expectedDate ? expectedDate : null,
            max_preorders: isPreorder && maxPreorders ? parseInt(maxPreorders) : null,
          })
          .eq("id", productId)
          .select()

        if (productError) {
          console.error("Product update error:", productError)
          throw productError
        }

        // Update images - delete old first
        const { error: imageDeleteError } = await supabase
          .from("product_images")
          .delete()
          .eq("product_id", productId)

        if (imageDeleteError) {
          console.error("Image delete error:", imageDeleteError)
          // Don't throw - continue with insert attempt
        }

        // Insert new images
        if (formData.images.length > 0) {
          const imagesWithProductId = formData.images.map((img, index) => ({
            product_id: Number(productId),
            image_url: img.image_url,
            display_order: index,
            is_primary: img.is_primary,
          }))

          const { error: imagesError } = await supabase
            .from("product_images")
            .insert(imagesWithProductId)
            .select()

          if (imagesError) {
            throw imagesError
          }
        }

        // Update inventory - delete old first
        const { error: invDeleteError } = await supabase
          .from("product_inventory")
          .delete()
          .eq("product_id", productId)

        if (invDeleteError) {
          console.error("Inventory delete error:", invDeleteError)
          // Don't throw - continue with insert attempt
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

          const { error: inventoryError } = await supabase
            .from("product_inventory")
            .insert(inventoryWithProductId)
            .select()

          if (inventoryError) {
            throw inventoryError
          }
        }
      }

      router.refresh()
      router.push("/admin/products")
    } catch (error) {
      console.error("Error saving product:", (error as Error).message ?? "Unknown error")

      const errorMsg = (error as Error).message || "Unknown error occurred"
      alert(`Failed to save product: ${errorMsg}`)
    } finally {
      setSaving(false)
    }
  }

  async function handleSendDropAlert() {
    if (!window.confirm(`Send drop alert for "${formData.name}" to all subscribers?`)) return

    setSendingAlert(true)
    try {
      const res = await fetch("/api/admin/send-drop-alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: Number(productId) })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      alert(data.sent > 0
        ? `✅ Drop alert sent to ${data.sent} subscribers`
        : "No active subscribers — alert not sent")
    } catch (err) {
      alert(`Failed to send alert: ${(err as Error).message}`)
    } finally {
      setSendingAlert(false)
    }
  }

  async function handleDelete() {
    if (!window.confirm("Are you sure you want to PERMANENTLY delete this product? This will also remove inventory, images, and reviews. Order history will be preserved via snapshots.")) {
      return
    }

    setDeleting(true)
    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productId)

      if (error) throw error

      router.push("/admin/products")
      router.refresh()
    } catch (error: any) {
      console.error("Error deleting product:", error)
      alert(`Failed to delete product: ${error.message}`)
    } finally {
      setDeleting(false)
    }
  }

  function updateColors(colorsString: string) {
    const colorsArray = colorsString.split(",").map((c) => c.trim()).filter(c => c)
    setFormData({ ...formData, colors: colorsArray })
  }

  async function handleAddReview() {
    alert("Manual review seeding has been disabled. Reviews are now created only by delivered customers.")
  }

  async function handleDeleteReview(id: string) {
    if (!window.confirm("Delete this review?")) return
    try {
      const { error } = await supabase.from("reviews").delete().eq("id", id)
      if (error) throw error
      setReviews(reviews.filter(r => r.id !== id))
    } catch (err: any) {
      alert(`Error: ${err.message}`)
    }
  }

  if (!mounted) return null

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-white/10 border-t-[#e93a3a]"></div>
      </div>
    )
  }

  return (
    <div className={cn("min-h-screen -mx-8 -mt-24 pt-24 px-8 pb-12", isDark ? 'bg-[var(--bg)] text-white' : 'bg-[var(--bg)] text-black')}>
      <div className="max-w-5xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/admin/products">
            <Button variant="ghost" size="icon" className={isDark ? "hover:bg-white/5 text-white" : "hover:bg-black/5 text-black"}>
              <ArrowLeft size={20} />
            </Button>
          </Link>
          <div>
            <h1 className={cn("text-3xl font-bold", isDark ? "text-white" : "text-black")}>
              {productId === "new" ? "Add New Product" : "Edit Product"}
            </h1>
            <p className={cn("mt-1", isDark ? "text-white/40" : "text-black/40")}>{productId === "new"
              ? "Create a new product with images and inventory tracking"
              : "Update product details, images, and inventory"}
            </p>
          </div>
        </div>

        {/* Basic Product Info */}
        <Card className={isDark ? 'bg-[#111] border border-white/[0.07]' : 'bg-white border border-black/[0.07]'}>
          <CardHeader>
            <CardTitle className={isDark ? "text-white" : "text-black"}>Product Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Name & Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className={isDark ? "text-white/60" : "text-black/60"}>Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., BUSTED Vintage Tee"
                  className={isDark ? 'bg-[#1a1a1a] border-white/10 text-white placeholder:text-white/30' : 'bg-white border-black/10 text-black placeholder:text-black/30'}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className={isDark ? "text-white/60" : "text-black/60"}>Category</Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className={`w-full px-3 py-2.5 rounded-xl border text-sm bg-transparent focus:outline-none focus:ring-1 focus:ring-[#e93a3a]/50 ${
                    isDark
                      ? "border-white/[0.10] text-white bg-[#1a1a1a]"
                      : "border-black/[0.10] text-black bg-white"
                  }`}
                >
                  <option value="tshirt">T-Shirt</option>
                  <option value="jersey">Jersey</option>
                  <option value="hoodie">Hoodie</option>
                  <option value="shorts">Shorts</option>
                  <option value="accessories">Accessories</option>
                  <option value="apparel">Apparel</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className={isDark ? "text-white/60" : "text-black/60"}>Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detailed product description..."
                rows={4}
                className={isDark ? 'bg-[#1a1a1a] border-white/10 text-white placeholder:text-white/30' : 'bg-white border-black/10 text-black placeholder:text-black/30'}
              />
            </div>

            {/* Tagline */}
            <div className="space-y-2">
              <Label htmlFor="tagline" className={isDark ? "text-white/60" : "text-black/60"}>Promotional Tagline (Optional)</Label>
              <Input
                id="tagline"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                placeholder="e.g., Limited drop – ends in 7 days"
                className={isDark ? 'bg-[#1a1a1a] border-white/10 text-white placeholder:text-white/30' : 'bg-white border-black/10 text-black placeholder:text-black/30'}
              />
              <p className={cn("text-xs", isDark ? "text-white/40" : "text-black/40")}>
                Displays above the product name on the product page.
              </p>
            </div>

            {/* Price & Colors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="price" className={isDark ? "text-white/60" : "text-black/60"}>Price (₹) *</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  placeholder="2999"
                  className={isDark ? 'bg-[#1a1a1a] border-white/10 text-white placeholder:text-white/30' : 'bg-white border-black/10 text-black placeholder:text-black/30'}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="colors" className={isDark ? "text-white/60" : "text-black/60"}>Available Colors</Label>
                <Input
                  id="colors"
                  value={formData.colors.join(", ")}
                  onChange={(e) => updateColors(e.target.value)}
                  placeholder="Black, White, Navy"
                  className={isDark ? 'bg-[#1a1a1a] border-white/10 text-white placeholder:text-white/30' : 'bg-white border-black/10 text-black placeholder:text-black/30'}
                />
                <p className={cn("text-xs", isDark ? "text-white/40" : "text-black/40")}>
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

        {/* Preorder Section */}
        <div className={`rounded-2xl border p-5 ${
          isDark ? "bg-white/[0.02] border-white/[0.07]" : "bg-black/[0.01] border-black/[0.07]"
        }`}>
          <div className="flex items-center justify-between mb-1">
            <div>
              <p className={`text-sm font-semibold ${isDark ? "text-white" : "text-black"}`}>
                Pre-Order
              </p>
              <p className={`text-xs mt-0.5 ${isDark ? "text-white/40" : "text-black/40"}`}>
                List this product before it&apos;s in stock. Customers can register interest.
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
              className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/[0.06] overflow-hidden"
            >
              {/* Status */}
              <div>
                <Label className={`block text-xs font-medium mb-1.5 ${isDark ? "text-white/60" : "text-black/60"}`}>
                  Status
                </Label>
                <select
                  value={preorderStatus}
                  onChange={(e) => setPreorderStatus(e.target.value as any)}
                  className={`w-full px-3 py-2.5 rounded-xl border text-sm bg-transparent focus:outline-none focus:ring-1 focus:ring-[#e93a3a]/50 ${
                    isDark
                      ? "border-white/[0.10] text-white"
                      : "border-black/[0.10] text-black"
                  }`}
                >
                  <option value="active" className={isDark ? "bg-[#111]" : ""}>Active — accepting registrations</option>
                  <option value="sold_out" className={isDark ? "bg-[#111]" : ""}>Sold Out — no new registrations</option>
                  <option value="stopped" className={isDark ? "bg-[#111]" : ""}>Stopped — hidden from public</option>
                </select>
              </div>

              {/* Expected Date */}
              <div>
                <Label className={`block text-xs font-medium mb-1.5 ${isDark ? "text-white/60" : "text-black/60"}`}>
                  Expected Date
                  <span className={`ml-1 font-normal ${isDark ? "text-white/30" : "text-black/30"}`}>(optional)</span>
                </Label>
                <Input
                  type="date"
                  value={expectedDate}
                  onChange={(e) => setExpectedDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className={isDark ? 'bg-transparent border-white/10 text-white' : 'bg-transparent border-black/10 text-black'}
                />
              </div>

              {/* Max Pre-orders */}
              <div>
                <Label className={`block text-xs font-medium mb-1.5 ${isDark ? "text-white/60" : "text-black/60"}`}>
                  Max Pre-orders
                  <span className={`ml-1 font-normal ${isDark ? "text-white/30" : "text-black/30"}`}>(leave blank for unlimited)</span>
                </Label>
                <Input
                  type="number"
                  value={maxPreorders}
                  onChange={(e) => setMaxPreorders(e.target.value)}
                  placeholder="e.g. 100"
                  min={1}
                  className={isDark ? 'bg-transparent border-white/10 text-white placeholder:text-white/30' : 'bg-transparent border-black/10 text-black placeholder:text-black/30'}
                />
              </div>
            </motion.div>
          )}
        </div>

        {/* Reviews Section */}
        {productId !== "new" && (
          <div className={`rounded-2xl border p-5 ${
            isDark ? "bg-white/[0.02] border-white/[0.07]" : "bg-black/[0.01] border-black/[0.07]"
          }`}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-black"}`}>Product Reviews</h3>
                <p className={`text-xs mt-0.5 ${isDark ? "text-white/40" : "text-black/40"}`}>
                  Manually seed or manage customer reviews for this product.
                </p>
              </div>
              <Button 
                onClick={() => setShowAddReview(!showAddReview)}
                variant="outline" 
                size="sm" 
                className={`gap-2 ${isDark ? "border-white/10 text-white" : "border-black/10 text-black"}`}
              >
                {showAddReview ? <X size={14} /> : <Plus size={14} />}
                {showAddReview ? "Cancel" : "Add Review"}
              </Button>
            </div>

            <AnimatePresence>
              {showAddReview && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-8 p-5 rounded-xl bg-white/[0.03] border border-white/[0.05] overflow-hidden"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold opacity-60">Reviewer Name</Label>
                      <Input 
                        value={newReview.reviewer_name}
                        onChange={e => setNewReview({ ...newReview, reviewer_name: e.target.value })}
                        placeholder="e.g. Rahul S."
                        className="bg-transparent"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold opacity-60">Rating (1-5)</Label>
                      <div className="flex items-center gap-2 mt-1">
                        {[1, 2, 3, 4, 5].map(s => (
                          <button 
                            key={s} 
                            onClick={() => setNewReview({ ...newReview, rating: s })}
                            className="p-1 transition-transform border border-transparent active:scale-95"
                          >
                            <Star size={20} className={s <= newReview.rating ? "text-[#e7bf04] fill-[#e7bf04]" : "text-white/10"} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="sm:col-span-2 space-y-2">
                      <Label className="text-xs font-semibold opacity-60">Review Body</Label>
                      <Textarea 
                        value={newReview.body}
                        onChange={e => setNewReview({ ...newReview, body: e.target.value })}
                        placeholder="What did the customer say?"
                        rows={3}
                        className="bg-transparent"
                      />
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-white/5 sm:col-span-2">
                      <div className="flex items-center gap-3">
                        <Toggle 
                          checked={newReview.verified_purchase}
                          onChange={v => setNewReview({ ...newReview, verified_purchase: v })}
                          size="sm"
                        />
                        <span className="text-xs font-medium opacity-60">Verified Purchase</span>
                      </div>
                      <Button onClick={handleAddReview} size="sm" className="bg-[#e93a3a] hover:bg-[#ff4a4a] text-white">
                        Submit Review
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Review List */}
            <div className="space-y-4">
              {reviews.length === 0 ? (
                <div className="py-8 text-center border-2 border-dashed border-white/[0.05] rounded-xl">
                  <p className="text-sm opacity-30 italic">No reviews yet. Reviews appear here after delivered customers submit them.</p>
                </div>
              ) : (
                reviews.map((r) => (
                  <div key={r.id} className="flex gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold">{r.title || (r.verified_purchase ? "Delivered buyer" : "Customer review")}</p>
                          {r.verified_purchase && (
                            <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[8px] font-bold uppercase tracking-wider">
                              Verified
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map(s => (
                            <Star key={s} size={10} className={s <= r.rating ? "text-[#e7bf04] fill-[#e7bf04]" : "text-white/10"} />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs opacity-60 leading-relaxed italic">&quot;{r.body}&quot;</p>
                      <p className="text-[10px] opacity-20 mt-2">{new Date(r.created_at).toLocaleDateString()}</p>
                    </div>
                    <button 
                      onClick={() => handleDeleteReview(r.id)}
                      className="p-2 h-fit rounded-lg hover:bg-red-500/10 text-white/20 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap justify-end gap-3 pb-8">
          <Link href="/admin/products">
            <Button variant="outline" className={isDark ? "border-white/[0.06] hover:bg-white/5 text-white" : "border-black/[0.06] hover:bg-black/5 text-black"}>
              Cancel
            </Button>
          </Link>
          {productId !== "new" && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={saving || deleting}
              className="gap-2"
            >
              {deleting ? "Deleting..." : "Delete Product"}
            </Button>
          )}
          {productId !== "new" && (
            <button
              onClick={handleSendDropAlert}
              disabled={sendingAlert}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#e7bf04] hover:bg-[#f0cc1a] text-black font-bold text-sm transition-colors disabled:opacity-50"
            >
              {sendingAlert ? "Sending..." : "📢 Send Drop Alert"}
            </button>
          )}
          <Button
            onClick={handleSave}
            disabled={saving || deleting || !formData.name || formData.price <= 0}
            className={cn("gap-2 text-white", isDark ? "bg-[#e93a3a] hover:bg-[#e93a3a]/80" : "bg-[#e93a3a] hover:bg-[#e93a3a]/80")}
          >
            <Save size={16} />
            {saving ? "Saving..." : "Save Product"}
          </Button>
        </div>
      </div>
    </div>
  )
}
