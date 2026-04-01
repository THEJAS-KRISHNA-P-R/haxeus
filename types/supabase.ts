/**
 * HAXEUS Supabase Schema Interfaces (SECTION C2)
 * 
 * These types match the actual Supabase public schema exactly as audited.
 * Used to replace 'any' across the codebase.
 */

// --- Base Types ---
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

// --- Core Models ---

/** Premium Product Model */
export interface Product {
    id: number // bigint
    name: string
    description: string | null
    price: number // numeric
    front_image: string | null
    back_image: string | null
    available_sizes: string[] | null
    colors: string[] | null
    total_stock: number | null
    category: string | null
    slug: string | null
    is_active: boolean | null
    is_preorder: boolean
    preorder_status: 'active' | 'sold_out' | 'stopped' | null
    expected_date: string | null
    max_preorders: number | null
    preorder_count: number
    tagline: string | null
    created_at: string
    updated_at: string
    // Joined Properties
    product_images?: ProductImage[]
    product_inventory?: ProductInventory[]
    reviews?: ProductReview[]
}

/** Product Gallery Model */
export interface ProductImage {
    id: string
    product_id: number
    image_url: string
    is_primary: boolean
    display_order: number
    created_at: string
}

/** Preorder Item (Marketing/Drop logic) */
export interface PreorderItem {
    id: string // uuid
    name: string
    description: string | null
    price: number
    original_price: number | null
    front_image: string | null
    images: string[]
    sizes_available: string[]
    expected_date: string | null
    max_preorders: number | null
    preorder_count: number
    status: 'active' | 'sold_out' | 'stopped' | 'converted'
    sort_order: number
    converted_product_id: number | null
    created_at: string
    updated_at: string
}

/** E2E User Profile */
export interface UserProfile {
    id: string // uuid
    email: string
    full_name: string | null
    avatar_url?: string | null
    role: 'customer' | 'admin' | string | null
    created_at: string
    updated_at?: string
}

/** Order Management */
export interface Order {
    id: string // uuid
    user_id: string | null
    total_amount: number
    subtotal_amount: number | null
    shipping_amount: number | null
    status: OrderStatus
    payment_status: PaymentStatus
    payment_method: string | null
    razorpay_order_id: string | null
    razorpay_payment_id: string | null
    order_number: string | null
    shipping_name: string | null
    shipping_email: string | null
    shipping_phone: string | null
    shipping_address_1: string | null
    shipping_address_2: string | null
    shipping_city: string | null
    shipping_state: string | null
    shipping_pincode: string | null
    tracking_number: string | null
    is_preorder: boolean
    created_at: string
    updated_at: string
    order_items?: OrderItem[]
}

export interface OrderItem {
    id: string
    order_id: string | null
    product_id: number | null
    product_name: string | null
    product_image: string | null
    size: string
    color: string | null
    quantity: number
    price: number // at time of purchase
    unit_price: number | null
    is_preorder: boolean
    created_at: string
}

/** Marketing & Retention */
export interface Coupon {
    id: string
    code: string
    description: string | null
    discount_type: 'percentage' | 'fixed' | string
    discount_value: number
    minimum_amount: number // DB name standardized for logic
    max_discount_amount: number | null
    usage_limit: number | null
    used_count: number
    is_active: boolean
    valid_from: string | null
    valid_until: string | null
}

/** Product Inventory (Size/Color variations) */
export interface ProductInventory {
    id: string // uuid
    product_id: number | null
    size: string
    color: string | null
    stock_quantity: number
    low_stock_threshold: number | null
    reserved_quantity: number | null
    sold_quantity: number | null
    created_at: string
    updated_at: string
}

/** User Shipping Addresses */
export interface UserAddress {
    id: string
    user_id: string | null
    full_name: string
    phone: string
    address_line1: string
    address_line2: string | null
    city: string
    state: string
    pincode: string
    is_default: boolean
    created_at: string
    updated_at: string
}

/** Loyalty Program */
export interface LoyaltyPoints {
    id: string
    user_id: string
    total_points: number
    lifetime_points: number
    tier: 'bronze' | 'silver' | 'gold' | 'platinum' | string
    created_at: string
    updated_at: string
}

export interface LoyaltyTransaction {
    id: string
    user_id: string
    points: number
    transaction_type: 'earn' | 'redeem' | 'refund' | 'expiry' | string
    order_id: string | null
    description: string | null
    created_at: string
}

/** Active Cart Logic */
export interface CartItem {
    id: string
    user_id: string | null
    product_id: number | null
    size: string
    color: string | null
    quantity: number
    is_preorder: boolean
    preorder_expected_date: string | null
    created_at: string
    updated_at: string
    product?: Product // Optional join
}

/** User Wishlist Logic */
export interface WishlistItem {
    id: string
    user_id: string
    product_id: number
    created_at: string
    product?: Product // Optional join
}

/** Product Reviews */
export interface ProductReview {
    id: string
    product_id: number | null
    user_id: string | null
    order_id: string | null
    rating: number // 1-5
    title: string | null
    comment: string | null
    verified_purchase: boolean
    helpful_count: number
    not_helpful_count: number
    is_approved: boolean
    status: 'pending' | 'approved' | 'rejected' | string // UI field
    created_at: string
    updated_at: string
    products?: {
        name: string
    } | null
}

// Alias for legacy or component imports
export type Review = ProductReview

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | string
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

/** Type-safe TanStack Query Options */
export interface QueryOptions {
    enabled?: boolean
    staleTime?: number
    gcTime?: number
    retry?: boolean | number | ((failureCount: number, error: Error) => boolean)
    refetchOnWindowFocus?: boolean | 'always'
    initialData?: any // Generic initial data
    [key: string]: any // Fallback for other TanStack options
}

/** Analytics & Tracking */
export interface AnalyticsEvent {
    id: string
    event_type: string
    user_id: string | null
    session_id: string | null
    product_id: number | null
    order_id: string | null
    event_data: Json | null
    created_at: string
}
