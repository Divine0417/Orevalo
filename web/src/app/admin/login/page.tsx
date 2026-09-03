'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense, useActionState } from 'react'
import { signIn, type ActionResult } from '../actions'

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}

function LoginForm() {
  const params = useSearchParams()
  const next = params.get('next') ?? '/admin'
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(signIn, null)

  return (
    <main className="flex min-h-screen items-center justify-center bg-cream px-5 py-12">
      <div className="w-full max-w-[420px]">
        <Link href="/" className="mb-8 block text-center font-display text-2xl font-semibold text-clay no-underline">
          Ore<span className="text-ink">valo</span>
        </Link>

        <div className="rounded-3xl border border-clay/10 bg-white p-8 shadow-[0_4px_24px_rgba(44,26,14,0.05)] max-sm:p-6">
          <h1 className="mb-1 font-display text-2xl font-semibold">Admin sign in</h1>
          <p className="mb-6 text-[0.9rem] text-muted">
            For the Orevalo team. Students do not need an account to use the board.
          </p>

          <form action={action} className="flex flex-col gap-4">
            <input type="hidden" name="next" value={next} />

            <label className="flex flex-col gap-2">
              <span className="text-[0.8rem] font-bold tracking-[0.08em] text-muted uppercase">
                Email
              </span>
              <input
                type="email"
                name="email"
                required
                autoComplete="email"
                autoFocus
                className="rounded-xl border-[1.5px] border-line bg-cream px-4 py-3 outline-none focus-visible:border-clay focus-visible:bg-white"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-[0.8rem] font-bold tracking-[0.08em] text-muted uppercase">
                Password
              </span>
              <input
                type="password"
                name="password"
                required
                autoComplete="current-password"
                className="rounded-xl border-[1.5px] border-line bg-cream px-4 py-3 outline-none focus-visible:border-clay focus-visible:bg-white"
              />
            </label>

            {state && !state.ok && (
              <p role="alert" className="rounded-xl border border-[#e07a50] bg-[#fff0eb] px-4 py-3 text-[0.88rem] text-[#8b3a1a]">
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
          </form>
        </div>

        <p className="mt-6 text-center text-[0.85rem] text-muted">
          <Link href="/" className="font-semibold text-clay no-underline">
            Back to orevalo.com
          </Link>
        </p>
      </div>
    </main>
  )
}
