'use client'

import { useActionState } from 'react'
import { submitResearchResponse, type FormResult } from '@/app/forms-actions'
import { Bell, Briefcase, Document, Envelope, GraduationCap, Robot, Rocket, Seedling } from './icons'

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
  { value: 'undergraduate', label: 'Undergraduate student' },
  { value: 'postgraduate', label: 'Postgraduate student' },
  { value: 'recent_graduate', label: 'Recent graduate (within 2 years)' },
  { value: 'nysc', label: 'Currently on NYSC' },
]

const STRUGGLES = [
  { value: 'finding_scholarships', label: "Finding scholarships — I don't know where to look" },
  { value: 'finding_internships', label: 'Finding internships and jobs relevant to me' },
  { value: 'cv_cover_letter', label: 'Writing a good CV or cover letter' },
  { value: 'studying', label: 'Studying and understanding difficult topics' },
  { value: 'career_direction', label: 'Not knowing what career path to follow' },
  { value: 'missing_deadlines', label: "Missing deadlines for opportunities I didn't know about" },
  { value: 'internet_access', label: 'Limited internet access or data costs' },
]

const HOURS = [
  { value: 'less_than_1', label: 'Less than 1 hour' },
  { value: '1_to_3', label: '1 to 3 hours' },
  { value: '3_to_6', label: '3 to 6 hours' },
  { value: 'more_than_6', label: 'More than 6 hours' },
]

const MISSED = [
  { value: 'yes_many', label: 'Yes, many times' },
  { value: 'yes_once', label: 'Yes, at least once' },
  { value: 'no', label: 'No' },
]

const USES_AI = [
  { value: 'yes_regularly', label: 'Yes, I use them regularly' },
  { value: 'yes_sometimes', label: 'Yes, sometimes' },
  { value: 'tried_once', label: "I tried once but don't use them" },
  { value: 'never', label: 'Never used AI tools' },
]

const PAID = [
  { value: 'yes', label: 'Yes — what did you pay for?' },
  { value: 'no_would', label: 'No, but I would if it was useful' },
  { value: 'no_never', label: 'No, I would only use free tools' },
]

const FEATURES = [
  { value: 'internship_board', icon: Briefcase, label: 'Internship & Job Board — updated regularly' },
  { value: 'scholarship_finder', icon: GraduationCap, label: 'Scholarship Finder — personalised to you' },
  { value: 'cv_builder', icon: Document, label: 'CV Builder — professional CVs in minutes' },
  { value: 'cover_letter', icon: Envelope, label: 'Cover Letter Generator — tailored applications' },
  { value: 'alerts', icon: Bell, label: 'Opportunity Alerts — never miss a deadline' },
  { value: 'ai_tutor', icon: Robot, label: 'AI Chat Tutor — ask any academic question' },
]

const PRICING = [
  { value: 'free_only', label: 'Nothing — free only' },
  { value: 'under_1000', label: 'Under ₦1,000 / month' },
  { value: '1000_to_3000', label: '₦1,000 — ₦3,000 / month' },
  { value: '3000_to_5000', label: '₦3,000 — ₦5,000 / month' },
  { value: 'above_5000', label: 'Above ₦5,000 / month' },
]

const SCALE = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

const input =
  'w-full rounded-xl border-[1.5px] border-clay/20 bg-cream px-4 py-3 text-[0.9rem] text-ink outline-none transition-colors focus-visible:border-clay focus-visible:bg-white'
const choice =
  'flex cursor-pointer items-center gap-3 rounded-xl border-[1.5px] border-clay/15 bg-cream px-4 py-3 text-[0.9rem] transition-colors hover:border-clay hover:bg-clay/4'

export default function ResearchSurveyForm() {
  const [state, action, pending] = useActionState<FormResult | null, FormData>(
    submitResearchResponse,
    null,
  )

  if (state?.ok) {
    return (
      <div className="rounded-3xl border border-clay/10 bg-white p-12 text-center max-sm:p-7">
        <span className="mb-5 flex justify-center text-[3rem] text-moss">
          <Seedling />
        </span>
        <h2 className="mb-3 font-display text-2xl font-semibold">Thank you</h2>
        <p className="mx-auto max-w-[420px] leading-[1.7] text-muted">
          Your answers go straight to the Orevalo team and genuinely shape what we build next. We
          read every single one.
        </p>
      </div>
    )
  }

  return (
    <form action={action}>
      <Card title="01 — About You">
        <Group label="Your first name" required>
          <input name="first_name" required placeholder="e.g. Chisom" className={input} />
        </Group>

        <Group label="Your email" required hint="We'll send you early access when we launch">
          <input
            type="email"
            name="email"
            required
            placeholder="you@email.com"
            className={input}
          />
        </Group>

        <Group label="What country are you in?" required>
          <select name="country" required defaultValue="" className={input}>
            <option value="">Select your country</option>
            {COUNTRIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Group>

        <Group label="What is your current status?" required>
          <Radios name="status" options={STATUSES} required />
        </Group>

        <Group label="What field are you studying or did you study?">
          <input
            name="field_of_study"
            placeholder="e.g. Computer Science, Business, Medicine..."
            className={input}
          />
        </Group>
      </Card>

      <Card title="02 — Your Biggest Struggles">
        <Group
          label="What is the hardest part of being a student or recent graduate in Africa right now?"
          required
          hint="Be as honest as possible — this is the most important question"
        >
          <textarea
            name="biggest_struggle"
            required
            rows={4}
            placeholder="Tell us in your own words..."
            className={`${input} resize-y leading-[1.6]`}
          />
        </Group>

        <Group label="Which of these do you struggle with most? Select all that apply">
          <div className="flex flex-col gap-2.5">
            {STRUGGLES.map(({ value, label }) => (
              <label key={value} className={choice}>
                <input
                  type="checkbox"
                  name="struggles"
                  value={value}
                  className="size-[18px] shrink-0 cursor-pointer accent-clay"
                />
                {label}
              </label>
            ))}
          </div>
        </Group>

        <Group label="How many hours per week do you spend searching for opportunities?">
          <Radios name="hours_searching" options={HOURS} />
        </Group>

        <Group label="Have you ever missed an opportunity because you found out too late?">
          <Radios name="missed_opportunity" options={MISSED} />
        </Group>
      </Card>

      <Card title="03 — What You Currently Use">
        <Group label="Where do you currently search for scholarships and opportunities?">
          <textarea
            name="current_tools"
            rows={3}
            placeholder="e.g. Google, WhatsApp groups, specific websites, friends..."
            className={`${input} resize-y leading-[1.6]`}
          />
        </Group>

        <Group label="Have you ever used any AI tools for studying or career help?">
          <Radios name="uses_ai" options={USES_AI} />
        </Group>

        <Group label="Have you ever paid for any education or career tool?">
          <Radios name="paid_for_tools" options={PAID} />
        </Group>

        <Group label="If you paid for a tool, what did you pay for and how much?">
          <input
            name="paid_tool_details"
            placeholder="e.g. Grammarly Premium — ₦5,000/month"
            className={input}
          />
        </Group>
      </Card>

      <Card title="04 — About Orevalo">
        <Group label="Which of these Orevalo features excites you most?" required>
          <div className="flex flex-col gap-2.5">
            {FEATURES.map(({ value, icon: Icon, label }, i) => (
              <label key={value} className={choice}>
                <input
                  type="radio"
                  name="most_exciting_feature"
                  value={value}
                  required={i === 0}
                  className="size-[18px] shrink-0 cursor-pointer accent-clay"
                />
                <span className="flex shrink-0 text-[1.05rem] text-clay">
                  <Icon />
                </span>
                {label}
              </label>
            ))}
          </div>
        </Group>

        <Group label="How much would you pay per month for access to all features?">
          <Radios name="willingness_to_pay" options={PRICING} />
        </Group>

        <Group label="How likely are you to use Orevalo when it launches?">
          <div className="flex flex-wrap gap-2">
            {SCALE.map((n) => (
              <label key={n} className="min-w-[44px] flex-1">
                <input type="radio" name="likelihood" value={n} className="peer sr-only" />
                <span className="flex h-11 w-full cursor-pointer items-center justify-center rounded-[10px] border-[1.5px] border-clay/20 bg-cream text-[0.9rem] font-medium transition-colors hover:border-clay peer-checked:border-clay peer-checked:bg-clay peer-checked:text-white">
                  {n}
                </span>
              </label>
            ))}
          </div>
          <div className="mt-1.5 flex justify-between text-[0.75rem] text-muted">
            <span>Not likely</span>
            <span>Definitely</span>
          </div>
        </Group>

        <Group label="Anything else you wish existed for African students that no one has built?">
          <textarea
            name="other_ideas"
            rows={3}
            placeholder="Share any ideas freely..."
            className={`${input} resize-y leading-[1.6]`}
          />
        </Group>
      </Card>

      {state && !state.ok && (
        <p
          role="alert"
          className="mb-4 rounded-xl border border-[#e07a50] bg-[#fff0eb] px-4 py-3.5 text-center text-[0.88rem] text-[#8b3a1a]"
        >
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-full bg-clay px-4 py-4 font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-clay-light disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? 'Submitting...' : 'Submit — Join Early Access'} <Rocket />
      </button>
    </form>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-6 rounded-3xl border border-clay/10 bg-white p-10 max-sm:p-5">
      <h2 className="mb-6 border-b border-clay/15 pb-3 font-display text-[1.1rem] font-semibold text-clay">
        {title}
      </h2>
      {children}
    </section>
  )
}

function Group({
  label,
  hint,
  required,
  children,
}: {
  label: string
  hint?: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="mb-6 last:mb-0">
      <p className="mb-2 text-[0.9rem] font-semibold text-ink">
        {label} {required && <span className="text-clay">*</span>}
      </p>
      {hint && <p className="mb-2 text-[0.8rem] text-muted">{hint}</p>}
      {children}
    </div>
  )
}

function Radios({
  name,
  options,
  required,
}: {
  name: string
  options: { value: string; label: string }[]
  required?: boolean
}) {
  return (
    <div className="flex flex-col gap-2.5">
      {options.map(({ value, label }, i) => (
        <label key={value} className={choice}>
          <input
            type="radio"
            name={name}
            value={value}
            required={required && i === 0}
            className="size-[18px] shrink-0 cursor-pointer accent-clay"
          />
          {label}
        </label>
      ))}
    </div>
  )
}
