import { verifyAdmin } from "@/lib/admin-guard"
import ReviewsContent from "./ReviewsContent"

export default async function ReviewsPage() {
    await verifyAdmin()
    return <ReviewsContent />
}
