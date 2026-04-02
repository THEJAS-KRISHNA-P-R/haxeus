import { verifyAdmin } from "@/lib/admin-guard"
import OrdersContent from "./OrdersContent"

export default async function AdminOrdersPage() {
  await verifyAdmin()
  return <OrdersContent />
}
