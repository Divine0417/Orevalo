import type { Metadata } from 'next'
import Link from 'next/link'
import LeaderApplicationForm from '@/components/LeaderApplicationForm'
import {
  ArrowLeft,
  Briefcase,
  GlobeAfrica,
  GlobeGrid,
  Medal,
  Rocket,
  Star,
} from '@/components/icons'

export const metadata: Metadata = {
  title: 'Founding Student Leaders Program',
  description:
    "Join Orevalo's Founding Student Leaders Program. Help shape the platform for African students before it launches.",
}

const BENEFITS = [
  {
    icon: Medal,
    title: 'Founding Leader Certificate',
    body: 'An official certificate recognising your role in building Orevalo from the ground up.',
  },
  {
    icon: Briefcase,
    title: 'LinkedIn Recommendation',
    body: 'A personal recommendation from the Orevalo founder — useful on your career profile.',
  },
  {
    icon: Rocket,
    title: 'Early Product Access',
    body: 'Use Orevalo before it launches publicly. First access to every new feature.',
  },
  {
    icon: GlobeAfrica,
    title: 'Private Leader Community',
    body: 'A WhatsApp group with student leaders from across Africa. Monthly calls with the team.',
  },
  {
    icon: GlobeGrid,
    title: 'Recognition on Orevalo',
    body: 'Your name and university featured on our website as a Founding Student Leader.',
  },
  {
    icon: Star,
    title: 'Priority Opportunities',
    body: 'First access to internships and roles as Orevalo grows, plus references for top contributors.',
  },
]

export default function StudentLeadersPage() {
  return (
    <div className="min-h-screen bg-cream">
      <nav className="flex items-center justify-between border-b border-line px-6 py-[18px] max-sm:px-4">
        <Link href="/" className="font-display text-xl font-bold text-clay no-underline">
          Orevalo
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-[7px] text-[0.85rem] text-ink/60 no-underline transition-opacity hover:text-ink"
        >
          <ArrowLeft /> Back to home
        </Link>
      </nav>

      <section className="bg-ink px-6 py-14 text-center text-cream max-sm:px-4 max-sm:py-10">
        <p className="mb-5 inline-block rounded-[20px] bg-clay px-3.5 py-1.5 text-[0.75rem] font-bold tracking-[0.12em] text-cream uppercase">
          Now Recruiting — Cohort 1
        </p>
        <h1 className="mx-auto mb-4 max-w-[640px] font-display text-[clamp(1.8rem,5vw,2.8rem)] leading-[1.2] font-semibold text-cream">
          Founding Student <span className="text-clay-light">Leaders</span> Program
        </h1>
        <p className="mx-auto max-w-[520px] leading-[1.6] text-cream/75">
          Help us understand what African students really need — and shape the platform before
          anyone else gets access.
        </p>
      </section>

      <section className="mx-auto max-w-[720px] px-6 py-12 max-sm:px-4">
        <p className="mb-5 text-[0.75rem] font-bold tracking-[0.12em] text-clay uppercase">
          What you get
        </p>
        <h2 className="mb-7 font-display text-2xl font-semibold">Real value for your time</h2>
        <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
          {BENEFITS.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-[10px] border border-line bg-[#fff8f2] p-5">
              <span className="mb-2 flex text-[1.4rem] text-clay">
                <Icon />
              </span>
              <h3 className="mb-1 text-[0.95rem] font-bold">{title}</h3>
              <p className="text-[0.82rem] leading-[1.5] text-muted">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <hr className="mx-auto max-w-[720px] border-0 border-t border-line" />

      <section className="mx-auto max-w-[600px] px-6 py-12 pb-16 max-sm:px-4">
        <p className="mb-5 text-[0.75rem] font-bold tracking-[0.12em] text-clay uppercase">
          Apply now
        </p>
        <h2 className="mb-2 font-display text-2xl font-semibold">Tell us about yourself</h2>
        <p className="mb-8 text-[0.9rem] leading-[1.5] text-muted">
          Applications take about 5 minutes. We review every one and get back to you within 7 days.
        </p>

        <LeaderApplicationForm />
      </section>

      <footer className="bg-ink px-6 py-7 text-center text-[0.82rem] text-cream/75">
        <p>
          © 2026 Orevalo ·{' '}
          <a href="mailto:hello@orevalo.com" className="text-clay-light no-underline">
            hello@orevalo.com
          </a>
        </p>
      </footer>
    </div>
  )
}
