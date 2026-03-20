import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
     // Update the newsletter_subscribers table
    console.log(`[unsubscribe] Attempting to unsubscribe: ${email.toLowerCase()}`)
    
    const { data, error } = await supabase
      .from("newsletter_subscribers")
      .update({ 
        subscribed: false, 
        unsubscribed_at: new Date().toISOString()
      })
      .eq("email", email.toLowerCase())
      .select()

    if (error) {
      console.error("[unsubscribe] Supabase error:", error.message)
      return NextResponse.json({ error: `Database error: ${error.message}` }, { status: 500 })
    }

    if (!data || data.length === 0) {
      console.warn(`[unsubscribe] No subscriber found with email: ${email.toLowerCase()}`)
      // Friendly 200 message as requested
      return NextResponse.json({ 
        success: true, 
        message: "You are not currently subscribed or have already been unsubscribed." 
      })
    }

    console.log("[unsubscribe] Successfully unsubscribed")
    return NextResponse.json({ success: true, message: "Unsubscribed successfully" })
  } catch (err: any) {
    console.error("[unsubscribe] Caught exception:", err.message)
    return NextResponse.json({ error: `Server error: ${err.message}` }, { status: 500 })
  }
}
