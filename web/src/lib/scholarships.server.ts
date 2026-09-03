import 'server-only'

import { createClient } from './supabase/server'
import { isSupabaseConfigured } from './supabase/config'
import type { ScholarshipRow } from './supabase/types'

export type Scholarship = Pick<
  ScholarshipRow,
  'slug' | 'name' | 'funder' | 'country' | 'field' | 'degree_level' | 'deadline' | 'eligibility' | 'apply_url'
>

export type ScholarshipFilters = {
  country?: string
  field?: string
  degree_level?: string
}

/**
 * Published scholarships, optionally narrowed.
 *
 * Filtering happens in the database so this keeps working at the 50+ entries
 * Phase 1 targets. Unlike listings there is no seed fallback — an empty finder
 * is the honest answer when nothing has been curated yet.
 */
export async function getScholarships(filters: ScholarshipFilters = {}): Promise<Scholarship[]> {
  if (!isSupabaseConfigured) return []

  try {
    const supabase = await createClient()
    let query = supabase
      .from('scholarships')
      .select('slug, name, funder, country, field, degree_level, deadline, eligibility, apply_url')
      .eq('published', true)

    if (filters.country) query = query.eq('country', filters.country)
    if (filters.field) query = query.eq('field', filters.field)
    if (filters.degree_level) query = query.eq('degree_level', filters.degree_level)

    // Rolling scholarships have no deadline; they sort last rather than first.
    const { data, error } = await query
      .order('deadline', { ascending: true, nullsFirst: false })
      .order('name', { ascending: true })

    if (error) throw error
    return (data ?? []) as Scholarship[]
  } catch (error) {
    console.warn('[scholarships] query failed:', error)
    return []
  }
}
