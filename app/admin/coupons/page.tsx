import { verifyAdmin } from "@/lib/admin-guard"
import CouponsContent from "./CouponsContent"

export default async function CouponsPage() {
    await verifyAdmin()
    return <CouponsContent />
}
