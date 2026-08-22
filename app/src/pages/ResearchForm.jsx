import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Bell,
  Briefcase,
  Document,
  Envelope,
  GlobeAfrica,
  GraduationCap,
  Robot,
  Rocket,
} from '../components/icons/Icons.jsx'
import './ResearchForm.css'

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xpqgljzy'

const COUNTRIES = [
  'Nigeria',
  'Ghana',
  'Kenya',
  'South Africa',
  'Ethiopia',
  'Tanzania',
  'Uganda',
  'Rwanda',
  'Cameroon',
  'Senegal',
  'Other African country',
  'Diaspora (outside Africa)',
]

const STATUSES = [
  { id: 's1', value: 'undergraduate', label: 'Undergraduate student' },
  { id: 's2', value: 'postgraduate', label: 'Postgraduate student' },
  { id: 's3', value: 'recent_graduate', label: 'Recent graduate (within 2 years)' },
  { id: 's4', value: 'nysc', label: 'Currently on NYSC' },
]

const STRUGGLES = [
  { id: 'c1', value: 'finding_scholarships', label: "Finding scholarships — I don't know where to look" },
  { id: 'c2', value: 'finding_internships', label: 'Finding internships and jobs relevant to me' },
  { id: 'c3', value: 'cv_cover_letter', label: 'Writing a good CV or cover letter' },
  { id: 'c4', value: 'studying', label: 'Studying and understanding difficult topics' },
  { id: 'c5', value: 'career_direction', label: 'Not knowing what career path to follow' },
  { id: 'c6', value: 'missing_deadlines', label: "Missing deadlines for opportunities I didn't know about" },
  { id: 'c7', value: 'internet_access', label: 'Limited internet access or data costs' },
]

const HOURS = [
  { id: 'h1', value: 'less_than_1', label: 'Less than 1 hour' },
  { id: 'h2', value: '1_to_3', label: '1 to 3 hours' },
  { id: 'h3', value: '3_to_6', label: '3 to 6 hours' },
  { id: 'h4', value: 'more_than_6', label: 'More than 6 hours' },
]

const MISSED = [
  { id: 'm1', value: 'yes_many', label: 'Yes, many times' },
  { id: 'm2', value: 'yes_once', label: 'Yes, at least once' },
  { id: 'm3', value: 'no', label: 'No' },
]

const USES_AI = [
  { id: 'a1', value: 'yes_regularly', label: 'Yes, I use them regularly' },
  { id: 'a2', value: 'yes_sometimes', label: 'Yes, sometimes' },
  { id: 'a3', value: 'tried_once', label: "I tried once but don't use them" },
  { id: 'a4', value: 'never', label: 'Never used AI tools' },
]

const PAID = [
  { id: 'p1', value: 'yes', label: 'Yes — what did you pay for?' },
  { id: 'p2', value: 'no_would', label: 'No, but I would if it was useful' },
  { id: 'p3', value: 'no_never', label: 'No, I would only use free tools' },
]

/** The icons here replace the emoji that used to label each feature. */
const FEATURES = [
  { id: 'f1', value: 'ai_tutor', icon: Robot, label: 'AI Chat Tutor — ask any academic question' },
  {
    id: 'f2',
    value: 'scholarship_finder',
    icon: GraduationCap,
    label: 'Scholarship Finder — personalised to you',
  },
  {
    id: 'f3',
    value: 'internship_board',
    icon: Briefcase,
    label: 'Internship & Job Board — updated daily',
  },
  { id: 'f4', value: 'cv_builder', icon: Document, label: 'CV Builder — professional CVs in minutes' },
  {
    id: 'f5',
    value: 'cover_letter',
    icon: Envelope,
    label: 'Cover Letter Generator — tailored applications',
  },
  { id: 'f6', value: 'alerts', icon: Bell, label: 'Opportunity Alerts — never miss a deadline' },
]

const PRICING = [
  { id: 'w1', value: 'free_only', label: 'Nothing — free only' },
  { id: 'w2', value: 'under_1000', label: 'Under ₦1,000 / month' },
  { id: 'w3', value: '1000_to_3000', label: '₦1,000 — ₦3,000 / month' },
  { id: 'w4', value: '3000_to_5000', label: '₦3,000 — ₦5,000 / month' },
  { id: 'w5', value: 'above_5000', label: 'Above ₦5,000 / month' },
]

const SCALE = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

export default function ResearchForm() {
  const navigate = useNavigate()
  const [status, setStatus] = useState('idle') // idle | sending | error

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
      navigate('/thank-you')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="page-research">
      <div className="container">
        <Link to="/" className="back-home">
          <ArrowLeft /> Back to home
        </Link>
        <div className="header">
          <div className="logo">
            <span>Ore</span>valo
          </div>
          <div className="tag">
            <GlobeAfrica /> Student Research — 5 mins
          </div>
          <h1>Help us build the platform African students actually need</h1>
          <p>
            We&apos;re building Orevalo and we want to hear directly from you. Your honest answers
            will shape everything we build. No right or wrong answers.
          </p>
        </div>

        <form onSubmit={submit}>
          {/* Section 1 */}
          <div className="form-card">
            <div className="section-title">01 — About You</div>

            <div className="form-group">
              <label htmlFor="first_name">
                Your first name <span className="required">*</span>
              </label>
              <input type="text" id="first_name" name="first_name" placeholder="e.g. Chisom" required />
            </div>

            <div className="form-group">
              <label htmlFor="email">
                Your email <span className="required">*</span>
              </label>
              <span className="sublabel">We&apos;ll send you early access when we launch</span>
              <input type="email" id="email" name="email" placeholder="you@email.com" required />
            </div>

            <div className="form-group">
              <label htmlFor="country">
                What country are you in? <span className="required">*</span>
              </label>
              <select id="country" name="country" defaultValue="" required>
                <option value="">Select your country</option>
                {COUNTRIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>
                What is your current status? <span className="required">*</span>
              </label>
              <RadioGroup name="status" options={STATUSES} required />
            </div>

            <div className="form-group">
              <label htmlFor="field_of_study">What field are you studying or did you study?</label>
              <input
                type="text"
                id="field_of_study"
                name="field_of_study"
                placeholder="e.g. Computer Science, Business, Medicine..."
              />
            </div>
          </div>

          {/* Section 2 */}
          <div className="form-card">
            <div className="section-title">02 — Your Biggest Struggles</div>

            <div className="form-group">
              <label htmlFor="biggest_struggle">
                What is the hardest part of being a student or recent graduate in Africa right now?{' '}
                <span className="required">*</span>
              </label>
              <span className="sublabel">
                Be as honest as possible — this is the most important question
              </span>
              <textarea
                id="biggest_struggle"
                name="biggest_struggle"
                placeholder="Tell us in your own words..."
                required
              />
            </div>

            <div className="form-group">
              <label>
                Which of these do you struggle with most? Select all that apply{' '}
                <span className="required">*</span>
              </label>
              <div className="checkbox-group">
                {STRUGGLES.map(({ id, value, label }) => (
                  <div className="checkbox-option" key={id}>
                    <input type="checkbox" name="struggles" id={id} value={value} />
                    <label htmlFor={id}>{label}</label>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>
                How many hours per week do you spend searching for scholarships, internships or
                opportunities?
              </label>
              <RadioGroup name="hours_searching" options={HOURS} />
            </div>

            <div className="form-group">
              <label>
                Have you ever missed a scholarship or opportunity because you found out too late?
              </label>
              <RadioGroup name="missed_opportunity" options={MISSED} />
            </div>
          </div>

          {/* Section 3 */}
          <div className="form-card">
            <div className="section-title">03 — What You Currently Use</div>

            <div className="form-group">
              <label htmlFor="current_tools">
                Where do you currently search for scholarships and opportunities?
              </label>
              <textarea
                id="current_tools"
                name="current_tools"
                placeholder="e.g. Google, WhatsApp groups, specific websites, friends..."
              />
            </div>

            <div className="form-group">
              <label>Have you ever used any AI tools for studying or career help?</label>
              <RadioGroup name="uses_ai" options={USES_AI} />
            </div>

            <div className="form-group">
              <label>Have you ever paid for any education or career tool?</label>
              <RadioGroup name="paid_for_tools" options={PAID} />
            </div>

            <div className="form-group">
              <label htmlFor="paid_tool_details">
                If you paid for a tool, what did you pay for and how much?
              </label>
              <input
                type="text"
                id="paid_tool_details"
                name="paid_tool_details"
                placeholder="e.g. Grammarly Premium — ₦5,000/month"
              />
            </div>
          </div>

          {/* Section 4 */}
          <div className="form-card">
            <div className="section-title">04 — About Orevalo</div>

            <div className="form-group">
              <label>
                Which of these Orevalo features excites you most? <span className="required">*</span>
              </label>
              <div className="radio-group">
                {FEATURES.map(({ id, value, icon: Icon, label }, i) => (
                  <div className="radio-option" key={id}>
                    <input
                      type="radio"
                      name="most_exciting_feature"
                      id={id}
                      value={value}
                      required={i === 0}
                    />
                    <label htmlFor={id}>
                      <span className="option-icon">
                        <Icon />
                      </span>
                      {label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>
                How much would you be willing to pay per month for access to all features?
              </label>
              <RadioGroup name="willingness_to_pay" options={PRICING} />
            </div>

            <div className="form-group">
              <label>How likely are you to use Orevalo when it launches?</label>
              <div className="scale-group">
                {SCALE.map((n) => (
                  <div className="scale-option" key={n}>
                    <input type="radio" name="likelihood" id={`l${n}`} value={n} />
                    <label htmlFor={`l${n}`}>{n}</label>
                  </div>
                ))}
              </div>
              <div className="scale-labels">
                <span>Not likely</span>
                <span>Definitely</span>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="other_ideas">
                Is there anything else you wish existed for African students that no one has built
                yet?
              </label>
              <textarea
                id="other_ideas"
                name="other_ideas"
                placeholder="Share any ideas freely..."
              />
            </div>
          </div>

          <button type="submit" className="submit-btn" disabled={status === 'sending'}>
            {status === 'sending' ? 'Submitting...' : 'Submit — Join Early Access'} <Rocket />
          </button>

          {status === 'error' && (
            <p className="submit-error" role="alert">
              Something went wrong sending your answers. Please try again, or email them to
              hello@orevalo.com — nothing you typed has been lost.
            </p>
          )}
        </form>

        <p className="footer-note">
          Your responses go directly to the Orevalo team.
          <br />
          We read every single one. Built with purpose by <strong>Orevalo</strong> — orevalo.com
        </p>
      </div>
    </div>
  )
}

function RadioGroup({ name, options, required = false }) {
  return (
    <div className="radio-group">
      {options.map(({ id, value, label }, i) => (
        <div className="radio-option" key={id}>
          <input type="radio" name={name} id={id} value={value} required={required && i === 0} />
          <label htmlFor={id}>{label}</label>
        </div>
      ))}
    </div>
  )
}
