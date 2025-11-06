import { supabase, ReturnRequest, ReturnItem } from './supabase'

/**
 * Returns & Exchanges Management
 * - Return requests
 * - Exchange requests
 * - Admin approval workflow
 * - Refund processing
 */

export async function createReturnRequest(request: {
  orderId: string
  userId: string
  returnType: 'return' | 'exchange'
  reason: string
  items: Array<{
    orderItemId: string
    quantity: number
    exchangeSize?: string
  }>
}): Promise<{ success: boolean; requestId?: string; error?: string }> {
  // Verify order belongs to user
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', request.orderId)
    .eq('user_id', request.userId)
    .single()

  if (orderError || !order) {
    return { success: false, error: 'Order not found' }
  }

  // Check if order is eligible for return (e.g., delivered within 7 days)
  const deliveredDate = order.delivered_at ? new Date(order.delivered_at) : null
  if (!deliveredDate) {
    return { success: false, error: 'Order has not been delivered yet' }
  }

  const daysSinceDelivery = Math.floor(
    (Date.now() - deliveredDate.getTime()) / (1000 * 60 * 60 * 24)
  )

  if (daysSinceDelivery > 7) {
    return { success: false, error: 'Return window has expired (7 days)' }
  }

  // Calculate refund amount
  let refundAmount = 0
  for (const item of request.items) {
    const { data: orderItem } = await supabase
      .from('order_items')
      .select('price, quantity')
      .eq('id', item.orderItemId)
      .single()

    if (orderItem) {
      refundAmount += orderItem.price * Math.min(item.quantity, orderItem.quantity)
    }
  }

  // Create return request
  const { data: returnRequest, error: returnError } = await supabase
    .from('return_requests')
    .insert({
      order_id: request.orderId,
      user_id: request.userId,
      return_type: request.returnType,
      reason: request.reason,
      refund_amount: request.returnType === 'return' ? refundAmount : 0,
      status: 'pending'
    })
    .select()
    .single()

  if (returnError || !returnRequest) {
    console.error('Error creating return request:', returnError)
    return { success: false, error: 'Failed to create return request' }
  }

  // Add return items
  for (const item of request.items) {
    await supabase
      .from('return_items')
      .insert({
        return_request_id: returnRequest.id,
        order_item_id: item.orderItemId,
        quantity: item.quantity,
        exchange_size: item.exchangeSize
      })
  }

  return { success: true, requestId: returnRequest.id }
}

export async function getUserReturnRequests(userId: string): Promise<ReturnRequest[]> {
  const { data, error } = await supabase
    .from('return_requests')
    .select(`
      *,
      orders (
        id,
        total_amount,
        created_at
      ),
      return_items (
        *,
        order_items (
          *,
          products (
            name,
            front_image
          )
        )
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching return requests:', error)
    return []
  }

  return (data as any) || []
}

export async function getAllReturnRequests(
  status?: 'pending' | 'approved' | 'rejected' | 'completed'
): Promise<ReturnRequest[]> {
  let query = supabase
    .from('return_requests')
    .select(`
      *,
      orders (
        id,
        total_amount,
        created_at
      ),
      return_items (
        *,
        order_items (
          *,
          products (
            name,
            front_image
          )
        )
      )
    `)
    .order('created_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching return requests:', error)
    return []
  }

  return (data as any) || []
}

export async function updateReturnStatus(
  requestId: string,
  status: 'approved' | 'rejected' | 'completed',
  adminNotes?: string
): Promise<boolean> {
  const { error } = await supabase
    .from('return_requests')
    .update({
      status,
      admin_notes: adminNotes,
      updated_at: new Date().toISOString()
    })
    .eq('id', requestId)

  if (error) {
    console.error('Error updating return status:', error)
    return false
  }

  // If approved and it's a return, process refund
  if (status === 'approved') {
    const { data: returnRequest } = await supabase
      .from('return_requests')
      .select('*, return_items(*)')
      .eq('id', requestId)
      .single()

    if (returnRequest && returnRequest.return_type === 'return') {
      // Add inventory back
      for (const item of returnRequest.return_items) {
        const { data: orderItem } = await supabase
          .from('order_items')
          .select('product_id, size, quantity')
          .eq('id', item.order_item_id)
          .single()

        if (orderItem) {
          await supabase.rpc('increment_inventory', {
            p_product_id: orderItem.product_id,
            p_size: orderItem.size,
            p_quantity: item.quantity
          })
        }
      }
    }
  }

  return true
}

export async function cancelReturnRequest(requestId: string, userId: string): Promise<boolean> {
  const { error } = await supabase
    .from('return_requests')
    .delete()
    .eq('id', requestId)
    .eq('user_id', userId)
    .eq('status', 'pending')

  return !error
}

export async function getReturnStats() {
  const { data, error } = await supabase
    .from('return_requests')
    .select('status, refund_amount, return_type')

  if (error || !data) {
    return {
      total_requests: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      completed: 0,
      total_refunds: 0
    }
  }

  const stats = {
    total_requests: data.length,
    pending: data.filter(r => r.status === 'pending').length,
    approved: data.filter(r => r.status === 'approved').length,
    rejected: data.filter(r => r.status === 'rejected').length,
    completed: data.filter(r => r.status === 'completed').length,
    total_refunds: data
      .filter(r => r.status === 'completed' && r.return_type === 'return')
      .reduce((sum, r) => sum + (r.refund_amount || 0), 0)
  }

  return stats
}

export function canReturnOrder(order: any): { canReturn: boolean; reason?: string } {
  if (order.status !== 'delivered') {
    return { canReturn: false, reason: 'Order must be delivered to request return' }
  }

  const deliveredDate = order.delivered_at ? new Date(order.delivered_at) : null
  if (!deliveredDate) {
    return { canReturn: false, reason: 'Delivery date not found' }
  }

  const daysSinceDelivery = Math.floor(
    (Date.now() - deliveredDate.getTime()) / (1000 * 60 * 60 * 24)
  )

  if (daysSinceDelivery > 7) {
    return { canReturn: false, reason: 'Return window expired (7 days from delivery)' }
  }

  return { canReturn: true }
}
