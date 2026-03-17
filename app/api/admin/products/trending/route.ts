import { NextResponse } from "next/server";
import { cached } from "@/lib/redis";
import { requireAdminRoute } from "@/lib/admin-route";

export const revalidate = 0;

async function getTrendingProducts(supabaseAdmin: any) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data, error } = await supabaseAdmin
    .from('order_items')
    .select(`
      product_id,
      products (name, price, front_image),
      quantity
    `)
    .gt('orders.created_at', thirtyDaysAgo.toISOString())
    .eq('orders.status', 'confirmed');

  if (error) {
    console.error("Error fetching trending products:", error);
    return [];
  }
    
  const productSales = data.reduce((acc, item) => {
    if (!item.products || !item.product_id) return acc;
    acc[item.product_id] = acc[item.product_id] || {
      product_id: item.product_id,
      name: (item.products as any)?.name,
      price: (item.products as any)?.price,
      front_image: (item.products as any)?.front_image,
      units_sold: 0,
    };
    acc[item.product_id].units_sold += item.quantity;
    return acc;
  }, {} as any);

  const sortedProducts = Object.values(productSales).sort((a: any, b: any) => b.units_sold - a.units_sold);

  return sortedProducts.slice(0, 6);
}

export async function GET() {
  try {
    const { supabaseAdmin, errorResponse } = await requireAdminRoute();
    if (errorResponse) return errorResponse;

    const products = await cached(
      "products:trending",
      300,
      () => getTrendingProducts(supabaseAdmin)
    );
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json([]);
  }
}
