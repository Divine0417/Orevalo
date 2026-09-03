/**
 * Listing types, vocabularies and date helpers.
 *
 * Deliberately free of server-only imports so Client Components can use it.
 * The Supabase query lives in listings.server.ts — importing `next/headers`
 * from here would break any client component that needs FIELDS or formatDeadline.
 */

export const FIELDS = ['Engineering', 'Business', 'Technology', 'Finance', 'Healthcare'] as const
export const LOCATIONS = ['Lagos', 'Abuja', 'Remote', 'Other'] as const

export type Field = (typeof FIELDS)[number]
export type Location = (typeof LOCATIONS)[number]

export type Listing = {
  id: string
  company: string
  title: string
  location: Location
  field: Field
  /** ISO date (YYYY-MM-DD), never a pre-formatted label. */
  deadline: string
  apply_url: string
}

export type ListingFilters = {
  field?: string
  location?: string
}

export const SEED: Listing[] = [
  {
    id: 'flutterwave-software-engineering-intern',
    company: 'Flutterwave',
    title: 'Software Engineering Intern',
    location: 'Remote',
    field: 'Technology',
    deadline: '2026-09-30',
    apply_url: 'https://example.com/apply/flutterwave',
  },
  {
    id: 'access-bank-graduate-trainee',
    company: 'Access Bank',
    title: 'Graduate Trainee',
    location: 'Lagos',
    field: 'Finance',
    deadline: '2026-10-15',
    apply_url: 'https://example.com/apply/access-bank',
  },
  {
    id: 'dangote-business-development-intern',
    company: 'Dangote Group',
    title: 'Business Development Intern',
    location: 'Abuja',
    field: 'Business',
    deadline: '2026-09-20',
    apply_url: 'https://example.com/apply/dangote',
  },
  {
    id: 'mtn-nigeria-technology-intern',
    company: 'MTN Nigeria',
    title: 'Technology Intern',
    location: 'Lagos',
    field: 'Technology',
    deadline: '2026-10-01',
    apply_url: 'https://example.com/apply/mtn',
  },
  {
    id: 'pwc-nigeria-accounting-intern',
    company: 'PwC Nigeria',
    title: 'Accounting Intern',
    location: 'Lagos',
    field: 'Finance',
    deadline: '2026-10-10',
    apply_url: 'https://example.com/apply/pwc',
  },
]

/** "2026-09-30" -> "September 30, 2026" */
export function formatDeadline(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

/** Whole days until the deadline. Negative once it has passed. */
export function daysUntil(iso: string, today = new Date()): number {
  const deadline = Date.parse(`${iso}T00:00:00Z`)
  const start = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
  return Math.round((deadline - start) / 86_400_000)
}
