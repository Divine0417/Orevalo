'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import ListingForm from './ListingForm'
import { archiveListing, deleteListing, setListingFeatured, setPublished } from './actions'
import { daysUntil, formatDeadline } from '@/lib/listings'
import type { ListingRow } from '@/lib/supabase/types'

export default function ListingRowItem({ listing }: { listing: ListingRow }) {
  const [editing, setEditing] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const remaining = daysUntil(listing.deadline)
  const expired = remaining < 0
  const closingSoon = !expired && remaining <= 14

  function run(fn: () => Promise<{ ok: boolean; message?: string }>) {
    setError(null)
    startTransition(async () => {
      const result = await fn()
      if (!result.ok) setError(result.message ?? 'Something went wrong.')
    })
  }

  if (editing) {
    return (
      <li className="rounded-2xl border border-clay/30 bg-white p-6 max-sm:p-4">
        <h3 className="mb-5 font-display text-lg font-semibold">
          Editing {listing.company} — {listing.title}
        </h3>
        <ListingForm listing={listing} onDone={() => setEditing(false)} />
      </li>
    )
  }

  return (
    <li
      className={`rounded-2xl border bg-white p-5 transition-opacity max-sm:p-4 ${
        listing.published ? 'border-line' : 'border-dashed border-muted/40 opacity-70'
      } ${pending ? 'opacity-50' : ''}`}
    >
      <div className="flex items-start justify-between gap-4 max-sm:flex-col">
        <div className="min-w-0">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span className="text-[0.85rem] font-bold text-clay">{listing.company}</span>
            <span className="rounded-full bg-cream-deep px-2.5 py-0.5 text-[0.68rem] font-bold tracking-[0.06em] text-muted uppercase">
              {listing.field}
            </span>
            {!listing.published && (
              <span className="rounded-full bg-ink/8 px-2.5 py-0.5 text-[0.68rem] font-bold tracking-[0.06em] text-muted uppercase">
                Hidden
              </span>
            )}
            {expired && (
              <span className="rounded-full bg-[#8b3a1a]/10 px-2.5 py-0.5 text-[0.68rem] font-bold tracking-[0.06em] text-[#8b3a1a] uppercase">
                Deadline passed
              </span>
            )}
            {closingSoon && (
              <span className="rounded-full bg-clay/10 px-2.5 py-0.5 text-[0.68rem] font-bold tracking-[0.06em] text-clay uppercase">
                {remaining === 0 ? 'Closes today' : `${remaining} days left`}
              </span>
            )}
            {listing.featured && <span className="rounded-full bg-moss/10 px-2.5 py-0.5 text-[0.68rem] font-bold text-moss uppercase">Featured</span>}
          </div>

          <h3 className="font-display text-[1.1rem] font-semibold">{listing.title}</h3>
          <p className="mt-1 text-[0.85rem] text-muted">
            {listing.location} · Deadline {formatDeadline(listing.deadline)}
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          {!listing.published && <Link href={`/internships/${listing.slug}?preview=1`} target="_blank" className="rounded-full border-[1.5px] border-line px-4 py-2 text-[0.82rem] font-semibold text-muted no-underline hover:border-clay hover:text-clay">Preview</Link>}
          <button
            type="button"
            disabled={pending}
            onClick={() => setEditing(true)}
            className="cursor-pointer rounded-full border-[1.5px] border-line px-4 py-2 text-[0.82rem] font-semibold text-muted transition-colors hover:border-clay hover:text-clay disabled:cursor-not-allowed"
          >
            Edit
          </button>
          <button type="button" disabled={pending} onClick={() => run(() => setListingFeatured(listing.id, !listing.featured))} className="cursor-pointer rounded-full border-[1.5px] border-line px-4 py-2 text-[0.82rem] font-semibold text-muted hover:border-clay hover:text-clay disabled:cursor-not-allowed">{listing.featured ? 'Unfeature' : 'Feature'}</button>
          {!listing.archived_at && <button type="button" disabled={pending} onClick={() => run(() => archiveListing(listing.id))} className="cursor-pointer rounded-full border-[1.5px] border-line px-4 py-2 text-[0.82rem] font-semibold text-muted hover:border-clay hover:text-clay disabled:cursor-not-allowed">Archive</button>}
          <button
            type="button"
            disabled={pending}
            onClick={() => run(() => setPublished(listing.id, !listing.published))}
            className="cursor-pointer rounded-full border-[1.5px] border-line px-4 py-2 text-[0.82rem] font-semibold text-muted transition-colors hover:border-clay hover:text-clay disabled:cursor-not-allowed"
          >
            {listing.published ? 'Hide' : 'Publish'}
          </button>

          {confirming ? (
            <span className="flex items-center gap-2">
              <button
                type="button"
                disabled={pending}
                onClick={() => run(() => deleteListing(listing.id))}
                className="cursor-pointer rounded-full bg-[#8b3a1a] px-4 py-2 text-[0.82rem] font-bold text-white disabled:cursor-not-allowed"
              >
                Delete for good
              </button>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="cursor-pointer text-[0.82rem] font-semibold text-muted hover:text-ink"
              >
                Cancel
              </button>
            </span>
          ) : (
            <button
              type="button"
              disabled={pending}
              onClick={() => setConfirming(true)}
              className="cursor-pointer rounded-full border-[1.5px] border-[#e07a50]/50 px-4 py-2 text-[0.82rem] font-semibold text-[#8b3a1a] transition-colors hover:border-[#8b3a1a] disabled:cursor-not-allowed"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-3 text-[0.85rem] font-semibold text-[#8b3a1a]">
          {error}
        </p>
      )}
    </li>
  )
}
