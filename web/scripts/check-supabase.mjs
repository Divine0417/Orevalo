/**
 * Connectivity check for the Supabase project.
 *
 * Run with: node scripts/check-supabase.mjs
 * Reports whether the schema migration has been applied and whether RLS is
 * behaving — without printing any key material.
 */

import { readFileSync } from 'node:fs'
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
const key = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or a publishable/anon key in .env.local')
  process.exit(1)
}

console.log('project:', new URL(url).hostname.split('.')[0])

const supabase = createClient(url, key)

const { data: listings, error: listingsError } = await supabase
  .from('listings')
  .select('slug, company, title, deadline, published')
  .order('deadline')

if (listingsError) {
  console.log(`listings  -> ${listingsError.code ?? ''} ${listingsError.message}`)
} else {
  console.log(`listings  -> OK, ${listings.length} readable as anon`)
  for (const l of listings) console.log(`             ${l.deadline}  ${l.company} — ${l.title}`)
}

const { error: profilesError } = await supabase.from('profiles').select('id').limit(1)
console.log(
  `profiles  -> ${profilesError ? `${profilesError.code ?? ''} ${profilesError.message}` : 'OK (readable)'}`,
)

// RLS smoke test: an anonymous insert must be rejected.
const { error: writeError } = await supabase
  .from('listings')
  .insert({
    slug: 'rls-probe-should-fail',
    company: 'RLS Probe',
    title: 'Should Not Insert',
    location: 'Remote',
    field: 'Technology',
    deadline: '2030-01-01',
    apply_url: 'https://example.com',
  })
  .select()

if (writeError) {
  console.log(`anon write-> correctly rejected (${writeError.code ?? writeError.message})`)
} else {
  console.log('anon write-> !! SUCCEEDED — row level security is NOT protecting listings')
  await supabase.from('listings').delete().eq('slug', 'rls-probe-should-fail')
}
