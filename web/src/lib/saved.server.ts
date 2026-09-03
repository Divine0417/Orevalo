import 'server-only'

import { createClient, getCurrentUser } from './supabase/server'
import { isSupabaseConfigured } from './supabase/config'

/**
 * Which opportunities of a given kind the current student has saved.
 *
 * Returns an empty set when signed out, so the boards render identically for
 * anonymous visitors — no account, no difference in what you can see.
 */
export async function getSavedState(kind: 'listing' | 'scholarship') {
  if (!isSupabaseConfigured) return { signedIn: false, saved: new Set<string>() }

  try {
    const { user } = await getCurrentUser()
    if (!user) return { signedIn: false, saved: new Set<string>() }

    const supabase = await createClient()
    const { data } = await supabase
      .from('saved_opportunities')
      .select('slug')
      .eq('user_id', user.id)
      .eq('kind', kind)

    return { signedIn: true, saved: new Set((data ?? []).map((r) => r.slug as string)) }
  } catch (error) {
    // A saved-state failure must never take the board down with it.
    console.warn('[saved] lookup failed:', error)
    return { signedIn: false, saved: new Set<string>() }
  }
}

/** Whether anyone is signed in — used to switch the nav between states. */
export async function getSignedIn() {
  if (!isSupabaseConfigured) return false
  try {
    const { user } = await getCurrentUser()
    return Boolean(user)
  } catch {
    return false
  }
}
