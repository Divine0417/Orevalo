import Link from 'next/link'
import { ArrowRight, Bell, CalendarClock, Check } from '@/components/icons'
import { daysUntil, formatDeadline } from '@/lib/listings'
import type { AlertPreferences } from './AlertPreferencesForm'

type Profile = {
  full_name?: string | null
  university?: string | null
  course?: string | null
  year_of_study?: string | null
  country?: string | null
} | null

type Deadline = { date: string | null; title: string }

export default function ReadinessPanel({
  profile,
  listings,
  scholarships,
  alertPreferences,
}: {
  profile: Profile
  listings: Deadline[]
  scholarships: Deadline[]
  alertPreferences: AlertPreferences | null
}) {
  const profileFields = [
    ['full_name', 'your name', profile?.full_name],
    ['university', 'your university', profile?.university],
    ['course', 'your course', profile?.course],
    ['year_of_study', 'your study year', profile?.year_of_study],
    ['country', 'your country', profile?.country],
  ] as const
  const complete = profileFields.filter(([, , value]) => Boolean(value?.trim())).length
  const percentage = Math.round((complete / profileFields.length) * 100)
  const nextMissing = profileFields.find(([, , value]) => !value?.trim())
  const deadlines = [...listings, ...scholarships]
    .filter((item) => item.date && daysUntil(item.date) >= 0)
    .sort((a, b) => a.date!.localeCompare(b.date!))
  const nextDeadline = deadlines[0]
  const frequency = alertPreferences?.frequency ?? 'weekly'
  const alertLabel = frequency === 'off' ? 'Alerts are off' : `${frequency[0].toUpperCase()}${frequency.slice(1)} alerts on`

  return (
    <section className="mb-10 rounded-3xl border border-clay/20 bg-ink p-6 text-cream max-sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="mb-2 text-[0.72rem] font-bold tracking-[0.12em] text-clay-light uppercase">Opportunity readiness</p>
          <h2 className="font-display text-2xl font-semibold">Build a profile that works for you.</h2>
          <p className="mt-2 max-w-[500px] text-[0.88rem] leading-[1.6] text-cream/65">
            Complete your details so future opportunity matches can be more relevant.
          </p>
        </div>
        <div className="flex size-20 shrink-0 flex-col items-center justify-center rounded-full border-4 border-clay-light/30 text-center">
          <strong className="font-display text-xl text-white">{percentage}%</strong>
          <span className="text-[0.62rem] text-cream/60">complete</span>
        </div>
      </div>

      <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/12">
        <span className="block h-full rounded-full bg-clay-light" style={{ width: `${percentage}%` }} />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 border-t border-white/12 pt-5 text-[0.85rem] max-sm:grid-cols-1">
        {profileFields.slice(1).map(([key, label, value]) => (
          <div key={key} className="flex items-center justify-between gap-4">
            <span className="text-cream/55">{label}</span>
            <span className={`text-right font-semibold ${value?.trim() ? 'text-white' : 'text-cream/40'}`}>
              {value?.trim() || 'Not added'}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3 max-md:grid-cols-1">
        <Summary icon={<Check />} label="Profile details" value={`${complete} of ${profileFields.length} added`} />
        <Summary icon={<CalendarClock />} label="Next saved deadline" value={nextDeadline ? formatDeadline(nextDeadline.date!) : 'None saved yet'} />
        <Summary icon={<Bell />} label="Opportunity alerts" value={alertLabel} />
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/12 pt-5">
        <p className="text-[0.85rem] text-cream/70">
          {nextMissing ? `Next step: add ${nextMissing[1]}.` : 'Your core profile is ready for matching.'}
        </p>
        {nextMissing ? (
          <a href="#your-details" className="inline-flex items-center gap-2 rounded-full bg-cream px-5 py-2.5 text-[0.84rem] font-bold text-ink no-underline hover:bg-white">
            Complete profile <ArrowRight />
          </a>
        ) : (
          <Link href="/internships" className="inline-flex items-center gap-2 rounded-full bg-cream px-5 py-2.5 text-[0.84rem] font-bold text-ink no-underline hover:bg-white">
            Browse opportunities <ArrowRight />
          </Link>
        )}
      </div>
    </section>
  )
}

function Summary({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/12 bg-white/8 p-4">
      <span className="mb-3 flex text-clay-light">{icon}</span>
      <p className="text-[0.7rem] font-bold tracking-[0.08em] text-cream/55 uppercase">{label}</p>
      <p className="mt-1 text-[0.88rem] font-semibold text-white">{value}</p>
    </div>
  )
}
