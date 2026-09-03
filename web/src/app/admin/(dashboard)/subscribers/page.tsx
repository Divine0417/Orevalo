import { createClient } from '@/lib/supabase/server'
import ExportButton from '../../ExportButton'
import { isMailerConfigured } from '@/lib/email'

type Subscriber = {
  id: string
  email: string
  source: string
  unsubscribed: boolean
  confirmed: boolean
  created_at: string
}

/**
 * The people who asked for opportunity emails.
 *
 * This list is the point of owning a subscribers table rather than leaving
 * signups in Formspree: Phase 3 alerts have to send to something.
 */
export default async function SubscribersPage() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('subscribers')
    .select('id, email, source, unsubscribed, confirmed, created_at')
    .order('created_at', { ascending: false })

  const subscribers = (data ?? []) as Subscriber[]
  const missingTable = error?.code === 'PGRST205'
  const active = subscribers.filter((s) => !s.unsubscribed)
  // Only confirmed addresses are safe to bulk mail.
  const mailable = active.filter((s) => s.confirmed)
  const pending = active.length - mailable.length

  return (
    <div className="mx-auto max-w-[1000px]">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold">Subscribers</h1>
          <p className="mt-1 text-[0.92rem] text-muted">
            {active.length} active
            {pending > 0 && ` · ${pending} awaiting confirmation`}
            {subscribers.length !== active.length &&
              ` · ${subscribers.length - active.length} unsubscribed`}
          </p>
        </div>
        {mailable.length > 0 && <ExportButton rows={mailable.map((s) => s.email)} />}
      </header>

      {!isMailerConfigured && (
        <div className="mb-6 rounded-2xl border border-[#e07a50] bg-[#fff0eb] px-5 py-4 text-[0.88rem] leading-[1.6] text-[#8b3a1a]">
          <strong>Single opt-in is active.</strong> No <code>RESEND_API_KEY</code> is set, so
          confirmation emails cannot be sent and new signups are trusted as-is. Anyone can enter
          someone else&apos;s address. Add a Resend key to switch on double opt-in.
        </div>
      )}

      {missingTable ? (
        <div className="rounded-2xl border border-[#e07a50] bg-[#fff0eb] p-8 text-[0.92rem] leading-[1.7] text-[#8b3a1a]">
          <h2 className="mb-2 font-display text-xl font-semibold">Table not created yet</h2>
          <p>
            Run{' '}
            <code className="rounded bg-white/60 px-1.5 py-0.5">
              supabase/migrations/0002_scholarships_and_subscribers.sql
            </code>{' '}
            in the Supabase SQL editor. Until then signups still reach Formspree, but they are not
            being stored here.
          </p>
        </div>
      ) : subscribers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-clay/40 bg-white p-12 text-center">
          <h2 className="mb-2 font-display text-xl font-semibold">No subscribers yet</h2>
          <p className="text-[0.9rem] text-muted">
            Emails collected from the landing page will appear here.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-white">
          <table className="w-full min-w-[520px] border-collapse text-left">
            <thead>
              <tr className="border-b border-line">
                <Th>Email</Th>
                <Th>Source</Th>
                <Th>Joined</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((s) => (
                <tr key={s.id} className="border-b border-line last:border-0">
                  <Td>
                    <a
                      href={`mailto:${s.email}`}
                      className="font-semibold text-ink no-underline hover:text-clay"
                    >
                      {s.email}
                    </a>
                  </Td>
                  <Td muted>{s.source}</Td>
                  <Td muted>
                    {new Date(s.created_at).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </Td>
                  <Td>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[0.7rem] font-bold uppercase ${
                        s.unsubscribed
                          ? 'bg-ink/8 text-muted'
                          : s.confirmed
                            ? 'bg-moss/12 text-moss'
                            : 'bg-clay/10 text-clay'
                      }`}
                    >
                      {s.unsubscribed ? 'Unsubscribed' : s.confirmed ? 'Confirmed' : 'Unconfirmed'}
                    </span>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-5 py-3 text-[0.72rem] font-bold tracking-[0.1em] text-muted uppercase">
      {children}
    </th>
  )
}

function Td({ children, muted }: { children: React.ReactNode; muted?: boolean }) {
  return <td className={`px-5 py-3 text-[0.9rem] ${muted ? 'text-muted' : ''}`}>{children}</td>
}
