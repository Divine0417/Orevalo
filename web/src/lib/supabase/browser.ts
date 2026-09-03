'use client'

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './types'
import { requireSupabaseConfig } from './config'
import { fetchWithRetry } from './fetch'

let client: ReturnType<typeof createBrowserClient<Database>> | undefined

/**
 * Supabase client for Client Components.
 *
 * Memoised because each call otherwise creates a new auth listener, and a
 * component that re-renders would accumulate them.
 *
 * Only ever receives the publishable/anon key. RLS is what protects the data;
 * the service-role key must never reach this file.
 */
export function createClient() {
  if (!client) {
    const { url, key } = requireSupabaseConfig()
    client = createBrowserClient<Database>(url, key, { global: { fetch: fetchWithRetry } })
  }
  return client
}
