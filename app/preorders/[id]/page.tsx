"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { useTheme } from "@/components/ThemeProvider"
import { Shield, Truck, RotateCcw, Zap } from "lucide-react"
import { useStoreSettings } from "@/hooks/useStoreSettings"
import { formatPrice } from "@/lib/currency"

interface PreorderItem {
  id: string
  name: string
  description: string
  price: number
  original_price?: number
  front_image?: string
  images?: string[]
  available_sizes?: string[]
  sizes?: string[]
  expected_date?: string
  preorder_count?: number
  max_preorders?: number
  status?: string
}

interface PreorderImage {
  id: string
  item_id: string
  image_url: string
  display_order: number
  is_primary: boolean
}

export default function PreorderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { theme } = useTheme()
  const { settings } = useStoreSettings()

  const [mounted, setMounted] = useState(false)
  const resolvedTheme = theme as "light" | "dark" | "system"
  const isDark = !mounted ? true : (
    resolvedTheme === "dark" ||
    (resolvedTheme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)
  )

  const [preorderItem, setPreorderItem] = useState<PreorderItem | null>(null)
  const [preorderImages, setPreorderImages] = useState<PreorderImage[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSize, setSelectedSize] = useState("")
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [touchStartX, setTouchStartX] = useState<number | null>(null)
  const [stickyBarVisible, setStickyBarVisible] = useState(false)
  const buySectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const el = buySectionRef.current
    if (!el) return
    const ob = new IntersectionObserver(
      ([e]) => setStickyBarVisible(!e.isIntersecting),
      { threshold: 0, rootMargin: "-80px 0px 0px 0px" }
    )
    ob.observe(el)
    return () => ob.disconnect()
  }, [preorderItem])

  useEffect(() => {
    fetchPreorderItem()
  }, [params.id])

  const fetchPreorderItem = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("preorder_items")
        .select("*")
        .eq("id", params.id)
        .single()

      if (error) {
        console.error("Error fetching preorder item:", error)
        return
      }

      if (data) {
        setPreorderItem({
          ...data,
          sizes: data.available_sizes || data.sizes || ["S", "M", "L", "XL"]
        })
        
        // If images exist in the database, use them
        if (data.images && Array.isArray(data.images) && data.images.length > 0) {
          const formattedImages: PreorderImage[] = data.images.map((imgUrl: string, idx: number) => ({
            id: `${data.id}-${idx}`,
            item_id: data.id,
            image_url: imgUrl,
            display_order: idx,
            is_primary: idx === 0
          }))
          setPreorderImages(formattedImages)
        }
      }
    } catch (error) {
      console.error("Error fetching preorder item:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePreorder = async () => {
    if (!selectedSize) {
      toast({
        title: "Please select a size",
        description: "Select a size before pre-ordering.",
        variant: "destructive",
      })
      return
    }

    try {
      // 1. Get the logged-in user's session
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.user?.email) {
        toast({
          title: "Error",
          description: "You must be logged in to pre-order.",
          variant: "destructive",
        })
        return
      }

      const email = session.user.email

      // 2. Already Pre-ordered check
      setVerifying(true)
      const { data: existing } = await supabase
        .from("preorder_registrations")
        .select("id")
        .eq("preorder_item_id", preorderItem!.id)
        .eq("email", email)
        .maybeSingle()

      if (existing) {
        toast({
          title: "Already Reserved",
          description: "You have already pre-ordered this item. We will contact you soon!",
          variant: "default",
        })
        setVerifying(false)
        return
      }

      // 3. Optional: Real-time deliverability check
      const verifyRes = await fetch("/api/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      })

      if (verifyRes.ok) {
        const { isValid } = await verifyRes.json()
        if (!isValid) {
          toast({
            title: "Verification Error",
            description: "Your account email appears to be undeliverable. Please update your profile.",
            variant: "destructive",
          })
          setVerifying(false)
          return
        }
      }

      setVerifying(false)
      setSubmitting(true)

      // 4. Save preorder registration
      const { error } = await supabase.from("preorder_registrations").insert({
        preorder_item_id: preorderItem!.id,
        size: selectedSize,
        email: email,
        name: session.user.user_metadata?.full_name || email.split('@')[0],
      })

      if (error) {
        console.error("Preorder error:", error)
        toast({
          title: "Error",
          description: error.message || "Could not place pre-order.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Pre-order Successful!",
          description: "Your reservation has been confirmed.",
        })
        router.push("/checkout")
      }
    } catch (error: any) {
      console.error("Preorder error:", error)
      toast({
        title: "Error",
        description: error.message || "Could not place pre-order.",
        variant: "destructive",
      })
    } finally {
      setVerifying(false)
      setSubmitting(false)
    }
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-theme">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--accent)] mx-auto mb-4"></div>
          <p className="text-theme-2">Loading preorder...</p>
        </div>
      </div>
    )
  }

  if (!preorderItem) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#080808]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-theme mb-4">Preorder not found</h1>
          <Button onClick={() => router.push("/")} className="bg-[var(--accent)] hover:opacity-90 text-white">
            Back to Home
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-theme pt-[100px] opacity-0 animate-fadeIn transition-colors duration-300 ${stickyBarVisible ? "pb-24 md:pb-8" : "pb-8"}`}>
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
      `}</style>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images - Scrollable Gallery */}
          <div className="space-y-3">
            {/* Main Image */}
            <div
              className="aspect-square relative bg-black rounded-2xl overflow-hidden"
              onTouchStart={(e) => setTouchStartX(e.touches[0].clientX)}
              onTouchEnd={(e) => {
                if (touchStartX === null) return
                const diff = touchStartX - e.changedTouches[0].clientX
                const total = preorderImages.length > 0 ? preorderImages.length : 1
                if (Math.abs(diff) > 40) {
                  if (diff > 0) {
                    setSelectedImageIndex(i => (i + 1) % total)
                  } else {
                    setSelectedImageIndex(i => (i - 1 + total) % total)
                  }
                }
                setTouchStartX(null)
              }}
            >
              {preorderImages.length > 0 ? (
                <Image
                  src={preorderImages[selectedImageIndex]?.image_url || "/placeholder.svg"}
                  alt={`HAXEUS ${preorderItem.name} - view`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                  className="object-cover transition-opacity duration-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = "/placeholder.svg"
                  }}
                />
              ) : (
                <Image
                  src={preorderItem.front_image || "/placeholder.svg"}
                  alt={`HAXEUS ${preorderItem.name} preorder`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                  className="object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = "/placeholder.svg"
                  }}
                />
              )}
            </div>

            {/* Swipe dots */}
            {preorderImages.length > 1 && (
              <div className="flex justify-center gap-1.5">
                {preorderImages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImageIndex(i)}
                    className="block rounded-full transition-all duration-200"
                    style={{
                      width: i === selectedImageIndex ? "18px" : "6px",
                      height: "6px",
                      background: i === selectedImageIndex ? "var(--text)" : "var(--text-3)",
                      opacity: i === selectedImageIndex ? 1 : 0.4,
                    }}
                  />
                ))}
              </div>
            )}

            {/* Image counter */}
            {preorderImages.length > 1 && (
              <p className={`text-center text-sm ${isDark ? "text-white/30" : "text-black/35"}`}>
                {selectedImageIndex + 1} of {preorderImages.length} images
              </p>
            )}
          </div>

          {/* Preorder Details */}
          <div className="space-y-5">
            {/* Name + Price */}
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-theme mb-3">{preorderItem.name}</h1>
              <div className="flex items-center gap-4 mb-4">
                <span className="text-3xl font-bold text-[var(--accent)]">{formatPrice(preorderItem.price)}</span>
                {preorderItem.original_price && (
                  <span className={`text-lg line-through ${isDark ? 'text-white/50' : 'text-black/55'}`}>{formatPrice(preorderItem.original_price)}</span>
                )}
              </div>
              {preorderItem.expected_date && (
                <div className="text-[#07e4e1] font-semibold">
                  Expected Ship Date: {preorderItem.expected_date}
                </div>
              )}
            </div>

            {/* Preorder Progress */}
            {preorderItem.max_preorders && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label className="text-base font-semibold text-theme">Pre-Orders: {preorderItem.preorder_count || 0}/{preorderItem.max_preorders}</Label>
                </div>
                <div className="w-full bg-white/10 rounded-full h-3">
                  <div 
                    className="bg-[#e7bf04] h-3 rounded-full transition-all duration-300" 
                    style={{ width: `${((preorderItem.preorder_count || 0) / preorderItem.max_preorders) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Size Selection */}
            <div>
              <Label className="text-base font-semibold mb-3 block text-theme">Size</Label>
              <div className="flex flex-wrap gap-2">
                {(preorderItem.sizes || preorderItem.available_sizes || []).map((size) => {
                  const isSelected = selectedSize === size

                  return (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`
                        px-5 py-2.5 min-h-[44px] rounded-full text-sm font-semibold border transition-all duration-200
                        ${isSelected
                          ? 'bg-[#e93a3a] border-[#e93a3a] text-white'
                          : isDark
                            ? 'bg-transparent border-white/20 text-white hover:border-white/60'
                            : 'bg-transparent border-black/20 text-black hover:border-black/60'
                        }
                      `}
                    >
                      {size}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Urgency badge */}
            <div className="flex items-center gap-2 text-sm text-[var(--accent)] font-medium">
              <Zap className="w-4 h-4" />
              Limited preorder available
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-3 text-xs text-theme-2">
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-green-500" />
                Secure preorder
              </span>
              <span className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-theme-2" />
                Free shipping over {formatPrice(settings.free_shipping_above)}
              </span>
              <span className="flex items-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5 text-theme-2" />
                10-day replacement
              </span>
            </div>

            {/* Preorder Button */}
            <div ref={buySectionRef}>
              <Button
                onClick={handlePreorder}
                disabled={verifying || submitting}
                className="w-full bg-[var(--accent)] hover:opacity-90 text-white h-12 text-base font-bold shadow-lg shadow-[var(--accent)]/20 transition-all disabled:opacity-50"
                size="lg"
              >
                <Zap className="w-5 h-5 mr-2" />
                {verifying ? "Verifying..." : submitting ? "Processing..." : "Pre-Order Now"}
              </Button>
            </div>

            {/* Description */}
            <p className="text-theme-2 leading-relaxed">{preorderItem.description}</p>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4 text-center bg-card border-theme">
                <Truck className="w-8 h-8 mx-auto mb-2 text-[var(--accent-cyan)]" />
                <div className="font-semibold text-theme">Shipping</div>
                <div className="text-sm text-theme-3">{preorderItem.expected_date ? `Ships ${preorderItem.expected_date}` : '1-2 weeks delivery'}</div>
              </Card>
              <Card className="p-4 text-center bg-card border-theme">
                <Shield className="w-8 h-8 mx-auto mb-2 text-[var(--accent-yellow)]" />
                <div className="font-semibold text-theme">Premium Quality</div>
                <div className="text-sm text-theme-3">100% Bio-Washed Cotton</div>
              </Card>
              <Card className="p-4 text-center bg-card border-theme">
                <RotateCcw className="w-8 h-8 mx-auto mb-2 text-[var(--accent-pink)]" />
                <div className="font-semibold text-theme">10-Day Replacement</div>
                <div className="text-sm text-theme-3">10-day replacement policy</div>
              </Card>
            </div>

            {/* Product Details */}
            <Card className="p-6 bg-card border-theme">
              <h3 className="font-bold text-lg mb-4 text-theme">Pre-Order Details</h3>
              <ul className="space-y-2 text-theme-2">
                <li>• Machine washable (cold water recommended)</li>
                <li>• Unique HAXEUS design</li>
                <li>• Comfortable relaxed fit</li>
                <li>• Durable construction for long-lasting wear</li>
              </ul>

              <div className="mt-6 pt-4 border-t border-theme">
                <h4 className="font-semibold mb-3 text-theme">Shipping &amp; Returns</h4>
                <ul className="space-y-2 text-theme-3 text-sm">
                  <li>• <strong>Pre-order Shipping:</strong> Expected on {preorderItem.expected_date || 'date provided'}</li>
                  <li>• <strong>Domestic Shipping:</strong> 7-10 days after ship</li>
                  <li>• <strong>Replacement:</strong> 10-day replacement from date of delivery</li>
                </ul>
              </div>
            </Card>

            {/* Size Chart */}
            <Card className="p-6 bg-card border-theme">
              <h3 className="font-bold text-lg mb-4 text-theme">Men's Relaxed Fit T-Shirt Size Chart</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-theme">
                      <th className="py-3 px-4 text-left font-semibold text-theme">Size</th>
                      <th className="py-3 px-4 text-center font-semibold text-theme">Chest (in)</th>
                      <th className="py-3 px-4 text-center font-semibold text-theme">Length (in)</th>
                    </tr>
                  </thead>
                  <tbody className="text-theme-2">
                    <tr className="border-b border-white/[0.04]">
                      <td className="py-3 px-4 font-medium">S</td>
                      <td className="py-3 px-4 text-center">40</td>
                      <td className="py-3 px-4 text-center">27.5</td>
                    </tr>
                    <tr className="border-b border-white/[0.04]">
                      <td className="py-3 px-4 font-medium">M</td>
                      <td className="py-3 px-4 text-center">42</td>
                      <td className="py-3 px-4 text-center">28.5</td>
                    </tr>
                    <tr className="border-b border-theme/50">
                      <td className="py-3 px-4 font-medium">L</td>
                      <td className="py-3 px-4 text-center">44</td>
                      <td className="py-3 px-4 text-center">29.5</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium">XL</td>
                      <td className="py-3 px-4 text-center">46</td>
                      <td className="py-3 px-4 text-center">30.5</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-4 text-xs text-theme-3">
                * Measurements are in inches. For best fit, measure a similar garment you already own.
              </p>
            </Card>
          </div>
        </div>

        {/* Sticky preorder bar — mobile only */}
        {stickyBarVisible && (
          <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-card/95 backdrop-blur-md border-t border-theme p-3 safe-area-pb">
            <div className="flex items-center gap-3 max-w-7xl mx-auto">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-theme truncate">{preorderItem.name}</p>
                <p className="text-[var(--accent)] font-bold">{formatPrice(preorderItem.price)}</p>
              </div>
              <Button
                onClick={handlePreorder}
                disabled={submitting || !selectedSize}
                size="lg"
                className="h-12 px-4 bg-[var(--accent)] hover:opacity-90 text-white"
              >
                <Zap className="w-5 h-5 mr-1.5" />
                {submitting ? "..." : "Pre-Order Now"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
