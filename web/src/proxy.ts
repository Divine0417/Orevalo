import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { SUPABASE_PUBLIC_KEY, SUPABASE_URL, isSupabaseConfigured } from '@/lib/supabase/config'
import { fetchWithRetry } from '@/lib/supabase/fetch'

/**
 * Refreshes the Supabase auth session on every request and gates /admin.
 *
 * Named `proxy` per the Next.js 16 file convention; `middleware` is deprecated.
 *
 * Access tokens are short-lived. Without this the session silently expires
 * mid-visit and Server Components start seeing a signed-out user. Refreshing
 * here means every route sees a valid session, or none at all.
 *
 * The /admin redirect is a convenience, not the security boundary — middleware
 * only checks that someone is signed in, not that they are an admin. Row level
 * security is what actually protects the data, and the admin pages re-check the
 * role server-side.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })

  if (!isSupabaseConfigured) return response

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY, {
    global: { fetch: fetchWithRetry },
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value)
        }
        response = NextResponse.next({ request })
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options)
        }
      },
    },
  })

  // Do not insert logic between createServerClient and getUser: a slow call
  // here can leave the session partially refreshed and log users out at random.
  let user = null
  try {
    const result = await supabase.auth.getUser()
    user = result.data.user
  } catch (error) {
    // A temporary auth transport failure should leave the visitor signed out,
    // rather than turning every public route into a 500 response.
    console.warn('[proxy] Supabase auth lookup failed:', error)
  }

  const { pathname } = request.nextUrl
  const isAdminRoute = pathname.startsWith('/admin')
  const isLoginRoute = pathname === '/admin/login'

  if (isAdminRoute && !isLoginRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin/login'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  if (isLoginRoute && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin'
    url.search = ''
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Everything except static assets and image files — those never carry a
     * session and refreshing on each would waste an auth round trip.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
