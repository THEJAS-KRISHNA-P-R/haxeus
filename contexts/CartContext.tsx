'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export interface CartItem {
  id: string
  product_id: number
  size: string
  quantity: number
  product: {
    id: number
    name: string
    price: number
    front_image: string
  }
}

interface CartContextType {
  items: CartItem[]
  addItem: (productId: number, size: string, quantity: number) => Promise<void>
  removeItem: (itemId: string) => Promise<void>
  updateQuantity: (itemId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  totalItems: number
  totalPrice: number
  isLoading: boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUserId(user?.id || null)
      
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUserId(session?.user?.id || null)
      })

      return () => subscription.unsubscribe()
    }
    getUser()
  }, [])

  useEffect(() => {
    loadCart()
  }, [userId])

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
            .select('id, name, price, front_image')
            .in('id', productIds)

          if (productsError) throw productsError

          const itemsWithProducts: CartItem[] = cartItems.map(item => {
            const product = products?.find(p => p.id === item.product_id)
            return {
              id: item.id,
              product_id: item.product_id,
              size: item.size,
              quantity: item.quantity,
              product: product || {
                id: item.product_id,
                name: 'Unknown Product',
                price: 0,
                front_image: '/placeholder.jpg'
              }
            }
          })

          setItems(itemsWithProducts)
        } else {
          setItems([])
        }
      } else {
        const localCart = localStorage.getItem('guestCart')
        if (localCart) {
          setItems(JSON.parse(localCart))
        } else {
          setItems([])
        }
      }
    } catch (error) {
      console.error('Error loading cart:', error)
      const localCart = localStorage.getItem('guestCart')
      if (localCart) {
        setItems(JSON.parse(localCart))
      }
    } finally {
      setIsLoading(false)
    }
  }

  const addItem = async (productId: number, size: string, quantity: number) => {
    try {
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('id, name, price, front_image')
        .eq('id', productId)
        .single()

      if (productError || !product) {
        throw new Error('Product not found')
      }

      if (userId) {
        const { data: existingItem, error: checkError } = await supabase
          .from('cart_items')
          .select('*')
          .eq('user_id', userId)
          .eq('product_id', productId)
          .eq('size', size)
          .maybeSingle()

        if (checkError && checkError.code !== 'PGRST116') throw checkError

        if (existingItem) {
          const { error: updateError } = await supabase
            .from('cart_items')
            .update({ quantity: existingItem.quantity + quantity })
            .eq('id', existingItem.id)

          if (updateError) throw updateError
        } else {
          const { error: insertError } = await supabase
            .from('cart_items')
            .insert({
              user_id: userId,
              product_id: productId,
              size,
              quantity
            })

          if (insertError) throw insertError
        }

        await loadCart()
      } else {
        const existingItemIndex = items.findIndex(
          item => item.product_id === productId && item.size === size
        )

        let newItems: CartItem[]
        if (existingItemIndex > -1) {
          newItems = [...items]
          newItems[existingItemIndex].quantity += quantity
        } else {
          const newItem: CartItem = {
            id: `guest-${Date.now()}`,
            product_id: productId,
            size,
            quantity,
            product: {
              id: product.id,
              name: product.name,
              price: product.price,
              front_image: product.front_image
            }
          }
          newItems = [...items, newItem]
        }

        setItems(newItems)
        localStorage.setItem('guestCart', JSON.stringify(newItems))
      }
    } catch (error: any) {
      console.error('Error adding item to cart:', error)
      throw new Error(error.message || 'Failed to add item to cart')
    }
  }

  const removeItem = async (itemId: string) => {
    try {
      if (userId) {
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('id', itemId)
          .eq('user_id', userId)

        if (error) throw error
        await loadCart()
      } else {
        const newItems = items.filter(item => item.id !== itemId)
        setItems(newItems)
        localStorage.setItem('guestCart', JSON.stringify(newItems))
      }
    } catch (error) {
      console.error('Error removing item:', error)
      throw error
    }
  }

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) return

    try {
      if (userId) {
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity })
          .eq('id', itemId)
          .eq('user_id', userId)

        if (error) throw error
        await loadCart()
      } else {
        const newItems = items.map(item =>
          item.id === itemId ? { ...item, quantity } : item
        )
        setItems(newItems)
        localStorage.setItem('guestCart', JSON.stringify(newItems))
      }
    } catch (error) {
      console.error('Error updating quantity:', error)
      throw error
    }
  }

  const clearCart = async () => {
    try {
      if (userId) {
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', userId)

        if (error) throw error
      }
      setItems([])
      localStorage.removeItem('guestCart')
    } catch (error) {
      console.error('Error clearing cart:', error)
      throw error
    }
  }

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)

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
        isLoading
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
