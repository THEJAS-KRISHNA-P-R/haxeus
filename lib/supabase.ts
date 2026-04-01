import { createBrowserClient } from "@supabase/ssr"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

// Product Image (Gallery support)
export interface ProductImage {
  id: string | number
  product_id: number
  image_url: string
  display_order: number
  is_primary: boolean
  alt_text?: string
  created_at?: string
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned' | 'refunded'
export type PaymentStatus = 'pending' | 'authorized' | 'paid' | 'failed' | 'refunded'

export interface UserProfile {
  id: string
  full_name: string | null
  email?: string | null
  avatar_url: string | null
  loyalty_points: number
  loyalty_tier: 'bronze' | 'silver' | 'gold' | 'platinum'
  created_at?: string
  updated_at?: string
}

export interface UserAddress {
  id: string
  user_id: string
  full_name: string
  line1: string
  line2?: string
  city: string
  state: string
  pincode: string
  phone: string
  is_default: boolean
  created_at?: string
}

export interface Product {
  id: number
  name: string
  description: string
  price: number
  compare_price?: number
  // Legacy fields (deprecated - use images instead)
  front_image?: string
  back_image?: string
  // New gallery-based images
  images?: ProductImage[]
  product_images?: ProductImage[] // Alias often used in queries
  // Size-specific inventory
  inventory?: ProductInventory[]
  product_inventory?: ProductInventory[] // Actual table name link
  available_sizes: string[]
  colors?: string[]
  total_stock: number
  category: string | null
  category_id?: number
  slug?: string
  tags?: string[]
  is_active?: boolean
  is_featured?: boolean
  avg_rating?: number
  review_count?: number
  created_at?: string
  updated_at?: string
  // Preorder support
  is_preorder?: boolean
  preorder_status?: 'upcoming' | 'active' | 'shipping' | 'completed' | 'stopped' | 'sold_out'
  expected_date?: string
  max_preorders?: number
  preorder_count?: number
  // Added relation fields for nested queries
  product_variants?: ProductVariant[]
}

export interface ProductVariant {
  id: string
  product_id: number
  size: string
  color?: string
  sku?: string
  price_override?: number
  stock_quantity: number
  created_at?: string
}

export interface ProductInventory {
  id: string
  product_id: number
  size: string
  stock_quantity: number
  reserved_quantity: number
  sold_quantity: number
  low_stock_threshold: number
  color?: string
  sku?: string
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
  subtotal_amount?: number
  shipping_amount?: number
  tax_amount?: number
  status: OrderStatus
  shipping_name: string
  shipping_email: string
  shipping_address: {
    line1: string
    line2?: string
    city: string
    state: string
    pincode: string
    phone: string
  }
  payment_status: PaymentStatus
  payment_method?: string
  razorpay_order_id?: string
  razorpay_payment_id?: string
  tracking_id?: string
  tracking_url?: string
  estimated_delivery?: string
  discount_code?: string
  discount_amount?: number
  created_at?: string
  updated_at?: string
  delivered_at?: string
  tracking_number?: string
  order_items?: OrderItem[]
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
  product_name?: string | null
  product_image?: string | null
}

export interface WishlistItem {
  id: string
  user_id: string
  product_id: number
  added_at?: string
  product?: Product
}

export interface Review {
  id: string
  product_id: number
  user_id: string
  rating: number
  title?: string
  comment?: string
  body?: string // Alias for comment used in services
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

export type ProductReview = Review

export interface ReviewImage {
  id: string
  review_id: string
  image_url: string
  created_at?: string
}

export interface Coupon {
  id: string
  code: string
  description?: string
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

export interface CouponUsage {
  id: string
  coupon_id: string
  user_id: string
  order_id: string
  discount_amount: number
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

export interface LoyaltyTransaction {
  id: string
  user_id: string
  order_id?: string
  points: number
  transaction_type: 'earned' | 'redeemed' | 'expired' | 'adjusted'
  description?: string
  created_at?: string
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
  order?: Partial<Order>
  items?: ReturnItem[]
  orders?: Partial<Order>
  return_items?: (ReturnItem & { 
    order_items?: OrderItem & { 
      products?: Pick<Product, 'name' | 'front_image'> 
    } 
  })[]
}

export interface ReturnItem {
  id: string
  return_request_id: string
  order_item_id: string
  quantity: number
  exchange_size?: string
  created_at?: string
  order_items?: OrderItem & { 
    products?: Pick<Product, 'name' | 'front_image'> 
  }
}

export interface NewsletterSubscriber {
  id: string
  email: string
  first_name?: string
  user_id?: string
  subscribed: boolean
  subscription_source?: string
  created_at?: string
  subscribed_at?: string
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

export interface PreorderRegistration {
  id: string
  product_id: number
  user_id: string | null
  email: string
  name: string | null
  size: string | null
  notified: boolean
  created_at: string
}