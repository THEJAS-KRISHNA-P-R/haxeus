import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { getSupabaseAdmin } from "@/lib/supabase-admin"
import { mapReviewRecord } from "@/lib/product-reviews"
import type { ProductReviewRecord } from "@/types/reviews"
import { sanitizeText } from "@/lib/utils"
import { verifyAdminRequest } from "@/lib/admin-auth"

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
    
    // Attempt join for author names
    const { data, error } = await supabase
      .from("reviews")
      .select("id, product_id, order_id, user_id, rating, title, body, verified_purchase, image_urls, created_at, profiles(full_name)")
      .eq("product_id", productId)
      .order("created_at", { ascending: false })

    if (error) {
      // Fallback: Fetch without join
      const { data: fallbackData } = await supabase
        .from("reviews")
        .select("id, product_id, order_id, user_id, rating, title, body, verified_purchase, image_urls, created_at")
        .eq("product_id", productId)
        .order("created_at", { ascending: false })
      
      return NextResponse.json({
        reviews: ((fallbackData as ProductReviewRecord[] | null) ?? []).map(mapReviewRecord),
      })
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
    const imageUrls = Array.isArray(body?.imageUrls) ? body.imageUrls : []

    if (!Number.isFinite(productId)) {
      return NextResponse.json({ error: "Invalid product ID." }, { status: 400 })
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5." }, { status: 400 })
    }

    if (reviewBody.length < 5) {
      return NextResponse.json({ error: "Review content is too short." }, { status: 400 })
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
      .from("orders")
      .select("id, order_items!inner(product_id)")
      .eq("user_id", user.id)
      .ilike("status", "delivered")
      .eq("order_items.product_id", productId)
      .limit(1)
      .maybeSingle()

    if (!deliveredOrder?.id) {
      return NextResponse.json(
        { error: "You can review this item only after it has been delivered to you." },
        { status: 403 }
      )
    }

    const { data, error } = await supabase
      .from("reviews")
      .insert({
        product_id: productId,
        order_id: deliveredOrder.id,
        user_id: user.id,
        rating,
        title: title || null,
        body: reviewBody,
        image_urls: imageUrls,
        verified_purchase: true,
      })
      .select("id, product_id, order_id, user_id, rating, title, body, verified_purchase, image_urls, created_at, profiles(full_name)")
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

export async function PATCH(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createAuthedSupabase(cookieStore)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
    }

    const json = await req.json()
    const { reviewId, rating, title, body, imageUrls } = json

    if (!reviewId) {
      return NextResponse.json({ error: "Missing review ID." }, { status: 400 })
    }

    const adminAuth = await verifyAdminRequest()
    const isAdmin = adminAuth.authorized

    const { data: review } = await supabase
      .from("reviews")
      .select("user_id")
      .eq("id", reviewId)
      .maybeSingle()

    if (!review || (!isAdmin && review.user_id !== user.id)) {
      return NextResponse.json({ error: "Forbidden or not found." }, { status: 403 })
    }

    const targetClient = isAdmin ? getSupabaseAdmin() : supabase

    const { data, error } = await targetClient
      .from("reviews")
      .update({
        rating: Number(rating),
        title: sanitizeText(String(title || "")).slice(0, 120) || null,
        body: sanitizeText(String(body || "")),
        image_urls: Array.isArray(imageUrls) ? imageUrls : [],
      })
      .eq("id", reviewId)
      .select("id, product_id, order_id, user_id, rating, title, body, verified_purchase, image_urls, created_at, profiles(full_name)")
      .single()

    if (error || !data) {
      return NextResponse.json({ error: "Failed to update review." }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      review: mapReviewRecord(data as ProductReviewRecord),
    })
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createAuthedSupabase(cookieStore)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
    }

    const reviewId = req.nextUrl.searchParams.get("reviewId")

    if (!reviewId) {
      return NextResponse.json({ error: "Missing review ID." }, { status: 400 })
    }

    const adminAuth = await verifyAdminRequest()
    const isAdmin = adminAuth.authorized

    const { data: review } = await supabase
      .from("reviews")
      .select("user_id")
      .eq("id", reviewId)
      .maybeSingle()

    if (!review || (!isAdmin && review.user_id !== user.id)) {
      return NextResponse.json({ error: "Forbidden or not found." }, { status: 403 })
    }

    const targetClient = isAdmin ? getSupabaseAdmin() : supabase

    const { error } = await targetClient
      .from("reviews")
      .delete()
      .eq("id", reviewId)

    if (error) {
      return NextResponse.json({ error: "Failed to delete review." }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 })
  }
}

