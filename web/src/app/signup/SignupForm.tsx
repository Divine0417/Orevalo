'use client'

import { useActionState } from 'react'
import { signUp, type AuthResult } from '@/app/auth-actions'
import { authInput, authLabel } from '@/components/AuthShell'
import { Mailbox } from '@/components/icons'

export default function SignupForm() {
  const [state, action, pending] = useActionState<AuthResult | null, FormData>(signUp, null)

  if (state?.ok && state.needsConfirmation) {
    return (
      <div className="text-center">
        <span className="mb-4 flex justify-center text-[2.5rem] text-clay">
          <Mailbox />
        </span>
        <h2 className="mb-2 font-display text-xl font-semibold">Check your inbox</h2>
        <p className="text-[0.9rem] leading-[1.7] text-muted">
          We sent you a link to confirm your email. Click it and you are in.
        </p>
      </div>
    )
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      <label className="flex flex-col gap-2">
        <span className={authLabel}>Full name</span>
        <input
          name="full_name"
          required
          autoComplete="name"
          autoFocus
          placeholder="e.g. Amara Okonkwo"
          className={authInput}
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className={authLabel}>Email</span>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className={authInput}
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className={authLabel}>Password</span>
        <input
          type="password"
          name="password"
          required
          minLength={8}
          autoComplete="new-password"
          className={authInput}
        />
        <span className="text-[0.78rem] text-muted">At least 8 characters.</span>
      </label>

      {state && !state.ok && (
        <p
          role="alert"
          className="rounded-xl border border-[#e07a50] bg-[#fff0eb] px-4 py-3 text-[0.88rem] text-[#8b3a1a]"
        >
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-1 cursor-pointer rounded-full bg-clay px-6 py-3.5 font-bold text-white transition-colors hover:bg-clay-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? 'Creating account...' : 'Create account'}
      </button>
    </form>
  )
}
