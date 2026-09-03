'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient, getCurrentUser } from '@/lib/supabase/server'
import { FIELDS, LOCATIONS } from '@/lib/listings'

export type ActionResult = { ok: true } | { ok: false; message: string }

/* ------------------------------------------------------------------ auth -- */

export async function signIn(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const next = String(formData.get('next') ?? '/admin')

  if (!email || !password) return { ok: false, message: 'Email and password are both required.' }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  // Deliberately vague: distinguishing "no such user" from "wrong password"
  // tells an attacker which emails are registered.
  if (error) return { ok: false, message: 'Those credentials were not accepted.' }

  redirect(next.startsWith('/admin') ? next : '/admin')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/admin/login')
}

/* -------------------------------------------------------------- listings -- */

function slugify(company: string, title: string) {
  return `${company}-${title}`
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

type ListingValues = {
  company: string
  title: string
  location: string
  field: string
  deadline: string
  apply_url: string
  published: boolean
}

/**
 * Shared validation so a bad row is rejected before it reaches the database.
 *
 * Returns a discriminated union on `ok` rather than an optional `values`, so a
 * caller cannot reach the values without having handled the error case first.
 */
function readListingForm(formData: FormData): { ok: true; values: ListingValues } | { ok: false; error: string } {
  const company = String(formData.get('company') ?? '').trim()
  const title = String(formData.get('title') ?? '').trim()
  const location = String(formData.get('location') ?? '').trim()
  const field = String(formData.get('field') ?? '').trim()
  const deadline = String(formData.get('deadline') ?? '').trim()
  const apply_url = String(formData.get('apply_url') ?? '').trim()
  const published = formData.get('published') === 'on'

  if (!company || !title) return { ok: false, error: 'Company and role title are both required.' }
  if (!FIELDS.includes(field as (typeof FIELDS)[number]))
    return { ok: false, error: 'Pick a valid field.' }
  if (!LOCATIONS.includes(location as (typeof LOCATIONS)[number]))
    return { ok: false, error: 'Pick a valid location.' }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(deadline))
    return { ok: false, error: 'Deadline must be a valid date.' }
  if (!/^https?:\/\//i.test(apply_url))
    return { ok: false, error: 'The apply link must start with http:// or https://' }

  return { ok: true, values: { company, title, location, field, deadline, apply_url, published } }
}

async function requireAdmin() {
  const { isAdmin } = await getCurrentUser()
  if (!isAdmin) {
    return 'You are signed in but not an admin. Ask an existing admin to promote your account.'
  }
  return null
}

export async function createListing(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const denied = await requireAdmin()
  if (denied) return { ok: false, message: denied }

  const parsed = readListingForm(formData)
  if (!parsed.ok) return { ok: false, message: parsed.error }

  const supabase = await createClient()
  const { error } = await supabase
    .from('listings')
    .insert({ ...parsed.values, slug: slugify(parsed.values.company, parsed.values.title) })

  if (error) {
    return {
      ok: false,
      message:
        error.code === '23505'
          ? 'A listing with that company and role already exists.'
          : error.message,
    }
  }

  revalidatePath('/admin')
  revalidatePath('/internships')
  return { ok: true }
}

export async function updateListing(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const denied = await requireAdmin()
  if (denied) return { ok: false, message: denied }

  const id = String(formData.get('id') ?? '')
  if (!id) return { ok: false, message: 'Missing listing id.' }

  const parsed = readListingForm(formData)
  if (!parsed.ok) return { ok: false, message: parsed.error }

  const supabase = await createClient()
  const { error } = await supabase.from('listings').update(parsed.values).eq('id', id)
  if (error) return { ok: false, message: error.message }

  revalidatePath('/admin')
  revalidatePath('/internships')
  return { ok: true }
}

export async function setPublished(id: string, published: boolean): Promise<ActionResult> {
  const denied = await requireAdmin()
  if (denied) return { ok: false, message: denied }

  const supabase = await createClient()
  const { error } = await supabase.from('listings').update({ published }).eq('id', id)
  if (error) return { ok: false, message: error.message }

  revalidatePath('/admin')
  revalidatePath('/internships')
  return { ok: true }
}

export async function deleteListing(id: string): Promise<ActionResult> {
  const denied = await requireAdmin()
  if (denied) return { ok: false, message: denied }

  const supabase = await createClient()
  const { error } = await supabase.from('listings').delete().eq('id', id)
  if (error) return { ok: false, message: error.message }

  revalidatePath('/admin')
  revalidatePath('/internships')
  return { ok: true }
}
