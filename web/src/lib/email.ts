import 'server-only'

/**
 * Transactional email.
 *
 * Uses Resend's REST API directly rather than its SDK — one fetch call, one
 * less dependency to keep current.
 *
 * Degrades honestly: with no RESEND_API_KEY the app runs single opt-in and says
 * so in the admin dashboard, rather than telling students to check an inbox for
 * a message that was never sent.
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY
const FROM = process.env.EMAIL_FROM ?? 'Orevalo <hello@orevalo.com>'

export const isMailerConfigured = Boolean(RESEND_API_KEY)

export function siteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
  )
}

type SendArgs = { to: string; subject: string; html: string; text: string }

async function send({ to, subject, html, text }: SendArgs): Promise<boolean> {
  if (!RESEND_API_KEY) return false

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: FROM, to, subject, html, text }),
    })

    if (!res.ok) {
      console.error('[email] resend rejected the send:', res.status, await res.text())
      return false
    }
    return true
  } catch (error) {
    console.error('[email] send failed:', error)
    return false
  }
}

export async function sendOpportunityAlertEmail(args: {
  to: string
  subject: string
  text: string
  html: string
}) {
  return send(args)
}

/**
 * Asks a new subscriber to prove they own the address.
 *
 * The unsubscribe link is included even here — someone who was signed up by a
 * third party should be able to leave without confirming first.
 */
export async function sendConfirmationEmail(args: {
  to: string
  confirmToken: string
  unsubscribeToken: string
}) {
  const base = siteUrl()
  const confirmUrl = `${base}/confirm?token=${args.confirmToken}`
  const unsubscribeUrl = `${base}/unsubscribe?token=${args.unsubscribeToken}`

  return send({
    to: args.to,
    subject: 'Confirm your Orevalo opportunity emails',
    text: [
      'One click and you are in.',
      '',
      `Confirm: ${confirmUrl}`,
      '',
      'We send new internships and scholarships open to African students, as we curate them.',
      'The internship board itself is free and open with no account: ' + `${base}/internships`,
      '',
      `Did not sign up? Ignore this, or remove yourself: ${unsubscribeUrl}`,
      'Orevalo — Study smart. Build your future.',
    ].join('\n'),
    html: `
<div style="font-family:'Plus Jakarta Sans',Arial,sans-serif;background:#FAF3EC;padding:32px 16px;color:#2C1A0E">
  <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:20px;padding:32px">
    <p style="font-size:22px;font-weight:700;color:#C4622D;margin:0 0 20px">Orevalo</p>
    <h1 style="font-size:22px;margin:0 0 12px">One click and you are in</h1>
    <p style="font-size:15px;line-height:1.7;color:#6B4C32;margin:0 0 24px">
      Confirm your email and we will send you new internships and scholarships open to African
      students, as we curate them.
    </p>
    <a href="${confirmUrl}"
       style="display:inline-block;background:#C4622D;color:#fff;text-decoration:none;padding:14px 28px;border-radius:100px;font-weight:700">
      Confirm my email
    </a>
    <p style="font-size:13px;line-height:1.6;color:#6B4C32;margin:28px 0 0">
      The internship board is free and open without an account —
      <a href="${base}/internships" style="color:#C4622D">browse it here</a>.
    </p>
    <p style="font-size:12px;line-height:1.6;color:#9b8b7e;margin:20px 0 0;border-top:1px solid #E8DDD3;padding-top:16px">
      Did not sign up? <a href="${unsubscribeUrl}" style="color:#9b8b7e">Remove this address</a>.
    </p>
  </div>
</div>`.trim(),
  })
}
