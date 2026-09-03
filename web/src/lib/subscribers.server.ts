import 'server-only'

import { createClient } from './supabase/server'
import { isSupabaseConfigured } from './supabase/config'
import { SUBSCRIBER_COUNT } from './content'

/**
 * How many students actually get the opportunity emails.
 *
 * Reads the live table so the number on the landing page and the number in the
 * admin dashboard can never disagree. Falls back to the figure carried over
 * from orevalo.com only when the table is unreachable — never to inflate it.
 */
export async function getSubscriberCount(): Promise<number> {
  if (!isSupabaseConfigured) return SUBSCRIBER_COUNT

  try {
    const supabase = await createClient()
    const { count, error } = await supabase
      .from('subscribers')
      .select('id', { count: 'exact', head: true })
      .eq('unsubscribed', false)

    if (error || count === null) return SUBSCRIBER_COUNT

    // Before the Formspree import runs the table holds only new signups, which
    // would understate the real list. Show whichever is genuinely larger.
    return Math.max(count, SUBSCRIBER_COUNT)
  } catch {
    return SUBSCRIBER_COUNT
  }
}
