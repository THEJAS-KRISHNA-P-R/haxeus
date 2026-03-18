import { verifyAdminRequest } from "@/lib/admin-auth"
import { redirect } from "next/navigation"

export async function verifyAdmin() {
    const auth = await verifyAdminRequest()

    if (!auth.authorized) {
        if (auth.status === 401) {
            redirect("/auth")
        } else {
            redirect("/")
        }
    }

    return { id: auth.userId }
}

