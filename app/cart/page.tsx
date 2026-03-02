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

  const applyPromoCode = () => {
    const validCodes = {
      WELCOME10: 10,
      SAVE20: 20,
      FIRST15: 15,
    }

    if (validCodes[promoCode as keyof typeof validCodes]) {
      setDiscount(validCodes[promoCode as keyof typeof validCodes])
      toast({
        title: "Promo code applied!",
        description: `You saved ${validCodes[promoCode as keyof typeof validCodes]}% on your order.`,
        className: "bg-[#111]",
      })
    } else {
      toast({
        title: "Invalid promo code",
        description: "Please check your promo code and try again.",
        variant: "destructive",
      })
    }
  }

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  const discountAmount = (subtotal * discount) / 100
  const shipping = subtotal > 2000 ? 0 : 150
  const total = subtotal - discountAmount + shipping

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#080808] py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <ShoppingBag className="w-24 h-24 mx-auto text-white/30/50 mb-6" />
            <h1 className="text-3xl font-bold text-white mb-4">Your cart is empty</h1>
            <p className="text-lg text-white/40 mb-8">Looks like you haven't added any items to your cart yet.</p>
            <Link href="/products">
              <Button className="bg-[#e93a3a] hover:bg-[#e93a3a]/80 text-white px-8 py-3 rounded-full">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#080808] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Shopping Cart</h1>
            <p className="text-white/40 mt-2">{items.length} items in your cart</p>
          </div>
          <Link href="/products">
            <Button variant="outline" className="flex items-center gap-2 bg-transparent border-white/[0.06] text-white/60 hover:bg-[#111]/5">
              <ArrowLeft className="w-4 h-4" />
              Continue Shopping
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.id} className="overflow-hidden bg-[#111] border-white/[0.06]">
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
                          <h3 className="text-lg font-semibold text-white hover:text-[#e93a3a] transition-colors">
                            {item.product.name}
                          </h3>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          className="text-[#e93a3a] hover:text-[#e93a3a] hover:bg-[#e93a3a]/10 hover:bg-[#e93a3a]/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="flex gap-4 mb-4">
                        <Badge variant="outline" className="border-white/[0.06] text-white/60">Size: {item.size}</Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="w-8 h-8 p-0 border-white/[0.06] hover:bg-[#111]/5"
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="w-8 text-center font-semibold text-white">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= 10}
                            className="w-8 h-8 p-0 border-white/[0.06] hover:bg-[#111]/5"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-white">
                            ₹{(item.product.price * item.quantity).toLocaleString("en-IN")}
                          </div>
                          <div className="text-sm text-white/40 mt-1">
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
            <Card className="bg-[#111] border-white/[0.06]">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4 text-white">Promo Code</h3>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    className="bg-[#111] border-white/[0.06] text-white"
                  />
                  <Button onClick={applyPromoCode} variant="outline" className="border-white/[0.06] hover:bg-[#111]/5">
                    Apply
                  </Button>
                </div>
                {discount > 0 && <div className="mt-2 text-sm text-green-500">✓ {discount}% discount applied</div>}
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card className="bg-[#111] border-white/[0.06]">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4 text-white">Order Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-white/60">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toLocaleString("en-IN")}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-500">
                      <span>Discount ({discount}%)</span>
                      <span>-₹{discountAmount.toLocaleString("en-IN")}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-white/60">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? "Free" : `₹${shipping}`}</span>
                  </div>
                  <Separator className="bg-[#111]/5" />
                  <div className="flex justify-between text-lg font-bold text-white">
                    <span>Total</span>
                    <span>₹{total.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                <Link href="/checkout">
                  <Button className="w-full mt-6 bg-[#e93a3a] hover:bg-[#e93a3a]/80 text-white h-12 text-lg">
                    Proceed to Checkout
                  </Button>
                </Link>

                <div className="mt-4 text-center text-sm text-white/40">Free shipping on orders above ₹2,000</div>
              </CardContent>
            </Card>

            {/* Features */}
            <div className="grid grid-cols-1 gap-4">
              <Card className="p-4 bg-[#111] border-white/[0.06]">
                <div className="flex items-center gap-3">
                  <Truck className="w-6 h-6 text-[#e93a3a]" />
                  <div>
                    <div className="font-semibold text-sm text-white">Free Shipping</div>
                    <div className="text-xs text-white/40">On orders above ₹2,000</div>
                  </div>
                </div>
              </Card>
              <Card className="p-4 bg-[#111] border-white/[0.06]">
                <div className="flex items-center gap-3">
                  <Shield className="w-6 h-6 text-[#e93a3a]" />
                  <div>
                    <div className="font-semibold text-sm text-white">Secure Payment</div>
                    <div className="text-xs text-white/40">100% secure checkout</div>
                  </div>
                </div>
              </Card>
              <Card className="p-4 bg-[#111] border-white/[0.06]">
                <div className="flex items-center gap-3">
                  <RotateCcw className="w-6 h-6 text-[#e93a3a]" />
                  <div>
                    <div className="font-semibold text-sm text-white">Easy Returns</div>
                    <div className="text-xs text-white/40">30-day return policy</div>
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
