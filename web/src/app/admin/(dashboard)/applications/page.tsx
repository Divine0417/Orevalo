import Link from 'next/link'
import ApplicationCard from '../../ApplicationCard'
import { createClient } from '@/lib/supabase/server'
import type { LeaderApplicationRow } from '@/lib/supabase/types'

type Status = LeaderApplicationRow['status']

const STATUSES: { value: Status | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'new', label: 'New' },
  { value: 'reviewing', label: 'Reviewing' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
]

/** Narrows an untrusted query param to a real status. */
function isStatus(value: string): value is Status {
  return STATUSES.some((s) => s.value === value && s.value !== 'all')
}

/**
 * Founding Student Leader applications.
 *
 * The programme page promises a reply within 7 days, so this is a queue to work
 * through rather than an archive — "new" is the default view for that reason.
 */
export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status = 'all' } = await searchParams

  const supabase = await createClient()
  let query = supabase.from('leader_applications').select('*')
  if (isStatus(status)) query = query.eq('status', status)

  const { data, error } = await query.order('created_at', { ascending: false })
  const applications = (data ?? []) as LeaderApplicationRow[]
  const missingTable = error?.code === 'PGRST205'

  return (
    <div className="mx-auto max-w-[1000px]">
      <header className="mb-6">
        <h1 className="font-display text-3xl font-semibold">Student Leader applications</h1>
        <p className="mt-1 text-[0.92rem] text-muted">
          {applications.length} {applications.length === 1 ? 'application' : 'applications'}
          {status !== 'all' && ` marked ${status}`}
        </p>
      </header>

      {missingTable ? (
        <MissingTable />
      ) : error ? (
        <DatabaseError message={error.message} />
      ) : (
        <>
          <nav className="mb-6 flex flex-wrap gap-2">
            {STATUSES.map(({ value, label }) => (
              <Link
                key={value}
                href={value === 'all' ? '/admin/applications' : `/admin/applications?status=${value}`}
                className={`rounded-full px-4 py-1.5 text-[0.82rem] font-semibold no-underline transition-colors ${
                  status === value
                    ? 'bg-ink text-cream'
                    : 'border-[1.5px] border-line bg-white text-muted hover:border-clay hover:text-clay'
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          {applications.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-clay/40 bg-white p-12 text-center">
              <h2 className="mb-2 font-display text-xl font-semibold">Nothing here yet</h2>
              <p className="text-[0.9rem] text-muted">
                Applications from the Student Leaders page will appear here.
              </p>
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {applications.map((a) => (
                <ApplicationCard key={a.id} application={a} />
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  )
}

function MissingTable() {
  return (
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
  )
}

function DatabaseError({ message }: { message: string }) {
  return (
    <div role="alert" className="rounded-2xl border border-[#e07a50] bg-[#fff0eb] p-8 text-[0.92rem] leading-[1.7] text-[#8b3a1a]">
      <h2 className="mb-2 font-display text-xl font-semibold">Could not load applications</h2>
      <p>The database returned an error. No applications were deleted.</p>
      <p className="mt-2 text-[0.8rem] opacity-80">{message}</p>
    </div>
  )
}
