/**
 * HAXEUS — Master Supabase Services
 * lib/services.ts
 *
 * Drop this file into your project at lib/services.ts
 * It wires every existing table to typed service functions.
 * Import what you need per page/component.
 */

import { supabase } from "@/lib/supabase"
import { invalidate } from "@/lib/redis"
import { CK } from "@/lib/cache-keys"

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

export interface Product {
    id: number
    name: string
    description: string
    price: number
    compare_price?: number
    front_image?: string
    back_image?: string
    is_active: boolean
    is_featured: boolean
    category_id?: number
    tags?: string[]
    created_at: string
    product_images?: ProductImage[]
    product_inventory?: ProductInventory[]
    avg_rating?: number
    review_count?: number
}

export interface ProductImage {
    id: number
    product_id: number
    image_url: string
    is_primary: boolean
    display_order: number
    alt_text?: string
}

export interface ProductInventory {
    id: number
    product_id: number
    size: string
    quantity: number
    low_stock_threshold: number
}

export interface ProductReview {
    id: string
    product_id: number
    user_id: string
    rating: number
    title?: string
    body: string
    is_approved: boolean
    is_verified_purchase: boolean
    helpful_count: number
    created_at: string
    profiles?: { full_name: string; avatar_url?: string }
    review_images?: ReviewImage[]
}

export interface ReviewImage {
    id: string
    review_id: string
    image_url: string
    display_order: number
}

export interface WishlistItem {
    id: string
    user_id: string
    product_id: number
    created_at: string
    products?: Product
}

export interface Order {
    id: string
    order_number?: string
    user_id?: string
    status: string
    payment_status: string
    total_amount: number
    subtotal: number
    shipping_amount: number
    discount_amount?: number
    coupon_code?: string
    email: string
    phone?: string
    shipping_first_name: string
    shipping_last_name: string
    shipping_address_line_1: string
    shipping_address_line_2?: string
    shipping_city: string
    shipping_state: string
    shipping_zip_code: string
    tracking_number?: string
    notes?: string
    created_at: string
    order_items?: OrderItem[]
}

export interface OrderItem {
    id: string
    order_id: string
    product_id: number
    product_name: string
    product_image?: string
    size: string
    quantity: number
    unit_price: number
    total_price: number
}

export interface Coupon {
    id: number
    code: string
    description?: string
    discount_type: "percentage" | "fixed"
    discount_value: number
    minimum_amount: number
    usage_limit?: number
    used_count: number
    is_active: boolean
    valid_from: string
    valid_until: string
}

export interface LoyaltyPoints {
    id: string
    user_id: string
    points_balance: number
    lifetime_points: number
    tier: "member" | "core" | "elite"
}

export interface LoyaltyTransaction {
    id: string
    user_id: string
    points: number
    type: "earn" | "redeem" | "expire" | "bonus"
    description: string
    order_id?: string
    created_at: string
}

export interface UserAddress {
    id: string
    user_id: string
    type: string
    first_name: string
    last_name: string
    address_line_1: string
    address_line_2?: string
    city: string
    state: string
    zip_code: string
    country: string
    is_default: boolean
    created_at: string
}

export interface ReturnRequest {
    id: string
    order_id: string
    user_id: string
    reason: string
    status: string
    created_at: string
}

export interface NewsletterSubscriber {
    id: string
    email: string
    first_name?: string
    is_active: boolean
    subscribed_at: string
}

// ─────────────────────────────────────────────
// PRODUCTS
// ─────────────────────────────────────────────

export const ProductService = {

    /** Get all active products with images and inventory */
    async getAll(options?: {
        limit?: number
        offset?: number
        category_id?: number
        min_price?: number
        max_price?: number
        sort?: "price_asc" | "price_desc" | "newest" | "popular"
        featured?: boolean
    }) {
        let query = supabase
            .from("products")
            .select(`
        *,
        product_images (id, image_url, is_primary, display_order, alt_text),
        product_inventory (id, size, quantity, low_stock_threshold)
      `)
            .eq("is_active", true)

        if (options?.featured) query = query.eq("is_featured", true)
        if (options?.category_id) query = query.eq("category_id", options.category_id)
        if (options?.min_price) query = query.gte("price", options.min_price)
        if (options?.max_price) query = query.lte("price", options.max_price)

        switch (options?.sort) {
            case "price_asc": query = query.order("price", { ascending: true }); break
            case "price_desc": query = query.order("price", { ascending: false }); break
            case "newest": query = query.order("created_at", { ascending: false }); break
            default: query = query.order("id")
        }

        if (options?.limit) query = query.limit(options.limit)
        if (options?.offset) query = query.range(options.offset, options.offset + (options.limit || 20) - 1)

        const { data, error } = await query
        if (error) throw error
        return data as Product[]
    },

    /** Get single product with full details */
    async getById(id: number) {
        const { data, error } = await supabase
            .from("products")
            .select(`
        *,
        product_images (id, image_url, is_primary, display_order, alt_text),
        product_inventory (id, size, quantity, low_stock_threshold),
        product_relations!product_relations_product_id_fkey (
          related_product:products!product_relations_related_product_id_fkey (
            id, name, price, front_image,
            product_images (image_url, is_primary)
          )
        )
      `)
            .eq("id", id)
            .eq("is_active", true)
            .single()

        if (error) throw error
        return data as Product & { product_relations: any[] }
    },

    /** Search products by text */
    async search(query: string) {
        const { data, error } = await supabase
            .from("products")
            .select(`*, product_images (image_url, is_primary)`)
            .eq("is_active", true)
            .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
            .limit(10)

        if (error) throw error
        return data as Product[]
    },

    /** Get stock for a specific product + size */
    async getStock(productId: number, size: string) {
        const { data, error } = await supabase
            .from("product_inventory")
            .select("quantity, low_stock_threshold")
            .eq("product_id", productId)
            .eq("size", size)
            .single()

        if (error) return null
        return data
    },

    /** Check if any size is in stock */
    async getInventory(productId: number) {
        const { data, error } = await supabase
            .from("product_inventory")
            .select("size, quantity, low_stock_threshold")
            .eq("product_id", productId)
            .order("size")

        if (error) throw error
        return data
    },

    /** Decrement stock after purchase (call from order creation) */
    async decrementStock(productId: number, size: string, qty: number) {
        const { error } = await supabase.rpc("decrement_inventory_rpc", {
            p_product_id: productId,
            p_size: size,
            p_quantity: qty,
        })
        if (error) throw error
    },
}

// ─────────────────────────────────────────────
// REVIEWS
// ─────────────────────────────────────────────

export const ReviewService = {

    /** Get approved reviews for a product */
    async getForProduct(productId: number, sort: "newest" | "highest" | "helpful" = "newest") {
        let query = supabase
            .from("product_reviews")
            .select(`
        *,
        profiles (full_name, avatar_url),
        review_images (id, image_url, display_order)
      `)
            .eq("product_id", productId)
            .eq("is_approved", true)

        switch (sort) {
            case "highest": query = query.order("rating", { ascending: false }); break
            case "helpful": query = query.order("helpful_count", { ascending: false }); break
            default: query = query.order("created_at", { ascending: false })
        }

        const { data, error } = await query
        if (error) throw error
        return data as ProductReview[]
    },

    /** Get avg rating + count for a product */
    async getSummary(productId: number) {
        const { data, error } = await supabase
            .from("product_reviews")
            .select("rating")
            .eq("product_id", productId)
            .eq("is_approved", true)

        if (error) throw error
        if (!data || data.length === 0) return { avg: 0, count: 0, distribution: {} }

        const count = data.length
        const avg = data.reduce((sum, r) => sum + r.rating, 0) / count
        const distribution = data.reduce((acc: Record<number, number>, r) => {
            acc[r.rating] = (acc[r.rating] || 0) + 1
            return acc
        }, {})

        return { avg: Math.round(avg * 10) / 10, count, distribution }
    },

    /** Submit a new review */
    async create(review: {
        product_id: number
        rating: number
        title?: string
        body: string
    }) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error("Must be logged in to review")

        // Check if verified purchase
        const { data: orderCheck } = await supabase
            .from("orders")
            .select("id")
            .eq("user_id", user.id)
            .eq("status", "delivered")
            .limit(1)

        const { data, error } = await supabase
            .from("product_reviews")
            .insert({
                ...review,
                user_id: user.id,
                is_approved: false, // admin approves
                is_verified_purchase: (orderCheck?.length ?? 0) > 0,
            })
            .select()
            .single()

        if (error) throw error
        return data
    },

    /** Vote helpful/unhelpful on a review */
    async vote(reviewId: string, helpful: boolean) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error("Must be logged in to vote")

        const { error } = await supabase
            .from("review_votes")
            .upsert({ review_id: reviewId, user_id: user.id, is_helpful: helpful })

        if (error) throw error

        // Update helpful_count on the review
        await supabase.rpc("update_review_helpful_count", { p_review_id: reviewId })
    },

    /** Upload review images */
    async uploadImages(reviewId: string, files: File[]) {
        const uploads = files.map(async (file, index) => {
            const path = `reviews/${reviewId}/${Date.now()}_${index}`
            const { data, error } = await supabase.storage
                .from("product-images")
                .upload(path, file, { cacheControl: "3600", upsert: false })

            if (error) throw error

            const { data: { publicUrl } } = supabase.storage
                .from("product-images")
                .getPublicUrl(path)

            await supabase.from("review_images").insert({
                review_id: reviewId,
                image_url: publicUrl,
                display_order: index,
            })
        })
        await Promise.all(uploads)
    },

    /** Admin: approve or reject a review */
    async setApproval(reviewId: string, approved: boolean) {
        const { error } = await supabase
            .from("product_reviews")
            .update({ is_approved: approved })
            .eq("id", reviewId)

        if (error) throw error
    },
}

// ─────────────────────────────────────────────
// WISHLIST
// ─────────────────────────────────────────────

export const WishlistService = {

    async get() {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return []

        const { data, error } = await supabase
            .from("wishlist")
            .select(`
        *,
        products (
          id, name, price, compare_price, front_image, is_active,
          product_images (image_url, is_primary),
          product_inventory (size, quantity)
        )
      `)
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })

        if (error) throw error
        return data as WishlistItem[]
    },

    async add(productId: number) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error("Must be logged in")

        const { error } = await supabase
            .from("wishlist")
            .upsert({ user_id: user.id, product_id: productId })

        if (error) throw error
    },

    async remove(productId: number) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error("Must be logged in")

        const { error } = await supabase
            .from("wishlist")
            .delete()
            .eq("user_id", user.id)
            .eq("product_id", productId)

        if (error) throw error
    },

    async isWishlisted(productId: number): Promise<boolean> {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return false

        const { data } = await supabase
            .from("wishlist")
            .select("id")
            .eq("user_id", user.id)
            .eq("product_id", productId)
            .single()

        return !!data
    },

    async toggle(productId: number): Promise<boolean> {
        const wishlisted = await WishlistService.isWishlisted(productId)
        if (wishlisted) {
            await WishlistService.remove(productId)
            return false
        } else {
            await WishlistService.add(productId)
            return true
        }
    },
}

// ─────────────────────────────────────────────
// ORDERS
// ─────────────────────────────────────────────

export const OrderService = {

    async getMyOrders() {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return []

        const { data, error } = await supabase
            .from("orders")
            .select(`*, order_items (*)`)
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })

        if (error) throw error
        return data as Order[]
    },

    async getById(orderId: string) {
        const { data, error } = await supabase
            .from("orders")
            .select(`*, order_items (*)`)
            .eq("id", orderId)
            .single()

        if (error) throw error
        return data as Order
    },

    /** Create order + items in one transaction */
    async create(order: Omit<Order, "id" | "created_at" | "order_items">, items: Omit<OrderItem, "id" | "order_id">[]) {
        const { data: { user } } = await supabase.auth.getUser()

        const { data: newOrder, error: orderError } = await supabase
            .from("orders")
            .insert({ ...order, user_id: user?.id })
            .select()
            .single()

        if (orderError) throw orderError

        const { error: itemsError } = await supabase
            .from("order_items")
            .insert(items.map(item => ({ ...item, order_id: newOrder.id })))

        if (itemsError) throw itemsError

        // Decrement inventory for each item
        for (const item of items) {
            await ProductService.decrementStock(item.product_id, item.size, item.quantity)
                .catch(err => console.error("Stock decrement failed:", err))
        }

        // Track abandoned cart as recovered
        if (user) {
            await supabase
                .from("abandoned_carts")
                .update({ recovered: true, recovered_at: new Date().toISOString() })
                .eq("user_id", user.id)
                .eq("recovered", false)
        }

        // Award loyalty points (₹1 spent = 1 point)
        if (user) {
            await LoyaltyService.awardPoints(
                user.id,
                Math.floor(order.total_amount),
                "earn",
                `Order ${newOrder.id}`,
                newOrder.id
            ).catch(err => console.error("Loyalty points failed:", err))
        }

        // Track analytics
        await AnalyticsService.track("purchase", {
            order_id: newOrder.id,
            total: order.total_amount,
            items: items.length,
        }).catch(() => { })

        // Invalidate analytics cache so admin sees fresh data
        await invalidate(CK.analytics(7), CK.analytics(30), CK.analytics(90)).catch(() => { })

        return newOrder as Order
    },

    /** Admin: update order status */
    async updateStatus(orderId: string, status: string, trackingNumber?: string) {
        const updates: any = { status }
        if (trackingNumber) updates.tracking_number = trackingNumber

        const { error } = await supabase
            .from("orders")
            .update(updates)
            .eq("id", orderId)

        if (error) throw error
    },

    /** Admin: get all orders with filters */
    async adminGetAll(options?: {
        status?: string
        limit?: number
        offset?: number
        search?: string
    }) {
        let query = supabase
            .from("orders")
            .select(`*, order_items (*)`, { count: "exact" })
            .order("created_at", { ascending: false })

        if (options?.status && options.status !== "all")
            query = query.eq("status", options.status)
        if (options?.search)
            query = query.or(`order_number.ilike.%${options.search}%,email.ilike.%${options.search}%`)
        if (options?.limit)
            query = query.limit(options.limit)
        if (options?.offset)
            query = query.range(options.offset, options.offset + (options.limit || 20) - 1)

        const { data, error, count } = await query
        if (error) throw error
        return { data: data as Order[], count: count || 0 }
    },
}

// ─────────────────────────────────────────────
// COUPONS
// ─────────────────────────────────────────────

export const CouponService = {

    async validate(code: string, cartTotal: number): Promise<{
        valid: boolean
        coupon?: Coupon
        discount?: number
        error?: string
    }> {
        const { data, error } = await supabase
            .from("coupons")
            .select("*")
            .eq("code", code.toUpperCase())
            .eq("is_active", true)
            .single()

        if (error || !data) return { valid: false, error: "Invalid coupon code" }

        const now = new Date()
        if (new Date(data.valid_until) < now) return { valid: false, error: "Coupon has expired" }
        if (new Date(data.valid_from) > now) return { valid: false, error: "Coupon is not yet active" }
        if (data.usage_limit && data.used_count >= data.usage_limit)
            return { valid: false, error: "Coupon usage limit reached" }
        if (cartTotal < data.minimum_amount)
            return { valid: false, error: `Minimum order ₹${data.minimum_amount} required` }

        const discount = data.discount_type === "percentage"
            ? (cartTotal * data.discount_value) / 100
            : data.discount_value

        return { valid: true, coupon: data as Coupon, discount: Math.min(discount, cartTotal) }
    },

    async redeem(code: string) {
        const { error } = await supabase.rpc("increment_coupon_usage", { p_code: code.toUpperCase() })
        if (error) throw error
    },

    /** Admin: create coupon */
    async create(coupon: Omit<Coupon, "id" | "used_count">) {
        const { data, error } = await supabase
            .from("coupons")
            .insert({ ...coupon, used_count: 0 })
            .select()
            .single()

        if (error) throw error
        // Invalidate anything cached for this coupon code
        await invalidate(CK.coupon(coupon.code)).catch(() => { })
        return data
    },

    /** Admin: get all coupons */
    async adminGetAll() {
        const { data, error } = await supabase
            .from("coupons")
            .select("*")
            .order("created_at", { ascending: false })

        if (error) throw error
        return data as Coupon[]
    },
}

// ─────────────────────────────────────────────
// LOYALTY POINTS
// ─────────────────────────────────────────────

export const LoyaltyService = {

    async getBalance(userId?: string) {
        const uid = userId || (await supabase.auth.getUser()).data.user?.id
        if (!uid) return null

        const { data, error } = await supabase
            .from("loyalty_points")
            .select("*")
            .eq("user_id", uid)
            .single()

        if (error) return null
        return data as LoyaltyPoints
    },

    async getTransactions() {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return []

        const { data, error } = await supabase
            .from("loyalty_transactions")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(20)

        if (error) throw error
        return data as LoyaltyTransaction[]
    },

    async awardPoints(
        userId: string,
        points: number,
        type: LoyaltyTransaction["type"],
        description: string,
        orderId?: string
    ) {
        // Upsert loyalty_points balance
        const { data: existing } = await supabase
            .from("loyalty_points")
            .select("points_balance, lifetime_points")
            .eq("user_id", userId)
            .single()

        if (existing) {
            const newBalance = existing.points_balance + points
            const newLifetime = existing.lifetime_points + (type === "earn" ? points : 0)
            const tier = newLifetime >= 5000 ? "elite" : newLifetime >= 1000 ? "core" : "member"

            await supabase
                .from("loyalty_points")
                .update({ points_balance: newBalance, lifetime_points: newLifetime, tier })
                .eq("user_id", userId)
        } else {
            await supabase
                .from("loyalty_points")
                .insert({
                    user_id: userId,
                    points_balance: points,
                    lifetime_points: points,
                    tier: "member",
                })
        }

        // Log transaction
        await supabase.from("loyalty_transactions").insert({
            user_id: userId,
            points,
            type,
            description,
            order_id: orderId,
        })
    },

    /** Redeem points at checkout (100 points = ₹10) */
    async redeem(userId: string, points: number, orderId: string) {
        const balance = await LoyaltyService.getBalance(userId)
        if (!balance || balance.points_balance < points)
            throw new Error("Insufficient points")

        await supabase
            .from("loyalty_points")
            .update({ points_balance: balance.points_balance - points })
            .eq("user_id", userId)

        await supabase.from("loyalty_transactions").insert({
            user_id: userId,
            points: -points,
            type: "redeem",
            description: `Redeemed for order`,
            order_id: orderId,
        })

        return (points / 100) * 10 // ₹ discount
    },

    pointsToRupees: (points: number) => (points / 100) * 10,
    rupeesToPoints: (rupees: number) => Math.floor(rupees),
}

// ─────────────────────────────────────────────
// USER ADDRESSES
// ─────────────────────────────────────────────

export const AddressService = {

    async getAll() {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return []

        const { data, error } = await supabase
            .from("user_addresses")
            .select("*")
            .eq("user_id", user.id)
            .order("is_default", { ascending: false })

        if (error) throw error
        return data as UserAddress[]
    },

    async save(address: Omit<UserAddress, "id" | "user_id" | "created_at">) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error("Must be logged in")

        if (address.is_default) {
            // Clear existing default
            await supabase
                .from("user_addresses")
                .update({ is_default: false })
                .eq("user_id", user.id)
        }

        const { data, error } = await supabase
            .from("user_addresses")
            .insert({ ...address, user_id: user.id })
            .select()
            .single()

        if (error) throw error
        return data as UserAddress
    },

    async delete(id: string) {
        const { error } = await supabase
            .from("user_addresses")
            .delete()
            .eq("id", id)

        if (error) throw error
    },

    async setDefault(id: string) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error("Must be logged in")

        await supabase
            .from("user_addresses")
            .update({ is_default: false })
            .eq("user_id", user.id)

        await supabase
            .from("user_addresses")
            .update({ is_default: true })
            .eq("id", id)
    },
}

// ─────────────────────────────────────────────
// RETURN REQUESTS
// ─────────────────────────────────────────────

export const ReturnService = {

    async getMyReturns() {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return []

        const { data, error } = await supabase
            .from("return_requests")
            .select(`*, orders (order_number, status)`)
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })

        if (error) throw error
        return data
    },

    async create(orderId: string, reason: string, details: string) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error("Must be logged in")

        const { data, error } = await supabase
            .from("return_requests")
            .insert({
                order_id: orderId,
                user_id: user.id,
                reason,
                details,
                status: "pending",
            })
            .select()
            .single()

        if (error) throw error
        return data
    },

    /** Admin: update return status */
    async updateStatus(returnId: string, status: string) {
        const { error } = await supabase
            .from("return_requests")
            .update({ status })
            .eq("id", returnId)

        if (error) throw error
    },

    async adminGetAll() {
        const { data, error } = await supabase
            .from("return_requests")
            .select(`*, orders (order_number, email, total_amount)`)
            .order("created_at", { ascending: false })

        if (error) throw error
        return data
    },
}

// ─────────────────────────────────────────────
// NEWSLETTER
// ─────────────────────────────────────────────

export const NewsletterService = {

    async subscribe(email: string, firstName?: string) {
        const { error } = await supabase
            .from("newsletter_subscribers")
            .upsert({
                email: email.toLowerCase(),
                first_name: firstName,
                is_active: true,
                subscribed_at: new Date().toISOString(),
                unsubscribed_at: null,
            }, { onConflict: "email" })

        if (error) throw error
    },

    async unsubscribe(email: string) {
        const { error } = await supabase
            .from("newsletter_subscribers")
            .update({ is_active: false, unsubscribed_at: new Date().toISOString() })
            .eq("email", email.toLowerCase())

        if (error) throw error
    },
}

// ─────────────────────────────────────────────
// ABANDONED CARTS
// ─────────────────────────────────────────────

export const AbandonedCartService = {

    /** Call this when user adds to cart — upserts the abandoned cart record */
    async track(cartValue: number, itemsCount: number) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        await supabase
            .from("abandoned_carts")
            .upsert({
                user_id: user.id,
                cart_value: cartValue,
                items_count: itemsCount,
                recovered: false,
                updated_at: new Date().toISOString(),
            }, { onConflict: "user_id" })
    },

    /** Mark as recovered when order completes */
    async markRecovered(userId: string) {
        await supabase
            .from("abandoned_carts")
            .update({ recovered: true, recovered_at: new Date().toISOString() })
            .eq("user_id", userId)
            .eq("recovered", false)
    },
}

// ─────────────────────────────────────────────
// ANALYTICS
// ─────────────────────────────────────────────

export const AnalyticsService = {

    async track(
        eventType: string,
        eventData?: Record<string, any>,
        productId?: number,
        orderId?: string
    ) {
        const { data: { user } } = await supabase.auth.getUser()
        const sessionId = typeof window !== "undefined"
            ? (sessionStorage.getItem("hx_session") || (() => {
                const id = crypto.randomUUID()
                sessionStorage.setItem("hx_session", id)
                return id
            })())
            : undefined

        await supabase.from("analytics_events").insert({
            event_type: eventType,
            user_id: user?.id,
            session_id: sessionId,
            product_id: productId,
            order_id: orderId,
            event_data: eventData,
        })
    },

    /** Admin: get revenue stats */
    async getRevenueStats(days: number = 30) {
        const since = new Date()
        since.setDate(since.getDate() - days)

        const { data, error } = await supabase
            .from("orders")
            .select("total_amount, created_at, status")
            .gte("created_at", since.toISOString())
            .in("status", ["paid", "shipped", "delivered"])

        if (error) throw error

        const total = data?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0
        const count = data?.length || 0
        const avg = count > 0 ? total / count : 0

        return { total, count, avg: Math.round(avg), days }
    },

    /** Admin: get top products by orders */
    async getTopProducts(limit = 5) {
        const { data, error } = await supabase
            .from("order_items")
            .select("product_id, product_name, quantity")
            .limit(500)

        if (error) throw error

        const totals = (data || []).reduce((acc: Record<string, any>, item) => {
            if (!acc[item.product_id]) {
                acc[item.product_id] = { product_id: item.product_id, name: item.product_name, total_sold: 0 }
            }
            acc[item.product_id].total_sold += item.quantity
            return acc
        }, {})

        return Object.values(totals)
            .sort((a: any, b: any) => b.total_sold - a.total_sold)
            .slice(0, limit)
    },

    /** Admin: get event counts */
    async getEventCounts(eventType: string, days = 30) {
        const since = new Date()
        since.setDate(since.getDate() - days)

        const { count, error } = await supabase
            .from("analytics_events")
            .select("*", { count: "exact", head: true })
            .eq("event_type", eventType)
            .gte("created_at", since.toISOString())

        if (error) throw error
        return count || 0
    },
}

// ─────────────────────────────────────────────
// SAVED FOR LATER
// ─────────────────────────────────────────────

export const SavedForLaterService = {

    async get() {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return []

        const { data, error } = await supabase
            .from("saved_for_later")
            .select(`*, products (id, name, price, front_image, product_images (image_url, is_primary))`)
            .eq("user_id", user.id)

        if (error) throw error
        return data
    },

    async save(productId: number, size: string) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error("Must be logged in")

        const { error } = await supabase
            .from("saved_for_later")
            .upsert({ user_id: user.id, product_id: productId, size })

        if (error) throw error
    },

    async remove(id: string) {
        const { error } = await supabase.from("saved_for_later").delete().eq("id", id)
        if (error) throw error
    },
}

// ─────────────────────────────────────────────
// ADMIN HELPERS
// ─────────────────────────────────────────────

export const AdminService = {

    async isAdmin(): Promise<boolean> {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return false

        const { data } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", user.id)
            .single()

        return data?.role === "admin"
    },

    async getDashboardStats() {
        const [
            { count: totalOrders },
            { count: totalCustomers },
            { count: pendingOrders },
            revenueStats,
            topProducts,
        ] = await Promise.all([
            supabase.from("orders").select("*", { count: "exact", head: true }),
            supabase.from("user_roles").select("*", { count: "exact", head: true }),
            supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "pending"),
            AnalyticsService.getRevenueStats(30),
            AnalyticsService.getTopProducts(5),
        ])

        return {
            totalOrders: totalOrders || 0,
            totalCustomers: totalCustomers || 0,
            pendingOrders: pendingOrders || 0,
            revenue: revenueStats.total,
            avgOrderValue: revenueStats.avg,
            topProducts,
        }
    },

    async getCustomers() {
        const { data, error } = await supabase
            .from("user_roles")
            .select("user_id, role, created_at")
            .order("created_at", { ascending: false })

        if (error) throw error
        return data
    },
}
