import { supabase, Coupon } from './supabase'

/**
 * Coupons & Discounts System
 * - Percentage and fixed discounts
 * - Usage limits
 * - Minimum purchase requirements
 * - Auto-apply at checkout
 */

export async function validateCoupon(
  code: string,
  cartTotal: number,
  userId: string
): Promise<{
  valid: boolean
  coupon?: Coupon
  discountAmount?: number
  error?: string
}> {
  // Get coupon
  const { data: coupon, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('is_active', true)
    .single()

  if (error || !coupon) {
    return { valid: false, error: 'Invalid coupon code' }
  }

  // Check if expired
  if (coupon.valid_until && new Date(coupon.valid_until) < new Date()) {
    return { valid: false, error: 'Coupon has expired' }
  }

  // Check if not yet valid
  if (coupon.valid_from && new Date(coupon.valid_from) > new Date()) {
    return { valid: false, error: 'Coupon not yet valid' }
  }

  // Check usage limit
  if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
    return { valid: false, error: 'Coupon usage limit reached' }
  }

  // Check minimum purchase
  if (coupon.min_purchase_amount && cartTotal < coupon.min_purchase_amount) {
    return {
      valid: false,
      error: `Minimum purchase of ₹${coupon.min_purchase_amount} required`
    }
  }

  // Check if user already used this coupon
  const { data: previousUsage } = await supabase
    .from('coupon_usage')
    .select('id')
    .eq('coupon_id', coupon.id)
    .eq('user_id', userId)

  if (previousUsage && previousUsage.length > 0) {
    return { valid: false, error: 'You have already used this coupon' }
  }

  // Calculate discount
  let discountAmount = 0
  if (coupon.discount_type === 'percentage') {
    discountAmount = (cartTotal * coupon.discount_value) / 100
    if (coupon.max_discount_amount) {
      discountAmount = Math.min(discountAmount, coupon.max_discount_amount)
    }
  } else {
    discountAmount = coupon.discount_value
  }

  // Ensure discount doesn't exceed cart total
  discountAmount = Math.min(discountAmount, cartTotal)

  return {
    valid: true,
    coupon,
    discountAmount: Math.round(discountAmount * 100) / 100
  }
}

export async function applyCoupon(couponId: string, userId: string, orderId: string, discountAmount: number) {
  // Record usage
  await supabase
    .from('coupon_usage')
    .insert({
      coupon_id: couponId,
      user_id: userId,
      order_id: orderId,
      discount_amount: discountAmount
    })

  // Increment used count
  await supabase.rpc('increment_coupon_usage', { coupon_id: couponId })
}

export async function getActiveCoupons(): Promise<Coupon[]> {
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('is_active', true)
    .gt('valid_until', new Date().toISOString())
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching coupons:', error)
    return []
  }

  return data || []
}

export async function createCoupon(coupon: {
  code: string
  discountType: 'percentage' | 'fixed'
  discountValue: number
  minPurchaseAmount?: number
  maxDiscountAmount?: number
  usageLimit?: number
  validFrom?: Date
  validUntil?: Date
}): Promise<{ success: boolean; couponId?: string; error?: string }> {
  // Check if code already exists
  const { data: existing } = await supabase
    .from('coupons')
    .select('id')
    .eq('code', coupon.code.toUpperCase())
    .single()

  if (existing) {
    return { success: false, error: 'Coupon code already exists' }
  }

  const { data, error } = await supabase
    .from('coupons')
    .insert({
      code: coupon.code.toUpperCase(),
      discount_type: coupon.discountType,
      discount_value: coupon.discountValue,
      min_purchase_amount: coupon.minPurchaseAmount || 0,
      max_discount_amount: coupon.maxDiscountAmount,
      usage_limit: coupon.usageLimit,
      valid_from: coupon.validFrom?.toISOString(),
      valid_until: coupon.validUntil?.toISOString()
    })
    .select()
    .single()

  if (error || !data) {
    console.error('Error creating coupon:', error)
    return { success: false, error: 'Failed to create coupon' }
  }

  return { success: true, couponId: data.id }
}

export async function deactivateCoupon(couponId: string): Promise<boolean> {
  const { error } = await supabase
    .from('coupons')
    .update({ is_active: false })
    .eq('id', couponId)

  return !error
}

export async function getCouponUsageStats(couponId: string) {
  const { data: coupon } = await supabase
    .from('coupons')
    .select('*')
    .eq('id', couponId)
    .single()

  const { data: usages } = await supabase
    .from('coupon_usage')
    .select('discount_amount')
    .eq('coupon_id', couponId)

  if (!coupon || !usages) {
    return null
  }

  const totalDiscount = usages.reduce((sum, u) => sum + u.discount_amount, 0)

  return {
    code: coupon.code,
    usedCount: coupon.used_count,
    usageLimit: coupon.usage_limit || 'Unlimited',
    totalDiscount,
    isActive: coupon.is_active
  }
}

// Auto-apply best coupon for user
export async function findBestCoupon(
  cartTotal: number,
  userId: string
): Promise<{ coupon?: Coupon; discountAmount?: number }> {
  const activeCoupons = await getActiveCoupons()

  let bestCoupon: Coupon | undefined
  let maxDiscount = 0

  for (const coupon of activeCoupons) {
    const validation = await validateCoupon(coupon.code, cartTotal, userId)
    if (validation.valid && validation.discountAmount && validation.discountAmount > maxDiscount) {
      maxDiscount = validation.discountAmount
      bestCoupon = coupon
    }
  }

  return bestCoupon ? { coupon: bestCoupon, discountAmount: maxDiscount } : {}
}
