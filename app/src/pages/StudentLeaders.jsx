import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  Briefcase,
  ChevronDown,
  GlobeAfrica,
  GlobeGrid,
  Medal,
  Rocket,
  Seedling,
  Star,
} from '../components/icons/Icons.jsx'
import './StudentLeaders.css'

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xpqgljzy'

const BENEFITS = [
  {
    icon: Medal,
    title: 'Founding Leader Certificate',
    body: 'An official certificate recognising your role in building Orevalo from the ground up.',
  },
  {
    icon: Briefcase,
    title: 'LinkedIn Recommendation',
    body: 'A personal recommendation from the Orevalo founder — great for your career profile.',
  },
  {
    icon: Rocket,
    title: 'Early Product Access',
    body: 'Use Orevalo months before it launches publicly. First access to every new feature.',
  },
  {
    icon: GlobeAfrica,
    title: 'Private Leader Community',
    body: 'A WhatsApp group with student leaders from across Africa. Monthly calls with the team.',
  },
  {
    icon: GlobeGrid,
    title: 'Recognition on Orevalo.com',
    body: 'Your name and university featured on our website as a Founding Student Leader.',
  },
  {
    icon: Star,
    title: 'Priority Opportunities',
    body: 'First access to internships and roles as Orevalo grows. Letters of recommendation for top contributors.',
  },
]

const COUNTRIES = [
  'Nigeria',
  'Ghana',
  'Kenya',
  'Uganda',
  'Tanzania',
  'South Africa',
  'Egypt',
  'Ethiopia',
  'Cameroon',
  'Senegal',
  'Rwanda',
  'Zimbabwe',
  'Zambia',
  'Other',
]

const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Postgraduate']

const CONNECTION_LEVELS = [
  { value: 'Very connected', label: 'Very connected — I know a lot of people' },
  { value: 'Somewhat connected', label: 'Somewhat connected' },
  { value: 'Not very connected', label: 'Not very connected yet' },
]

export default function StudentLeaders() {
  const [status, setStatus] = useState('idle') // idle | sending | sent | error

  async function submit(e) {
    e.preventDefault()
    const form = e.currentTarget
    setStatus('sending')

    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      })
      if (!res.ok) throw new Error('Submission failed')
      setStatus('sent')
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="page-leaders">
      <nav>
        <Link to="/" className="nav-logo">
          Orevalo
        </Link>
        <Link to="/" className="nav-back">
          <ArrowLeft /> Back to home
        </Link>
      </nav>

      <section className="hero">
        <div className="hero-eyebrow">Now Recruiting — Cohort 1</div>
        <h1>
          Founding Student <span>Leaders</span> Program
        </h1>
        <p>
          Help us understand what African students really need — and shape the platform before
          anyone else gets access.
        </p>
      </section>

      <section className="benefits">
        <div className="section-label">What you get</div>
        <h2>Real value for your time</h2>
        <div className="benefits-grid">
          {BENEFITS.map(({ icon: Icon, title, body }) => (
            <div className="benefit-card" key={title}>
              <div className="benefit-icon">
                <Icon />
              </div>
              <h3>{title}</h3>
              <p>{body}</p>
            </div>
          ))}
        </div>
      </section>

      <hr className="divider" />

      <section className="form-section">
        <div className="section-label">Apply now</div>
        <h2>Tell us about yourself</h2>
        <p className="form-intro">
          Applications take about 5 minutes. We&apos;ll review every one and get back to you within
          7 days.
        </p>

        {status !== 'sent' && (
          <form onSubmit={submit}>
            <div className="form-group">
              <label htmlFor="name">
                Full name <span className="required">*</span>
              </label>
              <input type="text" id="name" name="name" placeholder="e.g. Amara Okonkwo" required />
            </div>

            <div className="form-group">
              <label htmlFor="email">
                Email address <span className="required">*</span>
              </label>
              <input type="email" id="email" name="email" placeholder="you@example.com" required />
            </div>

            <div className="form-group">
              <label htmlFor="country">
                Country <span className="required">*</span>
              </label>
              <div className="select-wrapper">
                <select id="country" name="country" defaultValue="" required>
                  <option value="" disabled>
                    Select your country
                  </option>
                  {COUNTRIES.map((country) => (
                    <option key={country}>{country}</option>
                  ))}
                </select>
                <span className="select-chevron">
                  <ChevronDown />
                </span>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="university">
                University <span className="required">*</span>
              </label>
              <input
                type="text"
                id="university"
                name="university"
                placeholder="e.g. University of Lagos"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="course">
                Course of study <span className="required">*</span>
              </label>
              <input
                type="text"
                id="course"
                name="course"
                placeholder="e.g. Computer Science"
                required
              />
            </div>

            <div className="form-group">
              <label>
                Year of study <span className="required">*</span>
              </label>
              <div className="radio-group">
                {YEARS.map((year, i) => (
                  <label className="radio-option" key={year}>
                    <input type="radio" name="year" value={year} required={i === 0} /> {year}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>
                How connected are you to other students at your university?{' '}
                <span className="required">*</span>
              </label>
              <div className="radio-group">
                {CONNECTION_LEVELS.map(({ value, label }, i) => (
                  <label className="radio-option" key={value}>
                    <input type="radio" name="connection" value={value} required={i === 0} /> {label}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="challenge">
                What is the biggest challenge students at your university face?{' '}
                <span className="required">*</span>
              </label>
              <textarea
                id="challenge"
                name="challenge"
                placeholder="Be specific — this is the most important question."
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="why">
                Why do you want to be a Founding Student Leader?{' '}
                <span className="required">*</span>
              </label>
              <textarea id="why" name="why" placeholder="Tell us in your own words." required />
            </div>

            <div className="form-group">
              <label htmlFor="referral">How did you hear about Orevalo?</label>
              <input
                type="text"
                id="referral"
                name="referral"
                placeholder="e.g. WhatsApp, friend, Instagram..."
              />
            </div>

            <button type="submit" className="submit-btn" disabled={status === 'sending'}>
              {status === 'sending' ? 'Submitting...' : 'Submit Application'}
            </button>

            {status === 'error' && (
              <div className="error-msg">
                Something went wrong. Please try again or email us at orevaloai@gmail.com
              </div>
            )}
          </form>
        )}

        {status === 'sent' && (
          <div className="success-box">
            <div className="success-icon">
              <Seedling />
            </div>
            <h3>Application received!</h3>
            <p>
              Thank you for applying. We&apos;ll review your application and get back to you within
              7 days. We&apos;ll be in touch soon.
            </p>
          </div>
        )}
      </section>

      <footer>
        <p>
          © 2026 Orevalo · <a href="mailto:orevaloai@gmail.com">orevaloai@gmail.com</a> ·{' '}
          <a href="https://orevalo.com">orevalo.com</a>
        </p>
      </footer>
    </div>
  )
}
