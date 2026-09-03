'use client'

import { useActionState } from 'react'
import { submitLeaderApplication, type FormResult } from '@/app/forms-actions'
import { Seedling } from './icons'

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

const CONNECTION = [
  { value: 'Very connected', label: 'Very connected — I know a lot of people' },
  { value: 'Somewhat connected', label: 'Somewhat connected' },
  { value: 'Not very connected', label: 'Not very connected yet' },
]

const input =
  'w-full rounded-xl border-[1.5px] border-line bg-white px-4 py-3 text-[0.95rem] text-ink outline-none transition-colors focus-visible:border-clay'
const labelText = 'mb-2 block text-[0.88rem] font-bold text-ink'

export default function LeaderApplicationForm() {
  const [state, action, pending] = useActionState<FormResult | null, FormData>(
    submitLeaderApplication,
    null,
  )

  if (state?.ok) {
    return (
      <div className="rounded-2xl border-[1.5px] border-clay bg-[#fff8f2] p-9 text-center max-sm:p-6">
        <span className="mb-3.5 flex justify-center text-[2.5rem] text-clay">
          <Seedling />
        </span>
        <h3 className="mb-2.5 font-display text-[1.3rem] font-semibold">Application received</h3>
        <p className="text-[0.9rem] leading-[1.6] text-muted">
          Thank you for applying. We review every application and will get back to you within 7
          days.
        </p>
      </div>
    )
  }

  return (
    <form action={action} className="flex flex-col gap-[22px]">
      <Field label="Full name" name="full_name" placeholder="e.g. Amara Okonkwo" required />
      <Field
        label="Email address"
        name="email"
        type="email"
        placeholder="you@example.com"
        required
      />

      <div>
        <label htmlFor="country" className={labelText}>
          Country <Required />
        </label>
        <select id="country" name="country" required defaultValue="" className={input}>
          <option value="" disabled>
            Select your country
          </option>
          {COUNTRIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>

      <Field label="University" name="university" placeholder="e.g. University of Lagos" required />
      <Field label="Course of study" name="course" placeholder="e.g. Computer Science" required />

      <RadioGroup label="Year of study" name="year" options={YEARS.map((y) => ({ value: y, label: y }))} />
      <RadioGroup
        label="How connected are you to other students at your university?"
        name="connection"
        options={CONNECTION}
      />

      <TextArea
        label="What is the biggest challenge students at your university face?"
        name="challenge"
        placeholder="Be specific — this is the most important question."
      />
      <TextArea
        label="Why do you want to be a Founding Student Leader?"
        name="why"
        placeholder="Tell us in your own words."
      />

      <div>
        <label htmlFor="referral" className={labelText}>
          How did you hear about Orevalo?
        </label>
        <input
          id="referral"
          name="referral"
          placeholder="e.g. WhatsApp, friend, Instagram..."
          className={input}
        />
      </div>

      {state && !state.ok && (
        <p
          role="alert"
          className="rounded-xl border border-[#e07a50] bg-[#fff0eb] px-4 py-3.5 text-center text-[0.88rem] text-[#8b3a1a]"
        >
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2.5 w-full cursor-pointer rounded-xl bg-clay px-4 py-4 font-bold text-cream transition-colors hover:bg-clay-dark disabled:cursor-not-allowed disabled:bg-[#c4a48d]"
      >
        {pending ? 'Submitting...' : 'Submit Application'}
      </button>
    </form>
  )
}

function Required() {
  return <span className="ml-0.5 text-clay">*</span>
}

function Field({
  label,
  name,
  type = 'text',
  placeholder,
  required,
}: {
  label: string
  name: string
  type?: string
  placeholder?: string
  required?: boolean
}) {
  return (
    <div>
      <label htmlFor={name} className={labelText}>
        {label} {required && <Required />}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className={input}
      />
    </div>
  )
}

function TextArea({
  label,
  name,
  placeholder,
}: {
  label: string
  name: string
  placeholder: string
}) {
  return (
    <div>
      <label htmlFor={name} className={labelText}>
        {label} <Required />
      </label>
      <textarea
        id={name}
        name={name}
        required
        rows={4}
        placeholder={placeholder}
        className={`${input} resize-y`}
      />
    </div>
  )
}

function RadioGroup({
  label,
  name,
  options,
}: {
  label: string
  name: string
  options: { value: string; label: string }[]
}) {
  return (
    <fieldset>
      <legend className={labelText}>
        {label} <Required />
      </legend>
      <div className="flex flex-col gap-2.5">
        {options.map(({ value, label: text }, i) => (
          <label
            key={value}
            className="flex cursor-pointer items-center gap-2.5 text-[0.9rem] text-ink"
          >
            <input
              type="radio"
              name={name}
              value={value}
              required={i === 0}
              className="size-[17px] cursor-pointer accent-clay"
            />
            {text}
          </label>
        ))}
      </div>
    </fieldset>
  )
}
