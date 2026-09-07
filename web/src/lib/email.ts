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

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;',
    }
    return entities[character]
  })
}

/** Sends the branded welcome email once an account is created. */
export async function sendWelcomeEmail(args: { to: string; firstName: string }) {
  const base = siteUrl()
  const firstName = escapeHtml(args.firstName || 'there')
  const accountUrl = `${base}/account`

  return send({
    to: args.to,
    subject: 'Welcome to Orevalo',
    text: [
      `Welcome, ${args.firstName || 'there'}`,
      '',
      'You are now part of a growing community of African students building their future, one opportunity at a time.',
      '',
      'Browse internships and jobs, find scholarships, and save opportunities you want to come back to.',
      '',
      `Open your account: ${accountUrl}`,
      '',
      'Orevalo — Study smart. Build your future.',
    ].join('\n'),
    html: `
<div style="margin:0;padding:32px 16px;background:#FAF3EC;font-family:Georgia,'Times New Roman',serif;color:#2C1A0E">
  <div style="max-width:480px;margin:0 auto;overflow:hidden;background:#fff;border-radius:12px">
    <div style="padding:32px 32px 24px;background:#2C1A0E;text-align:center">
      <span style="color:#FAF3EC;font-size:24px;font-weight:bold;letter-spacing:.5px">Orevalo</span>
    </div>
    <div style="padding:40px 32px 24px">
      <h1 style="margin:0 0 16px;color:#2C1A0E;font-size:22px;line-height:1.3">Welcome, ${firstName}</h1>
      <p style="margin:0 0 20px;color:#2C1A0E;font-size:15px;line-height:1.6">You are now part of a growing community of African students building their future, one opportunity at a time.</p>
      <p style="margin:0 0 8px;color:#2C1A0E;font-size:15px;font-weight:bold;line-height:1.6">Here is what you can do right now:</p>
    </div>
    <div style="padding:0 32px 24px;color:#2C1A0E;font-size:14px;line-height:1.5">
      <p style="padding:10px 0;margin:0;border-bottom:1px solid #FAF3EC">→ Browse internships and jobs curated for students like you</p>
      <p style="padding:10px 0;margin:0;border-bottom:1px solid #FAF3EC">→ Find scholarships that match your field of study</p>
      <p style="padding:10px 0;margin:0">→ Save opportunities you want to come back to</p>
    </div>
    <div style="padding:8px 32px 40px;text-align:center">
      <a href="${accountUrl}" style="display:inline-block;padding:14px 36px;border-radius:8px;background:#C4622D;color:#fff;font-size:15px;font-weight:bold;text-decoration:none">Go to your account</a>
    </div>
    <div style="padding:0 32px 32px;border-top:1px solid #FAF3EC;text-align:center">
      <p style="margin:24px 0 0;color:#C4622D;font-size:14px;font-style:italic;font-weight:bold">Study smart. Build your future.</p>
    </div>
    <div style="padding:24px 32px;background:#FAF3EC;text-align:center">
      <p style="margin:0;color:#8a7568;font-size:11px;line-height:1.5">You are receiving this email because you created an Orevalo account.<br><a href="${base}/privacy" style="color:#8a7568">Privacy Policy</a> · <a href="${base}/terms" style="color:#8a7568">Terms</a></p>
    </div>
  </div>
</div>`.trim(),
  })
}

export function sendPasswordResetRequestedEmail(args: { to: string }) {
  return sendFormReceiptEmail({
    ...args,
    firstName: 'there',
    subject: 'Password reset requested — Orevalo',
    heading: 'Reset request received',
    message:
      'We received a request to reset the password for this email address. If it belongs to an Orevalo account, Supabase has sent a separate password reset link. If you did not make this request, you can safely ignore this message.',
    nextUrl: '/login',
    nextLabel: 'Return to sign in',
  })
}

export function sendPasswordChangedEmail(args: { to: string; firstName?: string }) {
  return sendFormReceiptEmail({
    to: args.to,
    firstName: args.firstName ?? 'there',
    subject: 'Your Orevalo password was changed',
    heading: 'Password updated',
    message:
      'Your Orevalo password was changed successfully. If you did not make this change, contact us immediately at hello@orevalo.com.',
    nextUrl: '/account',
    nextLabel: 'Open your account',
  })
}

async function sendFormReceiptEmail(args: {
  to: string
  firstName: string
  subject: string
  heading: string
  message: string
  nextUrl: string
  nextLabel: string
}) {
  const base = siteUrl()
  const firstName = escapeHtml(args.firstName || 'there')
  const heading = escapeHtml(args.heading)
  const message = escapeHtml(args.message)
  const nextUrl = `${base}${args.nextUrl}`

  return send({
    to: args.to,
    subject: args.subject,
    text: [
      `Hi ${args.firstName || 'there'},`,
      '',
      args.message,
      '',
      `${args.nextLabel}: ${nextUrl}`,
      '',
      'Orevalo — Study smart. Build your future.',
    ].join('\n'),
    html: `
<div style="margin:0;padding:32px 16px;background:#FAF3EC;font-family:Georgia,'Times New Roman',serif;color:#2C1A0E">
  <div style="max-width:480px;margin:0 auto;overflow:hidden;background:#fff;border-radius:12px">
    <div style="padding:32px 32px 24px;background:#2C1A0E;text-align:center">
      <span style="color:#FAF3EC;font-size:24px;font-weight:bold;letter-spacing:.5px">Orevalo</span>
    </div>
    <div style="padding:40px 32px 24px">
      <p style="margin:0 0 10px;color:#C4622D;font-size:13px;font-weight:bold;letter-spacing:.08em;text-transform:uppercase">Submission received</p>
      <h1 style="margin:0 0 16px;color:#2C1A0E;font-size:24px;line-height:1.3">${heading}, ${firstName}</h1>
      <p style="margin:0;color:#2C1A0E;font-size:15px;line-height:1.7">${message}</p>
    </div>
    <div style="padding:8px 32px 40px;text-align:center">
      <a href="${nextUrl}" style="display:inline-block;padding:14px 32px;border-radius:8px;background:#C4622D;color:#fff;font-size:15px;font-weight:bold;text-decoration:none">${escapeHtml(args.nextLabel)}</a>
    </div>
    <div style="padding:24px 32px;background:#FAF3EC;text-align:center">
      <p style="margin:0;color:#8A7568;font-size:11px;line-height:1.5"><a href="${base}/privacy" style="color:#8A7568">Privacy Policy</a> · <a href="${base}/terms" style="color:#8A7568">Terms</a></p>
    </div>
  </div>
</div>`.trim(),
  })
}

export function sendLeaderApplicationReceipt(args: { to: string; firstName: string }) {
  return sendFormReceiptEmail({
    ...args,
    subject: 'We received your Student Leader application',
    heading: 'Application received',
    message: 'Thank you for applying to the Founding Student Leaders Program. We review every application and will get back to you within 7 days.',
    nextUrl: '/student-leaders',
    nextLabel: 'View the program',
  })
}

export function sendResearchReceipt(args: { to: string; firstName: string }) {
  return sendFormReceiptEmail({
    ...args,
    subject: 'Thank you for helping shape Orevalo',
    heading: 'Thank you',
    message: 'Your research responses have been received and will help shape what Orevalo builds for African students.',
    nextUrl: '/',
    nextLabel: 'Return to Orevalo',
  })
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
