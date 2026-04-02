import { verifyAdmin } from "@/lib/admin-guard"
import AnalyticsContent from "./AnalyticsContent"

export default async function AnalyticsPage() {
    await verifyAdmin()
    return <AnalyticsContent />
}

