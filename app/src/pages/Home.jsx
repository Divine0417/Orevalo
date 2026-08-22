import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Bell,
  Close,
  Dot,
  GlobeAfrica,
  Instagram,
  LinkedIn,
  Mailbox,
  Rocket,
  Seedling,
  XTwitter,
} from '../components/icons/Icons.jsx'
import SiteNav from '../components/SiteNav.jsx'
import {
  DEADLINE_ICON,
  WAITLIST_COUNT,
  faqs,
  features,
  opportunities,
  painPoints,
  steps,
  strip,
  testimonials,
  timeline,
  universities,
} from '../data/home.js'
import { footerLinks } from '../data/nav.js'
import './Home.css'

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xpqgljzy'

export default function Home() {
  return (
    <div className="page-home">
      <StudentLeadersPopup />
      <SiteNav />
      <Hero />
      <Strip />
      <Universities />
      <Problem />
      <Features />
      <HowItWorks />
      <Opportunities />
      <Testimonials />
      <Timeline />
      <Faq />
      <WaitlistCta />
      <Footer />
    </div>
  )
}

/* -- popup -- */

/** Appears 3s after load, once per browser session. */
function StudentLeadersPopup() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem('sl-popup-closed')) return
    const timer = setTimeout(() => setOpen(true), 3000)
    return () => clearTimeout(timer)
  }, [])

  function close() {
    setOpen(false)
    sessionStorage.setItem('sl-popup-closed', '1')
  }

  if (!open) return null

  return (
    <div className="sl-overlay" role="dialog" aria-modal="true" aria-label="Student Leaders Program">
      <div className="sl-modal">
        <button className="sl-close" onClick={close} aria-label="Close">
          <Close />
        </button>
        <div className="sl-eyebrow">
          <GlobeAfrica /> Now Recruiting
        </div>
        <h2>Join the Orevalo Student Leaders Program</h2>
        <p>
          We&apos;re looking for passionate African students to help shape Orevalo before it
          launches. Get early access, be part of the founding community, and help build something
          that matters.
        </p>
        <Link to="/student-leaders" className="sl-apply" onClick={close}>
          Apply Now <ArrowRight />
        </Link>
        <button className="sl-later" onClick={close}>
          Maybe later
        </button>
      </div>
    </div>
  )
}

/* -- nav -- */

/* -- hero -- */

function Hero() {
  return (
    <section className="hero">
      <div className="hero-tag">
        <GlobeAfrica /> Built for African Students
      </div>
      <div className="counter-badge">
        <span className="dot" />
        <span>
          <strong>{WAITLIST_COUNT}+ African students</strong> already on the waitlist
        </span>
      </div>
      <h1>
        Your studies, your career,
        <br />
        <em>all in one place.</em>
      </h1>
      <p className="hero-sub">
        Orevalo brings AI tutoring, scholarship discovery, CV building, and career guidance together
        — so you spend less time searching and more time succeeding.
      </p>
      <a href="#waitlist" className="hero-cta">
        Claim Your Free Spot <ArrowRight />
      </a>
      <p className="hero-note">
        <strong>{WAITLIST_COUNT}+ students</strong> already waiting. Free forever. Launching 2026.
      </p>
    </section>
  )
}

function Strip() {
  return (
    <div className="strip">
      {strip.map(({ icon: Icon, label }) => (
        <div className="strip-item" key={label}>
          <span className="strip-icon">
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
    <div className="universities">
      <p>Students from these universities are already waiting</p>
      <div className="uni-logos">
        {universities.map((name) => (
          <span className="uni-badge" key={name}>
            {name}
          </span>
        ))}
      </div>
    </div>
  )
}

/* -- sections -- */

function Problem() {
  return (
    <section className="problem">
      <div className="section-label">The Problem</div>
      <h2 className="section-title">
        Students are losing opportunities they never even heard of.
      </h2>
      <p className="section-sub">
        Every year, thousands of African students miss out on scholarships, internships, and jobs —
        not because they aren&apos;t qualified, but because the information is buried across dozens
        of websites.
      </p>
      <div className="pain-grid">
        {painPoints.map(({ icon: Icon, text }) => (
          <div className="pain-card" key={text}>
            <span className="icon">
              <Icon />
            </span>
            {text}
          </div>
        ))}
      </div>
    </section>
  )
}

function Features() {
  return (
    <section className="features" id="features">
      <div className="section-label">What Orevalo Does</div>
      <h2 className="section-title">Everything a student needs, finally together.</h2>
      <p className="section-sub">
        Six core tools designed around the real challenges African students face — from studying to
        landing their first opportunity.
      </p>
      <div className="features-grid">
        {features.map(({ icon: Icon, tone, title, body }) => (
          <div className="feature-card" key={title}>
            <div className={`feature-icon ${tone}`}>
              <Icon />
            </div>
            <h3>{title}</h3>
            <p>{body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function HowItWorks() {
  return (
    <section className="how">
      <div className="section-label">How It Works</div>
      <h2 className="section-title">Simple from day one.</h2>
      <p className="section-sub">
        You don&apos;t need to figure anything out. Orevalo guides you from sign-up to your next
        opportunity.
      </p>
      <div className="steps">
        {steps.map(({ num, title, body }) => (
          <div className="step" key={num}>
            <div className="step-num">{num}</div>
            <h3>{title}</h3>
            <p>{body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function Opportunities() {
  const Deadline = DEADLINE_ICON

  return (
    <section className="opportunities">
      <div className="section-label">A Taste of What&apos;s Coming</div>
      <h2 className="section-title">Real opportunities. Curated for you.</h2>
      <p className="section-sub">
        Here is a preview of the kind of opportunities Orevalo will surface for you every day —
        scholarships, internships, and more.
      </p>
      <div className="opp-grid">
        {opportunities.map((opp) => (
          <div className="opp-card" key={opp.title}>
            <span className={`opp-type ${opp.type}`}>{opp.typeLabel}</span>
            <h4>{opp.title}</h4>
            <p>{opp.body}</p>
            <div className="opp-deadline">
              <Deadline /> {opp.deadline}
            </div>
          </div>
        ))}
      </div>
      <div className="opp-cta">
        <a href="#waitlist">
          Join the waitlist to get 100s more opportunities like these <ArrowRight />
        </a>
      </div>
    </section>
  )
}

function Testimonials() {
  return (
    <section className="testimonials">
      <div className="section-label">What Students Are Saying</div>
      <h2 className="section-title">Real voices. Real frustration. Real need.</h2>
      <p className="section-sub">
        These are words from Nigerian students who told us exactly what they are going through.
        Orevalo was built around their reality.
      </p>
      <div className="testimonials-grid">
        {testimonials.map(({ quote, name, school }) => (
          <div className="testimonial-card" key={name}>
            <p className="testimonial-text">{quote}</p>
            <div className="testimonial-author">
              <div className="testimonial-avatar">{name.charAt(0)}</div>
              <div>
                <div className="testimonial-name">{name}</div>
                <div className="testimonial-school">{school}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function Timeline() {
  return (
    <section className="timeline">
      <div className="section-label">Our Roadmap</div>
      <h2 className="section-title">Here is exactly where we are.</h2>
      <p className="section-sub">
        We believe in building in public. Here is our honest timeline so you know what to expect.
      </p>
      <div className="timeline-track">
        {timeline.map(({ state, icon: Icon, date, title, body }) => (
          <div className="tl-item" key={title}>
            <div className={`tl-dot ${state}`}>
              <Icon size="1.1em" />
            </div>
            <div className="tl-content">
              <div className="tl-date">{date}</div>
              <h4>{title}</h4>
              <p>{body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

/** Accordion: one open at a time, height animated off the measured content. */
function Faq() {
  const [openIndex, setOpenIndex] = useState(null)
  const answerRefs = useRef([])

  return (
    <section className="faq">
      <div className="section-label">Got Questions?</div>
      <h2 className="section-title">Frequently asked questions.</h2>
      <p className="section-sub">Everything you need to know about Orevalo.</p>
      <div className="faq-list">
        {faqs.map(({ q, a }, i) => {
          const isOpen = openIndex === i
          return (
            <div className="faq-item" key={q}>
              <button
                className={`faq-q ${isOpen ? 'open' : ''}`}
                onClick={() => setOpenIndex(isOpen ? null : i)}
                aria-expanded={isOpen}
              >
                {q} <span className="arrow">+</span>
              </button>
              <div
                className="faq-a"
                ref={(el) => {
                  answerRefs.current[i] = el
                }}
                style={{ maxHeight: isOpen ? `${answerRefs.current[i]?.scrollHeight ?? 400}px` : 0 }}
              >
                <p>{a}</p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

/* -- waitlist -- */

function WaitlistCta() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // idle | sending | error
  const [showThanks, setShowThanks] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setStatus('sending')
    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email, _subject: 'New Waitlist Signup — Orevalo' }),
      })
      if (!res.ok) throw new Error('Signup failed')

      window.gtag?.('event', 'waitlist_signup', {
        event_category: 'conversion',
        event_label: 'Waitlist Form Submission',
        value: 1,
      })
      setStatus('idle')
      setShowThanks(true)
    } catch {
      setStatus('error')
    }
  }

  const label =
    status === 'sending' ? 'Joining...' : status === 'error' ? 'Try again' : 'Claim Your Spot'

  return (
    <>
      <section className="cta-section" id="waitlist">
        <h2 className="section-title">
          {WAITLIST_COUNT}+ African students are already waiting. Are you next?
        </h2>
        <p className="cta-sub">
          Orevalo is being built for students like you. Join the waitlist and be the first to know
          when we launch.
        </p>
        <div className="cta-counter">
          <span className="live-dot">
            <Dot size="0.7em" />
          </span>
          {WAITLIST_COUNT} students and counting
        </div>
        <form className="waitlist-form" onSubmit={submit}>
          <div className="waitlist-row">
            <input
              type="email"
              name="email"
              placeholder="Enter your email address"
              required
              className="waitlist-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button type="submit" className="cta-white waitlist-btn" disabled={status === 'sending'}>
              {label} <ArrowRight />
            </button>
          </div>
          <p className="waitlist-note">
            Free forever. No spam. Early access when we launch in 2026.
          </p>
        </form>
      </section>

      {showThanks && <ThankYouOverlay onClose={() => setShowThanks(false)} />}
    </>
  )
}

function ThankYouOverlay({ onClose }) {
  return (
    <div className="ty-overlay" role="dialog" aria-modal="true" aria-label="You are in">
      <div className="ty-modal">
        <div className="ty-mark">
          <Seedling />
        </div>
        <div className="ty-badge">
          <span className="dot" /> You are in!
        </div>
        <h2>
          Welcome to <em>Orevalo.</em>
        </h2>
        <p className="ty-sub">
          You are now part of a growing community of African students who refuse to be held back by
          lack of access. We will email you when we launch.
        </p>
        <div className="ty-list">
          <div className="ty-list-item">
            <span className="ty-icon">
              <Mailbox />
            </span>
            <span>
              <strong>Check your email</strong> — a welcome message is on its way from
              hello@orevalo.com
            </span>
          </div>
          <div className="ty-list-item">
            <span className="ty-icon">
              <Bell />
            </span>
            <span>
              <strong>Follow @OrevaloAI</strong> — we post opportunities and updates every week
            </span>
          </div>
          <div className="ty-list-item">
            <span className="ty-icon">
              <Rocket />
            </span>
            <span>
              <strong>You are first in line</strong> — waitlist members get priority access at launch
              in Q4 2026
            </span>
          </div>
        </div>
        <div className="ty-socials">
          <a href="https://instagram.com/orevaloai" target="_blank" rel="noreferrer">
            <Instagram /> Instagram
          </a>
          <a href="https://x.com/OrevaloAI" target="_blank" rel="noreferrer">
            <XTwitter /> Twitter / X
          </a>
          <a href="https://www.linkedin.com/company/orevalo/" target="_blank" rel="noreferrer">
            <LinkedIn /> LinkedIn
          </a>
        </div>
        <button className="ty-back" onClick={onClose}>
          Back to Orevalo <ArrowRight />
        </button>
      </div>
    </div>
  )
}

/* -- footer -- */

function Footer() {
  return (
    <footer>
      <span className="logo">Orevalo</span>
      <nav className="footer-nav" aria-label="Pages">
        {footerLinks.map(({ to, label }) => (
          <Link key={to} to={to}>
            {label}
          </Link>
        ))}
      </nav>
      <p style={{ marginBottom: 12 }}>
        <a href="mailto:hello@orevalo.com">hello@orevalo.com</a>
        <a href="https://x.com/OrevaloAI" target="_blank" rel="noreferrer">
          Twitter / X
        </a>
        <a href="https://instagram.com/orevaloai" target="_blank" rel="noreferrer">
          Instagram
        </a>
        <a href="https://www.linkedin.com/company/orevalo/" target="_blank" rel="noreferrer">
          LinkedIn
        </a>
      </p>
      <p>© 2026 Orevalo. Built with purpose for African students.</p>
    </footer>
  )
}
