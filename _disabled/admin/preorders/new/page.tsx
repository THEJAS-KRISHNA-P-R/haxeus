"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useTheme } from "@/components/ThemeProvider"
import { ImageGalleryManager } from "@/components/admin/ImageGalleryManager"
import type { ProductImage } from "@/lib/supabase"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface PreorderFormData {
  name: string
  description: string
  price: number
  status: "active" | "sold_out" | "stopped" | "converted"
  expected_date: string
  max_preorders: number
  sort_order: number
  original_price: number | null
  images: string[]
  sizes_available: string[]
}

const defaultFormData: PreorderFormData = {
  name: "",
  description: "",
  price: 0,
  status: "active",
  expected_date: "",
  max_preorders: 0,
  sort_order: 0,
  original_price: null,
  images: [],
  sizes_available: [],
}

export default function NewPreorderPage() {
  const router = useRouter()
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<PreorderFormData>(defaultFormData)
  const [galleryImages, setGalleryImages] = useState<ProductImage[]>([])
  const [imageList, setImageList] = useState("")
  const [sizeList, setSizeList] = useState("")

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = !mounted ? true : theme === "dark"

  const fieldClassName = isDark
    ? "bg-[#1a1a1a] border-white/10 text-white placeholder:text-white/30"
    : "bg-white border-black/10 text-black placeholder:text-black/30"

  async function handleSave() {
    if (!formData.name.trim()) {
      toast.error("Name is required.")
      return
    }

    setSaving(true)

    try {
      const orderedGalleryImages = [...galleryImages].sort((a, b) => a.display_order - b.display_order)
      const primaryGalleryImage = orderedGalleryImages.find((image) => image.is_primary) ?? orderedGalleryImages[0]
      const secondaryGalleryImage = orderedGalleryImages.find(
        (image) => image.image_url !== primaryGalleryImage?.image_url,
      )
      const galleryUrls = orderedGalleryImages
        .map((image) => image.image_url.trim())
        .filter(Boolean)

      const manualAdditionalUrls = imageList
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean)

      const payload = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        status: formData.status,
        expected_date: formData.expected_date || null,
        max_preorders: formData.max_preorders,
        sort_order: formData.sort_order,
        original_price: formData.original_price || null,
        front_image: primaryGalleryImage?.image_url || null,
        images: Array.from(new Set([...galleryUrls, ...manualAdditionalUrls])),
        sizes_available: sizeList.split(",").map((value) => value.trim()).filter(Boolean),
      }

      const response = await fetch("/api/admin/preorders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => null)
        throw new Error(error?.error || "Failed to create preorder item.")
      }

      toast.success("Pre-order item created.")
      router.push("/admin/preorders")
      router.refresh()
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create preorder item."
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <div className={cn("min-h-screen -mx-8 -mt-24 px-8 pt-24 pb-12", isDark ? "bg-[#0a0a0a] text-white" : "bg-[#f5f4f0] text-black")}>
      <div className="max-w-5xl space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/preorders">
            <Button variant="ghost" size="icon" className={isDark ? "hover:bg-white/5 text-white" : "hover:bg-black/5 text-black"}>
              <ArrowLeft size={20} />
            </Button>
          </Link>
          <div>
            <h1 className={cn("text-3xl font-bold", isDark ? "text-white" : "text-black")}>Add New Pre-Order Item</h1>
            <p className={cn("mt-1", isDark ? "text-white/40" : "text-black/40")}>Create a new item for the homepage pre-order section.</p>
          </div>
        </div>

        <Card className={isDark ? "bg-[#111] border border-white/[0.07]" : "bg-white border border-black/[0.07]"}>
          <CardHeader>
            <CardTitle className={isDark ? "text-white" : "text-black"}>Pre-Order Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className={isDark ? "text-white/60" : "text-black/60"}>Name</Label>
                <Input id="name" value={formData.name} onChange={(e) => setFormData((current) => ({ ...current, name: e.target.value }))} placeholder="e.g., HAXEUS Drop 01 Hoodie" className={fieldClassName} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price" className={isDark ? "text-white/60" : "text-black/60"}>Price (₹)</Label>
                <Input id="price" type="number" min="0" value={formData.price} onChange={(e) => setFormData((current) => ({ ...current, price: Number(e.target.value) || 0 }))} className={fieldClassName} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className={isDark ? "text-white/60" : "text-black/60"}>Description</Label>
              <Textarea id="description" rows={5} value={formData.description} onChange={(e) => setFormData((current) => ({ ...current, description: e.target.value }))} placeholder="Short launch description, fit notes, drop details..." className={fieldClassName} />
            </div>

            <ImageGalleryManager
              images={galleryImages}
              onChange={setGalleryImages}
            />

            {galleryImages.length > 0 && (
              <div className={cn("rounded-2xl border px-4 py-3 text-sm", isDark ? "border-white/10 bg-white/[0.02] text-white/70" : "border-black/10 bg-black/[0.02] text-black/70")}>
                <p>
                  Image 1 is the primary gallery image. Image 2 is the next gallery image.
                </p>
                <p className="mt-1">
                  Use Set Primary and reorder controls to change which image becomes Image 1 and Image 2.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="status" className={isDark ? "text-white/60" : "text-black/60"}>Status</Label>
                <Select value={formData.status} onValueChange={(value: PreorderFormData["status"]) => setFormData((current) => ({ ...current, status: value }))}>
                  <SelectTrigger className={fieldClassName}>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="sold_out">Sold Out</SelectItem>
                    <SelectItem value="stopped">Stopped</SelectItem>
                    <SelectItem value="converted">Converted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="expected_date" className={isDark ? "text-white/60" : "text-black/60"}>Expected Release Date</Label>
                <Input id="expected_date" type="date" value={formData.expected_date} onChange={(e) => setFormData((current) => ({ ...current, expected_date: e.target.value }))} className={fieldClassName} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="max_preorders" className={isDark ? "text-white/60" : "text-black/60"}>Max Preorders</Label>
                <Input id="max_preorders" type="number" min="0" value={formData.max_preorders} onChange={(e) => setFormData((current) => ({ ...current, max_preorders: Number(e.target.value) || 0 }))} className={fieldClassName} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sort_order" className={isDark ? "text-white/60" : "text-black/60"}>Sort Order</Label>
                <Input id="sort_order" type="number" min="0" value={formData.sort_order} onChange={(e) => setFormData((current) => ({ ...current, sort_order: Number(e.target.value) || 0 }))} className={fieldClassName} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="original_price" className={isDark ? "text-white/60" : "text-black/60"}>Original Price (optional)</Label>
                <Input id="original_price" type="number" min="0" value={formData.original_price ?? ""} onChange={(e) => setFormData((current) => ({ ...current, original_price: e.target.value ? Number(e.target.value) : null }))} className={fieldClassName} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="images" className={isDark ? "text-white/60" : "text-black/60"}>Additional Image URLs</Label>
                <Textarea id="images" rows={4} value={imageList} onChange={(e) => setImageList(e.target.value)} placeholder="Comma-separated URLs" className={fieldClassName} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sizes_available" className={isDark ? "text-white/60" : "text-black/60"}>Available Sizes</Label>
                <Textarea id="sizes_available" rows={4} value={sizeList} onChange={(e) => setSizeList(e.target.value)} placeholder="Comma-separated sizes like S, M, L, XL" className={fieldClassName} />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Link href="/admin/preorders">
                <Button variant="outline" className={isDark ? "border-white/10 text-white hover:bg-white/5" : "border-black/10 text-black hover:bg-black/5"}>Cancel</Button>
              </Link>
              <Button onClick={handleSave} disabled={saving} className="bg-[#e93a3a] hover:bg-[#ff4a4a] text-white">
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Creating..." : "Create Pre-Order Item"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
