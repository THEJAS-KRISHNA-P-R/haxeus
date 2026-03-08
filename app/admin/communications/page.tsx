import { verifyAdmin } from "@/lib/admin-guard"
import CommunicationsContent from "./CommunicationsContent"

export default async function AdminCommunicationsPage() {
    await verifyAdmin()
    return <CommunicationsContent />
}
