import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyUserAdmin } from '@/lib/admin-auth'

export default async function proxy(req: NextRequest) {
    let res = NextResponse.next({
        request: { headers: req.headers },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return req.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        req.cookies.set(name, value)
                    )
                    res = NextResponse.next({ request: req })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        res.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const isAdminRoute = req.nextUrl.pathname.startsWith('/admin')
    const isProfileRoute = req.nextUrl.pathname.startsWith('/profile') || req.nextUrl.pathname.startsWith('/checkout')

    if (isAdminRoute || isProfileRoute) {
        const { data: { user } } = await supabase.auth.getUser()

        if (isAdminRoute) {
            if (!user) {
                const redirectUrl = new URL('/auth', req.url)
                redirectUrl.searchParams.set('redirect', req.nextUrl.pathname)
                return NextResponse.redirect(redirectUrl)
            }

            // High-performance Redis-backed admin check
            const isAdmin = await verifyUserAdmin(supabase, user.id)

            if (!isAdmin) {
                return NextResponse.redirect(new URL('/?error=unauthorized', req.url))
            }
        } else if (isProfileRoute && !user) {
            const redirectUrl = new URL('/auth', req.url)
            redirectUrl.searchParams.set('redirect', req.nextUrl.pathname)
            return NextResponse.redirect(redirectUrl)
        }
    }

    return res
}

export const config = {
    matcher: [
        '/admin/:path*',
        '/((?!_next/static|_next/image|favicon.ico|api/).*)',
    ],
}
