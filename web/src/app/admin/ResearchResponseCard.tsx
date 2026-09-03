'use client'

import { useState } from 'react'
import type { ResearchResponseRow } from '@/lib/supabase/types'

/** Field names that add nothing when shown raw alongside the promoted columns. */
const HIDDEN_KEYS = new Set(['first_name', 'email', 'country'])

function humanise(key: string) {
  return key.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase())
}

function renderValue(value: unknown) {
  if (Array.isArray(value)) return value.map((v) => String(v).replace(/_/g, ' ')).join(', ')
  return String(value ?? '').replace(/_/g, ' ')
}

export default function ResearchResponseCard({ response }: { response: ResearchResponseRow }) {
  const [open, setOpen] = useState(false)

  const entries = Object.entries(response.answers ?? {}).filter(
    ([key, value]) => !HIDDEN_KEYS.has(key) && value !== '' && value != null,
  )

  // The most important question in the survey, per the form's own copy.
  const struggle = response.answers?.biggest_struggle as string | undefined

  return (
    <li className="rounded-2xl border border-line bg-white">
      <div className="flex flex-wrap items-start justify-between gap-4 p-5 max-sm:p-4">
        <div className="min-w-0">
          <h3 className="font-display text-[1.05rem] font-semibold">
            {response.first_name}
            {response.field_of_study && (
              <span className="ml-2 text-[0.85rem] font-normal text-muted">
                {response.field_of_study}
              </span>
            )}
          </h3>
          <p className="mt-0.5 text-[0.85rem] text-muted">
            {response.country}
            {response.status && ` · ${response.status.replace(/_/g, ' ')}`}
          </p>
          <a
            href={`mailto:${response.email}`}
            className="text-[0.85rem] font-semibold text-clay no-underline hover:underline"
          >
            {response.email}
          </a>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="shrink-0 cursor-pointer text-[0.82rem] font-semibold text-muted hover:text-clay"
        >
          {open ? 'Hide' : 'Read all answers'}
        </button>
      </div>

      {struggle && !open && (
        <p className="border-t border-line px-5 py-3 text-[0.88rem] leading-[1.6] text-muted italic max-sm:px-4">
          &ldquo;{struggle.length > 180 ? `${struggle.slice(0, 180)}...` : struggle}&rdquo;
        </p>
      )}

      {open && (
        <dl className="border-t border-line px-5 py-4 max-sm:px-4">
          {entries.map(([key, value]) => (
            <div key={key} className="mb-4 last:mb-0">
              <dt className="mb-1 text-[0.72rem] font-bold tracking-[0.08em] text-muted uppercase">
                {humanise(key)}
              </dt>
              <dd className="text-[0.9rem] leading-[1.7] whitespace-pre-wrap">
                {renderValue(value)}
              </dd>
            </div>
          ))}
          <p className="mt-3 text-[0.78rem] text-muted">
            Submitted{' '}
            {new Date(response.created_at).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </dl>
      )}
    </li>
  )
}
