import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import InternshipFilters from '@/components/InternshipFilters'
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Building,
  CalendarClock,
  MapPin,
  Search,
} from '@/components/icons'
import { daysUntil, formatDeadline, type Listing } from '@/lib/listings'
import { getListings } from '@/lib/listings.server'
import { getSavedState } from '@/lib/saved.server'
import SaveButton from '@/components/SaveButton'

export const metadata: Metadata = {
  title: 'Internships',
  description:
    'Internship and graduate opportunities open to African students. Filter by field and location, check the deadline, and apply directly.',
}

/**
 * Internship board.
 *
 * A server component: filters arrive as search params and the listings are
 * fetched and narrowed on the server, so the browser only receives the rows it
 * will actually display. When Supabase lands this becomes a real query with no
 * change to the markup below.
 */
export default async function InternshipsPage({
  searchParams,
}: {
  searchParams: Promise<{ field?: string; location?: string }>
}) {
  const { field, location } = await searchParams
  const [{ listings, error }, { signedIn, saved }] = await Promise.all([
    getListings({ field, location }),
    getSavedState('listing'),
  ])
  const isFiltered = Boolean(field || location)

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 border-b border-line bg-cream/92 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-[1080px] flex-nowrap items-center justify-between gap-4 px-6 py-[18px] max-md:px-4 max-md:py-3.5">
          <Link href="/" className="flex min-w-0 flex-wrap items-baseline gap-3.5 no-underline">
            <span className="font-display text-2xl font-semibold tracking-[-0.02em] text-clay max-sm:text-xl">
              Ore<span className="text-ink">valo</span>
            </span>
            <span className="text-[0.85rem] text-muted italic max-sm:text-[0.78rem]">
              Study smart. Build your future.
            </span>
          </Link>

          {/* Label collapses to an icon-only button on small screens. */}
          <Link
            href="/"
            aria-label="Back to home"
            className="flex shrink-0 items-center justify-center gap-[7px] text-[0.85rem] font-semibold text-muted no-underline transition-colors hover:text-clay max-md:size-10 max-md:gap-0 max-md:rounded-full max-md:border-[1.5px] max-md:border-line max-md:bg-white max-md:text-clay"
          >
            <ArrowLeft />
            <span className="max-md:hidden">Back to home</span>
          </Link>
        </div>
      </header>

      <section className="mx-auto w-full max-w-[1080px] px-6 pt-14 pb-8 max-md:px-4 max-md:pt-10">
        <div className="mb-[18px] inline-flex items-center gap-2 rounded-full bg-clay/10 px-3.5 py-1.5 text-[0.72rem] font-bold tracking-[0.12em] text-clay uppercase">
          <Briefcase /> Internships
        </div>
        <h1 className="mb-3.5 max-w-[640px] font-display text-[clamp(1.9rem,4.5vw,2.9rem)] leading-[1.15] font-semibold tracking-[-0.03em]">
          Internships open to <em className="text-clay italic">African students</em>, in one place.
        </h1>
        <p className="max-w-[520px] leading-[1.7] text-muted">
          Hand-picked roles from companies hiring students and recent graduates right now. Check the
          deadline, then apply directly — no account needed.
        </p>
      </section>

      <div className="mx-auto w-full max-w-[1080px] px-6 max-md:px-4 max-sm:px-0">
        <Suspense fallback={<div className="h-[104px] rounded-[18px] border border-line bg-white" />}>
          <InternshipFilters />
        </Suspense>
      </div>

      <main className="mx-auto w-full max-w-[1080px] flex-1 px-6 pt-8 pb-18 max-md:px-4">
        <p className="mb-5 text-[0.85rem] text-muted">
          Showing <strong className="text-ink">{listings.length}</strong>{' '}
          {listings.length === 1 ? 'opportunity' : 'opportunities'}
          {isFiltered ? ' matching your filters' : ''}
        </p>

        {error ? (
          <div
            role="alert"
            className="rounded-[18px] border border-[#e07a50] bg-[#fff0eb] px-7 py-14 text-center"
          >
            <h2 className="mb-2 font-display text-[1.2rem] font-semibold">
              Internships are temporarily unavailable
            </h2>
            <p className="text-[0.9rem] text-muted">{error} Please try again later.</p>
          </div>
        ) : listings.length > 0 ? (
          <div className="grid grid-cols-3 items-stretch gap-5 max-lg:grid-cols-2 max-sm:grid-cols-1">
            {listings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                signedIn={signedIn}
                isSaved={saved.has(listing.id)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-[18px] border border-dashed border-clay/40 bg-white px-7 py-14 text-center">
            <span className="mb-3.5 flex justify-center text-[2rem] text-clay">
              <Search />
            </span>
            <h2 className="mb-2 font-display text-[1.2rem] font-semibold">
              No internships match those filters
            </h2>
            <p className="text-[0.9rem] text-muted">
              Try a different field or location — we add new roles every week.
            </p>
          </div>
        )}
      </main>

      <footer className="bg-ink px-6 py-8 text-center text-[0.85rem] text-cream/60">
        <p>
          <a
            href="https://orevalo.com"
            className="mx-2.5 text-clay-light no-underline hover:underline"
          >
            orevalo.com
          </a>
          <a
            href="mailto:hello@orevalo.com"
            className="mx-2.5 text-clay-light no-underline hover:underline"
          >
            hello@orevalo.com
          </a>
        </p>
        <p className="mt-2.5 text-[0.78rem] text-cream/40">
          © 2026 Orevalo. Built with purpose for African students.
        </p>
      </footer>
    </div>
  )
}

function ListingCard({
  listing,
  signedIn,
  isSaved,
}: {
  listing: Listing
  signedIn: boolean
  isSaved: boolean
}) {
  const remaining = daysUntil(listing.deadline)
  const closingSoon = remaining >= 0 && remaining <= 14

  return (
    <article className="flex flex-col gap-3.5 rounded-[18px] border border-line bg-white p-6 transition-all hover:-translate-y-[3px] hover:border-clay/35 hover:shadow-[0_12px_32px_rgba(44,26,14,0.08)]">
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2.5 text-[0.88rem] font-bold text-clay">
          <Building /> {listing.company}
        </span>
        <span className="rounded-full bg-cream-deep px-2.5 py-1 text-[0.68rem] font-bold tracking-[0.08em] whitespace-nowrap text-muted uppercase">
          {listing.field}
        </span>
      </div>

      <h2 className="font-display text-[1.2rem] leading-[1.3] font-semibold tracking-[-0.01em]">
        <Link href={`/internships/${listing.id}`} className="no-underline hover:text-clay">{listing.title}</Link>
      </h2>

      <div className="flex flex-col gap-2 text-[0.86rem] text-muted">
        <span className="flex items-center gap-2.5">
          <span className="flex shrink-0 text-clay">
            <MapPin />
          </span>
          {listing.location}
        </span>
        <span className="flex items-center gap-2.5">
          <span className="flex shrink-0 text-clay">
            <CalendarClock />
          </span>
          Deadline: {formatDeadline(listing.deadline)}
          {closingSoon && (
            <span className="rounded-full bg-clay/10 px-2 py-0.5 text-[0.72rem] font-bold text-clay">
              Closing soon
            </span>
          )}
        </span>
      </div>

      <div className="mt-auto flex items-center gap-2.5">
        <a
          href={listing.apply_url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex flex-1 items-center justify-center gap-2.5 rounded-full bg-clay px-6 py-[13px] text-[0.92rem] font-bold text-cream no-underline transition-all hover:-translate-y-px hover:bg-clay-dark"
        >
          Apply Now <ArrowRight />
        </a>
        <SaveButton
          kind="listing"
          slug={listing.id}
          initialSaved={isSaved}
          signedIn={signedIn}
        />
      </div>
    </article>
  )
}
