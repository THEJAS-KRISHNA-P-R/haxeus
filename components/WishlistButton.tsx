"use client"

import { useEffect, useState } from "react"
import { Heart } from "lucide-react"
import { Button } from "./ui/button"
import { addToWishlist, removeFromWishlist, isInWishlist } from "@/lib/wishlist"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

interface WishlistButtonProps {
  productId: number
  variant?: "default" | "ghost" | "outline"
  size?: "default" | "sm" | "lg" | "icon"
  showText?: boolean
  className?: string
}

export function WishlistButton({
  productId,
  variant = "ghost",
  size = "icon",
  showText = false,
  className = "",
}: WishlistButtonProps) {
  const router = useRouter()
  const [inWishlist, setInWishlist] = useState(false)
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    checkUser()
  }, [productId])

  async function checkUser() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        const inList = await isInWishlist(productId)
        setInWishlist(inList)
      }
    } catch (error) {
      console.error("Error checking wishlist status:", error)
    }
  }

  async function toggleWishlist(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    if (!user) {
      router.push("/auth")
      return
    }

    setLoading(true)

    try {
      if (inWishlist) {
        const success = await removeFromWishlist(productId)
        if (success) {
          setInWishlist(false)
        } else {
          alert("Failed to remove from wishlist")
        }
      } else {
        const success = await addToWishlist(productId)
        if (success) {
          setInWishlist(true)
        } else {
          alert("Failed to add to wishlist")
        }
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error)
      alert("An error occurred")
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) {
    return (
      <Button variant={variant} size={size} disabled className={className}>
        <Heart size={20} />
      </Button>
    )
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={toggleWishlist}
      disabled={loading}
      className={`${showText ? "gap-2" : ""} ${className}`}
      title={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart
        size={20}
        className={`transition-all ${
          inWishlist ? "fill-red-500 text-red-500" : "text-gray-600"
        }`}
      />
      {showText && (
        <span>{inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}</span>
      )}
    </Button>
  )
}
