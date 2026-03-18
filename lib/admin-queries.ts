// lib/admin-queries.ts
// Shared query helpers for admin API routes.
// All functions require a service role client from getSupabaseAdmin().
// Auth must be verified BEFORE calling any function here.

import type { SupabaseClient } from "@supabase/supabase-js"

// ── Products ─────────────────────────────────────────────────────────

export async function getProductById(
  supabase: SupabaseClient,
  id: number
) {
  return supabase
    .from("products")
    .select(`
      id, name, price, description, front_image, category,
      is_preorder, preorder_status, expected_date,
      max_preorders, preorder_count,
      product_images (image_url, is_primary, display_order),
      product_inventory (size, quantity)
    `)
    .eq("id", id)
    .maybeSingle()
}

export async function getPreorderProducts(supabase: SupabaseClient) {
  return supabase
    .from("products")
    .select(`
      id, name, price, front_image,
      is_preorder, preorder_status,
      expected_date, max_preorders, preorder_count
    `)
    .eq("is_preorder", true)
    .order("id", { ascending: false })
}

// ── Store Settings ────────────────────────────────────────────────────

export async function getStoreSetting(
  supabase: SupabaseClient,
  key: string
) {
  return supabase
    .from("store_settings")
    .select("value")
    .eq("key", key)
    .maybeSingle()
}

export async function upsertStoreSetting(
  supabase: SupabaseClient,
  key: string,
  value: unknown
) {
  return supabase
    .from("store_settings")
    .upsert({ key, value }, { onConflict: "key" })
}

// ── Orders ────────────────────────────────────────────────────────────

export async function getOrderWithItems(
  supabase: SupabaseClient,
  orderId: string
) {
  return supabase
    .from("orders")
    .select(`
      *,
      order_items (
        id, quantity, unit_price, size,
        products (id, name, front_image)
      )
    `)
    .eq("id", orderId)
    .maybeSingle()
}

// ── User Roles ────────────────────────────────────────────────────────

export async function getUserRole(
  supabase: SupabaseClient,
  userId: string
) {
  return supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle()
}

// ── Coupons ───────────────────────────────────────────────────────────

export async function getAllCoupons(supabase: SupabaseClient) {
  return supabase
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false })
}

// ── Preorder Registrations ────────────────────────────────────────────

export async function getRegistrationsForProduct(
  supabase: SupabaseClient,
  productId: number
) {
  return supabase
    .from("preorder_registrations")
    .select("id, email, name, size, created_at, notified")
    .eq("product_id", productId)
    .order("created_at", { ascending: false })
}
