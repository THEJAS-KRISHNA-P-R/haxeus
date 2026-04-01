import { createClient } from "@/lib/supabase-server"
import { NextResponse } from "next/server"

export async function GET(
  _request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params
  const supabase = await createClient()

  const productId = parseInt(id)
  if (isNaN(productId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 })
  }

  // Step 1: get this product's category
  const { data: current } = await supabase
    .from("products")
    .select("id, category")
    .eq("id", productId)
    .maybeSingle()

  if (!current) {
    return NextResponse.json({ related: [] })
  }

  // Step 2: fetch related by same category, exclude current product
  // Also exclude preorder items that are stopped
  const { data: related } = await supabase
    .from("products")
    .select(`
      id, name, price, front_image, category,
      is_preorder, preorder_status, expected_date,
      max_preorders, preorder_count,
      product_images (image_url, is_primary, display_order),
      product_inventory (size, stock_quantity, color)
    `)
    .eq("category", current.category ?? "apparel")
    .neq("id", productId)
    .order("id", { ascending: false })
    .limit(8)

  // Step 3: if same category yields fewer than 4, backfill from other categories
  let results = related ?? []
  if (results.length < 4) {
    const { data: backfill } = await supabase
      .from("products")
      .select(`
        id, name, price, front_image, category,
        is_preorder, preorder_status, expected_date,
        max_preorders, preorder_count,
        product_images (image_url, is_primary, display_order),
        product_inventory (size, stock_quantity, color)
      `)
      .neq("id", productId)
      .not("id", "in", `(${results.map(r => r.id).join(",") || "0"})`)
      .order("id", { ascending: false })
      .limit(8 - results.length)

    results = [...results, ...(backfill ?? [])]
  }

  // Map product_images to front image
  const mapped = results.map(p => {
    const primary = (p as any).product_images?.find((img: any) => img.is_primary)
    const first = (p as any).product_images?.[0]
    return {
      ...p,
      front_image: primary?.image_url || first?.image_url || (p as any).front_image,
      product_images: undefined  // don't send raw join to client
    }
  })

  return NextResponse.json({ related: mapped })
}
