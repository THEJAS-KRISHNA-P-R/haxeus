'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { checkStockAvailability } from '@/lib/inventory'
import { Product } from '@/types/supabase'
import { User } from '@supabase/supabase-js'

export interface CartItem {
  id: string
  product_id: number
  size: string
  color: string
  quantity: number
  is_preorder: boolean
  preorder_expected_date: string | null
  product: Pick<Product, 'id' | 'name' | 'price' | 'front_image'>
}

export interface AddToCartInput {
  productId: number
  size: string
  color?: string
  quantity: number
  is_preorder?: boolean
  preorder_expected_date?: string | null
}

interface CartContextType {
  items: CartItem[]
  addItem: (input: AddToCartInput) => Promise<void>
  removeItem: (itemId: string) => Promise<void>
  updateQuantity: (itemId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  totalItems: number
  totalPrice: number
  userId: string | null
  user: User | null
  isLoading: boolean
  wishlist: number[]
  toggleWishlist: (productId: number) => Promise<void>
  isWishlisted: (productId: number) => boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [hasFetchedUser, setHasFetchedUser] = useState(false)
  const [wishlist, setWishlist] = useState<number[]>([])

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null

    const getUser = async () => {
      if (hasFetchedUser) return
      setHasFetchedUser(true)

      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error) {
          if (error.name !== "AuthSessionMissingError") {
            console.error("[CartContext] Auth error:", error.message)
          }
          setUser(null)
          setUserId(null)
        } else {
          setUser(user)
          setUserId(user?.id || null)
        }

        const { data } = supabase.auth.onAuthStateChange((_event, session) => {
          setUser(session?.user || null)
          setUserId(session?.user?.id || null)
        })
        subscription = data.subscription
      } catch (err) {
        // Silently catch library-level throws
        setUser(null)
        setUserId(null)
      }
    }

    getUser()

    return () => {
      if (subscription) subscription.unsubscribe()
    }
  }, [hasFetchedUser])

  useEffect(() => {
    const handleCartSync = async () => {
      if (userId) {
        await syncCartWithServer()
      }
      await loadCart()
      await loadWishlist()
    }
    
    handleCartSync()
  }, [userId])

  const syncCartWithServer = async () => {
    const localCart = localStorage.getItem('haxeus-cart')
    if (!localCart || !userId) return

    try {
      const guestItems: CartItem[] = JSON.parse(localCart)
      if (guestItems.length === 0) return

      // Batch sync: Check existing and upsert
      // We iterate and wrap each in a try/catch to ensure one failure doesn't block the rest
      for (const item of guestItems) {
        try {
          await addItem({
            productId: item.product_id,
            size: item.size,
            color: item.color,
            quantity: item.quantity,
            is_preorder: item.is_preorder,
            preorder_expected_date: item.preorder_expected_date
          })
        } catch (itemErr) {
          console.error(`[CartContext] Failed to sync item ${item.product_id}:`, itemErr)
        }
      }

      // Clear local storage after attempt
      localStorage.removeItem('haxeus-cart')
    } catch (err) {
      console.error('[CartContext] Critical sync error:', err)
    }
  }

  const loadWishlist = async () => {
    if (!userId) return
    try {
      const { data, error } = await supabase
        .from('wishlist')
        .select('product_id')
        .eq('user_id', userId)

      if (error) throw error
      setWishlist(data?.map(item => item.product_id) || [])
    } catch (err) {
      console.error('[CartContext] Error loading wishlist:', err)
      setWishlist([])
    }
  }

  const toggleWishlist = async (productId: number) => {
    if (!userId) return

    const isListed = wishlist.includes(productId)

    // Optimistic update
    if (isListed) {
      setWishlist(wishlist.filter(id => id !== productId))
    } else {
      setWishlist([...wishlist, productId])
    }

    try {
      if (isListed) {
        await supabase
          .from('wishlist')
          .delete()
          .eq('user_id', userId)
          .eq('product_id', productId)
      } else {
        await supabase
          .from('wishlist')
          .insert({ user_id: userId, product_id: productId })
      }
    } catch (err) {
      console.error('[CartContext] Error toggling wishlist:', err)
      loadWishlist()
    }
  }

  const isWishlisted = (productId: number) => wishlist.includes(productId)

  const loadCart = async () => {
    setIsLoading(true)
    try {
      if (userId) {
        const { data: cartItems, error } = await supabase
          .from('cart_items')
          .select('*')
          .eq('user_id', userId)

        if (error) throw error

        if (cartItems && cartItems.length > 0) {
          const productIds = cartItems.map(item => item.product_id)
          const { data: products, error: productsError } = await supabase
            .from('products')
            .select('id, name, price, front_image, is_preorder, expected_date')
            .in('id', productIds)

          if (productsError) throw productsError

          const itemsWithProducts: CartItem[] = cartItems.map(item => {
            const product = products?.find(p => p.id === item.product_id)
            return {
              id: item.id,
              product_id: item.product_id,
              size: item.size,
              color: item.color ?? '',
              quantity: item.quantity,
              is_preorder: item.is_preorder ?? product?.is_preorder ?? false,
              preorder_expected_date: item.preorder_expected_date ?? product?.expected_date ?? null,
              product: product ? {
                id: product.id,
                name: product.name,
                price: product.price,
                front_image: product.front_image
              } : {
                id: item.product_id,
                name: 'Unknown Product',
                price: 0,
                front_image: '/placeholder.svg'
              }
            }
          })

          setItems(itemsWithProducts)
        } else {
          setItems([])
        }
      } else {
        const localCart = localStorage.getItem('haxeus-cart')
        if (localCart) {
          setItems(JSON.parse(localCart))
        } else {
          setItems([])
        }
      }
    } catch (error) {
      console.error('Error loading cart:', error)
      const localCart = localStorage.getItem('haxeus-cart')
      if (localCart) {
        setItems(JSON.parse(localCart))
      }
    } finally {
      setIsLoading(false)
    }
  }

  const addItem = async (input: AddToCartInput) => {
    const {
      productId,
      size,
      color = '',
      quantity,
      is_preorder = false,
      preorder_expected_date = null,
    } = input

    try {
      // Only check stock for non-preorder items
      if (!is_preorder) {
        const stock = await checkStockAvailability(productId, size, quantity)
        if (!stock.available) {
          throw new Error(
            stock.currentStock > 0
              ? `Only ${stock.currentStock} items left in stock for size ${size}.`
              : `Size ${size} is currently out of stock.`
          )
        }
      }

      // Fetch product details
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('id, name, price, front_image')
        .eq('id', productId)
        .maybeSingle()

      if (productError || !product) {
        throw new Error('Product not found')
      }

      if (userId) {
        const { data: existingItem } = await supabase
          .from('cart_items')
          .select('*')
          .eq('user_id', userId)
          .eq('product_id', productId)
          .eq('size', size)
          .maybeSingle()

        if (existingItem) {
          await supabase
            .from('cart_items')
            .update({ quantity: existingItem.quantity + quantity })
            .eq('id', existingItem.id)
        } else {
          await supabase
            .from('cart_items')
            .insert({
              user_id: userId,
              product_id: productId,
              size,
              color,
              quantity,
              is_preorder,
              preorder_expected_date,
            })
        }

        await loadCart()
      } else {
        // Guest cart — optimistic update + localStorage
        const existingIdx = items.findIndex(
          item => item.product_id === productId && item.size === size
        )

        let newItems: CartItem[]
        if (existingIdx > -1) {
          newItems = items.map((item, i) =>
            i === existingIdx ? { ...item, quantity: item.quantity + quantity } : item
          )
        } else {
          const newItem: CartItem = {
            id: `guest-${Date.now()}`,
            product_id: productId,
            size,
            color,
            quantity,
            is_preorder,
            preorder_expected_date,
            product: {
              id: product.id,
              name: product.name,
              price: product.price,
              front_image: product.front_image,
            },
          }
          newItems = [...items, newItem]
        }

        setItems(newItems)
        localStorage.setItem('haxeus-cart', JSON.stringify(newItems))
      }
    } catch (error: any) {
      console.error('Error adding item to cart:', error)
      throw new Error(error.message || 'Failed to add item to cart')
    }
  }

  const removeItem = async (itemId: string) => {
    try {
      if (userId) {
        await supabase
          .from('cart_items')
          .delete()
          .eq('id', itemId)
          .eq('user_id', userId)

        await loadCart()
      } else {
        const newItems = items.filter(item => item.id !== itemId)
        setItems(newItems)
        localStorage.setItem('haxeus-cart', JSON.stringify(newItems))
      }
    } catch (error) {
      console.error('Error removing item:', error)
      throw error
    }
  }

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) {
      // Treat as remove when quantity goes to 0
      await removeItem(itemId)
      return
    }

    try {
      if (userId) {
        await supabase
          .from('cart_items')
          .update({ quantity })
          .eq('id', itemId)
          .eq('user_id', userId)

        await loadCart()
      } else {
        const newItems = items.map(item =>
          item.id === itemId ? { ...item, quantity } : item
        )
        setItems(newItems)
        localStorage.setItem('haxeus-cart', JSON.stringify(newItems))
      }
    } catch (error) {
      console.error('Error updating quantity:', error)
      throw error
    }
  }

  const clearCart = async () => {
    try {
      if (userId) {
        await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', userId)
      }
      setItems([])
      localStorage.removeItem('haxeus-cart')
    } catch (error) {
      console.error('Error clearing cart:', error)
      throw error
    }
  }

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        isLoading,
        user,
        userId,
        wishlist,
        toggleWishlist,
        isWishlisted,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
