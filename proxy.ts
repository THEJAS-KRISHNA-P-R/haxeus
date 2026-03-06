import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default async function proxy(req: NextRequest) {
    let res = NextResponse.next({
        request: { headers: req.headers },
    })

    // Use @supabase/ssr — matches the rest of your project
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

    // CRITICAL: always call getUser() not getSession()
    // getSession() reads from cookie without verifying — can be spoofed
    // getUser() validates with Supabase auth server every time
    const { data: { user } } = await supabase.auth.getUser()

    const isAdminRoute = req.nextUrl.pathname.startsWith('/admin')

    if (isAdminRoute) {
        if (!user) {
            const redirectUrl = new URL('/auth', req.url)
            redirectUrl.searchParams.set('redirect', req.nextUrl.pathname)
            return NextResponse.redirect(redirectUrl)
        }

        // Check admin role
        const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .single()

        if (!roleData || roleData.role !== 'admin') {
            return NextResponse.redirect(new URL('/?error=unauthorized', req.url))
        }
    }

    return res
}

export const config = {
    matcher: [
        // Match all admin routes
        '/admin/:path*',
        // Exclude static files and api routes from middleware
        '/((?!_next/static|_next/image|favicon.ico|api/).*)',
    ],
}
