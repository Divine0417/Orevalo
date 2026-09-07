'use server'

import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { isMailerConfigured, sendLeaderApplicationReceipt, sendResearchReceipt } from '@/lib/email'
import {
  FORM_CONNECTIONS,
  FORM_COUNTRIES,
  FORM_STATUSES,
  FORM_YEARS,
  validEmail,
  withinLength,
} from '@/lib/form-validation'

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xpqgljzy'
const MAX = { short: 160, long: 4000 }
const attempts = new Map<string, number[]>()

export type FormResult = { ok: true } | { ok: false; message: string }

/**
 * Notifies the team without ever being allowed to fail the submission.
 *
 * Supabase is the record; Formspree is a convenience ping. If the ping fails
 * the student must not be told their application was lost.
 */
async function notify(subject: string, payload: Record<string, unknown>) {
  try {
    const response = await fetch(FORMSPREE_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ ...payload, _subject: subject }),
    })
    if (!response.ok) console.warn('[forms] formspree rejected notification:', response.status)
  } catch (error) {
    console.warn('[forms] formspree notification failed (submission saved):', error)
  }
}

function required(formData: FormData, keys: string[]) {
  for (const key of keys) {
    if (!String(formData.get(key) ?? '').trim()) return key
  }
  return null
}

function text(formData: FormData, key: string, limit = MAX.short) {
  const value = String(formData.get(key) ?? '').trim()
  return withinLength(value, limit) ? value : null
}

async function rateLimited() {
  const headerList = await headers()
  const ip = (headerList.get('x-forwarded-for') ?? 'unknown').split(',')[0].trim()
  const now = Date.now()
  const recent = (attempts.get(ip) ?? []).filter((time) => now - time < 60_000)
  recent.push(now)
  attempts.set(ip, recent)
  if (attempts.size > 5000) attempts.clear()
  return recent.length > 5
}

function persistenceUnavailable() {
  return {
    ok: false as const,
    message: 'This form is temporarily unavailable. Please try again later.',
  }
}

/* ------------------------------------------------- student leader applies -- */

export async function submitLeaderApplication(
  _prev: FormResult | null,
  formData: FormData,
): Promise<FormResult> {
  const missing = required(formData, [
    'full_name',
    'email',
    'country',
    'university',
    'course',
    'year',
    'connection',
    'challenge',
    'why',
  ])
  if (missing) return { ok: false, message: 'Please fill in every required field.' }

  if (await rateLimited()) return { ok: false, message: 'Too many attempts. Please try again in a minute.' }

  const fullName = text(formData, 'full_name')
  const country = text(formData, 'country')
  const university = text(formData, 'university')
  const course = text(formData, 'course')
  const year = text(formData, 'year')
  const connection = text(formData, 'connection')
  const challenge = text(formData, 'challenge', MAX.long)
  const why = text(formData, 'why', MAX.long)
  const email = String(formData.get('email')).trim().toLowerCase()

  if (
    !fullName ||
    !country ||
    !university ||
    !course ||
    !year ||
    !connection ||
    !challenge ||
    !why ||
    !validEmail(email)
  ) {
    return { ok: false, message: 'Please check the length and format of your answers.' }
  }

  if (!FORM_COUNTRIES.has(country) || !FORM_YEARS.has(year) || !FORM_CONNECTIONS.has(connection)) {
    return { ok: false, message: 'Please choose valid options from the form.' }
  }

  const values = {
    full_name: fullName,
    email,
    country,
    university,
    course,
    year,
    connection,
    challenge,
    why,
    referral: text(formData, 'referral') || null,
  }

  if (!isSupabaseConfigured && process.env.NODE_ENV !== 'development') {
    return persistenceUnavailable()
  }

  if (isSupabaseConfigured) {
    try {
      const supabase = await createClient()
      const { error } = await supabase.from('leader_applications').insert(values)
      if (error) {
        console.error('[forms] leader application insert failed:', error.code, error.message)
        return { ok: false, message: 'We could not save that just now. Please try again.' }
      }
    } catch (error) {
      console.error('[forms] unexpected error:', error)
      return { ok: false, message: 'We could not save that just now. Please try again.' }
    }
  }

  await notify('New Student Leader application — Orevalo', values)
  if (isMailerConfigured) {
    await sendLeaderApplicationReceipt({ to: email, firstName: fullName.split(/\s+/)[0] ?? 'there' })
  }
  return { ok: true }
}

/* -------------------------------------------------------- research survey -- */

export async function submitResearchResponse(
  _prev: FormResult | null,
  formData: FormData,
): Promise<FormResult> {
  const missing = required(formData, ['first_name', 'email', 'country', 'biggest_struggle'])
  if (missing) return { ok: false, message: 'Please fill in every required field.' }

  if (await rateLimited()) return { ok: false, message: 'Too many attempts. Please try again in a minute.' }

  // Checkboxes share a name, so collect every value rather than the first.
  const answers: Record<string, unknown> = {}
  for (const key of new Set(formData.keys())) {
    const all = formData.getAll(key).map(String)
    answers[key] = all.length > 1 ? all : all[0]
  }

  const firstName = text(formData, 'first_name')
  const email = String(formData.get('email')).trim().toLowerCase()
  const country = text(formData, 'country')
  const status = text(formData, 'status') || null
  const fieldOfStudy = text(formData, 'field_of_study') || null
  const biggestStruggle = text(formData, 'biggest_struggle', MAX.long)

  if (!firstName || !validEmail(email) || !country || !biggestStruggle) {
    return { ok: false, message: 'Please check the length and format of your answers.' }
  }
  if (!FORM_COUNTRIES.has(country) || (status && !FORM_STATUSES.has(status))) {
    return { ok: false, message: 'Please choose valid options from the form.' }
  }

  const values = {
    first_name: firstName,
    email,
    country,
    status,
    field_of_study: fieldOfStudy,
    answers,
  }

  if (!isSupabaseConfigured && process.env.NODE_ENV !== 'development') {
    return persistenceUnavailable()
  }

  if (isSupabaseConfigured) {
    try {
      const supabase = await createClient()
      const { error } = await supabase.from('research_responses').insert(values)
      if (error) {
        console.error('[forms] research insert failed:', error.code, error.message)
        return { ok: false, message: 'We could not save that just now. Please try again.' }
      }
    } catch (error) {
      console.error('[forms] unexpected error:', error)
      return { ok: false, message: 'We could not save that just now. Please try again.' }
    }
  }

  await notify('New research response — Orevalo', { ...values, answers: undefined })
  if (isMailerConfigured) {
    await sendResearchReceipt({ to: email, firstName: firstName.split(/\s+/)[0] ?? 'there' })
  }
  return { ok: true }
}

