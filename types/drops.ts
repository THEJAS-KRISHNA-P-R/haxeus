export interface ActiveDrop {
  id: string
  name: string
  description: string | null
  target_date: string
  is_active: boolean
  product_ids: number[] | null
}
