import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://hexzhuaifunjowwqkxcy.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhleHpodWFpZnVuam93d3FreGN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxMTQ2MDgsImV4cCI6MjA2ODY5MDYwOH0.d91NCn28rURIwFtEfUiJxtVxRf6Bm-X9XeyCGxDiURE"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database Types

// Product Image (Gallery support)
export interface ProductImage {
  id: string
  product_id: number
  image_url: string
  display_order: number
  is_primary: boolean
  created_at?: string
}

export interface Product {
  id: number
  name: string
  description: string
  price: number
  // Legacy fields (deprecated - use images instead)
  front_image?: string
  back_image?: string
  // New gallery-based images
  images?: ProductImage[]
  // Size-specific inventory
  inventory?: ProductInventory[]
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
  notify_price_drop?: boolean
  notify_back_in_stock?: boolean
  price_at_addition?: number
  created_at?: string
  product?: Product
}

export interface ProductInventory {
  id: string
  product_id: number
  size: string
  color: string
  stock_quantity: number
  low_stock_threshold: number
  reserved_quantity: number
  sold_quantity: number
  created_at?: string
  updated_at?: string
}

export interface ProductReview {
  id: string
  product_id: number
  user_id: string
  order_id?: string
  rating: number
  title?: string
  comment?: string
  verified_purchase: boolean
  helpful_count: number
  not_helpful_count: number
  is_approved: boolean
  created_at?: string
  updated_at?: string
  user?: {
    email?: string
    full_name?: string
  }
  images?: ReviewImage[]
}

export interface ReviewImage {
  id: string
  review_id: string
  image_url: string
  created_at?: string
}

export interface Coupon {
  id: string
  code: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  min_purchase_amount: number
  max_discount_amount?: number
  usage_limit?: number
  used_count: number
  valid_from?: string
  valid_until?: string
  is_active: boolean
  created_at?: string
}

export interface LoyaltyPoints {
  id: string
  user_id: string
  total_points: number
  lifetime_points: number
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
  created_at?: string
  updated_at?: string
}

export interface ReturnRequest {
  id: string
  order_id: string
  user_id: string
  return_type: 'return' | 'exchange'
  reason: string
  status: 'pending' | 'approved' | 'rejected' | 'completed'
  refund_amount?: number
  admin_notes?: string
  created_at?: string
  updated_at?: string
  order?: Order
  items?: ReturnItem[]
}

export interface ReturnItem {
  id: string
  return_request_id: string
  order_item_id: string
  quantity: number
  exchange_size?: string
  created_at?: string
}

export interface NewsletterSubscriber {
  id: string
  email: string
  user_id?: string
  subscribed: boolean
  subscription_source?: string
  created_at?: string
  unsubscribed_at?: string
}

export interface ProductRelation {
  id: string
  product_id: number
  related_product_id: number
  relation_type: 'frequently_bought_together' | 'similar' | 'complete_the_look'
  score: number
  created_at?: string
}

export interface AbandonedCart {
  id: string
  user_id: string
  cart_value: number
  items_count: number
  email_sent_count: number
  last_email_sent_at?: string
  recovered: boolean
  recovered_at?: string
  created_at?: string
  updated_at?: string
}