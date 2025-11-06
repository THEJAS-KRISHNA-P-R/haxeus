import { supabase, LoyaltyPoints } from './supabase'

/**
 * Loyalty Program System
 * - Points for purchases (1 point per ₹10)
 * - Tier system (Bronze, Silver, Gold, Platinum)
 * - Redeem points for discounts
 * - Exclusive perks per tier
 */

const POINTS_PER_RUPEE = 0.1 // 1 point per ₹10
const RUPEE_PER_POINT = 0.5 // 1 point = ₹0.50

const TIER_THRESHOLDS = {
  bronze: 0,
  silver: 1000,
  gold: 5000,
  platinum: 15000
}

const TIER_BENEFITS = {
  bronze: {
    pointsMultiplier: 1,
    freeShipping: false,
    exclusiveDeals: false,
    birthdayDiscount: 0
  },
  silver: {
    pointsMultiplier: 1.2,
    freeShipping: false,
    exclusiveDeals: true,
    birthdayDiscount: 10
  },
  gold: {
    pointsMultiplier: 1.5,
    freeShipping: true,
    exclusiveDeals: true,
    birthdayDiscount: 15
  },
  platinum: {
    pointsMultiplier: 2,
    freeShipping: true,
    exclusiveDeals: true,
    birthdayDiscount: 20
  }
}

export async function getUserLoyaltyPoints(userId: string): Promise<LoyaltyPoints | null> {
  const { data, error } = await supabase
    .from('loyalty_points')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching loyalty points:', error)
    return null
  }

  // Create if doesn't exist
  if (!data) {
    const { data: newPoints } = await supabase
      .from('loyalty_points')
      .insert({
        user_id: userId,
        total_points: 0,
        lifetime_points: 0,
        tier: 'bronze'
      })
      .select()
      .single()

    return newPoints
  }

  return data
}

export async function calculateTier(lifetimePoints: number): Promise<keyof typeof TIER_THRESHOLDS> {
  if (lifetimePoints >= TIER_THRESHOLDS.platinum) return 'platinum'
  if (lifetimePoints >= TIER_THRESHOLDS.gold) return 'gold'
  if (lifetimePoints >= TIER_THRESHOLDS.silver) return 'silver'
  return 'bronze'
}

export async function awardPoints(
  userId: string,
  orderAmount: number,
  orderId: string
): Promise<number> {
  const loyaltyData = await getUserLoyaltyPoints(userId)
  if (!loyaltyData) return 0

  // Calculate points based on tier
  const tierBenefits = TIER_BENEFITS[loyaltyData.tier]
  const basePoints = Math.floor(orderAmount * POINTS_PER_RUPEE)
  const pointsToAward = Math.floor(basePoints * tierBenefits.pointsMultiplier)

  // Update points
  const newTotalPoints = loyaltyData.total_points + pointsToAward
  const newLifetimePoints = loyaltyData.lifetime_points + pointsToAward
  const newTier = await calculateTier(newLifetimePoints)

  await supabase
    .from('loyalty_points')
    .update({
      total_points: newTotalPoints,
      lifetime_points: newLifetimePoints,
      tier: newTier,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId)

  // Record transaction
  await supabase
    .from('loyalty_transactions')
    .insert({
      user_id: userId,
      points: pointsToAward,
      transaction_type: 'earned',
      order_id: orderId,
      description: `Earned ${pointsToAward} points from order`
    })

  return pointsToAward
}

export async function redeemPoints(
  userId: string,
  pointsToRedeem: number,
  orderId: string
): Promise<{ success: boolean; discountAmount?: number; error?: string }> {
  const loyaltyData = await getUserLoyaltyPoints(userId)
  if (!loyaltyData) {
    return { success: false, error: 'Loyalty account not found' }
  }

  if (pointsToRedeem > loyaltyData.total_points) {
    return { success: false, error: 'Insufficient points' }
  }

  if (pointsToRedeem < 100) {
    return { success: false, error: 'Minimum 100 points required for redemption' }
  }

  // Calculate discount
  const discountAmount = pointsToRedeem * RUPEE_PER_POINT

  // Deduct points
  await supabase
    .from('loyalty_points')
    .update({
      total_points: loyaltyData.total_points - pointsToRedeem,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId)

  // Record transaction
  await supabase
    .from('loyalty_transactions')
    .insert({
      user_id: userId,
      points: -pointsToRedeem,
      transaction_type: 'redeemed',
      order_id: orderId,
      description: `Redeemed ${pointsToRedeem} points for ₹${discountAmount} discount`
    })

  return { success: true, discountAmount }
}

export async function getLoyaltyTransactions(
  userId: string,
  limit: number = 20
): Promise<any[]> {
  const { data, error } = await supabase
    .from('loyalty_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching loyalty transactions:', error)
    return []
  }

  return data || []
}

export function getTierBenefits(tier: keyof typeof TIER_BENEFITS) {
  return TIER_BENEFITS[tier]
}

export function getPointsValue(points: number): number {
  return points * RUPEE_PER_POINT
}

export function getPointsNeededForNextTier(currentTier: string, lifetimePoints: number): number {
  if (currentTier === 'bronze') {
    return TIER_THRESHOLDS.silver - lifetimePoints
  } else if (currentTier === 'silver') {
    return TIER_THRESHOLDS.gold - lifetimePoints
  } else if (currentTier === 'gold') {
    return TIER_THRESHOLDS.platinum - lifetimePoints
  }
  return 0 // Already at max tier
}

export async function getLoyaltyLeaderboard(limit: number = 10): Promise<any[]> {
  const { data, error } = await supabase
    .from('loyalty_points')
    .select(`
      *,
      auth.users (
        email
      )
    `)
    .order('lifetime_points', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching leaderboard:', error)
    return []
  }

  return data || []
}
