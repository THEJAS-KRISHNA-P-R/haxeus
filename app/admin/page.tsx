import { verifyAdmin } from "@/lib/admin-guard"
import DashboardClient from "./DashboardClient"

export default async function AdminDashboardPage() {
  await verifyAdmin()
  return <DashboardClient />
}