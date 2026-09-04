# Supabase Send Email Hook with Resend

This guide configures Supabase Auth to send confirmation, password-reset, magic-link, invite, and email-change messages through a Supabase Edge Function and Resend.

Use this when Supabase custom SMTP is unavailable or unreliable on the current plan.

## What this setup does

```text
Orevalo login, signup, or reset-password request
        |
        v
Supabase Auth
        |
        v
Send Email Hook
        |
        v
Supabase Edge Function
        |
        v
Resend API
        |
        v
The user's inbox
```

The existing Next.js Resend sender is used for application emails and opportunity alerts. Supabase Auth cannot call that server module directly, so the Auth Hook needs its own Edge Function and its own Resend secret.

## Before you start

You need:

- A Supabase project.
- A Resend account.
- A verified sending domain in Resend, preferably `orevalo.com`.
- The Supabase CLI installed and logged in, or access to the Supabase dashboard Edge Function editor.
- A deployed Orevalo URL, such as `https://orevalo.vercel.app`.

Do not paste API keys into this document, Git, browser code, or `NEXT_PUBLIC_` variables.

## 1. Verify the Resend sending domain

In Resend:

1. Open **Domains**.
2. Add `orevalo.com`.
3. Add the DNS records Resend provides at your domain host.
4. Wait until the domain status is **Verified**.
5. Create an API key with permission to send emails.

Use a sender matching the verified domain:

```text
Orevalo <hello@orevalo.com>
```

Do not use a random Gmail address in the `from` field. Resend may reject it or mark messages as suspicious.

## 2. Create the Edge Function

From the repository root, create a Supabase function named `send-auth-email`:

```bash
supabase functions new send-auth-email
```

The generated function will be under:

```text
supabase/functions/send-auth-email/index.ts
```

If you use the Supabase dashboard editor instead, create an Edge Function with the same name and paste the code below into its entry file.

## 3. Add the function code

Replace the generated `index.ts` with this code:

```ts
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const FROM = Deno.env.get('EMAIL_FROM') ?? 'Orevalo <hello@orevalo.com>'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

type EmailAction = 'signup' | 'recovery' | 'invite' | 'email_change'

type HookPayload = {
  user: {
    email?: string
    user_metadata?: Record<string, unknown>
  }
  email_data: {
    token_hash: string
    redirect_to: string
    email_action_type: EmailAction
    site_url: string
  }
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

function messageFor(action: EmailAction, confirmationUrl: string, firstName: string, siteUrl: string) {
  const safeName = escapeHtml(firstName || 'there')
  const subject = {
    signup: 'Confirm your Orevalo email',
    recovery: 'Reset your Orevalo password',
    invite: 'You have been invited to Orevalo',
    email_change: 'Confirm your new Orevalo email',
  }[action]

  const heading = action === 'recovery' ? 'Reset your password' : 'Confirm your email'
  const intro = action === 'recovery'
    ? 'We received a request to choose a new password for your Orevalo account.'
    : `Welcome, ${safeName}. Use the button below to continue with your Orevalo account.`
  const button = action === 'recovery' ? 'Reset my password' : 'Confirm my email'

  const html = `
<div style="margin:0;padding:32px 16px;background:#FAF3EC;font-family:Georgia,'Times New Roman',serif;color:#2C1A0E">
  <div style="max-width:480px;margin:0 auto;overflow:hidden;background:#fff;border-radius:12px">
    <div style="padding:32px 32px 24px;background:#2C1A0E;text-align:center">
      <span style="color:#FAF3EC;font-size:24px;font-weight:bold;letter-spacing:.5px">Orevalo</span>
    </div>
    <div style="padding:40px 32px 24px">
      <p style="margin:0 0 10px;color:#C4622D;font-size:13px;font-weight:bold;letter-spacing:.08em;text-transform:uppercase">Account security</p>
      <h1 style="margin:0 0 16px;color:#2C1A0E;font-size:24px;line-height:1.3">${heading}</h1>
      <p style="margin:0;color:#2C1A0E;font-size:15px;line-height:1.7">${intro}</p>
    </div>
    <div style="padding:8px 32px 40px;text-align:center">
      <a href="${confirmationUrl}" style="display:inline-block;padding:14px 32px;border-radius:8px;background:#C4622D;color:#fff;font-size:15px;font-weight:bold;text-decoration:none">${button}</a>
      <p style="margin:24px 0 0;color:#8A7568;font-size:12px;line-height:1.6">If you did not request this, you can safely ignore this email.</p>
    </div>
    <div style="padding:24px 32px;background:#FAF3EC;text-align:center">
      <p style="margin:0;color:#8A7568;font-size:11px;line-height:1.5"><a href="${siteUrl}/privacy" style="color:#8A7568">Privacy Policy</a> · <a href="${siteUrl}/terms" style="color:#8A7568">Terms</a></p>
    </div>
  </div>
</div>`.trim()

  const text = `${heading}\n\n${intro}\n\nContinue: ${confirmationUrl}\n\nIf you did not request this, you can safely ignore this email.\n\nOrevalo — Study smart. Build your future.`
  return { subject, html, text }
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 })
  if (!RESEND_API_KEY) return new Response('RESEND_API_KEY is not configured', { status: 500 })

  try {
    const payload = await request.json() as HookPayload
    const email = payload.user.email
    const emailData = payload.email_data

    if (!email || !emailData?.token_hash || !emailData.redirect_to) {
      return new Response('Invalid Supabase Auth payload', { status: 400 })
    }

    const confirmationUrl = `${emailData.redirect_to}?token_hash=${encodeURIComponent(emailData.token_hash)}&type=${encodeURIComponent(emailData.email_action_type)}`
    const firstName = String(payload.user.user_metadata?.full_name ?? payload.user.user_metadata?.name ?? '').split(/\s+/)[0]
    const payloadSiteUrl = emailData.site_url || 'https://orevalo.com'
    const message = messageFor(emailData.email_action_type, confirmationUrl, firstName, payloadSiteUrl)

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: FROM, to: [email], ...message }),
    })

    if (!resendResponse.ok) {
      console.error('Resend rejected the message:', resendResponse.status, await resendResponse.text())
      return new Response('Email provider rejected the message', { status: 502 })
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Auth email hook failed:', error)
    return new Response('Unable to send auth email', { status: 500 })
  }
})
```

### Important code note

The example builds the confirmation URL from Supabase's `redirect_to` and `token_hash`. Keep those values from the incoming Hook payload. Do not replace them with a hard-coded local or production URL, because the same function should work for local, preview, and production environments.

Before deploying, remove the unused `createClient` import if your editor reports it as unused. The function does not need a Supabase client to send through Resend.

## 4. Add Edge Function secrets

Set the secrets in Supabase, not in the Next.js `.env.local` file:

```bash
supabase secrets set \
  RESEND_API_KEY=re_your_resend_key \
  EMAIL_FROM="Orevalo <hello@orevalo.com>"
```

To verify names without printing secret values:

```bash
supabase secrets list
```

The same names must be available to the deployed function. The Vercel `RESEND_API_KEY` and the Supabase Edge Function `RESEND_API_KEY` are separate environments.

## 5. Deploy the function

From the repository root:

```bash
supabase functions deploy send-auth-email
```

If the CLI asks for a project link:

```bash
supabase link --project-ref YOUR_PROJECT_REF
```

The project ref is the first part of your Supabase URL. For example:

```text
https://wrrmfwqvchzdbulcltzl.supabase.co
```

has the project ref `wrrmfwqvchzdbulcltzl`.

## 6. Configure the Supabase Send Email Hook

In the Supabase dashboard:

1. Open the project.
2. Go to **Authentication → Hooks**.
3. Find **Send Email**.
4. Choose the deployed `send-auth-email` Edge Function.
5. Save the Hook.
6. Confirm that it is enabled for Auth email events.

The exact dashboard labels may vary slightly by Supabase dashboard version. Choose the Edge Function option, not a random public URL.

Once enabled, the Hook owns delivery for Auth messages. You do not need working custom SMTP for these messages.

## 7. Configure Auth URLs

In **Authentication → URL Configuration**, set the Site URL to the production URL:

```text
https://orevalo.vercel.app
```

Add these redirect URLs:

```text
https://orevalo.vercel.app/reset-password
https://orevalo.vercel.app/auth/callback
http://localhost:3000/reset-password
http://localhost:3000/auth/callback
```

If the custom domain is live, also add:

```text
https://orevalo.com/reset-password
https://orevalo.com/auth/callback
```

Keep **Confirm email** enabled under **Authentication → Providers → Email**.

## 8. Test password recovery

1. Deploy the latest Orevalo app to Vercel.
2. Open `/login`.
3. Choose **Forgot your password?**
4. Enter a test account email.
5. Confirm the Edge Function logs show a successful request.
6. Confirm Resend shows the email as delivered.
7. Click **Reset my password**.
8. Confirm the browser opens Orevalo at `/reset-password`.
9. Enter a new password.
10. Sign in with the new password.

Test with an account you control. Do not use a real user's address while debugging.

View function logs with:

```bash
supabase functions logs send-auth-email
```

## 9. Test every Auth email type

The Hook can receive different `email_action_type` values:

| Type | Trigger | Expected message |
| --- | --- | --- |
| `signup` | New email/password signup | Confirm your Orevalo email |
| `recovery` | Forgot password | Reset your Orevalo password |
| `invite` | Admin invitation | You have been invited to Orevalo |
| `email_change` | Email address change | Confirm your new Orevalo email |

Google OAuth does not normally need a password-reset email. Google verifies the account through Google during OAuth.

## Troubleshooting

### No email arrives

Check all of these:

- The Edge Function is deployed to the correct Supabase project.
- `RESEND_API_KEY` exists in Supabase Edge Function secrets.
- The Resend domain is verified.
- `EMAIL_FROM` uses the verified domain.
- Resend logs show the request.
- Supabase Function logs show a `200` response.
- The recipient checked spam and promotions folders.

### Supabase says the Hook failed

Usually this means the function returned a non-2xx response. Check:

- The incoming payload contains `user.email` and `email_data`.
- The Resend key is valid.
- The function returned `200` after Resend accepted the message.
- The function was deployed after the latest code change.

### The button opens the wrong domain

Do not hard-code `localhost` into the function. Check Supabase **URL Configuration** and the `site_url` value in the Hook payload.

### The reset link says it is invalid

Make sure the function uses the supplied `token_hash`, `email_action_type`, and `redirect_to` values. Do not use the old `{{ .ConfirmationURL }}` syntax inside the Edge Function. That syntax belongs to the standard Supabase email-template editor.

### Emails are sent twice

Do not keep a working SMTP delivery path and a Hook delivery path active for the same Auth event. Disable the old custom SMTP workflow once the Hook is verified, then test again.

## Security checklist

- Never commit `RESEND_API_KEY`.
- Never prefix the Resend key with `NEXT_PUBLIC_`.
- Never log the full Hook payload, token hash, confirmation URL, or API key.
- Use a verified Resend domain.
- Keep email confirmation enabled.
- Keep the function response fast; Auth waits for the Hook.
- Rotate any key that was pasted into chat, committed, or exposed in a screenshot.
