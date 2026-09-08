import 'server-only'

import { createClient } from './supabase/server'
import { isSupabaseConfigured } from './supabase/config'
import type { ScholarshipRow } from './supabase/types'

const PUBLIC_RESULT_LIMIT = 100

export type Scholarship = Pick<
  ScholarshipRow,
  'slug' | 'name' | 'funder' | 'country' | 'field' | 'degree_level' | 'deadline' | 'eligibility' | 'apply_url'
>

export type ScholarshipFilters = {
  country?: string
  field?: string
  degree_level?: string
}

export async function getScholarshipBySlug(slug: string, preview = false) {
  if (!isSupabaseConfigured) return null

  try {
    const supabase = await createClient()
    let query = supabase
      .from('scholarships')
      .select('id, slug, name, funder, country, field, degree_level, deadline, eligibility, apply_url, description, source_name, source_url, verified_at, featured, archived_at, published')
      .eq('slug', slug)
    if (!preview) query = query.eq('published', true).is('archived_at', null)
    const { data, error } = await query.maybeSingle()
    if (error) throw error
    return data
  } catch (error) {
    console.warn('[scholarships] detail query failed:', error)
    return null
  }
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
    const today = new Date().toISOString().slice(0, 10)
    let query = supabase
      .from('scholarships')
      .select('slug, name, funder, country, field, degree_level, deadline, eligibility, apply_url')
      .eq('published', true)
      .is('archived_at', null)
      .or(`deadline.is.null,deadline.gte.${today}`)

    if (filters.country) query = query.eq('country', filters.country)
    if (filters.field) query = query.or(`field.eq.${filters.field},field.eq.Any`)
    if (filters.degree_level) query = query.or(`degree_level.eq.${filters.degree_level},degree_level.eq.Any`)

    // Rolling scholarships have no deadline; they sort last rather than first.
    const { data, error } = await query
      .order('featured', { ascending: false })
      .order('deadline', { ascending: true, nullsFirst: false })
      .order('name', { ascending: true })
      .limit(PUBLIC_RESULT_LIMIT)

    if (error) throw error
    return (data ?? []) as Scholarship[]
  } catch (error) {
    console.warn('[scholarships] query failed:', error)
    return []
  }
}
