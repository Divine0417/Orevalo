import { createClient } from '@/lib/supabase/server'

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const [{ data: events }, { data: reports }] = await Promise.all([
    supabase.from('opportunity_events').select('kind, opportunity_id, event, created_at').order('created_at', { ascending: false }).limit(500),
    supabase.from('opportunity_reports').select('id, kind, opportunity_id, reason, created_at').order('created_at', { ascending: false }).limit(100),
  ])
  const views = (events ?? []).filter((event) => event.event === 'view').length
  const clicks = (events ?? []).filter((event) => event.event === 'apply_click').length
  return <div className="mx-auto max-w-[1000px]">
    <h1 className="font-display text-3xl font-semibold">Opportunity quality</h1>
    <p className="mt-2 text-[0.92rem] text-muted">Recent engagement and reports from public detail pages.</p>
    <div className="mt-8 grid grid-cols-3 gap-4 max-sm:grid-cols-1">
      <Metric label="Detail views" value={views} />
      <Metric label="Apply clicks" value={clicks} />
      <Metric label="Reports" value={reports?.length ?? 0} />
    </div>
    <section className="mt-8 rounded-2xl border border-line bg-white p-6">
      <h2 className="font-display text-xl font-semibold">Recent reports</h2>
      {(reports ?? []).length === 0 ? <p className="mt-4 text-sm text-muted">No reports yet.</p> : <ul className="mt-4 flex flex-col gap-3">{reports?.map((report) => <li key={report.id} className="rounded-xl bg-cream px-4 py-3 text-sm"><strong>{report.kind}</strong> · {report.reason}<span className="ml-2 text-muted">{new Date(report.created_at).toLocaleDateString('en-GB')}</span></li>)}</ul>}
    </section>
  </div>
}

function Metric({ label, value }: { label: string; value: number }) {
  return <div className="rounded-2xl border border-line bg-white p-5"><p className="text-sm text-muted">{label}</p><strong className="mt-2 block font-display text-3xl">{value}</strong></div>
}