import Link from 'next/link'
import { AddListingPanel } from '../../ListingForm'
import ListingRowItem from '../../ListingRowItem'
import SearchBox from '../../SearchBox'
import { createClient } from '@/lib/supabase/server'
import { daysUntil } from '@/lib/listings'
import type { ListingRow } from '@/lib/supabase/types'

type Status = 'all' | 'live' | 'pending' | 'rejected' | 'archived' | 'soon' | 'expired'

const STATUSES: { value: Status; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'live', label: 'Live' },
  { value: 'pending', label: 'Pending review' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'archived', label: 'Archived' },
  { value: 'soon', label: 'Closing soon' },
  { value: 'expired', label: 'Expired' },
]

/**
 * Internship management.
 *
 * Search and status live in the URL rather than component state so a filtered
 * view can be linked to — the Overview page deep-links straight to
 * ?status=expired, and a bookmark survives a reload.
 */
export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>
}) {
  const { q = '', status: rawStatus = 'all' } = await searchParams
  const status = (STATUSES.some((s) => s.value === rawStatus) ? rawStatus : 'all') as Status

  const supabase = await createClient()
  let query = supabase.from('listings').select('*')

  if (q.trim()) {
    const term = `%${q.trim()}%`
    query = query.or(`company.ilike.${term},title.ilike.${term}`)
  }
  if (status === 'live') query = query.eq('published', true)
  if (status === 'pending') query = query.eq('published', false).or('status.is.null,status.eq.pending')
  if (status === 'rejected') query = query.eq('status', 'rejected')
  if (status === 'archived') query = query.not('archived_at', 'is', null)
  if (status !== 'archived') query = query.is('archived_at', null)

  const { data, error } = await query
    .order('published', { ascending: false })
    .order('deadline', { ascending: true })
    .limit(500)

  let listings = (data ?? []) as ListingRow[]

  // Deadline-relative statuses are computed rather than stored, so they cannot
  // go stale — filtering them in SQL would need a daily job to stay correct.
  if (status === 'soon') {
    listings = listings.filter((l) => {
      const d = daysUntil(l.deadline)
      return l.published && d >= 0 && d <= 14
    })
  }
  if (status === 'expired') {
    listings = listings.filter((l) => daysUntil(l.deadline) < 0)
  }
  if (status === 'pending') {
    listings = listings.filter((l) => !l.published && (l.status === 'pending' || l.status == null))
  }

  return (
    <div className="mx-auto max-w-[1000px]">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold">Internships</h1>
          <p className="mt-1 text-[0.92rem] text-muted">
            {listings.length} {listings.length === 1 ? 'listing' : 'listings'}
            {status !== 'all' || q ? ' matching this view' : ' in total'}
          </p>
        </div>
        <AddListingPanel />
      </header>

      <SearchBox
        basePath="/admin/listings"
        defaultValue={q}
        keep={status === 'all' ? {} : { status }}
        placeholder="Search company or role..."
        label="Search listings"
      />

      <nav className="mb-6 flex flex-wrap gap-2">
        {STATUSES.map(({ value, label }) => {
          const params = new URLSearchParams()
          if (q) params.set('q', q)
          if (value !== 'all') params.set('status', value)
          const href = `/admin/listings${params.size ? `?${params}` : ''}`

          return (
            <Link
              key={value}
              href={href}
              className={`rounded-full px-4 py-1.5 text-[0.82rem] font-semibold no-underline transition-colors ${
                status === value
                  ? 'bg-ink text-cream'
                  : 'border-[1.5px] border-line bg-white text-muted hover:border-clay hover:text-clay'
              }`}
            >
              {label}
            </Link>
          )
        })}
      </nav>

      {error && (
        <p
          role="alert"
          className="mb-6 rounded-xl border border-[#e07a50] bg-[#fff0eb] px-4 py-3 text-[0.9rem] text-[#8b3a1a]"
        >
          Could not load listings: {error.message}
        </p>
      )}

      {listings.length === 0 && !error ? (
        <div className="rounded-2xl border border-dashed border-clay/40 bg-white p-12 text-center">
          <h2 className="mb-2 font-display text-xl font-semibold">
            {q || status !== 'all' ? 'Nothing matches this view' : 'No listings yet'}
          </h2>
          <p className="text-[0.9rem] text-muted">
            {q || status !== 'all'
              ? 'Try a different search or status filter.'
              : 'Add the first one and it appears on the public board immediately.'}
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {listings.map((listing) => (
            <ListingRowItem key={listing.id} listing={listing} />
          ))}
        </ul>
      )}
    </div>
  )
}
