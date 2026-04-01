import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { getSupabaseAdmin } from "@/lib/supabase-admin"
import { mapReviewRecord } from "@/lib/product-reviews"
import type { ProductReviewRecord } from "@/types/reviews"
import { sanitizeText } from "@/lib/utils"

function createAuthedSupabase(cookieStore: Awaited<ReturnType<typeof cookies>>) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {}
        },
      },
    }
  )
}

export async function GET(req: NextRequest) {
  const rawProductId = req.nextUrl.searchParams.get("productId")
  const productId = Number(rawProductId)

  if (!Number.isFinite(productId)) {
    return NextResponse.json({ error: "Invalid product ID." }, { status: 400 })
  }

  try {
    const cookieStore = await cookies()
    const supabase = createAuthedSupabase(cookieStore)
    const { data, error } = await supabase
      .from("reviews")
      .select("id, product_id, order_id, user_id, rating, title, body, verified_purchase, created_at")
      .eq("product_id", productId)
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ reviews: [] })
    }

    return NextResponse.json({
      reviews: ((data as ProductReviewRecord[] | null) ?? []).map(mapReviewRecord),
    })
  } catch {
    return NextResponse.json({ reviews: [] })
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createAuthedSupabase(cookieStore)
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Please sign in to leave a review." }, { status: 401 })
    }

    const body = await req.json()
    const productId = Number(body?.productId)
    const rating = Number(body?.rating)
    const title = sanitizeText(String(body?.title ?? "")).slice(0, 120)
    const reviewBody = sanitizeText(String(body?.body ?? ""))

    if (!Number.isFinite(productId)) {
      return NextResponse.json({ error: "Invalid product ID." }, { status: 400 })
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5." }, { status: 400 })
    }

    if (reviewBody.length < 12) {
      return NextResponse.json({ error: "Please share a little more detail in your review." }, { status: 400 })
    }

    const { data: existingReview } = await supabase
      .from("reviews")
      .select("id")
      .eq("product_id", productId)
      .eq("user_id", user.id)
      .maybeSingle()

    if (existingReview) {
      return NextResponse.json({ error: "You have already reviewed this product." }, { status: 409 })
    }

    const supabaseAdmin = getSupabaseAdmin()
    const { data: deliveredOrder } = await supabaseAdmin
      .from("order_items")
      .select("order_id, orders!inner(id, user_id, status, delivered_at)")
      .eq("product_id", productId)
      .eq("orders.user_id", user.id)
      .eq("orders.status", "delivered")
      .not("orders.delivered_at", "is", null)
      .limit(1)
      .maybeSingle()

    if (!deliveredOrder?.order_id) {
      return NextResponse.json(
        { error: "You can review this item only after it has been delivered to you." },
        { status: 403 }
      )
    }

    const { data, error } = await supabase
      .from("reviews")
      .insert({
        product_id: productId,
        order_id: deliveredOrder.order_id,
        user_id: user.id,
        rating,
        title: title || null,
        body: reviewBody,
        verified_purchase: true,
      })
      .select("id, product_id, order_id, user_id, rating, title, body, verified_purchase, created_at")
      .single()

    if (error || !data) {
      return NextResponse.json({ error: "We could not save your review right now." }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      review: mapReviewRecord(data as ProductReviewRecord),
    })
  } catch {
    return NextResponse.json({ error: "Unable to submit review." }, { status: 500 })
  }
}
