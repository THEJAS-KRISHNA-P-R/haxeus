import { supabase } from './supabase'

/**
 * Analytics & Tracking System
 * - Page views, add to cart, purchases
 * - Revenue tracking
 * - Conversion funnels
 * - Product performance
 */

export type AnalyticsEvent =
  | 'page_view'
  | 'product_view'
  | 'add_to_cart'
  | 'remove_from_cart'
  | 'checkout_start'
  | 'checkout_complete'
  | 'purchase'
  | 'search'
  | 'wishlist_add'
  | 'wishlist_remove'
  | 'review_submit'

export async function trackEvent(
  eventType: AnalyticsEvent,
  data: {
    userId?: string
    sessionId?: string
    productId?: number
    orderId?: string
    eventData?: Record<string, any>
  }
) {
  await supabase
    .from('analytics_events')
    .insert({
      event_type: eventType,
      user_id: data.userId || null,
      session_id: data.sessionId || null,
      product_id: data.productId || null,
      order_id: data.orderId || null,
      event_data: data.eventData || {}
    })
}

export async function getConversionFunnel(startDate: Date, endDate: Date) {
  const { data, error } = await supabase
    .from('analytics_events')
    .select('event_type, session_id')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())

  if (error || !data) {
    return {
      page_views: 0,
      product_views: 0,
      add_to_carts: 0,
      checkouts: 0,
      purchases: 0,
      conversion_rate: 0
    }
  }

  const sessionFunnels = new Map<string, Set<AnalyticsEvent>>()

  data.forEach(event => {
    if (!sessionFunnels.has(event.session_id)) {
      sessionFunnels.set(event.session_id, new Set())
    }
    sessionFunnels.get(event.session_id)!.add(event.event_type as AnalyticsEvent)
  })

  let page_views = 0
  let product_views = 0
  let add_to_carts = 0
  let checkouts = 0
  let purchases = 0

  sessionFunnels.forEach(events => {
    if (events.has('page_view')) page_views++
    if (events.has('product_view')) product_views++
    if (events.has('add_to_cart')) add_to_carts++
    if (events.has('checkout_start')) checkouts++
    if (events.has('purchase')) purchases++
  })

  const conversion_rate = page_views > 0 ? (purchases / page_views) * 100 : 0

  return {
    page_views,
    product_views,
    add_to_carts,
    checkouts,
    purchases,
    conversion_rate: Math.round(conversion_rate * 100) / 100
  }
}

export async function getRevenueStats(startDate: Date, endDate: Date) {
  const { data, error } = await supabase
    .from('orders')
    .select('total_amount, created_at, status')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())

  if (error || !data) {
    return {
      total_revenue: 0,
      total_orders: 0,
      average_order_value: 0,
      completed_orders: 0
    }
  }

  const total_orders = data.length
  const completed_orders = data.filter(o => o.status === 'delivered').length
  const total_revenue = data
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, order) => sum + order.total_amount, 0)
  const average_order_value = total_orders > 0 ? total_revenue / total_orders : 0

  return {
    total_revenue: Math.round(total_revenue * 100) / 100,
    total_orders,
    average_order_value: Math.round(average_order_value * 100) / 100,
    completed_orders
  }
}

export async function getTopSellingProducts(limit: number = 10, startDate?: Date, endDate?: Date) {
  let query = supabase
    .from('order_items')
    .select(`
      product_id,
      quantity,
      price,
      products (
        id,
        name,
        front_image
      )
    `)

  if (startDate) {
    query = query.gte('created_at', startDate.toISOString())
  }
  if (endDate) {
    query = query.lte('created_at', endDate.toISOString())
  }

  const { data, error } = await query

  if (error || !data) {
    return []
  }

  // Aggregate by product
  const productStats: Record<number, {
    product: any
    totalQuantity: number
    totalRevenue: number
  }> = {}

  data.forEach((item: any) => {
    if (!item.product_id || !item.products) return

    if (!productStats[item.product_id]) {
      productStats[item.product_id] = {
        product: item.products,
        totalQuantity: 0,
        totalRevenue: 0
      }
    }

    productStats[item.product_id].totalQuantity += item.quantity
    productStats[item.product_id].totalRevenue += item.quantity * item.price
  })

  // Sort by quantity sold
  return Object.values(productStats)
    .sort((a, b) => b.totalQuantity - a.totalQuantity)
    .slice(0, limit)
}

export async function getCustomerStats() {
  const { data: users, error: usersError } = await supabase
    .from('orders')
    .select('user_id')

  if (usersError || !users) {
    return {
      total_customers: 0,
      repeat_customers: 0,
      repeat_rate: 0
    }
  }

  const customerOrders: Record<string, number> = {}
  
  users.forEach(order => {
    if (order.user_id) {
      customerOrders[order.user_id] = (customerOrders[order.user_id] || 0) + 1
    }
  })

  const total_customers = Object.keys(customerOrders).length
  const repeat_customers = Object.values(customerOrders).filter(count => count > 1).length
  const repeat_rate = total_customers > 0 ? (repeat_customers / total_customers) * 100 : 0

  return {
    total_customers,
    repeat_customers,
    repeat_rate: Math.round(repeat_rate * 100) / 100
  }
}

export async function getProductPerformance(productId: number, days: number = 30) {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

  // Views
  const { data: views } = await supabase
    .from('product_views')
    .select('id')
    .eq('product_id', productId)
    .gte('created_at', startDate.toISOString())

  // Add to cart
  const { data: cartAdds } = await supabase
    .from('analytics_events')
    .select('id')
    .eq('event_type', 'add_to_cart')
    .eq('product_id', productId)
    .gte('created_at', startDate.toISOString())

  // Purchases
  const { data: purchases } = await supabase
    .from('order_items')
    .select('quantity, price')
    .eq('product_id', productId)
    .gte('created_at', startDate.toISOString())

  const totalViews = views?.length || 0
  const totalCartAdds = cartAdds?.length || 0
  const totalPurchases = purchases?.reduce((sum, p) => sum + p.quantity, 0) || 0
  const totalRevenue = purchases?.reduce((sum, p) => sum + (p.quantity * p.price), 0) || 0

  const viewToCartRate = totalViews > 0 ? (totalCartAdds / totalViews) * 100 : 0
  const cartToPurchaseRate = totalCartAdds > 0 ? (totalPurchases / totalCartAdds) * 100 : 0
  const conversionRate = totalViews > 0 ? (totalPurchases / totalViews) * 100 : 0

  return {
    views: totalViews,
    cart_adds: totalCartAdds,
    purchases: totalPurchases,
    revenue: totalRevenue,
    view_to_cart_rate: Math.round(viewToCartRate * 100) / 100,
    cart_to_purchase_rate: Math.round(cartToPurchaseRate * 100) / 100,
    conversion_rate: Math.round(conversionRate * 100) / 100
  }
}

// Integration helpers for Google Analytics & Facebook Pixel
export function initGoogleAnalytics(measurementId: string) {
  if (typeof window === 'undefined') return

  // Load gtag script
  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
  document.head.appendChild(script)

  // Initialize
  ;(window as any).dataLayer = (window as any).dataLayer || []
  function gtag(...args: any[]) {
    ;(window as any).dataLayer.push(args)
  }
  gtag('js', new Date())
  gtag('config', measurementId)
}

export function initFacebookPixel(pixelId: string) {
  if (typeof window === 'undefined') return

  ;(window as any).fbq = function(...args: any[]) {
    ;((window as any).fbq.q = (window as any).fbq.q || []).push(args)
  }
  ;(window as any).fbq.loaded = true

  const script = document.createElement('script')
  script.async = true
  script.src = 'https://connect.facebook.net/en_US/fbevents.js'
  document.head.appendChild(script)

  ;(window as any).fbq('init', pixelId)
  ;(window as any).fbq('track', 'PageView')
}

export function trackGAEvent(eventName: string, params: Record<string, any>) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    ;(window as any).gtag('event', eventName, params)
  }
}

export function trackFBEvent(eventName: string, params: Record<string, any>) {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    ;(window as any).fbq('track', eventName, params)
  }
}
