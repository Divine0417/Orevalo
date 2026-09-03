import 'server-only'

/**
 * Server-side listing queries.
 *
 * Split from listings.ts because this imports `next/headers` (via the Supabase
 * server client), which cannot be pulled into a Client Component. The
 * `server-only` import turns any such mistake into a build error naming this
 * file, rather than a confusing "next/headers in the Pages Router" message.
 */

import { createClient } from './supabase/server'
import { isSupabaseConfigured } from './supabase/config'
import { SEED, type Field, type Listing, type ListingFilters, type Location } from './listings'

/** Maps a database row to the shape the UI renders. */
function toListing(row: {
  slug: string
  company: string
  title: string
  location: string
  field: string
  deadline: string
  apply_url: string
}): Listing {
  return {
    id: row.slug,
    company: row.company,
    title: row.title,
    location: row.location as Location,
    field: row.field as Field,
    deadline: row.deadline,
    apply_url: row.apply_url,
  }
}

function filterSeed({ field, location }: ListingFilters): Listing[] {
  return SEED.filter(
    (l) => (!field || l.field === field) && (!location || l.location === location),
  ).sort((a, b) => a.deadline.localeCompare(b.deadline))
}

export type ListingsResult = {
  listings: Listing[]
  error?: string
}

/**
 * Fetch published listings, optionally narrowed by field and location.
 *
 * Filtering happens in the database rather than in JS so this keeps working
 * when there are hundreds of rows.
 */
export async function getListings(filters: ListingFilters = {}): Promise<ListingsResult> {
  if (!isSupabaseConfigured) {
    if (process.env.NODE_ENV === 'development') return { listings: filterSeed(filters) }
    return { listings: [], error: 'The internship board is temporarily unavailable.' }
  }

  try {
    const supabase = await createClient()
    let query = supabase
      .from('listings')
      .select('slug, company, title, location, field, deadline, apply_url')
      .eq('published', true)
      .order('deadline', { ascending: true })

    if (filters.field) query = query.eq('field', filters.field)
    if (filters.location) query = query.eq('location', filters.location)

    const { data, error } = await query
    if (error) throw error

    return { listings: (data ?? []).map(toListing) }
  } catch (error) {
    console.warn('[listings] Supabase query failed:', error)
    return { listings: [], error: 'The internship board is temporarily unavailable.' }
  }
}

