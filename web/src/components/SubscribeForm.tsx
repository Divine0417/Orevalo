'use client'

import { useState } from 'react'
import { ArrowRight, Bell, Mailbox, Rocket, Seedling } from './icons'
import { subscribe } from '@/app/subscribe-action'

type Status = 'idle' | 'sending' | 'error'

export default function SubscribeForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [needsConfirmation, setNeedsConfirmation] = useState(false)

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('sending')

    // The server action writes to Supabase and notifies Formspree, so the
    // publishable key never has to be trusted with the subscriber list.
    const form = e.currentTarget
    const honeypot = (form.elements.namedItem('company') as HTMLInputElement | null)?.value ?? ''
    const result = await subscribe(email, 'landing', honeypot)

    if (result.ok) {
      setStatus('idle')
      setNeedsConfirmation(result.needsConfirmation)
      setDone(true)
    } else {
      setError(result.message)
      setStatus('error')
    }
  }

  if (done) return <ThankYouPanel needsConfirmation={needsConfirmation} />

  return (
    <form onSubmit={submit} className="relative mx-auto w-full max-w-[560px]">
      <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label>
          Company (leave blank)
          <input type="text" name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="mb-3 flex flex-wrap justify-center gap-3">
        <input
          type="email"
          name="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email address"
          aria-label="Email address"
          className="min-w-[240px] flex-1 rounded-full border-none bg-white/95 px-5 py-4 text-ink outline-none placeholder:text-[#9b8b7e] focus-visible:ring-2 focus-visible:ring-white"
        />
        <button
          type="submit"
          disabled={status === 'sending'}
          className="inline-flex cursor-pointer items-center gap-2.5 rounded-full bg-white px-8 py-4 font-bold whitespace-nowrap text-clay transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {status === 'sending' ? 'Signing you up...' : 'Send me opportunities'} <ArrowRight />
        </button>
      </div>

      {status === 'error' ? (
        <p role="alert" className="mt-1 text-[0.85rem] font-semibold text-white">
          {error || 'That did not go through. Please email hello@orevalo.com and we will add you.'}
        </p>
      ) : (
        <p className="mt-1 text-[0.8rem] text-white/65">
          No spam, no account. Unsubscribe in one click.
        </p>
      )}
    </form>
  )
}

/** Replaces the form in place — no full-screen dialog to scroll or trap focus. */
function ThankYouPanel({ needsConfirmation }: { needsConfirmation: boolean }) {
  const items = [
    {
      Icon: Mailbox,
      title: 'Check your email',
      body: 'A welcome message is on its way from hello@orevalo.com.',
    },
    {
      Icon: Bell,
      title: 'Follow @OrevaloAI',
      body: 'We post real opportunities and build updates every week.',
    },
    {
      Icon: Rocket,
      title: 'First to know',
      body: 'We send new internships and scholarships as we curate them.',
    },
  ]

  return (
    <div className="mx-auto w-full max-w-[560px] rounded-3xl bg-white/12 p-8 text-left max-sm:p-6">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex text-[2rem] text-white">
          <Seedling />
        </span>
        <div>
          <p className="font-display text-2xl font-semibold text-white">
            {needsConfirmation ? 'Check your inbox.' : 'You are in.'}
          </p>
          <p className="text-[0.9rem] text-white/75">
            {needsConfirmation
              ? 'Click the link we just sent to confirm your email.'
              : 'Part of a growing community of African students.'}
          </p>
        </div>
      </div>

      <ul className="flex flex-col gap-3">
        {items.map(({ Icon, title, body }) => (
          <li key={title} className="flex items-start gap-3">
            <span className="mt-0.5 flex shrink-0 text-white">
              <Icon />
            </span>
            <span className="text-[0.88rem] text-white/90">
              <strong className="font-semibold text-white">{title}</strong> — {body}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
