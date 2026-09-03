'use server'

import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { isMailerConfigured, sendConfirmationEmail } from '@/lib/email'

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xpqgljzy'

export type SubscribeResult =
  | { ok: true; needsConfirmation: boolean }
  | { ok: false; message: string }

/**
 * In-memory signup throttle.
 *
 * Anyone may insert into `subscribers` — they have to, since students are not
 * logged in — so without this one script could fill the table. Per-process and
 * therefore best-effort: it resets on deploy and does not span instances. It
 * raises the cost of abuse rather than eliminating it; a serious problem wants
 * a captcha or an edge rate limiter.
 */
const RATE_LIMIT = { windowMs: 60_000, max: 5 }
const attempts = new Map<string, number[]>()

function rateLimited(ip: string) {
  const now = Date.now()
  const recent = (attempts.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT.windowMs)
  recent.push(now)
  attempts.set(ip, recent)

  if (attempts.size > 5000) attempts.clear() // crude ceiling on memory growth
  return recent.length > RATE_LIMIT.max
}

export async function subscribe(
  email: string,
  source = 'landing',
  honeypot = '',
): Promise<SubscribeResult> {
  // Bots fill in every field they find; humans never see this one. Report
  // success so the bot does not learn to adapt.
  if (honeypot.trim()) return { ok: true, needsConfirmation: false }

  const trimmed = email.trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed)) {
    return { ok: false, message: 'That does not look like an email address.' }
  }

  const headerList = await headers()
  const ip = (headerList.get('x-forwarded-for') ?? 'unknown').split(',')[0].trim()

  if (rateLimited(ip)) {
    return { ok: false, message: 'Too many attempts just now. Please try again in a minute.' }
  }

  let needsConfirmation = false

  if (isSupabaseConfigured) {
    try {
      const supabase = await createClient()

      // Single opt-in when no mailer is configured: marking rows unconfirmed
      // when no confirmation email can be sent would strand every subscriber.
      const { data, error } = await supabase
        .from('subscribers')
        .insert({ email: trimmed, source, confirmed: !isMailerConfigured, source_ip: ip })
        .select('confirm_token, unsubscribe_token')
        .maybeSingle()

      // 23505 = already subscribed. That is a success from the student's point
      // of view; never make them feel it failed.
      if (error && error.code !== '23505') {
        console.error('[subscribe] insert failed:', error.code, error.message)
        if (error.code !== 'PGRST205') {
          return { ok: false, message: 'We could not save that just now. Please try again.' }
        }
        console.warn('[subscribe] subscribers table missing — run migrations 0002 and 0003')
      }

      if (data && isMailerConfigured) {
        const sent = await sendConfirmationEmail({
          to: trimmed,
          confirmToken: data.confirm_token as string,
          unsubscribeToken: data.unsubscribe_token as string,
        })
        needsConfirmation = sent

        // If the send failed the row would sit unconfirmed forever, so fall
        // back to single opt-in rather than losing them.
        if (!sent) {
          await supabase.from('subscribers').update({ confirmed: true }).eq('email', trimmed)
        }
      }
    } catch (error) {
      console.error('[subscribe] unexpected error:', error)
      return { ok: false, message: 'We could not save that just now. Please try again.' }
    }
  }

  // Team notification. A Formspree outage must never lose a subscriber, so its
  // failure is logged and swallowed.
  try {
    await fetch(FORMSPREE_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ email: trimmed, _subject: 'New opportunity-email signup — Orevalo' }),
    })
  } catch (error) {
    console.warn('[subscribe] formspree notification failed (subscriber saved):', error)
  }

  return { ok: true, needsConfirmation }
}
