'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Close, Search } from '@/components/icons'

/**
 * Search field that keeps the URL as the source of truth.
 *
 * Emptying the box resets the list immediately, without needing a second click
 * on Search. That matters because `<input type="search">` renders a native
 * clear "x" in WebKit which fires input events but never submits the form — so
 * a plain GET form leaves the list filtered by a term no longer on screen.
 *
 * Other filters (the status tabs) are passed through `keep` so searching does
 * not silently drop them.
 */
export default function SearchBox({
  basePath,
  defaultValue = '',
  keep = {},
  placeholder = 'Search...',
  label = 'Search',
}: {
  basePath: string
  defaultValue?: string
  keep?: Record<string, string>
  placeholder?: string
  label?: string
}) {
  const router = useRouter()
  const [value, setValue] = useState(defaultValue)

  // Keep in step when the URL changes from elsewhere, e.g. a status tab.
  useEffect(() => setValue(defaultValue), [defaultValue])

  function go(term: string) {
    const params = new URLSearchParams(keep)
    if (term.trim()) params.set('q', term.trim())
    const query = params.toString()
    router.push(query ? `${basePath}?${query}` : basePath)
  }

  function onChange(next: string) {
    setValue(next)
    // Cleared: restore the unfiltered list straight away.
    if (next === '' && defaultValue !== '') go('')
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        go(value)
      }}
      role="search"
      className="mb-6 flex flex-wrap items-center gap-3"
    >
      <div className="relative min-w-[220px] flex-1">
        <span className="pointer-events-none absolute top-1/2 left-4 flex -translate-y-1/2 text-muted">
          <Search size="1em" />
        </span>
        <input
          type="search"
          name="q"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') onChange('')
          }}
          placeholder={placeholder}
          aria-label={label}
          className="w-full rounded-xl border-[1.5px] border-line bg-white py-2.5 pr-10 pl-10 text-[0.92rem] outline-none focus-visible:border-clay [&::-webkit-search-cancel-button]:hidden"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            aria-label="Clear search"
            className="absolute top-1/2 right-3 flex size-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-muted transition-colors hover:bg-cream-deep hover:text-clay"
          >
            <Close size="0.9em" />
          </button>
        )}
      </div>

      <button
        type="submit"
        className="cursor-pointer rounded-xl border-[1.5px] border-line bg-white px-5 py-2.5 text-[0.88rem] font-semibold text-muted transition-colors hover:border-clay hover:text-clay"
      >
        Search
      </button>
    </form>
  )
}
