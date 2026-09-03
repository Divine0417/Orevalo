'use client'

import { useActionState } from 'react'
import { updateProfile, type AuthResult } from '@/app/auth-actions'

const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Postgraduate', 'Graduate']

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
  'Other',
]

const input =
  'w-full rounded-xl border-[1.5px] border-line bg-white px-4 py-3 text-[0.95rem] outline-none transition-colors focus-visible:border-clay'
const label = 'text-[0.75rem] font-bold tracking-[0.08em] text-muted uppercase'

type Profile = {
  full_name?: string | null
  university?: string | null
  course?: string | null
  year_of_study?: string | null
  country?: string | null
} | null

export default function ProfileForm({ profile }: { profile: Profile }) {
  const [state, action, pending] = useActionState<AuthResult | null, FormData>(updateProfile, null)

  return (
    <form action={action} className="rounded-2xl border border-line bg-white p-6 max-sm:p-4">
      <div className="mb-4 grid grid-cols-2 gap-4 max-sm:grid-cols-1">
        <label className="flex flex-col gap-2">
          <span className={label}>Full name</span>
          <input name="full_name" defaultValue={profile?.full_name ?? ''} className={input} />
        </label>

        <label className="flex flex-col gap-2">
          <span className={label}>Country</span>
          <select name="country" defaultValue={profile?.country ?? ''} className={input}>
            <option value="">Prefer not to say</option>
            {COUNTRIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2">
          <span className={label}>University</span>
          <input
            name="university"
            defaultValue={profile?.university ?? ''}
            placeholder="e.g. University of Lagos"
            className={input}
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className={label}>Course</span>
          <input
            name="course"
            defaultValue={profile?.course ?? ''}
            placeholder="e.g. Computer Science"
            className={input}
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className={label}>Year of study</span>
          <select name="year_of_study" defaultValue={profile?.year_of_study ?? ''} className={input}>
            <option value="">Prefer not to say</option>
            {YEARS.map((y) => (
              <option key={y}>{y}</option>
            ))}
          </select>
        </label>
      </div>

      {state && !state.ok && (
        <p
          role="alert"
          className="mb-4 rounded-xl border border-[#e07a50] bg-[#fff0eb] px-4 py-3 text-[0.88rem] text-[#8b3a1a]"
        >
          {state.message}
        </p>
      )}

      {state?.ok && (
        <p className="mb-4 rounded-xl border border-moss/40 bg-moss/10 px-4 py-3 text-[0.88rem] text-moss">
          Saved.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="cursor-pointer rounded-full bg-clay px-7 py-3 font-bold text-white transition-colors hover:bg-clay-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? 'Saving...' : 'Save details'}
      </button>
    </form>
  )
}
