import { supabase, ProductInventory } from './supabase'

/**
 * Inventory Management System
 * - Real-time stock tracking
 * - Size-specific inventory
 * - Auto-decrement on purchase
 * - Low stock warnings
 */

export async function getProductInventory(productId: number): Promise<ProductInventory[]> {
  const { data, error } = await supabase
    .from('product_inventory')
    .select('*')
    .eq('product_id', productId)
    .order('size')

  if (error) {
    console.error('Error fetching inventory:', error)
    return []
  }

  return data || []
}

export async function checkStockAvailability(
  productId: number,
  size: string,
  quantity: number
): Promise<{ available: boolean; currentStock: number; isLowStock: boolean }> {
  const { data, error } = await supabase
    .from('product_inventory')
    .select('*')
    .eq('product_id', productId)
    .eq('size', size)
    .single()

  if (error || !data) {
    return { available: false, currentStock: 0, isLowStock: false }
  }

  const availableStock = data.stock_quantity - data.reserved_quantity
  const isLowStock = data.stock_quantity <= data.low_stock_threshold

  return {
    available: availableStock >= quantity,
    currentStock: availableStock,
    isLowStock
  }
}

export async function reserveStock(
  productId: number,
  size: string,
  quantity: number
): Promise<boolean> {
  // Reserve stock during checkout (15 min timer)
  const { error } = await supabase.rpc('reserve_product_stock', {
    p_product_id: productId,
    p_size: size,
    p_quantity: quantity
  })

  return !error
}

export async function releaseReservedStock(
  productId: number,
  size: string,
  quantity: number
): Promise<boolean> {
  // Release reserved stock if checkout abandoned
  const { error } = await supabase.rpc('release_product_stock', {
    p_product_id: productId,
    p_size: size,
    p_quantity: quantity
  })

  return !error
}

export async function getLowStockProducts(): Promise<any[]> {
  const { data, error } = await supabase
    .from('low_stock_products')
    .select('*')

  if (error) {
    console.error('Error fetching low stock products:', error)
    return []
  }

  return data || []
}

export async function updateInventoryQuantity(
  productId: number,
  size: string,
  newQuantity: number
): Promise<boolean> {
  const { error } = await supabase
    .from('product_inventory')
    .update({ 
      stock_quantity: newQuantity,
      updated_at: new Date().toISOString()
    })
    .eq('product_id', productId)
    .eq('size', size)

  if (error) {
    console.error('Error updating inventory:', error)
    return false
  }

  return true
}

export async function bulkUpdateInventory(
  updates: Array<{ productId: number; size: string; quantity: number }>
): Promise<boolean> {
  try {
    for (const update of updates) {
      await updateInventoryQuantity(update.productId, update.size, update.quantity)
    }
    return true
  } catch (error) {
    console.error('Error bulk updating inventory:', error)
    return false
  }
}

export async function getInventorySummary() {
  const { data, error } = await supabase
    .from('product_inventory')
    .select(`
      *,
      products (
        id,
        name,
        category
      )
    `)

  if (error) {
    console.error('Error fetching inventory summary:', error)
    return []
  }

  return data || []
}

// Export inventory report as CSV
export function exportInventoryToCSV(inventory: any[]): string {
  const headers = ['Product', 'Size', 'Stock', 'Reserved', 'Sold', 'Status']
  const rows = inventory.map(item => [
    item.products?.name || 'Unknown',
    item.size,
    item.stock_quantity,
    item.reserved_quantity,
    item.sold_quantity,
    item.stock_quantity <= item.low_stock_threshold ? 'Low Stock' : 'In Stock'
  ])

  const csv = [headers, ...rows]
    .map(row => row.join(','))
    .join('\n')

  return csv
}
