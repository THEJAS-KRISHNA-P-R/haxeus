import { verifyAdmin } from "@/lib/admin-guard"
import NotificationsContent from "./NotificationsContent"

export default async function NotificationsPage() {
    await verifyAdmin()
    return <NotificationsContent />
}
