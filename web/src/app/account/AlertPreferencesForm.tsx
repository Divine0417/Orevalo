'use client'

import { useActionState } from 'react'
import { saveAlertPreferences, type AlertResult } from '../alert-actions'

const FIELDS = ['Engineering', 'Business', 'Technology', 'Finance', 'Healthcare']
const LOCATIONS = ['Lagos', 'Abuja', 'Remote', 'Other']
const DEGREE_LEVELS = ['Undergraduate', 'Masters', 'PhD']

const checkbox = 'size-4 accent-clay'
const label = 'text-[0.75rem] font-bold tracking-[0.08em] text-muted uppercase'

export type AlertPreferences = {
  fields: string[]
  locations: string[]
  degree_levels: string[]
  frequency: 'off' | 'daily' | 'weekly'
  deadline_reminders: boolean
}

export default function AlertPreferencesForm({ initial }: { initial: AlertPreferences | null }) {
  const [state, action, pending] = useActionState<AlertResult | null, FormData>(saveAlertPreferences, null)

  return (
    <form action={action} className="rounded-2xl border border-line bg-white p-6 max-sm:p-4">
      <p className="mb-5 text-[0.88rem] leading-[1.6] text-muted">
        Choose what you want to hear about. Empty filters mean all available options.
      </p>

      <fieldset className="mb-5">
        <legend className={label}>Email frequency</legend>
        <div className="mt-3 flex flex-wrap gap-4 text-[0.9rem]">
          {(['off', 'daily', 'weekly'] as const).map((value) => (
            <label key={value} className="flex items-center gap-2 capitalize">
              <input type="radio" name="frequency" value={value} defaultChecked={(initial?.frequency ?? 'weekly') === value} />
              {value === 'off' ? 'Off' : value}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid grid-cols-3 gap-5 max-md:grid-cols-1">
        <ChoiceGroup name="fields" title="Fields" options={FIELDS} selected={initial?.fields ?? []} />
        <ChoiceGroup name="locations" title="Locations" options={LOCATIONS} selected={initial?.locations ?? []} />
        <ChoiceGroup name="degree_levels" title="Degree levels" options={DEGREE_LEVELS} selected={initial?.degree_levels ?? []} />
      </div>

      <label className="mt-5 flex items-center gap-3 text-[0.9rem]">
        <input type="checkbox" name="deadline_reminders" defaultChecked={initial?.deadline_reminders ?? true} className={checkbox} />
        Remind me about deadlines
      </label>

      {state && !state.ok && <p role="alert" className="mt-4 rounded-xl border border-[#e07a50] bg-[#fff0eb] px-4 py-3 text-[0.88rem] text-[#8b3a1a]">{state.message}</p>}
      {state?.ok && <p className="mt-4 rounded-xl border border-moss/40 bg-moss/10 px-4 py-3 text-[0.88rem] text-moss">Alert preferences saved.</p>}

      <button type="submit" disabled={pending} className="mt-5 cursor-pointer rounded-full bg-clay px-7 py-3 font-bold text-white hover:bg-clay-dark disabled:cursor-not-allowed disabled:opacity-60">
        {pending ? 'Saving...' : 'Save alert preferences'}
      </button>
    </form>
  )
}

function ChoiceGroup({ name, title, options, selected }: { name: string; title: string; options: string[]; selected: string[] }) {
  return (
    <fieldset>
      <legend className={label}>{title}</legend>
      <div className="mt-3 flex flex-col gap-2 text-[0.9rem]">
        {options.map((option) => (
          <label key={option} className="flex items-center gap-3">
            <input type="checkbox" name={name} value={option} defaultChecked={selected.includes(option)} className={checkbox} />
            {option}
          </label>
        ))}
      </div>
    </fieldset>
  )
}
