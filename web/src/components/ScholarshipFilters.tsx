'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'
import { ChevronDown } from './icons'
import { COUNTRIES, DEGREE_LEVELS, SCHOLARSHIP_FIELDS } from '@/lib/scholarships'

/**
 * Filter controls for the scholarship finder.
 *
 * Same shape as the internship board: state lives in the URL so a filtered view
 * is shareable, the back button works, and the narrowing happens as a database
 * `where` clause rather than shipping every row to the browser.
 */
export default function ScholarshipFilters() {
  const router = useRouter()
  const params = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const country = params.get('country') ?? ''
  const field = params.get('field') ?? ''
  const degree = params.get('degree_level') ?? ''
  const hasFilters = Boolean(country || field || degree)

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString())
    if (value) next.set(key, value)
    else next.delete(key)

    startTransition(() => {
      router.push(next.size ? `/scholarships?${next}` : '/scholarships', { scroll: false })
    })
  }

  return (
    <div
      className={`grid gap-4 rounded-[18px] border border-line bg-white p-[18px_20px] shadow-[0_4px_20px_rgba(44,26,14,0.04)] transition-opacity md:grid-cols-[1fr_1fr_1fr_auto] md:items-end max-sm:rounded-none max-sm:border-x-0 max-sm:p-4 max-sm:shadow-none ${
        isPending ? 'opacity-60' : ''
      }`}
    >
      <Select
        label="Country"
        value={country}
        options={COUNTRIES}
        onChange={(v) => update('country', v)}
      />
      <Select
        label="Field"
        value={field}
        options={SCHOLARSHIP_FIELDS}
        onChange={(v) => update('field', v)}
      />
      <Select
        label="Degree level"
        value={degree}
        options={DEGREE_LEVELS}
        onChange={(v) => update('degree_level', v)}
      />

      <button
        type="button"
        disabled={!hasFilters}
        onClick={() => startTransition(() => router.push('/scholarships', { scroll: false }))}
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
  const id = `filter-${label.toLowerCase().replace(/\s+/g, '-')}`

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
          <option value="">All</option>
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
