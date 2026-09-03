/**
 * Verifies that row level security actually protects personal data.
 *
 * These tables hold applicants' names, emails and universities, and the anon
 * key is public by definition — so "we wrote a policy" is not evidence. This
 * inserts a probe row with the service-role key, then checks the anon key
 * cannot see it, then removes it.
 *
 * Important: a blocked SELECT returns an EMPTY SET, not an error. Testing for
 * an error would pass even with RLS switched off on an empty table.
 *
 * Run: node scripts/check-rls.mjs
 */

import { readFileSync } from 'node:fs'
import { randomUUID } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'

const env = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    .split(/\r?\n/)
    .filter((l) => l && !l.trimStart().startsWith('#') && l.includes('='))
    .map((l) => {
      const i = l.indexOf('=')
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()]
    }),
)

const url = env.NEXT_PUBLIC_SUPABASE_URL
const service = createClient(url, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})
const anon = createClient(
  url,
  env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
)

const probe = randomUUID()

/** table -> a row that satisfies its NOT NULL constraints. */
const PRIVATE_TABLES = {
  subscribers: { email: `rls-probe-${probe}@example.com`, source: 'rls-probe' },
  leader_applications: {
    full_name: 'RLS Probe',
    email: `rls-probe-${probe}@example.com`,
    country: 'Nigeria',
    university: 'Probe University',
    course: 'Probing',
    year: '1st Year',
    connection: 'Very connected',
    challenge: 'probe',
    why: 'probe',
  },
  research_responses: {
    first_name: 'RLS Probe',
    email: `rls-probe-${probe}@example.com`,
    country: 'Nigeria',
    answers: { probe: true },
  },
}

let failures = 0

for (const [table, row] of Object.entries(PRIVATE_TABLES)) {
  const { data: inserted, error: insertError } = await service
    .from(table)
    .insert(row)
    .select('id')
    .single()

  if (insertError) {
    console.log(`${table.padEnd(20)} could not probe: ${insertError.message}`)
    failures++
    continue
  }

  const { data: seen } = await anon.from(table).select('id').eq('id', inserted.id)
  const leaked = (seen ?? []).length > 0

  console.log(
    `${table.padEnd(20)} anon read -> ${leaked ? '!! LEAKED — personal data is public' : 'blocked'}`,
  )
  if (leaked) failures++

  // Public insert must stay open: that is the signup / apply path.
  const { error: writeError } = await anon.from(table).insert(row)
  console.log(
    `${table.padEnd(20)} anon insert -> ${writeError ? `blocked (${writeError.code})` : 'allowed (expected)'}`,
  )

  await service.from(table).delete().eq('id', inserted.id)
  await service.from(table).delete().eq('email', row.email)
}

// Listings are meant to be world readable — the opposite expectation.
const { data: publicListings } = await anon.from('listings').select('id').limit(1)
console.log(
  `${'listings'.padEnd(20)} anon read -> ${(publicListings ?? []).length > 0 ? 'readable (expected)' : '!! not readable — the public board will be empty'}`,
)

console.log(failures === 0 ? '\nPASS — no personal data readable by anon' : `\nFAIL — ${failures} problem(s)`)
process.exit(failures === 0 ? 0 : 1)
