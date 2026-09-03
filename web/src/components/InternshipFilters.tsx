'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'
import { ChevronDown } from './icons'
import { FIELDS, LOCATIONS } from '@/lib/listings'

/**
 * Filter controls for the internship board.
 *
 * State lives in the URL rather than in React, so a filtered view is
 * shareable and bookmarkable, the back button works, and the filtering itself
 * happens on the server — which is what lets it become a Supabase `where`
 * clause later instead of shipping every listing to the browser.
 */
export default function InternshipFilters() {
  const router = useRouter()
  const params = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const field = params.get('field') ?? ''
  const location = params.get('location') ?? ''
  const hasFilters = Boolean(field || location)

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString())
    if (value) next.set(key, value)
    else next.delete(key)

    startTransition(() => {
      router.push(next.size ? `/internships?${next}` : '/internships', { scroll: false })
    })
  }

  return (
    <div
      className={`grid gap-4 rounded-[18px] border border-line bg-white p-[18px_20px] shadow-[0_4px_20px_rgba(44,26,14,0.04)] transition-opacity md:grid-cols-[1fr_1fr_auto] md:items-end max-sm:rounded-none max-sm:border-x-0 max-sm:p-4 max-sm:shadow-none ${
        isPending ? 'opacity-60' : ''
      }`}
    >
      <Select
        label="Field"
        value={field}
        options={FIELDS}
        onChange={(v) => update('field', v)}
      />
      <Select
        label="Location"
        value={location}
        options={LOCATIONS}
        onChange={(v) => update('location', v)}
      />

      <button
        type="button"
        disabled={!hasFilters}
        onClick={() => startTransition(() => router.push('/internships', { scroll: false }))}
        className="w-full cursor-pointer rounded-xl border-[1.5px] border-line bg-white px-5 py-[13px] text-[0.88rem] font-semibold whitespace-nowrap text-muted transition-colors hover:border-clay hover:text-clay disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:border-line disabled:hover:text-muted"
      >
        Clear filters
      </button>
    </div>
  )
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: readonly string[]
  onChange: (value: string) => void
}) {
  const id = `filter-${label.toLowerCase()}`

  return (
    <div className="w-full">
      <label
        htmlFor={id}
        className="mb-2 block text-[0.72rem] font-bold tracking-[0.1em] text-muted uppercase"
      >
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full cursor-pointer appearance-none rounded-xl border-[1.5px] border-line bg-cream py-[13px] pr-[42px] pl-4 text-[0.92rem] font-medium text-ink transition-colors outline-none hover:border-clay/45 focus-visible:border-clay focus-visible:bg-white focus-visible:ring-[3px] focus-visible:ring-clay/15"
        >
          <option value="">All {label.toLowerCase()}s</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute top-1/2 right-3.5 flex -translate-y-1/2 text-clay">
          <ChevronDown />
        </span>
      </div>
    </div>
  )
}
