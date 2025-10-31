import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://hexzhuaifunjowwqkxcy.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhleHpodWFpZnVuam93d3FreGN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxMTQ2MDgsImV4cCI6MjA2ODY5MDYwOH0.d91NCn28rURIwFtEfUiJxtVxRf6Bm-X9XeyCGxDiURE"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database Types
export interface Product {
  id: number
  name: string
  description: string
  price: number
  front_image: string
  back_image?: string
  available_sizes: string[]
  colors?: string[]
  total_stock: number
  category?: string
  created_at?: string
  updated_at?: string
}

export interface CartItem {
  id: string
  user_id: string
  product_id: number
  size: string
  quantity: number
  created_at?: string
  updated_at?: string
  product?: Product
}

export interface Order {
  id: string
  user_id: string
  total_amount: number
  status: string
  shipping_address?: any
  created_at?: string
  updated_at?: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: number
  size: string
  quantity: number
  price: number
  created_at?: string
  product?: Product
}

export interface UserAddress {
  id: string
  user_id: string
  full_name: string
  phone: string
  address_line1: string
  address_line2?: string
  city: string
  state: string
  pincode: string
  is_default: boolean
  created_at?: string
  updated_at?: string
}

export interface WishlistItem {
  id: string
  user_id: string
  product_id: number
  created_at?: string
  product?: Product
}
