import {
  AddScholarshipPanel,
  ScholarshipRowItem,
  type ScholarshipRow,
} from '../../ScholarshipManager'
import SearchBox from '../../SearchBox'
import { createClient } from '@/lib/supabase/server'

export default async function ScholarshipsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q = '' } = await searchParams

  const supabase = await createClient()
  let query = supabase.from('scholarships').select('*')
  if (q.trim()) {
    const term = `%${q.trim()}%`
    query = query.or(`name.ilike.${term},funder.ilike.${term}`)
  }

  const { data, error } = await query
    .order('published', { ascending: false })
    .order('name', { ascending: true })
    .limit(500)

  const scholarships = (data ?? []) as ScholarshipRow[]
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
            placeholder="Search name or funder..."
            label="Search scholarships"
          />

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
