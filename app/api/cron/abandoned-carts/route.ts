import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { processAbandonedCarts } from '@/lib/abandoned-cart'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * Cron job to process abandoned cart recovery emails
 * 
 * Schedule: Runs every hour via Vercel Cron Jobs
 * 
 * This endpoint should be protected in production with:
 * - Vercel Cron Secret (CRON_SECRET environment variable)
 * - Or API key authentication
 * 
 * Add to vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/abandoned-carts",
 *     "schedule": "0 * * * *"
 *   }]
 * }
 */
export async function GET(request: Request) {
  try {
    // Verify cron secret (recommended for production)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Process abandoned carts
    const result = await processAbandonedCarts(supabase)

    // Log results
    console.log('Abandoned cart cron job completed:', {
      timestamp: new Date().toISOString(),
      stage1Sent: result.stage1Sent,
      stage2Sent: result.stage2Sent,
      stage3Sent: result.stage3Sent,
      totalSent: result.stage1Sent + result.stage2Sent + result.stage3Sent,
      errors: result.errors
    })

    return NextResponse.json({
      success: true,
      message: 'Abandoned cart processing completed',
      stats: {
        stage1: result.stage1Sent,
        stage2: result.stage2Sent,
        stage3: result.stage3Sent,
        total: result.stage1Sent + result.stage2Sent + result.stage3Sent,
        errors: result.errors.length
      },
      errors: result.errors
    })

  } catch (error) {
    console.error('Abandoned cart cron job failed:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process abandoned carts',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * Optional: POST endpoint for manual trigger via admin panel
 */
export async function POST(request: Request) {
  try {
    // Verify admin authentication
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Process abandoned carts
    const result = await processAbandonedCarts(supabase)

    return NextResponse.json({
      success: true,
      message: 'Abandoned cart processing completed (manual trigger)',
      stats: {
        stage1: result.stage1Sent,
        stage2: result.stage2Sent,
        stage3: result.stage3Sent,
        total: result.stage1Sent + result.stage2Sent + result.stage3Sent,
        errors: result.errors.length
      },
      errors: result.errors
    })

  } catch (error) {
    console.error('Manual abandoned cart processing failed:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process abandoned carts',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
