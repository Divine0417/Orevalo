'use server'

import { revalidatePath } from 'next/cache'
import { createClient, getCurrentUser } from '@/lib/supabase/server'
import { FIELDS, LOCATIONS } from '@/lib/listings'
import { COUNTRIES, DEGREE_LEVELS, SCHOLARSHIP_FIELDS } from '@/lib/scholarships'
import { duplicateKey, parseCsv, type ImportKind } from '@/lib/opportunity-import'
import type { ActionResult } from './actions'
import type { ListingInsert, ScholarshipInsert } from '@/lib/supabase/types'

export async function importOpportunities(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const { isAdmin } = await getCurrentUser()
  if (!isAdmin) return { ok: false, message: 'You must be an admin to import opportunities.' }

  const kind = String(formData.get('kind') ?? '') as ImportKind
  const file = formData.get('file')
  if (!['listing', 'scholarship'].includes(kind) || !(file instanceof File)) return { ok: false, message: 'Choose a type and CSV file.' }
  const rows = parseCsv(await file.text())
  if (!rows.length) return { ok: false, message: 'The CSV has no data rows.' }

  const supabase = await createClient()
  const seen = new Set<string>()
  const values: Array<ListingInsert | ScholarshipInsert> = []
  for (const row of rows) {
    const key = duplicateKey(kind, row)
    if (seen.has(key)) continue
    seen.add(key)
    if (!row.apply_url || !/^https?:\/\//i.test(row.apply_url)) return { ok: false, message: 'Every row needs an http(s) apply_url.' }
    if (kind === 'listing') {
      if (!row.company || !row.title || !FIELDS.includes(row.field as never) || !LOCATIONS.includes(row.location as never) || !/^\d{4}-\d{2}-\d{2}$/.test(row.deadline)) return { ok: false, message: 'Listing rows need company, title, valid field, location and YYYY-MM-DD deadline.' }
      values.push({ company: row.company, title: row.title, location: row.location, field: row.field, deadline: row.deadline, apply_url: row.apply_url, slug: `${row.company}-${row.title}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80), published: false, description: row.description || null, source_name: row.source_name || null, source_url: row.source_url || null, verified_at: row.verified_at ? `${row.verified_at}T00:00:00.000Z` : null })
    } else {
      if (!row.name || !row.funder || !COUNTRIES.includes(row.country as never) || !SCHOLARSHIP_FIELDS.includes(row.field as never) || !DEGREE_LEVELS.includes(row.degree_level as never)) return { ok: false, message: 'Scholarship rows need name, funder, valid country, field and degree_level.' }
      values.push({ name: row.name, funder: row.funder, country: row.country, field: row.field, degree_level: row.degree_level, deadline: row.deadline || null, eligibility: row.eligibility || null, apply_url: row.apply_url, slug: row.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80), published: false, description: row.description || null, source_name: row.source_name || null, source_url: row.source_url || null, verified_at: row.verified_at ? `${row.verified_at}T00:00:00.000Z` : null })
    }
  }

  const { error } = await supabase.from(kind === 'listing' ? 'listings' : 'scholarships').insert(values)
  if (error) return { ok: false, message: error.code === '23505' ? 'The import contains an existing slug or duplicate opportunity.' : error.message }
  revalidatePath('/admin')
  revalidatePath(kind === 'listing' ? '/admin/listings' : '/admin/scholarships')
  return { ok: true }
}
