'use server'

import { revalidatePath } from 'next/cache'
import { createClient, getCurrentUser } from '@/lib/supabase/server'

const FIELDS = new Set(['Engineering', 'Business', 'Technology', 'Finance', 'Healthcare'])
const LOCATIONS = new Set(['Lagos', 'Abuja', 'Remote', 'Other'])
const DEGREE_LEVELS = new Set(['Undergraduate', 'Masters', 'PhD'])
const FREQUENCIES = new Set(['off', 'daily', 'weekly'])
type Frequency = 'off' | 'daily' | 'weekly'

export type AlertResult = { ok: true } | { ok: false; message: string }

export async function saveAlertPreferences(
  _prev: AlertResult | null,
  formData: FormData,
): Promise<AlertResult> {
  const { user } = await getCurrentUser()
  if (!user) return { ok: false, message: 'Sign in to manage your alert preferences.' }

  const frequencyValue = String(formData.get('frequency') ?? '')
  const fields = formData.getAll('fields').map(String)
  const locations = formData.getAll('locations').map(String)
  const degreeLevels = formData.getAll('degree_levels').map(String)
  const deadlineReminders = formData.get('deadline_reminders') === 'on'

  if (!FREQUENCIES.has(frequencyValue)) return { ok: false, message: 'Choose a valid email frequency.' }
  if (fields.some((value) => !FIELDS.has(value))) return { ok: false, message: 'Choose valid fields.' }
  if (locations.some((value) => !LOCATIONS.has(value))) return { ok: false, message: 'Choose valid locations.' }
  if (degreeLevels.some((value) => !DEGREE_LEVELS.has(value))) return { ok: false, message: 'Choose valid degree levels.' }

  const supabase = await createClient()
  const { error } = await supabase.from('alert_preferences').upsert({
    user_id: user.id,
    fields,
    locations,
    degree_levels: degreeLevels,
    frequency: frequencyValue as Frequency,
    deadline_reminders: deadlineReminders,
  })

  if (error) {
    console.error('[alerts] preferences save failed:', error.code, error.message)
    return { ok: false, message: 'We could not save those preferences. Please try again.' }
  }

  revalidatePath('/account')
  return { ok: true }
}
