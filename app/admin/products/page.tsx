import { verifyAdmin } from "@/lib/admin-guard"
import ProductsContent from "./ProductsContent"

export default async function ProductsManagementPage() {
  await verifyAdmin()
  return <ProductsContent />
}

