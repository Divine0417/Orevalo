'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/browser'
import { authInput, authLabel } from '@/components/AuthShell'

type Status = 'loading' | 'ready' | 'saving' | 'done' | 'error'

export default function ResetPasswordForm() {
  const [status, setStatus] = useState<Status>('loading')
  const [message, setMessage] = useState('')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')

  useEffect(() => {
    let active = true
    const supabase = createClient()

    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return
      if (error || !data.session) {
        setStatus('error')
        setMessage('This reset link is invalid or has expired. Request a new one from the sign-in page.')
        return
      }
      setStatus('ready')
    })

    return () => {
      active = false
    }
  }, [])

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (password.length < 8) {
      setStatus('error')
      setMessage('Use at least 8 characters for your password.')
      return
    }
    if (password !== confirmation) {
      setStatus('error')
      setMessage('The passwords do not match.')
      return
    }

    setStatus('saving')
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setStatus('error')
      setMessage('We could not update your password. Request a new reset link and try again.')
      return
    }

    setStatus('done')
  }

  if (status === 'loading') {
    return <p className="text-[0.9rem] text-muted">Checking your reset link...</p>
  }

  if (status === 'error' && !password && !confirmation) {
    return (
      <div className="flex flex-col gap-5">
        <p role="alert" className="rounded-xl border border-[#e07a50] bg-[#fff0eb] px-4 py-3 text-[0.88rem] leading-[1.6] text-[#8b3a1a]">
          {message}
        </p>
        <Link href="/login" className="text-center text-[0.85rem] font-semibold text-clay no-underline">
          Request another reset link
        </Link>
      </div>
    )
  }

  if (status === 'done') {
    return (
      <div className="flex flex-col gap-5">
        <p className="rounded-xl border border-moss/40 bg-moss/10 px-4 py-3 text-[0.9rem] leading-[1.6] text-moss">
          Your password has been updated. You can now sign in with the new password.
        </p>
        <Link href="/login" className="rounded-full bg-clay px-6 py-3.5 text-center font-bold text-white no-underline hover:bg-clay-dark">
          Sign in
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      {status === 'error' && (
        <p role="alert" className="rounded-xl border border-[#e07a50] bg-[#fff0eb] px-4 py-3 text-[0.88rem] leading-[1.6] text-[#8b3a1a]">
          {message}
        </p>
      )}
      <label className="flex flex-col gap-2">
        <span className={authLabel}>New password</span>
        <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" required className={authInput} />
      </label>
      <label className="flex flex-col gap-2">
        <span className={authLabel}>Confirm new password</span>
        <input type="password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} autoComplete="new-password" required className={authInput} />
      </label>
      <button type="submit" disabled={status === 'saving'} className="mt-1 cursor-pointer rounded-full bg-clay px-6 py-3.5 font-bold text-white hover:bg-clay-dark disabled:cursor-not-allowed disabled:opacity-60">
        {status === 'saving' ? 'Updating...' : 'Update password'}
      </button>
    </form>
  )
}
