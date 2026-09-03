/**
 * Supabase connection details, resolved in one place.
 *
 * Supabase is migrating from the legacy JWT `anon` key to the newer
 * `sb_publishable_...` key. Both work today, so prefer the newer one when it is
 * present and fall back to anon — that way rotating to the new scheme is an
 * env change with no code change.
 */

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''

export const SUPABASE_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  ''

/**
 * Whether the app can talk to Supabase at all.
 *
 * Every data path falls back to the bundled seed listings when this is false,
 * so a fresh clone with no .env.local still renders a working board instead of
 * crashing. Check this before assuming a query will succeed.
 */
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_PUBLIC_KEY)

export function requireSupabaseConfig() {
  if (!isSupabaseConfigured) {
    throw new Error(
      'Supabase is not configured. Copy .env.local.example to .env.local and set ' +
        'NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.',
    )
  }
  return { url: SUPABASE_URL, key: SUPABASE_PUBLIC_KEY }
}
