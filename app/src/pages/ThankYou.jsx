import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Bell,
  Instagram,
  LinkedIn,
  Mailbox,
  Rocket,
  Seedling,
  XTwitter,
} from '../components/icons/Icons.jsx'
import './ThankYou.css'

const NEXT_STEPS = [
  {
    icon: Mailbox,
    title: 'Check your email',
    body: 'You will receive a welcome email from hello@orevalo.com with early access details.',
  },
  {
    icon: Bell,
    title: 'Follow us for updates',
    body: 'We post opportunities, tips and behind-the-scenes updates on our socials every week.',
  },
  {
    icon: Rocket,
    title: 'Get first access at launch',
    body: 'Waitlist members get priority access when we launch in Q4 2026. You are ahead of the queue.',
  },
]

export default function ThankYou() {
  // Landing here means the signup went through — fire the conversion event.
  useEffect(() => {
    window.gtag?.('event', 'waitlist_signup', {
      event_category: 'conversion',
      event_label: 'Waitlist Form Submission',
      value: 1,
    })
  }, [])

  return (
    <div className="page-thankyou">
      <div className="confetti-wrap">
        <Seedling />
      </div>

      <div className="card">
        <div className="badge">
          <span className="dot" /> You&apos;re in!
        </div>

        <h1>
          Welcome to
          <br />
          <em>Orevalo.</em>
        </h1>
        <p className="sub">
          You are now part of a growing community of African students who refuse to be held back by
          lack of access. We will be in touch when we launch.
        </p>

        <hr className="divider" />

        <div className="what-next">
          <h3>What happens next</h3>
          {NEXT_STEPS.map(({ icon: Icon, title, body }) => (
            <div className="next-item" key={title}>
              <div className="next-icon">
                <Icon />
              </div>
              <div className="next-text">
                <h4>{title}</h4>
                <p>{body}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="social-row">
          <a
            href="https://instagram.com/orevaloai"
            target="_blank"
            rel="noreferrer"
            className="social-btn"
          >
            <Instagram /> Instagram
          </a>
          <a href="https://x.com/OrevaloAI" target="_blank" rel="noreferrer" className="social-btn">
            <XTwitter /> Twitter / X
          </a>
          <a
            href="https://www.linkedin.com/company/orevalo/"
            target="_blank"
            rel="noreferrer"
            className="social-btn"
          >
            <LinkedIn /> LinkedIn
          </a>
        </div>

        <Link to="/" className="back-btn">
          Back to orevalo.com
        </Link>
      </div>

      <div className="logo">
        Ore<span>valo</span>
      </div>
      <p className="tagline">Study smart. Build your future.</p>
    </div>
  )
}
