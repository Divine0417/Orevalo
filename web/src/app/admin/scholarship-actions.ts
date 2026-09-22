'use server'

import { revalidatePath } from 'next/cache'
import { createClient, getCurrentUser } from '@/lib/supabase/server'
import type { ActionResult } from './actions'
import { COUNTRIES, DEGREE_LEVELS, SCHOLARSHIP_FIELDS } from '@/lib/scholarships'
import { composeReviewUpdate, normalizeReviewStatus } from '@/lib/review-status'

type ScholarshipValues = {
  name: string
  funder: string
  country: string
  field: string
  degree_level: string
  deadline: string | null
  eligibility: string | null
  apply_url: string
  published: boolean
  description: string | null
  source_name: string | null
  source_url: string | null
  verified_at: string | null
  featured: boolean
}

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

function readForm(
  formData: FormData,
): { ok: true; values: ScholarshipValues } | { ok: false; error: string } {
  const name = String(formData.get('name') ?? '').trim()
  const funder = String(formData.get('funder') ?? '').trim()
  const country = String(formData.get('country') ?? '').trim()
  const field = String(formData.get('field') ?? '').trim()
  const degree_level = String(formData.get('degree_level') ?? '').trim()
  const deadlineRaw = String(formData.get('deadline') ?? '').trim()
  const eligibility = String(formData.get('eligibility') ?? '').trim()
  const apply_url = String(formData.get('apply_url') ?? '').trim()
  const published = formData.get('published') === 'on'
  const description = String(formData.get('description') ?? '').trim() || null
  const source_name = String(formData.get('source_name') ?? '').trim() || null
  const source_url = String(formData.get('source_url') ?? '').trim() || null
  const verifiedRaw = String(formData.get('verified_at') ?? '').trim()
  const verified_at = verifiedRaw ? `${verifiedRaw}T00:00:00.000Z` : null
  const featured = formData.get('featured') === 'on'

  if (!name || !funder) return { ok: false, error: 'Name and funder are both required.' }
  if (!COUNTRIES.includes(country as (typeof COUNTRIES)[number]))
    return { ok: false, error: 'Pick a valid country.' }
  if (!SCHOLARSHIP_FIELDS.includes(field as (typeof SCHOLARSHIP_FIELDS)[number]))
    return { ok: false, error: 'Pick a valid field.' }
  if (!DEGREE_LEVELS.includes(degree_level as (typeof DEGREE_LEVELS)[number]))
    return { ok: false, error: 'Pick a valid degree level.' }
  // Deadline is optional — many scholarships are rolling or vary by university.
  if (deadlineRaw && !/^\d{4}-\d{2}-\d{2}$/.test(deadlineRaw))
    return { ok: false, error: 'Deadline must be a valid date, or left blank if rolling.' }
  if (!/^https?:\/\//i.test(apply_url))
    return { ok: false, error: 'The apply link must start with http:// or https://' }
  if (source_url && !/^https?:\/\//i.test(source_url))
    return { ok: false, error: 'The source link must start with http:// or https://' }

  return {
    ok: true,
    values: {
      name,
      funder,
      country,
      field,
      degree_level,
      deadline: deadlineRaw || null,
      eligibility: eligibility || null,
      apply_url,
      published,
      description,
      source_name,
      source_url,
      verified_at,
      featured,
    },
  }
}

async function requireAdmin() {
  const { isAdmin } = await getCurrentUser()
  return isAdmin ? null : 'You are signed in but not an admin.'
}

function revalidate() {
  revalidatePath('/admin')
  revalidatePath('/admin/scholarships')
  revalidatePath('/scholarships')
}

export async function createScholarship(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const denied = await requireAdmin()
  if (denied) return { ok: false, message: denied }

  const parsed = readForm(formData)
  if (!parsed.ok) return { ok: false, message: parsed.error }

  const supabase = await createClient()
  const reviewStatus = normalizeReviewStatus({ published: parsed.values.published })
  const { error } = await supabase
    .from('scholarships')
    .insert({ ...parsed.values, status: reviewStatus, slug: slugify(parsed.values.name) })

  if (error) {
    return {
      ok: false,
      message:
        error.code === '23505' ? 'A scholarship with that name already exists.' : error.message,
    }
  }

  revalidate()
  return { ok: true }
}

export async function updateScholarship(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const denied = await requireAdmin()
  if (denied) return { ok: false, message: denied }

  const id = String(formData.get('id') ?? '')
  if (!id) return { ok: false, message: 'Missing scholarship id.' }

  const parsed = readForm(formData)
  if (!parsed.ok) return { ok: false, message: parsed.error }

  const supabase = await createClient()
  const reviewStatus = normalizeReviewStatus({ published: parsed.values.published })
  const { error } = await supabase
    .from('scholarships')
    .update({ ...parsed.values, status: reviewStatus, slug: slugify(parsed.values.name) })
    .eq('id', id)
  if (error) return { ok: false, message: error.message }

  revalidate()
  return { ok: true }
}

export async function setScholarshipPublished(
  id: string,
  published: boolean,
): Promise<ActionResult> {
  const denied = await requireAdmin()
  if (denied) return { ok: false, message: denied }

  const supabase = await createClient()
  const nextStatus = normalizeReviewStatus({ published })
  const updatePayload: Record<string, unknown> = {
    published,
    status: nextStatus,
    rejection_reason: published ? null : undefined,
  }

  if (published) {
    updatePayload.archived_at = null
  }

  const { error } = await supabase
    .from('scholarships')
    .update(updatePayload)
    .eq('id', id)
  if (error) return { ok: false, message: error.message }

  revalidate()
  return { ok: true }
}

export async function approveScholarship(id: string): Promise<ActionResult> {
  const denied = await requireAdmin()
  if (denied) return { ok: false, message: denied }

  const supabase = await createClient()
  const reviewUpdate = composeReviewUpdate('approved')
  const { error } = await supabase
    .from('scholarships')
    .update({ ...reviewUpdate, rejection_reason: null })
    .eq('id', id)
  if (error) return { ok: false, message: error.message }

  revalidate()
  return { ok: true }
}

export async function rejectScholarship(id: string, reason: string): Promise<ActionResult> {
  const denied = await requireAdmin()
  if (denied) return { ok: false, message: denied }

  const supabase = await createClient()
  const reviewUpdate = composeReviewUpdate('rejected', reason)
  const { error } = await supabase
    .from('scholarships')
    .update(reviewUpdate)
    .eq('id', id)
  if (error) return { ok: false, message: error.message }

  revalidate()
  return { ok: true }
}

export async function setScholarshipFeatured(id: string, featured: boolean): Promise<ActionResult> {
  const denied = await requireAdmin()
  if (denied) return { ok: false, message: denied }
  const supabase = await createClient()
  const { error } = await supabase.from('scholarships').update({ featured }).eq('id', id)
  if (error) return { ok: false, message: error.message }
  revalidate()
  return { ok: true }
}

export async function archiveScholarship(id: string): Promise<ActionResult> {
  const denied = await requireAdmin()
  if (denied) return { ok: false, message: denied }
  const supabase = await createClient()
  const { error } = await supabase.from('scholarships').update({ archived_at: new Date().toISOString(), published: false }).eq('id', id)
  if (error) return { ok: false, message: error.message }
  revalidate()
  return { ok: true }
}

export async function deleteScholarship(id: string): Promise<ActionResult> {
  const denied = await requireAdmin()
  if (denied) return { ok: false, message: denied }

  const supabase = await createClient()
  const { error } = await supabase.from('scholarships').delete().eq('id', id)
  if (error) return { ok: false, message: error.message }

  revalidate()
  return { ok: true }
}
