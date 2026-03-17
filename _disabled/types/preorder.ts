// ─── PREORDER SYSTEM TYPES ───────────────────────────────────────────

export type PreorderStatus = "active" | "sold_out" | "stopped" | "converted"

export interface PreorderItem {
  id: string
  name: string
  description: string | null
  price: number
  original_price: number | null
  front_image: string | null
  images: string[]
  sizes_available: string[]
  expected_date: string | null
  max_preorders: number | null
  preorder_count: number
  status: PreorderStatus
  sort_order: number
  converted_product_id: number | null
  created_at: string
  updated_at: string
}

export interface PreorderRegistration {
  id: string
  preorder_item_id: string
  user_id: string | null
  email: string
  name: string | null
  size: string | null
  notified: boolean
  created_at: string
}

export interface AdminPreorderItem extends PreorderItem {
  registrations_count: number
  recent_registrations?: Pick<PreorderRegistration, "email" | "name" | "size" | "created_at">[]
}
