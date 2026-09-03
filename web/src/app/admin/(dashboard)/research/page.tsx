import ExportButton from '../../ExportButton'
import ResearchResponseCard from '../../ResearchResponseCard'
import { createClient } from '@/lib/supabase/server'
import type { ResearchResponseRow } from '@/lib/supabase/types'

/**
 * Research survey responses.
 *
 * The roadmap gates Phase 1 on Phase 0 engagement, and this is the only place
 * that evidence is countable. The tallies below are deliberately the questions
 * the roadmap quotes as findings, so the claims on the landing page can be
 * checked against live data rather than a memory of the original survey.
 */
export default async function ResearchPage() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('research_responses')
    .select('*')
    .order('created_at', { ascending: false })

  const responses = (data ?? []) as ResearchResponseRow[]
  const missingTable = error?.code === 'PGRST205'

  const tally = (key: string) => {
    const counts = new Map<string, number>()
    for (const r of responses) {
      const value = r.answers?.[key]
      const values = Array.isArray(value) ? value : value ? [String(value)] : []
      for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1)
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1])
  }

  const wouldPay = responses.filter(
    (r) => r.answers?.willingness_to_pay && r.answers.willingness_to_pay !== 'free_only',
  ).length
  const usesAi = responses.filter(
    (r) => typeof r.answers?.uses_ai === 'string' && r.answers.uses_ai !== 'never',
  ).length

  return (
    <div className="mx-auto max-w-[1000px]">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold">Research responses</h1>
          <p className="mt-1 text-[0.92rem] text-muted">
            {responses.length} {responses.length === 1 ? 'response' : 'responses'}
          </p>
        </div>
        {responses.length > 0 && <ExportButton rows={responses.map((r) => r.email)} />}
      </header>

      {missingTable ? (
        <div className="rounded-2xl border border-[#e07a50] bg-[#fff0eb] p-8 text-[0.92rem] leading-[1.7] text-[#8b3a1a]">
          <h2 className="mb-2 font-display text-xl font-semibold">Table not created yet</h2>
          <p>
            Run{' '}
            <code className="rounded bg-white/60 px-1.5 py-0.5">
              supabase/migrations/0004_applications_and_research.sql
            </code>{' '}
            in the Supabase SQL editor.
          </p>
        </div>
      ) : error ? (
        <div role="alert" className="rounded-2xl border border-[#e07a50] bg-[#fff0eb] p-8 text-[0.92rem] leading-[1.7] text-[#8b3a1a]">
          <h2 className="mb-2 font-display text-xl font-semibold">Could not load research responses</h2>
          <p>The database returned an error. No responses were deleted.</p>
          <p className="mt-2 text-[0.8rem] opacity-80">{error.message}</p>
        </div>
      ) : responses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-clay/40 bg-white p-12 text-center">
          <h2 className="mb-2 font-display text-xl font-semibold">No responses yet</h2>
          <p className="text-[0.9rem] text-muted">
            Submissions from the research form will appear here.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-8 grid grid-cols-3 gap-4 max-sm:grid-cols-1">
            <Stat
              label="Would pay something"
              value={`${Math.round((wouldPay / responses.length) * 100)}%`}
              hint={`${wouldPay} of ${responses.length}`}
            />
            <Stat
              label="Already use AI tools"
              value={`${Math.round((usesAi / responses.length) * 100)}%`}
              hint={`${usesAi} of ${responses.length}`}
            />
            <Stat
              label="Most wanted feature"
              value={tally('most_exciting_feature')[0]?.[0]?.replace(/_/g, ' ') ?? '—'}
              hint={`${tally('most_exciting_feature')[0]?.[1] ?? 0} picked it`}
            />
          </div>

          <section className="mb-8 rounded-2xl border border-line bg-white p-6">
            <h2 className="mb-4 font-display text-lg font-semibold">Biggest struggles</h2>
            <ul className="flex flex-col gap-2">
              {tally('struggles').map(([value, count]) => (
                <li key={value} className="flex items-center gap-3 text-[0.88rem]">
                  <span className="w-[220px] shrink-0 text-muted max-sm:w-[130px]">
                    {value.replace(/_/g, ' ')}
                  </span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-cream-deep">
                    <span
                      className="block h-full rounded-full bg-clay"
                      style={{ width: `${(count / responses.length) * 100}%` }}
                    />
                  </span>
                  <span className="w-8 shrink-0 text-right font-bold">{count}</span>
                </li>
              ))}
            </ul>
          </section>

          <ul className="flex flex-col gap-3">
            {responses.map((r) => (
              <ResearchResponseCard key={r.id} response={r} />
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <p className="text-[0.72rem] font-bold tracking-[0.1em] text-muted uppercase">{label}</p>
      <p className="mt-2 font-display text-2xl font-semibold capitalize">{value}</p>
      <p className="mt-1 text-[0.78rem] text-muted">{hint}</p>
    </div>
  )
}
