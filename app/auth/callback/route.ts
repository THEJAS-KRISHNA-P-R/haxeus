import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { sendWelcomeEmail } from '@/lib/email'

export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const redirect = searchParams.get('redirect') || '/'

    if (code) {
        const cookieStore = await cookies()
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() { return cookieStore.getAll() },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    },
                },
            }
        )

        const { data, error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error && data?.user) {
            // Check if this is a new user (created in the last 10 seconds)
            const createdAt = new Date(data.user.created_at || "")
            const now = new Date()
            const diffSeconds = (now.getTime() - createdAt.getTime()) / 1000

            if (diffSeconds < 10) {
                await sendWelcomeEmail(
                    data.user.email!,
                    data.user.user_metadata?.full_name ||
                    data.user.user_metadata?.name ||
                    data.user.email?.split("@")[0]
                ).catch(console.error)
            }
        }
    }

    return NextResponse.redirect(`${origin}${redirect}`)
}
