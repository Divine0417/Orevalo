import Link from 'next/link'
import SiteFooter from '@/components/SiteFooter'
import SiteNav from '@/components/SiteNav'
import SubscribeForm from '@/components/SubscribeForm'
import { ArrowRight, Check, Dot, GlobeAfrica } from '@/components/icons'
import { getSubscriberCount } from '@/lib/subscribers.server'
import { getSignedIn } from '@/lib/saved.server'
import {
  DEADLINE_ICON,
  RESEARCH,
  faqs,
  features,
  opportunities,
  painPoints,
  phases,
  pricing,
  steps,
  strip,
  testimonials,
  universities,
} from '@/lib/content'

/**
 * Landing page.
 *
 * Content order and claims follow orevalo-roadmap.md: features appear in build
 * order (internships first, AI tutor last), the roadmap section shows the real
 * Phase 0-3 plan, and pricing is stated outright rather than hinted at.
 */
export default async function HomePage() {
  const [subscribers, signedIn] = await Promise.all([getSubscriberCount(), getSignedIn()])

  return (
    <>
      <SiteNav signedIn={signedIn} />
      <Hero subscribers={subscribers} />
      <Strip />
      <Universities />
      <Problem />
      <Features />
      <HowItWorks />
      <Opportunities />
      <Testimonials />
      <Roadmap />
      <Pricing />
      <Faq />
      <AlertsCta subscribers={subscribers} />
      <SiteFooter />
    </>
  )
}

/* ----------------------------------------------------------------- shell -- */

function Section({
  id,
  dark,
  warm,
  children,
}: {
  id?: string
  dark?: boolean
  warm?: boolean
  children: React.ReactNode
}) {
  const tone = dark ? 'bg-ink text-cream' : warm ? 'bg-[#f5ecd9]' : 'bg-cream'
  return (
    <section id={id} className={`scroll-mt-16 px-[5vw] py-25 max-sm:py-18 ${tone}`}>
      {children}
    </section>
  )
}

function SectionHead({
  label,
  title,
  sub,
  dark,
}: {
  label: string
  title: string
  sub: string
  dark?: boolean
}) {
  return (
    <>
      <p
        className={`mb-3 text-[0.75rem] font-bold tracking-[0.12em] uppercase ${dark ? 'text-clay-light' : 'text-clay'}`}
      >
        {label}
      </p>
      <h2
        className={`mb-4 max-w-[600px] font-display text-[clamp(1.8rem,3.5vw,2.8rem)] leading-[1.2] font-semibold tracking-[-0.02em] ${dark ? 'text-white' : ''}`}
      >
        {title}
      </h2>
      <p className={`mb-15 max-w-[520px] leading-[1.7] ${dark ? 'text-cream/65' : 'text-muted'}`}>
        {sub}
      </p>
    </>
  )
}

/* ------------------------------------------------------------------ hero -- */

function Hero({ subscribers }: { subscribers: number }) {
  return (
    <section className="relative flex min-h-[88vh] flex-col items-center justify-center overflow-hidden px-[5vw] pt-20 pb-15 text-center">
      <div className="pointer-events-none absolute -top-25 -right-25 size-[600px] rounded-full bg-[radial-gradient(circle,rgba(196,98,45,0.08)_0%,transparent_70%)]" />
      <div className="pointer-events-none absolute bottom-0 -left-20 size-[400px] rounded-full bg-[radial-gradient(circle,rgba(46,125,94,0.07)_0%,transparent_70%)]" />

      <p className="relative mb-7 inline-flex items-center gap-2 rounded-full bg-moss/10 px-4 py-1.5 text-[0.8rem] font-semibold tracking-[0.08em] text-moss uppercase">
        <GlobeAfrica /> Built for African Students
      </p>

      <div className="relative mb-6 inline-flex items-center gap-2 rounded-full border-[1.5px] border-moss/30 bg-white px-5 py-2 text-[0.85rem] text-muted">
        <span className="size-2 animate-pulse rounded-full bg-moss" />
        <span>
          <strong className="text-ink">The Internship Board is live</strong> — open now, no account
        </span>
      </div>

      <h1 className="relative mb-6 max-w-[820px] font-display text-[clamp(2.4rem,6vw,4.2rem)] leading-[1.15] font-semibold tracking-[-0.03em]">
        Real internships for African students,
        <br />
        <em className="text-clay italic">open right now.</em>
      </h1>

      <p className="relative mb-11 max-w-[560px] text-[clamp(1rem,2vw,1.2rem)] leading-[1.7] text-muted">
        Curated roles from companies hiring students and graduates today — filter by field and
        location, check the deadline, apply direct. Scholarships, CV tools and AI tutoring are on
        the way.
      </p>

      <div className="relative flex flex-wrap justify-center gap-3">
        <Link
          href="/internships"
          className="inline-flex items-center gap-2.5 rounded-full bg-clay px-10 py-4 font-semibold text-white no-underline shadow-[0_4px_24px_rgba(196,98,45,0.25)] transition-transform hover:-translate-y-0.5"
        >
          Browse internships <ArrowRight />
        </Link>
        <a
          href="#alerts"
          className="inline-flex items-center gap-2.5 rounded-full border-[1.5px] border-clay/25 px-10 py-4 font-semibold text-ink no-underline transition-colors hover:border-clay hover:text-clay"
        >
          Get them by email
        </a>
      </div>

      <p className="relative mt-4 text-[0.85rem] text-muted">
        Free to use. No sign-up, no paywall.{' '}
        <strong className="text-clay">{subscribers}+ students</strong> already get our
        opportunity emails.
      </p>
    </section>
  )
}

function Strip() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-10 border-y border-clay/10 bg-[#f5ecd9] px-[5vw] py-5 text-center max-sm:gap-6">
      {strip.map(({ icon: Icon, label }) => (
        <div key={label} className="text-[0.85rem] text-muted">
          <span className="mb-1 flex justify-center text-[1.1rem] text-ink">
            <Icon />
          </span>
          {label}
        </div>
      ))}
    </div>
  )
}

function Universities() {
  return (
    <div className="border-b border-clay/8 bg-cream px-[5vw] py-15 text-center">
      <p className="mb-7 text-[0.8rem] font-bold tracking-[0.12em] text-muted uppercase">
        Students from these universities are already using Orevalo
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3 max-sm:gap-2">
        {universities.map((name) => (
          <span
            key={name}
            className="rounded-full border-[1.5px] border-clay/15 bg-white px-5 py-2 text-[0.82rem] font-semibold whitespace-nowrap"
          >
            {name}
          </span>
        ))}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------- sections -- */

function Problem() {
  return (
    <Section dark>
      <SectionHead
        dark
        label="The Problem"
        title="Students are losing opportunities they never even heard of."
        sub={`We spoke to ${RESEARCH.respondents} Nigerian students and recent graduates. Not one named a dedicated African opportunities platform they already use — the information is scattered across Google, WhatsApp groups and LinkedIn.`}
      />
      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
        {painPoints.map(({ icon: Icon, text }) => (
          <div
            key={text}
            className="rounded-2xl border border-white/8 bg-white/5 p-6 text-[0.95rem] leading-[1.5] text-cream/80"
          >
            <span className="mb-3 block text-[1.6rem] text-clay-light">
              <Icon />
            </span>
            {text}
          </div>
        ))}
      </div>
    </Section>
  )
}

function Features() {
  return (
    <Section id="features">
      <SectionHead
        label="What Orevalo Does"
        title="Six tools, built in the order students asked for."
        sub="Research put internship and scholarship discovery first, so that is what we are building first. Each card shows the phase it ships in — no vapourware."
      />
      <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6">
        {features.map(({ icon: Icon, tone, title, body, phase, status, href }) => {
          const card = (
            <>
              <div className="mb-5 flex items-start justify-between gap-3">
                <div
                  className={`flex size-13 items-center justify-center rounded-[14px] text-2xl ${tone}`}
                >
                  <Icon />
                </div>
                <PhaseBadge phase={phase} status={status} />
              </div>
              <h3 className="mb-2.5 font-display text-[1.2rem] font-semibold tracking-[-0.01em]">
                {title}
              </h3>
              <p className="text-[0.9rem] leading-[1.6] text-muted">{body}</p>
              {href && (
                <span className="mt-4 inline-flex items-center gap-2 text-[0.85rem] font-semibold text-clay">
                  Browse now <ArrowRight />
                </span>
              )}
            </>
          )

          const shell =
            'flex flex-col rounded-[20px] border border-clay/10 bg-white p-8 transition-all hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(196,98,45,0.1)]'

          return href ? (
            <Link key={title} href={href} className={`${shell} no-underline`}>
              {card}
            </Link>
          ) : (
            <div key={title} className={shell}>
              {card}
            </div>
          )
        })}
      </div>
    </Section>
  )
}

function PhaseBadge({
  phase,
  status,
}: {
  phase: string
  status: 'live' | 'building' | 'planned' | 'funding'
}) {
  const tone = {
    live: 'bg-moss text-white',
    building: 'bg-moss/12 text-moss',
    planned: 'bg-clay/10 text-clay',
    funding: 'bg-ink/8 text-muted',
  }[status]

  const label = {
    live: 'Live now',
    building: 'Building now',
    planned: phase,
    funding: 'Needs funding',
  }[status]

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-[0.68rem] font-bold tracking-[0.06em] whitespace-nowrap uppercase ${tone}`}
    >
      {status === 'live' && <span className="size-1.5 animate-pulse rounded-full bg-white" />}
      {label}
    </span>
  )
}

function HowItWorks() {
  return (
    <Section warm>
      <SectionHead
        label="How It Works"
        title="Simple from day one."
        sub="You don't need to figure anything out. Orevalo guides you from sign-up to your next opportunity."
      />
      <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-10">
        {steps.map(({ num, title, body }) => (
          <div key={num}>
            <p className="mb-4 font-display text-5xl leading-none font-semibold text-clay/18">
              {num}
            </p>
            <h3 className="mb-2 text-[1.05rem] font-semibold">{title}</h3>
            <p className="text-[0.9rem] leading-[1.6] text-muted">{body}</p>
          </div>
        ))}
      </div>
    </Section>
  )
}

function Opportunities() {
  const Deadline = DEADLINE_ICON

  return (
    <Section dark>
      <SectionHead
        dark
        label="A Taste of What's Coming"
        title="Real opportunities. Curated for you."
        sub="A preview of the kind of opportunities Orevalo surfaces — scholarships, internships and graduate schemes open to African students."
      />
      <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4">
        {opportunities.map((opp) => (
          <div
            key={opp.title}
            className="rounded-2xl border border-white/10 bg-white/5 p-6 transition-colors hover:border-clay/50"
          >
            <span
              className={`mb-3.5 inline-block rounded-full px-3 py-1 text-[0.7rem] font-bold tracking-[0.1em] uppercase ${opp.type === 'Scholarship'
                  ? 'bg-moss/25 text-[#6ecfa3]'
                  : 'bg-clay/25 text-clay-light'
                }`}
            >
              {opp.type}
            </span>
            <h3 className="mb-2 font-display text-[1.05rem] text-white">{opp.title}</h3>
            <p className="mb-4 text-[0.85rem] leading-[1.5] text-cream/60">{opp.body}</p>
            <p className="flex items-center gap-2 text-[0.78rem] font-semibold text-clay-light">
              <Deadline /> {opp.deadline}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-10 text-center">
        <Link
          href="/internships"
          className="inline-flex items-center gap-2.5 rounded-full border-[1.5px] border-white/25 px-9 py-3.5 text-[0.9rem] font-semibold text-white no-underline transition-colors hover:border-white/40 hover:bg-white/8"
        >
          Browse the internship board <ArrowRight />
        </Link>
      </div>
    </Section>
  )
}

function Testimonials() {
  return (
    <Section>
      <SectionHead
        label="What Students Are Saying"
        title="Real voices. Real frustration. Real need."
        sub={`From our research with ${RESEARCH.respondents} Nigerian students and recent graduates. ${RESEARCH.willingToPay} said they would pay for a tool that solved this, and ${RESEARCH.alreadyUseAi} already use AI tools.`}
      />
      <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6">
        {testimonials.map(({ quote, name, school }) => (
          <figure
            key={name}
            className="relative rounded-[20px] border border-clay/10 bg-white p-8 before:absolute before:top-2 before:left-5 before:font-display before:text-[5rem] before:leading-none before:text-clay/12 before:content-['\201C']"
          >
            <blockquote className="mb-5 pt-5 text-[0.95rem] leading-[1.7] italic">
              {quote}
            </blockquote>
            <figcaption className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-clay/15 font-display font-bold text-clay">
                {name.charAt(0)}
              </span>
              <span>
                <span className="block text-[0.88rem] font-semibold">{name}</span>
                <span className="block text-[0.78rem] text-muted">{school}</span>
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </Section>
  )
}

function Roadmap() {
  return (
    <Section id="roadmap" warm>
      <SectionHead
        label="Our Roadmap"
        title="Here is exactly where we are."
        sub="We build in public. This is the honest plan, phase by phase, so you know what lands when."
      />
      <ol className="relative max-w-[640px] before:absolute before:top-2 before:bottom-2 before:left-[18px] before:w-0.5 before:bg-clay/20">
        {phases.map(({ state, icon: Icon, label, status, title, body }) => (
          <li key={label} className="relative flex gap-6 pb-8 last:pb-0">
            <span
              className={`z-1 flex size-9.5 shrink-0 items-center justify-center rounded-full ${state === 'done'
                  ? 'bg-clay text-white'
                  : state === 'active'
                    ? 'bg-moss text-white ring-4 ring-moss/20'
                    : 'border-2 border-clay/30 bg-white text-muted'
                }`}
            >
              <Icon size="1.05em" />
            </span>
            <div className="pt-1">
              <p className="mb-1 flex flex-wrap items-center gap-x-2 text-[0.75rem] font-bold tracking-[0.08em] uppercase">
                <span className="text-clay">{label}</span>
                <span className={state === 'active' ? 'text-moss' : 'text-muted/70'}>
                  · {status}
                </span>
              </p>
              <h3 className="mb-1 font-semibold">{title}</h3>
              <p className="text-[0.88rem] leading-[1.55] text-muted">{body}</p>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  )
}

function Pricing() {
  return (
    <Section id="pricing">
      <SectionHead
        label="Pricing"
        title="Free at launch. Paid when it earns its place."
        sub={`Browse and apply for free while we build the product around real student needs. ${RESEARCH.willingToPay} of the students we surveyed said they would pay for this, at around ${RESEARCH.pricePoint} a month — so we will test a NGN 1,000 founding plan before the full NGN 2,000 Premium plan.`}
      />
      <div className="grid max-w-[840px] grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6">
        {pricing.map(({ name, price, cadence, highlight, features: perks }) => (
          <div
            key={name}
            className={`flex flex-col rounded-[20px] p-8 ${highlight
                ? 'border-2 border-clay bg-white shadow-[0_12px_40px_rgba(196,98,45,0.12)]'
                : 'border border-clay/10 bg-white'
              }`}
          >
            <div className="mb-6">
              <p className="mb-2 text-[0.75rem] font-bold tracking-[0.12em] text-clay uppercase">
                {name}
              </p>
              <p className="font-display text-[2.2rem] leading-none font-semibold">{price}</p>
              <p className="mt-1 text-[0.85rem] text-muted">{cadence}</p>
            </div>
            <ul className="flex flex-col gap-3">
              {perks.map((perk) => (
                <li key={perk} className="flex items-start gap-2.5 text-[0.9rem]">
                  <span className="mt-0.5 flex shrink-0 text-clay">
                    <Check size="0.9em" />
                  </span>
                  {perk}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="mt-6 max-w-[560px] text-[0.85rem] leading-[1.6] text-muted">
        No paid plan is available yet. Universities can later license Orevalo so every enrolled student gets Premium at no personal cost.
        Email <a href="mailto:hello@orevalo.com" className="font-semibold text-clay">hello@orevalo.com</a>.
      </p>
    </Section>
  )
}

/** Native <details> — an accordion with no JavaScript and no hydration cost. */
function Faq() {
  return (
    <Section warm>
      <SectionHead
        label="Got Questions?"
        title="Frequently asked questions."
        sub="Everything you need to know about Orevalo."
      />
      <div className="flex max-w-[720px] flex-col gap-3">
        {faqs.map(({ q, a }) => (
          <details
            key={q}
            className="group rounded-2xl border border-clay/10 bg-white"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-6 py-5 text-[0.95rem] font-semibold">
              {q}
              <span className="shrink-0 text-[1.2rem] leading-none text-clay transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="px-6 pb-5 text-[0.9rem] leading-[1.7] text-muted">{a}</p>
          </details>
        ))}
      </div>
    </Section>
  )
}

function AlertsCta({ subscribers }: { subscribers: number }) {
  return (
    <section id="alerts" className="scroll-mt-16 bg-clay px-[5vw] py-25 text-center max-sm:py-18">
      <h2 className="mx-auto mb-4 max-w-[600px] font-display text-[clamp(1.8rem,3.5vw,2.8rem)] leading-[1.2] font-semibold tracking-[-0.02em] text-white">
        New opportunities, straight to your inbox.
      </h2>
      <p className="mx-auto mb-4 max-w-[480px] leading-[1.7] text-white/80">
        The board is already open — you do not need to sign up to use it. Give us your email and
        we will send you the new internships and scholarships as we curate them, so you never find
        one a week after it closed.
      </p>
      <p className="mb-8 inline-flex items-center gap-2 rounded-full bg-white/15 px-5 py-1.5 text-[0.85rem] text-white/90">
        <span className="flex text-[#6ecfa3]">
          <Dot size="0.7em" />
        </span>
        {subscribers} students already subscribed
      </p>
      <SubscribeForm />
    </section>
  )
}
