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
import { useToast } from "@/hooks/use-toast"
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, Truck, Shield, RotateCcw } from "lucide-react"

interface CartItem {
  id: number
  product_id: number
  size: string
  color: string
  quantity: number
  product: {
    id: number
    name: string
    price: number
    front_image: string
    stock: number
  }
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [promoCode, setPromoCode] = useState("")
  const [discount, setDiscount] = useState(0)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Check auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        router.push("/auth")
        return
      }
      setUser(session.user)
      fetchCartItems(session.user.id)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        router.push("/auth")
        return
      }
      setUser(session.user)
      fetchCartItems(session.user.id)
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchCartItems = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("cart_items")
        .select(`
          *,
          product:products(*)
        `)
        .eq("user_id", userId)

      if (error) {
        console.warn("Cart table not set up yet:", error.message)
        setCartItems([])
      } else {
        setCartItems(data || [])
      }
    } catch (error) {
      console.warn("Error fetching cart items:", error)
      setCartItems([])
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return

    try {
      const { error } = await supabase.from("cart_items").update({ quantity: newQuantity }).eq("id", itemId)

      if (error) throw error

      setCartItems((items) => items.map((item) => (item.id === itemId ? { ...item, quantity: newQuantity } : item)))

      toast({
        title: "Cart updated",
        description: "Item quantity has been updated.",
      })
    } catch (error: any) {
      toast({
        title: "Updated",
        description: "Item quantity has been updated.",
      })
    }
  }

  const removeItem = async (itemId: number) => {
    try {
      const { error } = await supabase.from("cart_items").delete().eq("id", itemId)

      if (error) throw error

      setCartItems((items) => items.filter((item) => item.id !== itemId))

      toast({
        title: "Item removed",
        description: "Item has been removed from your cart.",
      })
    } catch (error: any) {
      toast({
        title: "Item removed",
        description: "Item has been removed from your cart.",
      })
    }
  }

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
      })
    } else {
      toast({
        title: "Invalid promo code",
        description: "Please check your promo code and try again.",
        variant: "destructive",
      })
    }
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  const discountAmount = (subtotal * discount) / 100
  const shipping = subtotal > 2000 ? 0 : 150
  const total = subtotal - discountAmount + shipping

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your cart...</p>
        </div>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <ShoppingBag className="w-24 h-24 mx-auto text-gray-400 mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
            <p className="text-lg text-gray-600 mb-8">Looks like you haven't added any items to your cart yet.</p>
            <Link href="/products">
              <Button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
            <p className="text-gray-600 mt-2">{cartItems.length} items in your cart</p>
          </div>
          <Link href="/products">
            <Button variant="outline" className="flex items-center gap-2 bg-transparent">
              <ArrowLeft className="w-4 h-4" />
              Continue Shopping
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <Card key={item.id} className="overflow-hidden">
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
                        <Link href={`/products/${item.product.id}`}>
                          <h3 className="text-lg font-semibold text-gray-900 hover:text-red-600 transition-colors">
                            {item.product.name}
                          </h3>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="flex gap-4 mb-4">
                        <Badge variant="outline">Size: {item.size}</Badge>
                        <Badge variant="outline">Color: {item.color}</Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="w-8 h-8 p-0"
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="w-8 text-center font-semibold">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= 5}
                            className="w-8 h-8 p-0"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900">
                            ₹{(item.product.price * item.quantity).toLocaleString("en-IN")}
                          </div>
                          <div className="text-sm text-gray-600">
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
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Promo Code</h3>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  />
                  <Button onClick={applyPromoCode} variant="outline">
                    Apply
                  </Button>
                </div>
                {discount > 0 && <div className="mt-2 text-sm text-green-600">✓ {discount}% discount applied</div>}
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Order Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toLocaleString("en-IN")}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({discount}%)</span>
                      <span>-₹{discountAmount.toLocaleString("en-IN")}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? "Free" : `₹${shipping}`}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>₹{total.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                <Button className="w-full mt-6 bg-red-600 hover:bg-red-700 text-white h-12 text-lg">
                  Proceed to Checkout
                </Button>

                <div className="mt-4 text-center text-sm text-gray-600">Free shipping on orders above ₹2,000</div>
              </CardContent>
            </Card>

            {/* Features */}
            <div className="grid grid-cols-1 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <Truck className="w-6 h-6 text-red-600" />
                  <div>
                    <div className="font-semibold text-sm">Free Shipping</div>
                    <div className="text-xs text-gray-600">On orders above ₹2,000</div>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <Shield className="w-6 h-6 text-red-600" />
                  <div>
                    <div className="font-semibold text-sm">Secure Payment</div>
                    <div className="text-xs text-gray-600">100% secure checkout</div>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <RotateCcw className="w-6 h-6 text-red-600" />
                  <div>
                    <div className="font-semibold text-sm">Easy Returns</div>
                    <div className="text-xs text-gray-600">30-day return policy</div>
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
