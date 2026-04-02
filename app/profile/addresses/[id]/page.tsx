"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Toggle } from "@/components/ui/Toggle"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"

export default function EditAddressPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = use(paramsPromise)
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    pincode: "",
    is_default: false,
  })

  useEffect(() => {
    loadAddress()
  }, [params.id])

  async function loadAddress() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth")
        return
      }

      const { data, error } = await supabase
        .from("user_addresses")
        .select("*")
        .eq("id", params.id)
        .eq("user_id", user.id)
        .maybeSingle()

      if (error) throw error
      if (!data) {
        router.push("/profile?tab=addresses")
        return
      }

      setFormData({
        full_name: data.full_name || "",
        phone: data.phone || "",
        address_line1: data.address_line1 || "",
        address_line2: data.address_line2 || "",
        city: data.city || "",
        state: data.state || "",
        pincode: data.pincode || "",
        is_default: data.is_default || false,
      })
    } catch (error) {
      console.error("Error loading address:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth")
        return
      }

      // If setting as default, unset other defaults first
      if (formData.is_default) {
        await supabase
          .from("user_addresses")
          .update({ is_default: false })
          .eq("user_id", user.id)
      }

      const { error } = await supabase
        .from("user_addresses")
        .update(formData)
        .eq("id", params.id)
        .eq("user_id", user.id)

      if (error) throw error

      router.push("/profile?tab=addresses")
      router.refresh()
    } catch (error) {
      console.error("Error updating address:", error)
      alert("Failed to update address")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen pt-20 bg-theme">
        <Loader2 className="animate-spin text-[var(--accent)]" size={32} />
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 pb-12 bg-theme">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href="/profile?tab=addresses">
            <Button variant="ghost" className="gap-2 mb-4 text-theme-2 hover:text-theme">
              <ArrowLeft size={16} />
              Back to Profile
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-theme">Edit Address</h1>
        </div>

        <Card className="bg-card border-theme text-theme">
          <CardHeader>
            <CardTitle className="text-theme">Address Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="full_name" className="text-theme">Full Name *</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) =>
                      setFormData({ ...formData, full_name: e.target.value })
                    }
                    required
                    className="bg-transparent border-theme text-theme placeholder:text-theme-3"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-theme">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    required
                    className="bg-transparent border-theme text-theme placeholder:text-theme-3"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address_line1" className="text-theme">Address Line 1 *</Label>
                <Input
                  id="address_line1"
                  value={formData.address_line1}
                  onChange={(e) =>
                    setFormData({ ...formData, address_line1: e.target.value })
                  }
                  placeholder="House no., Building name"
                  required
                  className="bg-transparent border-theme text-theme placeholder:text-theme-3"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address_line2" className="text-theme">Address Line 2</Label>
                <Input
                  id="address_line2"
                  value={formData.address_line2}
                  onChange={(e) =>
                    setFormData({ ...formData, address_line2: e.target.value })
                  }
                  placeholder="Road name, Area, Colony"
                  className="bg-transparent border-theme text-theme placeholder:text-theme-3"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-theme">City *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    required
                    className="bg-transparent border-theme text-theme placeholder:text-theme-3"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state" className="text-theme">State *</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) =>
                      setFormData({ ...formData, state: e.target.value })
                    }
                    required
                    className="bg-transparent border-theme text-theme placeholder:text-theme-3"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pincode" className="text-theme">Pincode *</Label>
                  <Input
                    id="pincode"
                    value={formData.pincode}
                    onChange={(e) =>
                      setFormData({ ...formData, pincode: e.target.value })
                    }
                    required
                    className="bg-transparent border-theme text-theme placeholder:text-theme-3"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Toggle
                  checked={formData.is_default}
                  onChange={(checked) => setFormData({ ...formData, is_default: checked })}
                  size="md"
                />
                <Label htmlFor="is_default" className="cursor-pointer text-theme">
                  Set as default address
                </Label>
              </div>

              <div className="flex gap-3 pt-6 border-t border-theme">
                <Link href="/profile?tab=addresses" className="flex-1">
                  <Button type="button" variant="outline" className="w-full border-theme">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={saving} className="flex-1 bg-[var(--accent)] hover:opacity-90 text-white">
                  {saving ? "Saving..." : "Update Address"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
