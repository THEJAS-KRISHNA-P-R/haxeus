import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { sendDropAlert } from "@/lib/email"

export async function POST(request: Request) {
  const cookieStore = await cookies()

  // Cookie client for auth check
  const supabaseAuth = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )

  // Service role for DB reads
  const supabaseAdmin = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  )

  // Auth check
  const { data: { user } } = await supabaseAuth.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // Admin role check
  const { data: role } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .maybeSingle()

  if (!role) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  let product_id: number
  try {
    const body = await request.json()
    product_id = body.product_id
    if (!product_id) throw new Error("missing")
  } catch {
    return NextResponse.json({ error: "product_id required" }, { status: 400 })
  }

  // Fetch product
  const { data: product } = await supabaseAdmin
    .from("products")
    .select("id, name, price, front_image, description, is_preorder, expected_date")
    .eq("id", product_id)
    .maybeSingle()

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 })
  }

  // Fetch active newsletter subscribers
  const { data: newsletterSubs } = await supabaseAdmin
    .from("newsletter_subscribers")
    .select("email")
    .eq("subscribed", true)

  const subscribers: { email: string }[] = newsletterSubs ?? []

  if (subscribers.length === 0) {
    return NextResponse.json({ success: true, sent: 0, message: "No active subscribers" })
  }

  try {
    await sendDropAlert({
      product_name: product.name,
      product_id: product.id,
      product_image: product.front_image ?? "",
      description: product.description ?? "",
      price: product.price,
      is_preorder: product.is_preorder ?? false,
      expected_date: product.expected_date ?? null,
      recipients: subscribers.map(s => s.email)
    })
  } catch (err) {
    console.error("[email] Drop alert failed:", (err as Error).message)
    return NextResponse.json({ error: "Failed to send drop alert" }, { status: 500 })
  }

  return NextResponse.json({ success: true, sent: subscribers.length })
}
