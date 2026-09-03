import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from './types'
import { requireSupabaseConfig } from './config'
import { fetchWithRetry } from './fetch'

/**
 * Supabase client for Server Components, Route Handlers and Server Actions.
 *
 * Reads the session from cookies so RLS sees the signed-in user. Must be
 * created per request — never hoisted to a module-level singleton, or one
 * user's session leaks into another's request.
 */
export async function createClient() {
  const { url, key } = requireSupabaseConfig()
  const cookieStore = await cookies()

  return createServerClient<Database>(url, key, {
    global: { fetch: fetchWithRetry },
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options)
          }
        } catch {
          // Called from a Server Component, where cookies are read-only.
          // Middleware refreshes the session instead, so this is safe to skip.
        }
      },
    },
  })
}

/**
 * Returns the signed-in user and their profile, or nulls when signed out.
 *
 * Uses getUser(), not getSession(): getSession() trusts the cookie as-is, while
 * getUser() revalidates it against the auth server. For anything that gates
 * access, only the revalidated answer is worth having.
 */
export async function getCurrentUser() {
  const supabase = await createClient()
  let user
  try {
    const result = await supabase.auth.getUser()
    user = result.data.user
  } catch (error) {
    console.warn('[supabase] auth lookup failed:', error)
    return { user: null, profile: null, isAdmin: false }
  }

  if (!user) return { user: null, profile: null, isAdmin: false }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, university, course, year_of_study, country')
    .eq('id', user.id)
    .maybeSingle()

  return { user, profile, isAdmin: profile?.role === 'admin' }
}
