import { verifyAdmin } from "@/lib/admin-guard"
import CustomersContent from "./CustomersContent"

export default async function CustomersPage() {
  await verifyAdmin()
  return <CustomersContent />
}
