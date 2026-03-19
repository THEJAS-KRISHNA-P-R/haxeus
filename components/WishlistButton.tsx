"use client"

import { useEffect, useState } from "react"
import { Heart } from "lucide-react"
import { Button } from "./ui/button"
import { addToWishlist, removeFromWishlist, isInWishlist } from "@/lib/wishlist"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { useCart } from "@/contexts/CartContext"

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
  const { user } = useCart()
  const [inWishlist, setInWishlist] = useState(false)
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    checkUser()
  }, [productId])

  async function checkUser() {
    try {
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

    // Optimistic update — flip immediately, no loading state
    const wasInWishlist = inWishlist
    setInWishlist(!wasInWishlist)

    try {
      const success = wasInWishlist
        ? await removeFromWishlist(productId)
        : await addToWishlist(productId)

      // Only revert if the call actually failed
      if (!success) {
        setInWishlist(wasInWishlist)
      }
    } catch {
      setInWishlist(wasInWishlist)
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
          inWishlist ? "fill-red-500 text-red-500" : "text-white/50"
        }`}
      />
      {showText && (
        <span>{inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}</span>
      )}
    </Button>
  )
}
