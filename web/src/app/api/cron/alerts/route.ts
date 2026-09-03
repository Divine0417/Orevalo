import { NextRequest, NextResponse } from 'next/server'
import { sendOpportunityAlertEmail, isMailerConfigured, siteUrl } from '@/lib/email'
import { createAdminClient } from '@/lib/supabase/admin'
import { matchesAlert } from '@/lib/alerts'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Opportunity = {
  slug: string
  kind: 'listing' | 'scholarship'
  title: string
  funder: string
  deadline: string | null
  field: string
  location: string
  apply_url: string
  created_at: string
}

type Recipient = {
  user_id: string | null
  subscriber_id: string | null
  email: string
  fields: string[]
  locations: string[]
  degree_levels: string[]
  frequency: 'daily' | 'weekly' | 'off'
  deadline_reminders: boolean
}

const CRON_SECRET = process.env.CRON_SECRET ?? ''

function daysUntil(iso: string, today = new Date()) {
  const deadline = Date.parse(`${iso}T00:00:00Z`)
  const start = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
  return Math.round((deadline - start) / 86_400_000)
}

function renderEmail(opportunities: Opportunity[], reason: string) {
  const base = siteUrl()
  const lines = opportunities.map((item) =>
    `${item.title} — ${item.funder}\nDeadline: ${item.deadline ?? 'Rolling'}\nApply: ${item.apply_url}`,
  )
  return {
    subject: reason === 'new' ? 'New opportunities from Orevalo' : 'Orevalo deadline reminder',
    text: `Here are opportunities from Orevalo:\n\n${lines.join('\n\n')}\n\nBrowse more: ${base}/internships`,
    html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#2C1A0E"><h1 style="color:#C4622D">Orevalo opportunities</h1><p>Here are opportunities matching your preferences.</p>${opportunities.map((item) => `<article style="border-top:1px solid #E8DDD3;padding:16px 0"><h2>${item.title}</h2><p>${item.funder} · Deadline: ${item.deadline ?? 'Rolling'}</p><a href="${item.apply_url}" style="color:#C4622D;font-weight:700">Apply now</a></article>`).join('')}<p><a href="${base}/account">Manage alert preferences</a></p></div>`,
  }
}

async function claimAndSend(admin: ReturnType<typeof createAdminClient>, recipient: Recipient, opportunities: Opportunity[], reason: 'new' | 'deadline_7' | 'deadline_1') {
  const pending: Opportunity[] = []
  for (const opportunity of opportunities) {
    const filter = recipient.user_id
      ? { user_id: recipient.user_id, subscriber_id: null }
      : { user_id: null, subscriber_id: recipient.subscriber_id }
    const { data } = await admin.from('alert_deliveries').select('id').match({ ...filter, kind: opportunity.kind, slug: opportunity.slug, reason }).maybeSingle()
    if (!data) pending.push(opportunity)
  }
  if (pending.length === 0) return 0

  const email = renderEmail(pending, reason)
  if (!(await sendOpportunityAlertEmail({ to: recipient.email, ...email }))) return 0

  const rows = pending.map((item) => ({
    user_id: recipient.user_id,
    subscriber_id: recipient.subscriber_id,
    kind: item.kind,
    slug: item.slug,
    reason,
  }))
  const { error } = await admin.from('alert_deliveries').insert(rows)
  if (error) console.error('[alerts] ledger insert failed:', error.message)
  return pending.length
}

export async function GET(request: NextRequest) {
  if (!CRON_SECRET || request.headers.get('authorization') !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!isMailerConfigured) return NextResponse.json({ error: 'RESEND_API_KEY is not configured' }, { status: 503 })

  try {
    const admin = createAdminClient()
    const today = new Date()
    const since = new Date(today.getTime() - 7 * 86_400_000).toISOString()
    const [{ data: listings }, { data: scholarships }, { data: subscribers }, { data: preferences }] = await Promise.all([
      admin.from('listings').select('slug, company, title, location, field, deadline, apply_url, created_at').eq('published', true),
      admin.from('scholarships').select('slug, funder, name, country, field, degree_level, deadline, apply_url, created_at').eq('published', true),
      admin.from('subscribers').select('id, email').eq('confirmed', true).eq('unsubscribed', false),
      admin.from('alert_preferences').select('*').neq('frequency', 'off'),
    ])

    const opportunities: Opportunity[] = [
      ...(listings ?? []).map((item) => ({ ...item, kind: 'listing' as const, title: item.title, funder: item.company, location: item.location, degree_level: '' })),
      ...(scholarships ?? []).map((item) => ({ ...item, kind: 'scholarship' as const, title: item.name, funder: item.funder, location: item.country })),
    ]
    const newItems = opportunities.filter((item) => item.created_at >= since)
    let sent = 0

    for (const subscriber of subscribers ?? []) {
      sent += await claimAndSend(admin, { user_id: null, subscriber_id: subscriber.id, email: subscriber.email, fields: [], locations: [], degree_levels: [], frequency: 'daily', deadline_reminders: false }, newItems, 'new')
    }
    for (const preference of preferences ?? []) {
      const profile = await admin.from('profiles').select('email').eq('id', preference.user_id).maybeSingle()
      if (!profile.data?.email) continue
      const recipient: Recipient = { ...preference, user_id: preference.user_id, subscriber_id: null, email: profile.data.email }
      const cadenceMatches = recipient.frequency === 'daily' || today.getUTCDay() === 1
      if (cadenceMatches) sent += await claimAndSend(admin, recipient, newItems.filter((item) => matchesAlert(item, recipient)), 'new')
      if (recipient.deadline_reminders) {
        for (const reason of ['deadline_7', 'deadline_1'] as const) {
          const due = opportunities.filter((item) => item.deadline && daysUntil(item.deadline, today) === (reason === 'deadline_7' ? 7 : 1) && matchesAlert(item, recipient))
          sent += await claimAndSend(admin, recipient, due, reason)
        }
      }
    }

    return NextResponse.json({ ok: true, sent })
  } catch (error) {
    console.error('[alerts] cron failed:', error)
    return NextResponse.json({ error: 'Alert job failed' }, { status: 500 })
  }
}
