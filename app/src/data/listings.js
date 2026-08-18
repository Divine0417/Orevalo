/**
 * Internship listings.
 *
 * Hardcoded for now, but deliberately shaped like an API response so the swap
 * to a real backend is a one-line change in the page: replace the import with
 * `fetch('/api/internships')`. Nothing in the components reads anything that
 * a Mongo document could not carry.
 *
 * `deadline` is an ISO date string (never a pre-formatted label) so filtering,
 * sorting and "closing soon" logic stay possible without re-parsing prose.
 */

export const FIELDS = ['Engineering', 'Business', 'Technology', 'Finance', 'Healthcare']

export const LOCATIONS = ['Lagos', 'Abuja', 'Remote', 'Other']

export const listings = [
  {
    id: 'flutterwave-software-engineering-intern',
    company: 'Flutterwave',
    title: 'Software Engineering Intern',
    location: 'Remote',
    field: 'Technology',
    deadline: '2026-09-30',
    applyUrl: 'https://example.com/apply/flutterwave',
  },
  {
    id: 'access-bank-graduate-trainee',
    company: 'Access Bank',
    title: 'Graduate Trainee',
    location: 'Lagos',
    field: 'Finance',
    deadline: '2026-10-15',
    applyUrl: 'https://example.com/apply/access-bank',
  },
  {
    id: 'dangote-business-development-intern',
    company: 'Dangote Group',
    title: 'Business Development Intern',
    location: 'Abuja',
    field: 'Business',
    deadline: '2026-09-20',
    applyUrl: 'https://example.com/apply/dangote',
  },
  {
    id: 'mtn-nigeria-technology-intern',
    company: 'MTN Nigeria',
    title: 'Technology Intern',
    location: 'Lagos',
    field: 'Technology',
    deadline: '2026-10-01',
    applyUrl: 'https://example.com/apply/mtn',
  },
  {
    id: 'pwc-nigeria-accounting-intern',
    company: 'PwC Nigeria',
    title: 'Accounting Intern',
    location: 'Lagos',
    field: 'Finance',
    deadline: '2026-10-10',
    applyUrl: 'https://example.com/apply/pwc',
  },
]

/** "2026-09-30" -> "September 30, 2026" */
export function formatDeadline(iso) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

/** Whole days from today until the deadline. Negative once it has passed. */
export function daysUntil(iso, today = new Date()) {
  const deadline = new Date(`${iso}T00:00:00`)
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  return Math.round((deadline - start) / 86400000)
}
