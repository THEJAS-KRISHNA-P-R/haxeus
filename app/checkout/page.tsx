"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { supabase, type UserAddress } from "@/lib/supabase"
import { useCart } from "@/contexts/CartContext"
import { useToast } from "@/hooks/use-toast"
import { sendOrderConfirmationEmail } from "@/lib/email"
import { ArrowLeft, CreditCard, Wallet, Building2, Smartphone, QrCode } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { QRCodeSVG } from "qrcode.react"
import { useIsMobile } from "@/hooks/use-mobile"

export default function CheckoutPage() {
  const router = useRouter()
  const { items, clearCart } = useCart()
  const { toast } = useToast()
  const isMobile = useIsMobile()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [addresses, setAddresses] = useState<UserAddress[]>([])
  const [selectedAddress, setSelectedAddress] = useState<string>("")
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "online">("cod")
  const [selectedPaymentApp, setSelectedPaymentApp] = useState<string>("gpay")

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push("/auth?redirect=/checkout")
      return
    }

    setUser(user)
    await loadAddresses(user.id)
  }

  async function loadAddresses(userId: string) {
    const { data, error } = await supabase
      .from("user_addresses")
      .select("*")
      .eq("user_id", userId)
      .order("is_default", { ascending: false })

    if (error) {
      console.error("Error loading addresses:", error)
      return
    }

    setAddresses(data || [])
    
    // Select default address or first address
    const defaultAddr = data?.find((addr) => addr.is_default)
    if (defaultAddr) {
      setSelectedAddress(defaultAddr.id)
    } else if (data && data.length > 0) {
      setSelectedAddress(data[0].id)
    }
  }

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  const shipping = subtotal > 2000 ? 0 : 150
  const total = subtotal + shipping

  const UPI_ID = "shahzadak735@okaxis"
  const UPI_NAME = "HAXEUZ"
  
  // Generate UPI payment string
  const generateUPIString = () => {
    return `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${total}&cu=INR&tn=${encodeURIComponent(`Order Payment - HAXEUZ`)}`
  }

  // Handle UPI payment on mobile
  const handleUPIPayment = () => {
    const upiString = generateUPIString()
    
    // UPI app URLs for different payment apps
    const appUrls: Record<string, string> = {
      gpay: `tez://upi/pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${total}&cu=INR`,
      phonepe: `phonepe://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${total}&cu=INR`,
      paytm: `paytmmp://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${total}&cu=INR`,
      default: upiString
    }

    const url = appUrls[selectedPaymentApp] || appUrls.default
    
    // Open payment app
    window.location.href = url
    
    toast({
      title: "Opening payment app",
      description: "Complete the payment in your UPI app",
    })
  }

  async function handlePlaceOrder() {
    if (!selectedAddress) {
      toast({
        title: "Select delivery address",
        description: "Please select a delivery address to continue",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      // Get selected address details
      const address = addresses.find((addr) => addr.id === selectedAddress)
      if (!address) {
        throw new Error("Address not found")
      }

      // Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          total_amount: total,
          status: "pending",
          shipping_address: {
            fullName: address.full_name,
            addressLine1: address.address_line1,
            addressLine2: address.address_line2,
            city: address.city,
            state: address.state,
            pincode: address.pincode,
            phone: address.phone,
          },
          payment_method: paymentMethod,
          payment_status: paymentMethod === "cod" ? "pending" : "paid",
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Create order items
      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.product.id,
        size: item.size,
        quantity: item.quantity,
        price: item.product.price,
      }))

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

      if (itemsError) throw itemsError

      // Delete cart items
      const { error: deleteError } = await supabase
        .from("cart_items")
        .delete()
        .eq("user_id", user.id)

      if (deleteError) console.error("Error deleting cart items:", deleteError)

      // Send order confirmation email
      await sendOrderConfirmationEmail({
        orderId: order.id,
        customerEmail: user.email!,
        customerName: address.full_name,
        items: items.map((item) => ({
          name: item.product.name,
          size: item.size,
          quantity: item.quantity,
          price: item.product.price,
        })),
        totalAmount: total,
        shippingAddress: {
          fullName: address.full_name,
          addressLine1: address.address_line1,
          addressLine2: address.address_line2,
          city: address.city,
          state: address.state,
          pincode: address.pincode,
          phone: address.phone,
        },
      })

      // Clear local cart
      clearCart()

      toast({
        title: "Order placed successfully!",
        description: "You will receive a confirmation email shortly.",
      })

      // Redirect to order confirmation
      router.push(`/orders/${order.id}`)
    } catch (error: any) {
      console.error("Error placing order:", error)
      toast({
        title: "Failed to place order",
        description: error.message || "Please try again",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 dark:text-white">Your cart is empty</h1>
          <Link href="/products">
            <Button className="bg-red-600 hover:bg-red-700">Shop Now</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="dark:hover:bg-gray-800">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold dark:text-white">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Address & Payment */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="dark:text-white">Delivery Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {addresses.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600 dark:text-gray-400 mb-4">No saved addresses</p>
                    <Link href="/profile/addresses/new">
                      <Button>Add Address</Button>
                    </Link>
                  </div>
                ) : (
                  <RadioGroup value={selectedAddress} onValueChange={setSelectedAddress}>
                    {addresses.map((address) => (
                      <div
                        key={address.id}
                        className={`border rounded-lg p-4 cursor-pointer transition ${
                          selectedAddress === address.id ? "border-red-600 bg-red-50 dark:bg-red-900/20" : "border-gray-200 dark:border-gray-600"
                        }`}
                        onClick={() => setSelectedAddress(address.id)}
                      >
                        <div className="flex items-start gap-3">
                          <RadioGroupItem value={address.id} id={address.id} className="mt-1" />
                          <label htmlFor={address.id} className="flex-1 cursor-pointer">
                            <div className="font-semibold dark:text-white">{address.full_name}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {address.address_line1}
                              {address.address_line2 && `, ${address.address_line2}`}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {address.city}, {address.state} {address.pincode}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Phone: {address.phone}</div>
                            {address.is_default && (
                              <div className="text-xs text-red-600 dark:text-red-500 font-semibold mt-2">DEFAULT</div>
                            )}
                          </label>
                        </div>
                      </div>
                    ))}
                  </RadioGroup>
                )}

                {addresses.length > 0 && (
                  <Link href="/profile/addresses/new">
                    <Button variant="outline" className="w-full dark:border-gray-600 dark:hover:bg-gray-700">
                      Add New Address
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="dark:text-white">Payment Method</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                  <div
                    className={`border rounded-lg p-4 cursor-pointer transition ${
                      paymentMethod === "cod" ? "border-red-600 bg-red-50 dark:bg-red-900/20" : "border-gray-200 dark:border-gray-600"
                    }`}
                    onClick={() => setPaymentMethod("cod")}
                  >
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="cod" id="cod" />
                      <label htmlFor="cod" className="flex-1 cursor-pointer flex items-center gap-3">
                        <Wallet className="w-5 h-5 dark:text-gray-300" />
                        <div>
                          <div className="font-semibold dark:text-white">Cash on Delivery</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Pay when you receive</div>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div
                    className={`border rounded-lg p-4 cursor-pointer transition ${
                      paymentMethod === "online" ? "border-red-600 bg-red-50 dark:bg-red-900/20" : "border-gray-200 dark:border-gray-600"
                    }`}
                    onClick={() => setPaymentMethod("online")}
                  >
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="online" id="online" />
                      <label htmlFor="online" className="flex-1 cursor-pointer flex items-center gap-3">
                        <Smartphone className="w-5 h-5 dark:text-gray-300" />
                        <div>
                          <div className="font-semibold dark:text-white">UPI Payment</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {isMobile ? "Pay via UPI app" : "Scan QR code to pay"}
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>
                </RadioGroup>

                {/* UPI Payment Details */}
                {paymentMethod === "online" && (
                  <div className="mt-4 p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                    {isMobile ? (
                      // Mobile: Show payment app selection
                      <div className="space-y-4">
                        <Label className="text-sm font-semibold dark:text-white">Select Payment App</Label>
                        <RadioGroup value={selectedPaymentApp} onValueChange={setSelectedPaymentApp}>
                          <div className="grid grid-cols-2 gap-3">
                            <div
                              className={`border rounded-lg p-3 cursor-pointer transition ${
                                selectedPaymentApp === "gpay" ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20" : "border-gray-300 dark:border-gray-600"
                              }`}
                              onClick={() => setSelectedPaymentApp("gpay")}
                            >
                              <div className="flex items-center gap-2">
                                <RadioGroupItem value="gpay" id="gpay" />
                                <label htmlFor="gpay" className="cursor-pointer text-sm font-medium dark:text-white">
                                  Google Pay
                                </label>
                              </div>
                            </div>
                            <div
                              className={`border rounded-lg p-3 cursor-pointer transition ${
                                selectedPaymentApp === "phonepe" ? "border-purple-600 bg-purple-50 dark:bg-purple-900/20" : "border-gray-300 dark:border-gray-600"
                              }`}
                              onClick={() => setSelectedPaymentApp("phonepe")}
                            >
                              <div className="flex items-center gap-2">
                                <RadioGroupItem value="phonepe" id="phonepe" />
                                <label htmlFor="phonepe" className="cursor-pointer text-sm font-medium dark:text-white">
                                  PhonePe
                                </label>
                              </div>
                            </div>
                            <div
                              className={`border rounded-lg p-3 cursor-pointer transition ${
                                selectedPaymentApp === "paytm" ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20" : "border-gray-300 dark:border-gray-600"
                              }`}
                              onClick={() => setSelectedPaymentApp("paytm")}
                            >
                              <div className="flex items-center gap-2">
                                <RadioGroupItem value="paytm" id="paytm" />
                                <label htmlFor="paytm" className="cursor-pointer text-sm font-medium dark:text-white">
                                  Paytm
                                </label>
                              </div>
                            </div>
                            <div
                              className={`border rounded-lg p-3 cursor-pointer transition ${
                                selectedPaymentApp === "default" ? "border-gray-600 bg-gray-50 dark:bg-gray-800" : "border-gray-300 dark:border-gray-600"
                              }`}
                              onClick={() => setSelectedPaymentApp("default")}
                            >
                              <div className="flex items-center gap-2">
                                <RadioGroupItem value="default" id="default" />
                                <label htmlFor="default" className="cursor-pointer text-sm font-medium dark:text-white">
                                  Other UPI
                                </label>
                              </div>
                            </div>
                          </div>
                        </RadioGroup>
                        <Button
                          onClick={handleUPIPayment}
                          className="w-full bg-green-600 hover:bg-green-700"
                        >
                          <Smartphone className="w-4 h-4 mr-2" />
                          Pay ₹{total.toLocaleString("en-IN")} via UPI
                        </Button>
                        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                          You will be redirected to your payment app
                        </p>
                      </div>
                    ) : (
                      // Desktop: Show QR code
                      <div className="space-y-4">
                        <div className="text-center">
                          <Label className="text-sm font-semibold dark:text-white">Scan QR Code to Pay</Label>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Use any UPI app to scan and pay
                          </p>
                        </div>
                        <div className="flex justify-center p-4 bg-white dark:bg-gray-800 rounded-lg">
                          <QRCodeSVG
                            value={generateUPIString()}
                            size={200}
                            level="H"
                            includeMargin={true}
                            className="border-4 border-gray-200 dark:border-gray-700 rounded-lg"
                          />
                        </div>
                        <div className="text-center space-y-2">
                          <div className="flex items-center justify-center gap-2 text-sm">
                            <QrCode className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            <span className="font-semibold dark:text-white">Amount: ₹{total.toLocaleString("en-IN")}</span>
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            UPI ID: {UPI_ID}
                          </div>
                        </div>
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                          <p className="text-xs text-yellow-800 dark:text-yellow-200">
                            ⚠️ After successful payment, please click "I've Paid" button below
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Order Summary */}
          <div>
            <Card className="sticky top-24 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="dark:text-white">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items */}
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={`${item.product.id}-${item.size}`} className="flex gap-3">
                      <div className="relative h-16 w-16 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                        <Image
                          src={item.product.front_image || "/placeholder.jpg"}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate dark:text-white">{item.product.name}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Size: {item.size} • Qty: {item.quantity}
                        </p>
                        <p className="text-sm font-semibold mt-1 dark:text-white">
                          ₹{(item.product.price * item.quantity).toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="dark:bg-gray-700" />

                {/* Price Breakdown */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                    <span className="font-medium dark:text-white">₹{subtotal.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                    <span className="font-medium dark:text-white">{shipping === 0 ? "Free" : `₹${shipping}`}</span>
                  </div>
                  <Separator className="dark:bg-gray-700" />
                  <div className="flex justify-between text-lg font-bold">
                    <span className="dark:text-white">Total</span>
                    <span className="dark:text-white">₹{total.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                <Button
                  onClick={handlePlaceOrder}
                  disabled={loading || !selectedAddress}
                  className="w-full bg-red-600 hover:bg-red-700 h-12"
                >
                  {loading ? "Placing Order..." : "Place Order"}
                </Button>

                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  By placing your order, you agree to our terms and conditions
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
