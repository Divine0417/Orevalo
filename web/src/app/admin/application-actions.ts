'use server'

import { revalidatePath } from 'next/cache'
import { createClient, getCurrentUser } from '@/lib/supabase/server'
import type { ActionResult } from './actions'
import type { LeaderApplicationRow } from '@/lib/supabase/types'

export async function setApplicationStatus(
  id: string,
  status: LeaderApplicationRow['status'],
): Promise<ActionResult> {
  const { isAdmin } = await getCurrentUser()
  if (!isAdmin) return { ok: false, message: 'You are signed in but not an admin.' }

  const supabase = await createClient()
  const { error } = await supabase.from('leader_applications').update({ status }).eq('id', id)
  if (error) return { ok: false, message: error.message }

  revalidatePath('/admin/applications')
  revalidatePath('/admin')
  return { ok: true }
}
