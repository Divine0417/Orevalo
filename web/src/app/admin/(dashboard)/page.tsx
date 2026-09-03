import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { daysUntil, formatDeadline } from '@/lib/listings'
import { ArrowRight } from '@/components/icons'

/** Phase 1 in the roadmap ships with at least 50 real listings in each board. */
const PHASE_1_TARGET = 50

type Row = { deadline: string | null; published: boolean }

export default async function OverviewPage() {
  const supabase = await createClient()

  const [listingsRes, scholarshipsRes, subscribersRes, expiringRes] = await Promise.all([
    supabase.from('listings').select('deadline, published'),
    supabase.from('scholarships').select('deadline, published'),
    supabase.from('subscribers').select('id', { count: 'exact', head: true }).eq('unsubscribed', false),
    supabase
      .from('listings')
      .select('id, company, title, deadline, published')
      .eq('published', true)
      .order('deadline', { ascending: true })
      .limit(50),
  ])

  const listings = (listingsRes.data ?? []) as Row[]
  const scholarships = (scholarshipsRes.data ?? []) as Row[]
  const missingScholarships = scholarshipsRes.error?.code === 'PGRST205'
  const databaseErrors = [listingsRes, scholarshipsRes, subscribersRes, expiringRes].filter(
    (result) => result.error && result.error.code !== 'PGRST205',
  )

  const live = listings.filter((l) => l.published).length
  const hidden = listings.length - live
  const expired = listings.filter(
    (l) => l.published && l.deadline && daysUntil(l.deadline) < 0,
  ).length

  const closingSoon = (expiringRes.data ?? []).filter((l) => {
    const d = daysUntil(l.deadline as string)
    return d >= 0 && d <= 14
  })

  const liveScholarships = scholarships.filter((s) => s.published).length

  return (
    <div className="mx-auto max-w-[1000px]">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-semibold">Overview</h1>
        <p className="mt-1 text-[0.92rem] text-muted">
          Where Phase 1 stands: the Internship Board and Scholarship Finder, and the students
          waiting to hear about them.
        </p>
      </header>

      {/* Anything needing action comes first, above the counts. */}
      {expired > 0 && (
        <Callout tone="warn">
          <strong>{expired}</strong> published {expired === 1 ? 'listing has' : 'listings have'} a
          deadline in the past. Students can still see {expired === 1 ? 'it' : 'them'}.{' '}
          <Link href="/admin/listings?status=expired" className="font-semibold underline">
            Review {expired === 1 ? 'it' : 'them'}
          </Link>
        </Callout>
      )}

      {missingScholarships && (
        <Callout tone="warn">
          The <code className="rounded bg-white/60 px-1.5 py-0.5">scholarships</code> table does not
          exist yet. Run{' '}
          <code className="rounded bg-white/60 px-1.5 py-0.5">
            supabase/migrations/0002_scholarships_and_subscribers.sql
          </code>{' '}
          in the SQL editor.
        </Callout>
      )}

      {databaseErrors.length > 0 && (
        <Callout tone="warn">
          Some dashboard data could not be loaded. The numbers below may be incomplete. Check the
          database connection and permissions, then refresh the page.
        </Callout>
      )}

      <div className="mb-10 grid grid-cols-4 gap-4 max-lg:grid-cols-2 max-sm:grid-cols-1">
        <Stat
          label="Live internships"
          value={live}
          hint={`${PHASE_1_TARGET} needed for Phase 1`}
          progress={Math.min(live / PHASE_1_TARGET, 1)}
          href="/admin/listings"
        />
        <Stat
          label="Live scholarships"
          value={missingScholarships ? '—' : liveScholarships}
          hint={`${PHASE_1_TARGET} needed for Phase 1`}
          progress={missingScholarships ? 0 : Math.min(liveScholarships / PHASE_1_TARGET, 1)}
          href="/admin/scholarships"
        />
        <Stat
          label="Closing in 14 days"
          value={closingSoon.length}
          hint="Worth emailing out"
          href="/admin/listings?status=soon"
        />
        <Stat
          label="Subscribers"
          value={subscribersRes.error ? '—' : (subscribersRes.count ?? 0)}
          hint="Opted in to opportunity emails"
          href="/admin/subscribers"
        />
      </div>

      <div className="grid grid-cols-2 gap-6 max-lg:grid-cols-1">
        <Panel
          title="Closing soon"
          description="Send these to subscribers before they close."
          empty="Nothing closes in the next two weeks."
        >
          {closingSoon.slice(0, 6).map((l) => {
            const left = daysUntil(l.deadline as string)
            return (
              <li
                key={l.id as string}
                className="flex items-center justify-between gap-4 border-b border-line py-3 last:border-0"
              >
                <span className="min-w-0">
                  <span className="block truncate text-[0.9rem] font-semibold">
                    {l.title as string}
                  </span>
                  <span className="block text-[0.8rem] text-muted">
                    {l.company as string} · {formatDeadline(l.deadline as string)}
                  </span>
                </span>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-[0.7rem] font-bold uppercase ${
                    left <= 3 ? 'bg-[#8b3a1a]/10 text-[#8b3a1a]' : 'bg-clay/10 text-clay'
                  }`}
                >
                  {left === 0 ? 'Today' : `${left}d`}
                </span>
              </li>
            )
          })}
        </Panel>

        <Panel
          title="Board health"
          description="What students see right now."
          empty="No listings yet."
        >
          <Line label="Published" value={live} />
          <Line label="Hidden from the board" value={hidden} />
          <Line label="Past deadline but still live" value={expired} warn={expired > 0} />
          <Line
            label="Progress to Phase 1 target"
            value={`${Math.round((live / PHASE_1_TARGET) * 100)}%`}
          />
        </Panel>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/admin/listings"
          className="inline-flex items-center gap-2 rounded-full bg-clay px-6 py-3 font-bold text-white no-underline transition-colors hover:bg-clay-dark"
        >
          Manage internships <ArrowRight />
        </Link>
        <Link
          href="/admin/scholarships"
          className="inline-flex items-center gap-2 rounded-full border-[1.5px] border-line px-6 py-3 font-semibold text-muted no-underline transition-colors hover:border-clay hover:text-clay"
        >
          Manage scholarships
        </Link>
      </div>
    </div>
  )
}

/* ----------------------------------------------------------------- parts -- */

function Stat({
  label,
  value,
  hint,
  progress,
  href,
}: {
  label: string
  value: number | string
  hint: string
  progress?: number
  href: string
}) {
  return (
    <Link
      href={href}
      className="block rounded-2xl border border-line bg-white p-5 no-underline transition-colors hover:border-clay/40"
    >
      <p className="text-[0.72rem] font-bold tracking-[0.1em] text-muted uppercase">{label}</p>
      <p className="mt-2 font-display text-3xl font-semibold text-ink">{value}</p>
      {progress !== undefined && (
        <span className="mt-3 block h-1.5 overflow-hidden rounded-full bg-cream-deep">
          <span
            className="block h-full rounded-full bg-clay transition-[width]"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </span>
      )}
      <p className="mt-2 text-[0.78rem] text-muted">{hint}</p>
    </Link>
  )
}

function Panel({
  title,
  description,
  empty,
  children,
}: {
  title: string
  description: string
  empty: string
  children: React.ReactNode
}) {
  const items = Array.isArray(children) ? children.flat() : [children]
  const isEmpty = items.filter(Boolean).length === 0

  return (
    <section className="rounded-2xl border border-line bg-white p-6">
      <h2 className="font-display text-lg font-semibold">{title}</h2>
      <p className="mt-0.5 mb-4 text-[0.82rem] text-muted">{description}</p>
      {isEmpty ? (
        <p className="py-6 text-center text-[0.88rem] text-muted">{empty}</p>
      ) : (
        <ul className="flex flex-col">{children}</ul>
      )}
    </section>
  )
}

function Line({ label, value, warn }: { label: string; value: number | string; warn?: boolean }) {
  return (
    <li className="flex items-center justify-between gap-4 border-b border-line py-2.5 text-[0.9rem] last:border-0">
      <span className="text-muted">{label}</span>
      <span className={`font-bold ${warn ? 'text-[#8b3a1a]' : 'text-ink'}`}>{value}</span>
    </li>
  )
}

function Callout({ tone, children }: { tone: 'warn'; children: React.ReactNode }) {
  return (
    <div
      className={`mb-6 rounded-2xl border px-5 py-4 text-[0.9rem] leading-[1.6] ${
        tone === 'warn' ? 'border-[#e07a50] bg-[#fff0eb] text-[#8b3a1a]' : ''
      }`}
    >
      {children}
    </div>
  )
}
