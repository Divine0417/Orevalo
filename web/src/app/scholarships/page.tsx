import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import ScholarshipFilters from '@/components/ScholarshipFilters'
import SiteFooter from '@/components/SiteFooter'
import {
  ArrowLeft,
  ArrowRight,
  Building,
  CalendarClock,
  GraduationCap,
  MapPin,
  Search,
} from '@/components/icons'
import { formatDeadline } from '@/lib/listings'
import { getScholarships, type Scholarship } from '@/lib/scholarships.server'
import { getSavedState } from '@/lib/saved.server'
import SaveButton from '@/components/SaveButton'

export const metadata: Metadata = {
  title: 'Scholarships',
  description:
    'Scholarships, fellowships and grants open to African students. Filter by country, field of study and degree level, then apply directly.',
}

/**
 * Scholarship finder — the second half of Phase 1.
 *
 * Server component: filters arrive as search params and become a database
 * `where` clause, so the browser only receives rows it will display.
 */
export default async function ScholarshipsPage({
  searchParams,
}: {
  searchParams: Promise<{ country?: string; field?: string; degree_level?: string }>
}) {
  const { country, field, degree_level } = await searchParams
  const [scholarships, { signedIn, saved }] = await Promise.all([
    getScholarships({ country, field, degree_level }),
    getSavedState('scholarship'),
  ])
  const isFiltered = Boolean(country || field || degree_level)

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
        <p className="mb-[18px] inline-flex items-center gap-2 rounded-full bg-clay/10 px-3.5 py-1.5 text-[0.72rem] font-bold tracking-[0.12em] text-clay uppercase">
          <GraduationCap /> Scholarships
        </p>
        <h1 className="mb-3.5 max-w-[640px] font-display text-[clamp(1.9rem,4.5vw,2.9rem)] leading-[1.15] font-semibold tracking-[-0.03em]">
          Scholarships open to <em className="text-clay italic">African students</em>.
        </h1>
        <p className="max-w-[520px] leading-[1.7] text-muted">
          Curated funding for undergraduate, masters and doctoral study. Check the eligibility, note
          the deadline, then apply directly — no account needed.
        </p>
      </section>

      <div className="mx-auto w-full max-w-[1080px] px-6 max-md:px-4 max-sm:px-0">
        <Suspense fallback={<div className="h-[86px]" />}>
          <ScholarshipFilters />
        </Suspense>
      </div>

      <main className="mx-auto w-full max-w-[1080px] flex-1 px-6 pt-8 pb-18 max-md:px-4">
        <p className="mb-5 text-[0.85rem] text-muted">
          Showing <strong className="text-ink">{scholarships.length}</strong>{' '}
          {scholarships.length === 1 ? 'scholarship' : 'scholarships'}
          {isFiltered ? ' matching your filters' : ''}
        </p>

        {scholarships.length > 0 ? (
          <div className="grid grid-cols-3 items-stretch gap-5 max-lg:grid-cols-2 max-sm:grid-cols-1">
            {scholarships.map((s) => (
              <ScholarshipCard
                key={s.slug}
                scholarship={s}
                signedIn={signedIn}
                isSaved={saved.has(s.slug)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-[18px] border border-dashed border-clay/40 bg-white p-14 text-center">
            <span className="mb-3.5 flex justify-center text-[2rem] text-clay">
              <Search />
            </span>
            <h2 className="mb-2 font-display text-xl font-semibold">
              {isFiltered ? 'Nothing matches those filters' : 'No scholarships listed yet'}
            </h2>
            <p className="text-[0.9rem] text-muted">
              {isFiltered
                ? 'Try a different country, field or degree level.'
                : 'We are curating the first batch now. Check back shortly.'}
            </p>
          </div>
        )}

        <div className="mt-10 rounded-[18px] border border-line bg-white p-8 text-center max-sm:p-6">
          <h2 className="mb-2 font-display text-xl font-semibold">Looking for internships too?</h2>
          <p className="mb-5 text-[0.9rem] text-muted">
            The internship board carries graduate schemes and paid roles open to students.
          </p>
          <Link
            href="/internships"
            className="inline-flex items-center gap-2.5 rounded-full bg-clay px-7 py-3 font-bold text-white no-underline transition-colors hover:bg-clay-dark"
          >
            Browse internships <ArrowRight />
          </Link>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}

function ScholarshipCard({
  scholarship,
  signedIn,
  isSaved,
}: {
  scholarship: Scholarship
  signedIn: boolean
  isSaved: boolean
}) {
  return (
    <article className="flex flex-col gap-3.5 rounded-[18px] border border-line bg-white p-6 transition-all hover:-translate-y-[3px] hover:border-clay/35 hover:shadow-[0_12px_32px_rgba(44,26,14,0.08)]">
      <div className="flex items-start justify-between gap-3">
        <span className="flex items-center gap-2.5 text-[0.88rem] font-bold text-clay">
          <Building /> {scholarship.funder}
        </span>
        <span className="shrink-0 rounded-full bg-cream-deep px-2.5 py-1 text-[0.68rem] font-bold tracking-[0.08em] text-muted uppercase">
          {scholarship.degree_level}
        </span>
      </div>

      <h2 className="font-display text-[1.2rem] leading-[1.3] font-semibold tracking-[-0.01em]">
        {scholarship.name}
      </h2>

      {scholarship.eligibility && (
        <p className="text-[0.86rem] leading-[1.6] text-muted">{scholarship.eligibility}</p>
      )}

      <div className="flex flex-col gap-2 text-[0.86rem] text-muted">
        <span className="flex items-center gap-2.5">
          <span className="flex shrink-0 text-clay">
            <MapPin />
          </span>
          {scholarship.country} · {scholarship.field}
        </span>
        <span className="flex items-center gap-2.5">
          <span className="flex shrink-0 text-clay">
            <CalendarClock />
          </span>
          {scholarship.deadline
            ? `Deadline: ${formatDeadline(scholarship.deadline)}`
            : 'Rolling — check the funder for dates'}
        </span>
      </div>

      <div className="mt-auto flex items-center gap-2.5">
        <a
          href={scholarship.apply_url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex flex-1 items-center justify-center gap-2.5 rounded-full bg-clay px-6 py-3 font-bold text-cream no-underline transition-all hover:-translate-y-px hover:bg-clay-dark"
        >
          Apply Now <ArrowRight />
        </a>
        <SaveButton
          kind="scholarship"
          slug={scholarship.slug}
          initialSaved={isSaved}
          signedIn={signedIn}
        />
      </div>
    </article>
  )
}
