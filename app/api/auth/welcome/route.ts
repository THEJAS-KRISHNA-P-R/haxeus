import { NextRequest, NextResponse } from "next/server"
import { sendWelcomeEmail } from "@/lib/email"

export async function POST(req: NextRequest) {
  try {
    const { email, name } = await req.json()

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "email required" }, { status: 400 })
    }

    await sendWelcomeEmail({ 
      email, 
      discountCode: "WELCOME10", 
      customerName: name ?? null 
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[email] Welcome email failed:", (err as Error).message)
    // Always return 200 — caller (auth page) should never be blocked by email failures
    return NextResponse.json({ success: false })
  }
}
