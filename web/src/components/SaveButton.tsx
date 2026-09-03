'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { toggleSaved } from '@/app/auth-actions'
import { Check, Star } from './icons'

/**
 * Save an opportunity to the signed-in student's list.
 *
 * Signed out, this is a link to sign in rather than a disabled control or a
 * modal — the board works perfectly well without an account, so a save attempt
 * should feel like an invitation, not a wall.
 */
export default function SaveButton({
  kind,
  slug,
  initialSaved,
  signedIn,
}: {
  kind: 'listing' | 'scholarship'
  slug: string
  initialSaved: boolean
  signedIn: boolean
}) {
  const router = useRouter()
  const [saved, setSaved] = useState(initialSaved)
  const [pending, startTransition] = useTransition()

  if (!signedIn) {
    return (
      <button
        type="button"
        onClick={() => router.push('/login?next=' + encodeURIComponent(`/${kind}s`))}
        title="Sign in to save this"
        className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border-[1.5px] border-line px-3.5 py-2 text-[0.8rem] font-semibold text-muted transition-colors hover:border-clay hover:text-clay"
      >
        <Star size="0.95em" /> Save
      </button>
    )
  }

  function toggle() {
    const previous = saved
    setSaved(!previous) // optimistic; reverted below if the write fails
    startTransition(async () => {
      const result = await toggleSaved(kind, slug)
      if (!result.ok) setSaved(previous)
    })
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-pressed={saved}
      className={`inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border-[1.5px] px-3.5 py-2 text-[0.8rem] font-semibold transition-colors disabled:opacity-60 ${
        saved
          ? 'border-moss bg-moss/10 text-moss'
          : 'border-line text-muted hover:border-clay hover:text-clay'
      }`}
    >
      {saved ? <Check size="0.95em" /> : <Star size="0.95em" />}
      {saved ? 'Saved' : 'Save'}
    </button>
  )
}
