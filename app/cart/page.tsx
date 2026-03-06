"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { supabase } from "@/lib/supabase"
import { useCart } from "@/contexts/CartContext"
import { useToast } from "@/hooks/use-toast"
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, Truck, Shield, RotateCcw } from "lucide-react"

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart } = useCart()
  const [user, setUser] = useState<any>(null)
  const [promoCode, setPromoCode] = useState("")
  const [discount, setDiscount] = useState(0)
  const router = useRouter()
  const { toast } = useToast()
  const [stockMap, setStockMap] = useState<Record<string, number>>({})
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null)
  const [couponError, setCouponError] = useState<string | null>(null)

  useEffect(() => {
    // Check auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const fetchStock = async () => {
      if (!items.length) return
      const stockData: Record<string, number> = {}
      await Promise.all(
        items.map(async (item) => {
          const { data } = await supabase
            .from("product_inventory")
            .select("stock_quantity")
            .eq("product_id", item.product_id)
            .eq("size", item.size)
            .single()
          stockData[`${item.product_id}_${item.size}`] = data?.stock_quantity ?? 0
        })
      )
      setStockMap(stockData)
    }
    fetchStock()
  }, [items])

  const applyPromoCode = async () => {
    if (!promoCode.trim()) return
    setCouponLoading(true)
    setCouponError(null)
    setCouponSuccess(null)

    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: promoCode.trim().toUpperCase(),
          cartTotal: subtotal,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.valid) {
        setCouponError(data.error || "Invalid promo code")
        setDiscount(0)
        toast({
          title: "Coupon Error",
          description: data.error || "Invalid promo code",
          variant: "destructive",
        })
      } else {
        setDiscount(data.coupon.discount_type === "percentage" ? data.coupon.discount_value : (data.discount / subtotal) * 100)
        setCouponSuccess(`${data.coupon.discount_type === "percentage" ? data.coupon.discount_value + "%" : "₹" + data.coupon.discount_value} discount applied!`)
        toast({
          title: "Coupon Applied",
          description: "Your discount has been added.",
        })
      }
    } catch (error) {
      setCouponError("Could not validate coupon")
    } finally {
      setCouponLoading(false)
    }
  }

  const getAvailableStock = (item: any) => stockMap[`${item.product_id}_${item.size}`] ?? 99

  const handleIncrease = (item: any) => {
    const available = getAvailableStock(item)
    if (item.quantity >= available) {
      toast({
        title: "Limited Stock",
        description: `Only ${available} units available in this size.`,
        variant: "destructive",
      })
      return
    }
    updateQuantity(item.id, item.quantity + 1)
  }

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  const discountAmount = (subtotal * discount) / 100
  const shipping = subtotal > 2000 ? 0 : 150
  const total = subtotal - discountAmount + shipping

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-theme pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <ShoppingBag className="w-24 h-24 mx-auto text-theme-3 mb-6" />
            <h1 className="text-3xl font-bold text-theme mb-4">Your cart is empty</h1>
            <p className="text-lg text-theme-2 mb-8">Looks like you haven't added any items to your cart yet.</p>
            <Link href="/products">
              <Button className="bg-[var(--accent)] hover:opacity-90 text-white px-8 py-3 rounded-full">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-theme pt-20 pb-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-theme">Shopping Cart</h1>
            <p className="text-theme-2 mt-2">{items.length} items in your cart</p>
          </div>
          <Link href="/products">
            <Button variant="outline" className="flex items-center gap-2 bg-transparent border-theme text-theme-2 hover:bg-card">
              <ArrowLeft className="w-4 h-4" />
              Continue Shopping
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.id} className="overflow-hidden bg-card border-theme">
                <CardContent className="p-6">
                  <div className="flex gap-6">
                    {/* Product Image */}
                    <div className="w-24 h-24 bg-black rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={item.product.front_image || "/placeholder.svg"}
                        alt={item.product.name}
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = "/placeholder.svg?height=96&width=96&text=Product"
                        }}
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <Link href={`/products/${item.product_id}`}>
                          <h3 className="text-lg font-semibold text-theme hover:text-[var(--accent)] transition-colors">
                            {item.product.name}
                          </h3>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          className="text-[var(--accent)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="flex gap-4 mb-4">
                        <Badge variant="outline" className="border-theme text-theme-2">Size: {item.size}</Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="w-8 h-8 p-0 border-theme hover:bg-card"
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="w-8 text-center font-semibold text-theme">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleIncrease(item)}
                            disabled={item.quantity >= getAvailableStock(item)}
                            className="w-8 h-8 p-0 border-theme hover:bg-card"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="text-right">
                          {item.quantity >= getAvailableStock(item) && (
                            <div className="text-[10px] text-[var(--accent)] font-medium mb-1">Max Stock Reached</div>
                          )}
                          <div className="text-lg font-bold text-theme">
                            ₹{(item.product.price * item.quantity).toLocaleString("en-IN")}
                          </div>
                          <div className="text-sm text-theme-3 mt-1">
                            ₹{item.product.price.toLocaleString("en-IN")} each
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            {/* Promo Code */}
            <Card className="bg-card border-theme">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4 text-theme">Promo Code</h3>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    className="bg-card border-theme text-theme"
                    disabled={couponLoading}
                  />
                  <Button
                    onClick={applyPromoCode}
                    variant="outline"
                    className="border-theme hover:bg-card"
                    disabled={couponLoading}
                  >
                    {couponLoading ? "..." : "Apply"}
                  </Button>
                </div>
                {couponSuccess && <div className="mt-2 text-sm text-green-500">✓ {couponSuccess}</div>}
                {couponError && <div className="mt-2 text-sm text-red-500">✗ {couponError}</div>}
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card className="bg-card border-theme">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4 text-theme">Order Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-theme-2">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toLocaleString("en-IN")}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-500">
                      <span>Discount ({discount}%)</span>
                      <span>-₹{discountAmount.toLocaleString("en-IN")}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-theme-2">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? "Free" : `₹${shipping}`}</span>
                  </div>
                  <Separator className="bg-theme opacity-10" />
                  <div className="flex justify-between text-lg font-bold text-theme">
                    <span>Total</span>
                    <span>₹{total.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                <Link href="/checkout">
                  <Button className="w-full mt-6 bg-[var(--accent)] hover:opacity-90 text-white h-12 text-lg">
                    Proceed to Checkout
                  </Button>
                </Link>

                <div className="mt-4 text-center text-sm text-theme-3">Free shipping on orders above ₹2,000</div>
              </CardContent>
            </Card>

            {/* Features */}
            <div className="grid grid-cols-1 gap-4">
              <Card className="p-4 bg-card border-theme">
                <div className="flex items-center gap-3">
                  <Truck className="w-6 h-6 text-[var(--accent)]" />
                  <div>
                    <div className="font-semibold text-sm text-theme">Free Shipping</div>
                    <div className="text-xs text-theme-3">On orders above ₹2,000</div>
                  </div>
                </div>
              </Card>
              <Card className="p-4 bg-card border-theme">
                <div className="flex items-center gap-3">
                  <Shield className="w-6 h-6 text-[var(--accent)]" />
                  <div>
                    <div className="font-semibold text-sm text-theme">Secure Payment</div>
                    <div className="text-xs text-theme-3">100% secure checkout</div>
                  </div>
                </div>
              </Card>
              <Card className="p-4 bg-card border-theme">
                <div className="flex items-center gap-3">
                  <RotateCcw className="w-6 h-6 text-[var(--accent)]" />
                  <div>
                    <div className="font-semibold text-sm text-theme">Easy Returns</div>
                    <div className="text-xs text-theme-3">30-day return policy</div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
