export const FORM_COUNTRIES = new Set([
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
  'Other African country',
  'Diaspora (outside Africa)',
])

export const FORM_YEARS = new Set(['1st Year', '2nd Year', '3rd Year', '4th Year', 'Postgraduate'])
export const FORM_CONNECTIONS = new Set(['Very connected', 'Somewhat connected', 'Not very connected'])
export const FORM_STATUSES = new Set(['undergraduate', 'postgraduate', 'recent_graduate', 'nysc'])

export function validEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)
}

export function withinLength(value: string, maximum: number) {
  return value.trim().length <= maximum
}
