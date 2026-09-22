import Link from 'next/link'
import {
  AddScholarshipPanel,
  ScholarshipRowItem,
  type ScholarshipRow,
} from '../../ScholarshipManager'
import SearchBox from '../../SearchBox'
import { createClient } from '@/lib/supabase/server'

type Status = 'all' | 'live' | 'pending' | 'rejected'

const STATUSES: { value: Status; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'live', label: 'Live' },
  { value: 'pending', label: 'Pending review' },
  { value: 'rejected', label: 'Rejected' },
]

export default async function ScholarshipsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>
}) {
  const { q = '', status: rawStatus = 'all' } = await searchParams
  const status = (STATUSES.some((s) => s.value === rawStatus) ? rawStatus : 'all') as Status

  const supabase = await createClient()
  let query = supabase.from('scholarships').select('*')
  if (q.trim()) {
    const term = `%${q.trim()}%`
    query = query.or(`name.ilike.${term},funder.ilike.${term}`)
  }
  if (status === 'live') query = query.eq('published', true)
  if (status === 'pending') query = query.eq('published', false).or('status.is.null,status.eq.pending')
  if (status === 'rejected') query = query.eq('status', 'rejected')

  const { data, error } = await query
    .order('published', { ascending: false })
    .order('name', { ascending: true })
    .limit(500)

  const scholarships = ((data ?? []) as ScholarshipRow[]).filter((item) => {
    if (status === 'pending') return !item.published && (item.status === 'pending' || item.status == null)
    if (status === 'rejected') return item.status === 'rejected'
    return true
  })
  const missingTable = error?.code === 'PGRST205'

  return (
    <div className="mx-auto max-w-[1000px]">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold">Scholarships</h1>
          <p className="mt-1 text-[0.92rem] text-muted">
            The other half of Phase 1. {scholarships.length}{' '}
            {scholarships.length === 1 ? 'entry' : 'entries'}.
          </p>
        </div>
        {!missingTable && <AddScholarshipPanel />}
      </header>

      {missingTable ? (
        <div className="rounded-2xl border border-[#e07a50] bg-[#fff0eb] p-8 text-[0.92rem] leading-[1.7] text-[#8b3a1a]">
          <h2 className="mb-2 font-display text-xl font-semibold">Table not created yet</h2>
          <p>
            Run{' '}
            <code className="rounded bg-white/60 px-1.5 py-0.5">
              supabase/migrations/0002_scholarships_and_subscribers.sql
            </code>{' '}
            in the Supabase SQL editor, then reload this page.
          </p>
        </div>
      ) : (
        <>
          <SearchBox
            basePath="/admin/scholarships"
            defaultValue={q}
            keep={status === 'all' ? {} : { status }}
            placeholder="Search name or funder..."
            label="Search scholarships"
          />

          <nav className="mb-6 flex flex-wrap gap-2">
            {STATUSES.map(({ value, label }) => {
              const params = new URLSearchParams()
              if (q) params.set('q', q)
              if (value !== 'all') params.set('status', value)
              const href = `/admin/scholarships${params.size ? `?${params}` : ''}`

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
              {error.message}
            </p>
          )}

          {scholarships.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-clay/40 bg-white p-12 text-center">
              <h2 className="mb-2 font-display text-xl font-semibold">
                {q ? 'Nothing matches that search' : 'No scholarships yet'}
              </h2>
              <p className="text-[0.9rem] text-muted">
                {q ? 'Try a different term.' : 'Add the first one to start building the finder.'}
              </p>
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {scholarships.map((s) => (
                <ScholarshipRowItem key={s.id} scholarship={s} />
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  )
}
