import 'server-only'

import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { requireSupabaseConfig } from './config'
import type { Database } from './types'
import { fetchWithRetry } from './fetch'

const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''

export function createAdminClient() {
  const { url } = requireSupabaseConfig()
  if (!SERVICE_ROLE_KEY) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured.')

  return createSupabaseClient<Database>(url, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { fetch: fetchWithRetry },
  })
}
