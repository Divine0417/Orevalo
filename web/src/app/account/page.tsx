import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import ProfileForm from './ProfileForm'
import AlertPreferencesForm, { type AlertPreferences } from './AlertPreferencesForm'
import ReadinessPanel from './ReadinessPanel'
import SiteFooter from '@/components/SiteFooter'
import SiteNav from '@/components/SiteNav'
import { ArrowRight, Briefcase, CalendarClock, GraduationCap } from '@/components/icons'
import { signOut } from '@/app/auth-actions'
import { createClient, getCurrentUser } from '@/lib/supabase/server'
import { daysUntil, formatDeadline } from '@/lib/listings'
import SavedStatusSelect from './SavedStatusSelect'
import SavedNotesForm from './SavedNotesForm'
import type { ApplicationStatus } from '@/lib/supabase/types'

export const metadata: Metadata = {
  title: 'Your account',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

type Saved = { id: string; kind: 'listing' | 'scholarship'; slug: string; status: ApplicationStatus; notes: string | null }

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { user, profile, isAdmin } = await getCurrentUser()
  if (!user) redirect('/login?next=/account')

  const supabase = await createClient()
  const { status: rawStatus = 'all' } = await searchParams
  const statuses: Array<ApplicationStatus | 'all'> = ['all', 'interested', 'preparing', 'applied', 'interviewing', 'accepted', 'rejected']
  const status = statuses.includes(rawStatus as ApplicationStatus) ? rawStatus as ApplicationStatus | 'all' : 'all'
  const [{ data: savedRows }, { data: alertPreferences }] = await Promise.all([
    supabase
      .from('saved_opportunities')
      .select('id, kind, slug, status, notes')
      .order('created_at', { ascending: false }),
    supabase.from('alert_preferences').select('*').maybeSingle(),
  ])

  const saved = (savedRows ?? []) as Saved[]
  const counts = saved.reduce<Record<ApplicationStatus, number>>((result, item) => {
    result[item.status] = (result[item.status] ?? 0) + 1
    return result
  }, { interested: 0, preparing: 0, applied: 0, interviewing: 0, accepted: 0, rejected: 0 })
  const visibleSaved = status === 'all' ? saved : saved.filter((item) => item.status === status)
  const listingSlugs = visibleSaved.filter((s) => s.kind === 'listing').map((s) => s.slug)
  const scholarshipSlugs = visibleSaved.filter((s) => s.kind === 'scholarship').map((s) => s.slug)

  // Fetch the saved rows themselves. Saved items reference slugs rather than
  // foreign keys, so anything the team has since removed simply drops out.
  const [listingsRes, scholarshipsRes] = await Promise.all([
    listingSlugs.length
      ? supabase
          .from('listings')
          .select('slug, company, title, location, deadline, apply_url')
          .in('slug', listingSlugs)
          .eq('published', true)
      : Promise.resolve({ data: [] }),
    scholarshipSlugs.length
      ? supabase
          .from('scholarships')
          .select('slug, name, funder, deadline, apply_url')
          .in('slug', scholarshipSlugs)
          .eq('published', true)
      : Promise.resolve({ data: [] }),
  ])

  const listings = listingsRes.data ?? []
  const scholarships = scholarshipsRes.data ?? []
  const total = listings.length + scholarships.length
  const deadlineWarnings = [...listings, ...scholarships].filter((item) => item.deadline && daysUntil(String(item.deadline)) >= 0 && daysUntil(String(item.deadline)) <= 7)

  return (
    <>
      <SiteNav signedIn />

      <main className="mx-auto w-full max-w-[860px] px-6 py-12 max-sm:px-4">
        <header className="mb-10 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-semibold">
              {profile?.full_name ? `Hello, ${profile.full_name.split(' ')[0]}` : 'Your account'}
            </h1>
            <p className="mt-1 text-[0.92rem] text-muted">{profile?.email ?? user.email}</p>
          </div>
          <div className="flex items-center gap-3">
            {isAdmin && (
              <Link
                href="/admin"
                className="rounded-full border-[1.5px] border-clay px-5 py-2.5 text-[0.85rem] font-semibold text-clay no-underline transition-colors hover:bg-clay hover:text-white"
              >
                Admin dashboard
              </Link>
            )}
            <form action={signOut}>
              <button
                type="submit"
                className="cursor-pointer rounded-full border-[1.5px] border-line px-5 py-2.5 text-[0.85rem] font-semibold text-muted transition-colors hover:border-clay hover:text-clay"
              >
                Sign out
              </button>
            </form>
          </div>
        </header>

        <ReadinessPanel
          profile={profile}
          listings={listings.map((listing) => ({ date: listing.deadline as string, title: listing.title as string }))}
          scholarships={scholarships.map((scholarship) => ({ date: scholarship.deadline as string | null, title: scholarship.name as string }))}
          alertPreferences={(alertPreferences as AlertPreferences | null) ?? null}
        />

        <section className="mb-10 rounded-2xl border border-line bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-xl font-semibold">Application tracker</h2>
              <p className="mt-1 text-[0.85rem] text-muted">Keep every opportunity moving forward.</p>
            </div>
            {deadlineWarnings.length > 0 && <p className="rounded-full bg-[#fff0eb] px-3 py-1.5 text-[0.78rem] font-bold text-[#8b3a1a]">{deadlineWarnings.length} deadline{deadlineWarnings.length === 1 ? '' : 's'} this week</p>}
          </div>
          <div className="mt-5 grid grid-cols-3 gap-2 max-sm:grid-cols-2">
            {(['interested', 'preparing', 'applied', 'interviewing', 'accepted', 'rejected'] as const).map((value) => (
              <Link key={value} href={value === status ? '/account' : `/account?status=${value}`} className={`rounded-xl px-3 py-2.5 text-center no-underline ${status === value ? 'bg-ink text-white' : 'bg-cream text-muted hover:bg-cream-deep'}`}>
                <strong className="block font-display text-lg">{counts[value]}</strong>
                <span className="text-[0.7rem] font-bold tracking-[0.04em] uppercase">{value}</span>
              </Link>
            ))}
          </div>
          {status !== 'all' && <Link href="/account" className="mt-4 inline-block text-[0.8rem] font-semibold text-clay no-underline">Show all saved opportunities</Link>}
        </section>

        <section className="mb-10">
          <h2 className="mb-1 font-display text-xl font-semibold">Saved opportunities</h2>
          <p className="mb-5 text-[0.88rem] text-muted">
            {total > 0
              ? `${total} saved. Deadlines shown so nothing slips past you.`
              : 'Nothing saved yet.'}
          </p>

          {total === 0 ? (
            <div className="rounded-2xl border border-dashed border-clay/40 bg-white p-10 text-center">
              <p className="mb-5 text-[0.9rem] leading-[1.7] text-muted">
                Tap <strong className="text-ink">Save</strong> on any internship or scholarship and
                it will be waiting here.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link
                  href="/internships"
                  className="inline-flex items-center gap-2 rounded-full bg-clay px-6 py-3 font-bold text-white no-underline transition-colors hover:bg-clay-dark"
                >
                  Browse internships <ArrowRight />
                </Link>
                <Link
                  href="/scholarships"
                  className="inline-flex items-center gap-2 rounded-full border-[1.5px] border-line px-6 py-3 font-semibold text-muted no-underline transition-colors hover:border-clay hover:text-clay"
                >
                  Browse scholarships
                </Link>
              </div>
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {listings.map((l) => (
                <SavedCard
                  key={`listing-${l.slug}`}
                  icon={<Briefcase />}
                  eyebrow={l.company as string}
                  title={l.title as string}
                  meta={`${l.location} · Deadline ${formatDeadline(l.deadline as string)}`}
                  href={l.apply_url as string}
                  saved={saved.find((item) => item.slug === l.slug && item.kind === 'listing')}
                />
              ))}
              {scholarships.map((s) => (
                <SavedCard
                  key={`scholarship-${s.slug}`}
                  icon={<GraduationCap />}
                  eyebrow={s.funder as string}
                  title={s.name as string}
                  meta={
                    s.deadline
                      ? `Deadline ${formatDeadline(s.deadline as string)}`
                      : 'Rolling — check the funder'
                  }
                  href={s.apply_url as string}
                  saved={saved.find((item) => item.slug === s.slug && item.kind === 'scholarship')}
                />
              ))}
            </ul>
          )}
        </section>

        <section id="your-details">
          <h2 className="mb-1 font-display text-xl font-semibold">Your details</h2>
          <p className="mb-5 text-[0.88rem] leading-[1.6] text-muted">
            Optional today. When opportunity alerts land, these are what we match against — so the
            emails are about roles you could actually get.
          </p>
          <ProfileForm profile={profile} />
        </section>

        <section className="mt-10">
          <h2 className="mb-1 font-display text-xl font-semibold">Opportunity alerts</h2>
          <p className="mb-5 text-[0.88rem] leading-[1.6] text-muted">
            We will use these choices when alert emails become available.
          </p>
          <AlertPreferencesForm initial={(alertPreferences as AlertPreferences | null) ?? null} />
        </section>
      </main>

      <SiteFooter />
    </>
  )
}

function SavedCard({
  icon,
  eyebrow,
  title,
  meta,
  href,
  saved,
}: {
  icon: React.ReactNode
  eyebrow: string
  title: string
  meta: string
  href: string
  saved?: Saved
}) {
  return (
    <li className="rounded-2xl border border-line bg-white p-5">
      <div className="flex min-w-0 items-start gap-3.5">
        <span className="mt-0.5 flex shrink-0 text-[1.1rem] text-clay">{icon}</span>
        <div className="min-w-0">
          <p className="text-[0.82rem] font-bold text-clay">{eyebrow}</p>
          <h3 className="font-display text-[1.05rem] font-semibold">{title}</h3>
          <p className="mt-0.5 flex items-center gap-2 text-[0.84rem] text-muted">
            <CalendarClock size="0.95em" /> {meta}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-end gap-2 max-sm:w-full max-sm:flex-col max-sm:items-stretch">
        {saved && <SavedStatusSelect id={saved.id} initialStatus={saved.status} />}
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-clay px-5 py-2.5 text-[0.85rem] font-bold text-white no-underline transition-colors hover:bg-clay-dark"
        >
          Apply <ArrowRight />
        </a>
      </div>
      {saved && <SavedNotesForm id={saved.id} initialNotes={saved.notes} />}
    </li>
  )
}
