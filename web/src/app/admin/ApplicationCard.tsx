'use client'

import { useState, useTransition } from 'react'
import { setApplicationStatus } from './application-actions'
import type { LeaderApplicationRow } from '@/lib/supabase/types'

const NEXT_STATUS: { value: LeaderApplicationRow['status']; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'reviewing', label: 'Reviewing' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
]

const TONE: Record<LeaderApplicationRow['status'], string> = {
  new: 'bg-clay/12 text-clay',
  reviewing: 'bg-[#326eb4]/12 text-[#326eb4]',
  accepted: 'bg-moss/12 text-moss',
  rejected: 'bg-ink/8 text-muted',
}

export default function ApplicationCard({
  application,
}: {
  application: LeaderApplicationRow
}) {
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState(application.status)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function change(next: LeaderApplicationRow['status']) {
    setError(null)
    const previous = status
    setStatus(next) // optimistic — reverted below if the write fails
    startTransition(async () => {
      const result = await setApplicationStatus(application.id, next)
      if (!result.ok) {
        setStatus(previous)
        setError(result.message)
      }
    })
  }

  const days = Math.floor(
    (Date.now() - Date.parse(application.created_at)) / 86_400_000,
  )
  // The programme page promises a reply within 7 days.
  const overdue = status === 'new' && days > 7

  return (
    <li className={`rounded-2xl border bg-white ${overdue ? 'border-[#e07a50]' : 'border-line'}`}>
      <div className="flex flex-wrap items-start justify-between gap-4 p-5 max-sm:p-4">
        <div className="min-w-0">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-0.5 text-[0.68rem] font-bold tracking-[0.06em] uppercase ${TONE[status]}`}
            >
              {status}
            </span>
            {overdue && (
              <span className="rounded-full bg-[#8b3a1a]/10 px-2.5 py-0.5 text-[0.68rem] font-bold tracking-[0.06em] text-[#8b3a1a] uppercase">
                {days} days waiting
              </span>
            )}
          </div>
          <h3 className="font-display text-[1.1rem] font-semibold">{application.full_name}</h3>
          <p className="mt-1 text-[0.85rem] text-muted">
            {application.course}, {application.year} · {application.university} ·{' '}
            {application.country}
          </p>
          <a
            href={`mailto:${application.email}`}
            className="text-[0.85rem] font-semibold text-clay no-underline hover:underline"
          >
            {application.email}
          </a>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          <label className="sr-only" htmlFor={`status-${application.id}`}>
            Application status
          </label>
          <select
            id={`status-${application.id}`}
            value={status}
            disabled={pending}
            onChange={(e) => change(e.target.value as LeaderApplicationRow['status'])}
            className="cursor-pointer rounded-xl border-[1.5px] border-line bg-white px-3 py-2 text-[0.85rem] font-semibold outline-none focus-visible:border-clay disabled:opacity-60"
          >
            {NEXT_STATUS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="cursor-pointer text-[0.82rem] font-semibold text-muted hover:text-clay"
          >
            {open ? 'Hide answers' : 'Read answers'}
          </button>
        </div>
      </div>

      {error && (
        <p role="alert" className="px-5 pb-4 text-[0.85rem] font-semibold text-[#8b3a1a]">
          {error}
        </p>
      )}

      {open && (
        <div className="border-t border-line px-5 py-4 max-sm:px-4">
          <Answer label="How connected are they?" value={application.connection} />
          <Answer
            label="Biggest challenge students at their university face"
            value={application.challenge}
          />
          <Answer label="Why they want to be a Founding Student Leader" value={application.why} />
          {application.referral && <Answer label="How they heard about Orevalo" value={application.referral} />}
          <p className="mt-3 text-[0.78rem] text-muted">
            Submitted{' '}
            {new Date(application.created_at).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>
      )}
    </li>
  )
}

function Answer({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-4 last:mb-0">
      <p className="mb-1 text-[0.72rem] font-bold tracking-[0.08em] text-muted uppercase">
        {label}
      </p>
      <p className="text-[0.9rem] leading-[1.7] whitespace-pre-wrap">{value}</p>
    </div>
  )
}
