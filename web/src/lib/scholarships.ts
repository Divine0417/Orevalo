/**
 * Scholarship vocabularies.
 *
 * These live here rather than beside the server actions because a file marked
 * `'use server'` may only export async functions — Next.js rewrites every other
 * export into an action reference, so an exported array arrives on the client
 * as an opaque proxy and blows up on `.map()`. It builds cleanly and fails at
 * runtime, so the rule is worth remembering rather than rediscovering.
 */

export const COUNTRIES = [
  'Pan-African',
  'Nigeria',
  'Ghana',
  'Kenya',
  'South Africa',
  'Other',
] as const

export const DEGREE_LEVELS = ['Any', 'Undergraduate', 'Masters', 'PhD'] as const

export const SCHOLARSHIP_FIELDS = [
  'Any',
  'Engineering',
  'Business',
  'Technology',
  'Finance',
  'Healthcare',
] as const

export type Country = (typeof COUNTRIES)[number]
export type DegreeLevel = (typeof DEGREE_LEVELS)[number]
export type ScholarshipField = (typeof SCHOLARSHIP_FIELDS)[number]
