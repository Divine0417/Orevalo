'use client'

import { useState, useTransition } from 'react'
import { updateSavedStatus } from '../auth-actions'
import type { ApplicationStatus } from '@/lib/supabase/types'

const STATUSES: { value: ApplicationStatus; label: string }[] = [
  { value: 'interested', label: 'Interested' },
  { value: 'preparing', label: 'Preparing' },
  { value: 'applied', label: 'Applied' },
  { value: 'interviewing', label: 'Interviewing' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
]

export default function SavedStatusSelect({ id, initialStatus }: { id: string; initialStatus: ApplicationStatus }) {
  const [status, setStatus] = useState(initialStatus)
  const [error, setError] = useState('')
  const [pending, startTransition] = useTransition()

  function change(next: ApplicationStatus) {
    const previous = status
    setStatus(next)
    setError('')
    startTransition(async () => {
      const result = await updateSavedStatus(id, next)
      if (!result.ok) {
        setStatus(previous)
        setError(result.message)
      }
    })
  }

  return (
    <label className="flex shrink-0 flex-col gap-1.5 max-sm:w-full">
      <span className="text-[0.68rem] font-bold tracking-[0.08em] text-muted uppercase">Status</span>
      <select
        value={status}
        onChange={(event) => change(event.target.value as ApplicationStatus)}
        disabled={pending}
        aria-label="Application status"
        className="rounded-full border-[1.5px] border-line bg-cream px-3.5 py-2 text-[0.8rem] font-semibold text-ink outline-none transition-colors focus-visible:border-clay disabled:opacity-60 max-sm:w-full"
      >
        {STATUSES.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
      {error && <span role="alert" className="text-[0.72rem] text-[#8b3a1a]">{error}</span>}
    </label>
  )
}
