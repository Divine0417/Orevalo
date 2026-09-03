'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient, getCurrentUser } from '@/lib/supabase/server'
import { siteUrl } from '@/lib/email'
import { isApplicationStatus, type ApplicationStatus } from '@/lib/supabase/types'
import { safeNext } from '@/lib/auth'
import { PASSWORD_RESET_PATH } from '@/lib/auth'

export type AuthResult =
  | { ok: true; needsConfirmation?: boolean }
  | { ok: false; message: string }

export async function signUp(_prev: AuthResult | null, formData: FormData): Promise<AuthResult> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const password = String(formData.get('password') ?? '')
  const fullName = String(formData.get('full_name') ?? '').trim()

  if (!fullName) return { ok: false, message: 'Please tell us your name.' }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return { ok: false, message: 'That does not look like an email address.' }
  }
  if (password.length < 8) {
    return { ok: false, message: 'Use at least 8 characters for your password.' }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Read by the handle_new_user trigger from 0001 to populate the profile.
      data: { full_name: fullName },
      emailRedirectTo: `${siteUrl()}/account`,
    },
  })

  if (error) {
    // Supabase returns the same shape whether or not the address exists, which
    // is what we want — surfacing "already registered" enumerates accounts.
    return {
      ok: false,
      message:
        error.message.toLowerCase().includes('password')
          ? error.message
          : 'We could not create that account. Try signing in instead.',
    }
  }

  // With email confirmation switched on in Supabase there is no session yet.
  const needsConfirmation = !data.session

  if (needsConfirmation) return { ok: true, needsConfirmation: true }

  revalidatePath('/', 'layout')
  redirect('/account')
}

export async function signIn(_prev: AuthResult | null, formData: FormData): Promise<AuthResult> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const password = String(formData.get('password') ?? '')
  const next = safeNext(String(formData.get('next') ?? '/account'))

  if (!email || !password) return { ok: false, message: 'Email and password are both required.' }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  // Deliberately vague: distinguishing "no such user" from "wrong password"
  // tells an attacker which addresses are registered.
  if (error) return { ok: false, message: 'Those credentials were not accepted.' }

  revalidatePath('/', 'layout')
  redirect(next)
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}

export async function requestPasswordReset(
  _prev: AuthResult | null,
  formData: FormData,
): Promise<AuthResult> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  if (!email) return { ok: false, message: 'Enter your email address.' }

  const supabase = await createClient()
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl()}${PASSWORD_RESET_PATH}`,
  })

  // Always report success: whether an address is registered is not public.
  return { ok: true }
}

/* ------------------------------------------------------ saved opportunities -- */

export async function toggleSaved(
  kind: 'listing' | 'scholarship',
  slug: string,
): Promise<{ ok: true; saved: boolean } | { ok: false; message: string }> {
  const { user } = await getCurrentUser()
  if (!user) return { ok: false, message: 'Sign in to save opportunities.' }

  const supabase = await createClient()

  const { data: existing } = await supabase
    .from('saved_opportunities')
    .select('id')
    .eq('user_id', user.id)
    .eq('kind', kind)
    .eq('slug', slug)
    .maybeSingle()

  if (existing) {
    const { error } = await supabase.from('saved_opportunities').delete().eq('id', existing.id)
    if (error) return { ok: false, message: error.message }
    revalidatePath('/account')
    return { ok: true, saved: false }
  }

  const { error } = await supabase
    .from('saved_opportunities')
    .insert({ user_id: user.id, kind, slug })
  if (error) return { ok: false, message: error.message }

  revalidatePath('/account')
  return { ok: true, saved: true }
}

export async function updateSavedStatus(
  id: string,
  status: ApplicationStatus,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const { user } = await getCurrentUser()
  if (!user) return { ok: false, message: 'Sign in to update application status.' }
  if (!isApplicationStatus(status)) {
    return { ok: false, message: 'Choose a valid application status.' }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('saved_opportunities')
    .update({ status })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { ok: false, message: 'We could not update that status.' }
  revalidatePath('/account')
  return { ok: true }
}

export async function updateSavedNotes(
  id: string,
  notes: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const { user } = await getCurrentUser()
  if (!user) return { ok: false, message: 'Sign in to update your notes.' }

  const trimmed = notes.trim()
  if (trimmed.length > 2000) return { ok: false, message: 'Notes must be 2,000 characters or fewer.' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('saved_opportunities')
    .update({ notes: trimmed || null })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { ok: false, message: 'We could not save that note.' }
  revalidatePath('/account')
  return { ok: true }
}

export async function updateProfile(
  _prev: AuthResult | null,
  formData: FormData,
): Promise<AuthResult> {
  const { user } = await getCurrentUser()
  if (!user) return { ok: false, message: 'You are not signed in.' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: String(formData.get('full_name') ?? '').trim() || null,
      university: String(formData.get('university') ?? '').trim() || null,
      course: String(formData.get('course') ?? '').trim() || null,
      year_of_study: String(formData.get('year_of_study') ?? '').trim() || null,
      country: String(formData.get('country') ?? '').trim() || null,
    })
    .eq('id', user.id)

  if (error) return { ok: false, message: error.message }

  revalidatePath('/account')
  return { ok: true }
}
