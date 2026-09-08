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
  degree_level: string
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
  unsubscribe_token?: string
}

const CRON_SECRET = process.env.CRON_SECRET ?? ''

function daysUntil(iso: string, today = new Date()) {
  const deadline = Date.parse(`${iso}T00:00:00Z`)
  const start = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
  return Math.round((deadline - start) / 86_400_000)
}

function renderEmail(opportunities: Opportunity[], reason: string, unsubscribeToken?: string) {
  const base = siteUrl()
  const unsubscribeUrl = unsubscribeToken
    ? `${base}/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}`
    : `${base}/account`
  const lines = opportunities.map((item) =>
    `${item.title} — ${item.funder}\nDeadline: ${item.deadline ?? 'Rolling'}\nApply: ${item.apply_url}`,
  )
  return {
    subject: reason === 'new' ? 'New opportunities from Orevalo' : 'Orevalo deadline reminder',
    text: `Here are opportunities from Orevalo:\n\n${lines.join('\n\n')}\n\nBrowse more: ${base}/internships\n\nManage email preferences: ${unsubscribeUrl}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#2C1A0E"><h1 style="color:#C4622D">Orevalo opportunities</h1><p>Here are opportunities matching your preferences.</p>${opportunities.map((item) => `<article style="border-top:1px solid #E8DDD3;padding:16px 0"><h2>${item.title}</h2><p>${item.funder} · Deadline: ${item.deadline ?? 'Rolling'}</p><a href="${item.apply_url}" style="color:#C4622D;font-weight:700">Apply now</a></article>`).join('')}<p><a href="${unsubscribeUrl}">${unsubscribeToken ? 'Unsubscribe from opportunity emails' : 'Manage alert preferences'}</a></p></div>`,
  }
}

async function claimAndSend(admin: ReturnType<typeof createAdminClient>, recipient: Recipient, opportunities: Opportunity[], reason: 'new' | 'deadline_7' | 'deadline_1') {
  const rows = opportunities.map((item) => ({
    user_id: recipient.user_id,
    subscriber_id: recipient.subscriber_id,
    kind: item.kind,
    slug: item.slug,
    reason,
  }))
  if (rows.length === 0) return 0

  // The unique ledger indexes make this insert an atomic claim. An overlapping
  // cron run receives no rows for opportunities already claimed by another run.
  const { data: claimed, error: claimError } = await admin
    .from('alert_deliveries')
    .upsert(rows, {
      onConflict: 'recipient_key,kind,slug,reason',
      ignoreDuplicates: true,
    })
    .select('id, kind, slug, reason')
  if (claimError) {
    console.error('[alerts] delivery claim failed:', claimError.message)
    return 0
  }

  const claimedKeys = new Set((claimed ?? []).map((row) => `${row.kind}:${row.slug}:${row.reason}`))
  const pending = opportunities.filter((item) => claimedKeys.has(`${item.kind}:${item.slug}:${reason}`))
  if (pending.length === 0) return 0

  const email = renderEmail(pending, reason, recipient.unsubscribe_token)
  if (await sendOpportunityAlertEmail({ to: recipient.email, ...email })) return pending.length

  const claimedIds = (claimed ?? []).filter((row) => claimedKeys.has(`${row.kind}:${row.slug}:${row.reason}`)).map((row) => row.id)
  if (claimedIds.length) await admin.from('alert_deliveries').delete().in('id', claimedIds)
  return 0
}

export async function GET(request: NextRequest) {
  if (!CRON_SECRET || request.headers.get('authorization') !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!isMailerConfigured) return NextResponse.json({ error: 'RESEND_API_KEY is not configured' }, { status: 503 })

  try {
    const admin = createAdminClient()
    const today = new Date()
    await Promise.all([
      admin.from('listings').update({ archived_at: today.toISOString(), published: false }).lt('deadline', today.toISOString().slice(0, 10)).is('archived_at', null),
      admin.from('scholarships').update({ archived_at: today.toISOString(), published: false }).lt('deadline', today.toISOString().slice(0, 10)).is('archived_at', null),
    ])
    const since = new Date(today.getTime() - 7 * 86_400_000).toISOString()
    const [listingsResult, scholarshipsResult, subscribersResult, preferencesResult] = await Promise.all([
      admin.from('listings').select('slug, company, title, location, field, deadline, apply_url, created_at').eq('published', true).gte('deadline', today.toISOString().slice(0, 10)),
      admin.from('scholarships').select('slug, funder, name, country, field, degree_level, deadline, apply_url, created_at').eq('published', true).or(`deadline.is.null,deadline.gte.${today.toISOString().slice(0, 10)}`),
      admin.from('subscribers').select('id, email, unsubscribe_token').eq('confirmed', true).eq('unsubscribed', false),
      admin.from('alert_preferences').select('*').neq('frequency', 'off'),
    ])

    const queryErrors = [listingsResult, scholarshipsResult, subscribersResult, preferencesResult]
    if (queryErrors.some((result) => result.error)) {
      console.error('[alerts] source query failed:', queryErrors.find((result) => result.error)?.error)
      return NextResponse.json({ error: 'Alert data could not be loaded' }, { status: 503 })
    }

    const opportunities: Opportunity[] = [
      ...(listingsResult.data ?? []).map((item) => ({ ...item, kind: 'listing' as const, title: item.title, funder: item.company, location: item.location, degree_level: 'Any' })),
      ...(scholarshipsResult.data ?? []).map((item) => ({ ...item, kind: 'scholarship' as const, title: item.name, funder: item.funder, location: item.country })),
    ]
    const newItems = opportunities.filter((item) => item.created_at >= since)
    let sent = 0

    for (const subscriber of subscribersResult.data ?? []) {
      sent += await claimAndSend(admin, { user_id: null, subscriber_id: subscriber.id, email: subscriber.email, fields: [], locations: [], degree_levels: [], frequency: 'daily', deadline_reminders: false, unsubscribe_token: subscriber.unsubscribe_token }, newItems, 'new')
    }
    for (const preference of preferencesResult.data ?? []) {
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
