'use client'

import { useSearchParams } from 'next/navigation'
import { useActionState, useState } from 'react'
import { requestPasswordReset, signIn, type AuthResult } from '@/app/auth-actions'
import { authInput, authLabel } from '@/components/AuthShell'

export default function LoginForm() {
  const params = useSearchParams()
  const next = params.get('next') ?? '/account'
  const [state, action, pending] = useActionState<AuthResult | null, FormData>(signIn, null)
  const [resetting, setResetting] = useState(false)

  if (resetting) return <ResetForm onBack={() => setResetting(false)} />

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="next" value={next} />

      <label className="flex flex-col gap-2">
        <span className={authLabel}>Email</span>
        <input type="email" name="email" required autoComplete="email" autoFocus className={authInput} />
      </label>

      <label className="flex flex-col gap-2">
        <span className={authLabel}>Password</span>
        <input
          type="password"
          name="password"
          required
          autoComplete="current-password"
          className={authInput}
        />
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
        {pending ? 'Signing in...' : 'Sign in'}
      </button>

      <button
        type="button"
        onClick={() => setResetting(true)}
        className="cursor-pointer text-[0.85rem] font-semibold text-muted hover:text-clay"
      >
        Forgot your password?
      </button>
    </form>
  )
}

function ResetForm({ onBack }: { onBack: () => void }) {
  const [state, action, pending] = useActionState<AuthResult | null, FormData>(
    requestPasswordReset,
    null,
  )

  if (state?.ok) {
    return (
      <div>
        <p className="mb-5 rounded-xl border border-moss/40 bg-moss/10 px-4 py-3 text-[0.9rem] leading-[1.6] text-moss">
          If that address has an account, a reset link is on its way.
        </p>
        <button
          type="button"
          onClick={onBack}
          className="cursor-pointer text-[0.85rem] font-semibold text-clay"
        >
          Back to sign in
        </button>
      </div>
    )
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      <label className="flex flex-col gap-2">
        <span className={authLabel}>Email</span>
        <input type="email" name="email" required autoFocus className={authInput} />
      </label>

      {state && !state.ok && (
        <p role="alert" className="text-[0.88rem] font-semibold text-[#8b3a1a]">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="cursor-pointer rounded-full bg-clay px-6 py-3.5 font-bold text-white transition-colors hover:bg-clay-dark disabled:opacity-60"
      >
        {pending ? 'Sending...' : 'Send reset link'}
      </button>
      <button
        type="button"
        onClick={onBack}
        className="cursor-pointer text-[0.85rem] font-semibold text-muted hover:text-clay"
      >
        Back to sign in
      </button>
    </form>
  )
}
