/**
 * Imports existing signups into the subscribers table.
 *
 * The 113 students who signed up before this table existed live in Formspree.
 * Until they are here, the landing page count and the dashboard disagree — and
 * Phase 3 alerts have nobody to send to.
 *
 * Usage:
 *   1. Formspree -> your form -> Submissions -> Export CSV
 *   2. node scripts/import-subscribers.mjs path/to/export.csv
 *
 * Accepts .csv or .json. Finds the email column by name, or falls back to the
 * first column that looks like an email address. Existing emails are skipped,
 * so re-running is safe.
 *
 * Uses the service-role key: importing has to bypass the admin-only RLS on
 * subscribers, and this runs on your machine, never in the browser.
 */

import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

const EMAIL_RE = /^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]{2,}$/

const file = process.argv[2]
if (!file) {
  console.error('Usage: node scripts/import-subscribers.mjs <export.csv|export.json>')
  process.exit(1)
}

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
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SECRET_KEY

if (!url || !serviceKey) {
  console.error('Need NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

/** Minimal CSV row splitter that respects quoted fields containing commas. */
function splitCsvLine(line) {
  const out = []
  let cur = ''
  let quoted = false

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (quoted && line[i + 1] === '"') {
        cur += '"'
        i++
      } else {
        quoted = !quoted
      }
    } else if (ch === ',' && !quoted) {
      out.push(cur)
      cur = ''
    } else {
      cur += ch
    }
  }
  out.push(cur)
  return out.map((s) => s.trim().replace(/^"|"$/g, ''))
}

function extractEmails(raw) {
  if (file.endsWith('.json')) {
    const parsed = JSON.parse(raw)
    const rows = Array.isArray(parsed) ? parsed : (parsed.submissions ?? parsed.data ?? [])
    return rows
      .map((r) => Object.values(r).find((v) => typeof v === 'string' && EMAIL_RE.test(v.trim())))
      .filter(Boolean)
  }

  const lines = raw.split(/\r?\n/).filter((l) => l.trim())
  if (lines.length === 0) return []

  const header = splitCsvLine(lines[0]).map((h) => h.toLowerCase())
  let emailIdx = header.findIndex((h) => h === 'email' || h.includes('email'))

  // No usable header? Find the column that actually holds email addresses.
  if (emailIdx === -1) {
    const firstRow = splitCsvLine(lines[1] ?? '')
    emailIdx = firstRow.findIndex((v) => EMAIL_RE.test(v))
  }

  const body = header.some((h) => h.includes('email')) ? lines.slice(1) : lines
  return body
    .map((line) => {
      const cells = splitCsvLine(line)
      const candidate = emailIdx >= 0 ? cells[emailIdx] : cells.find((c) => EMAIL_RE.test(c))
      return candidate?.trim()
    })
    .filter((e) => e && EMAIL_RE.test(e))
}

const emails = [...new Set(extractEmails(readFileSync(file, 'utf8')).map((e) => e.toLowerCase()))]

if (emails.length === 0) {
  console.error('No email addresses found in that file.')
  process.exit(1)
}

console.log(`found ${emails.length} unique addresses in ${file}`)

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } })

const { data: existingRows } = await supabase.from('subscribers').select('email')
const existing = new Set((existingRows ?? []).map((r) => r.email.toLowerCase()))
const fresh = emails.filter((e) => !existing.has(e))

console.log(`${existing.size} already in the table, ${fresh.length} to insert`)

if (fresh.length === 0) {
  console.log('nothing to do')
  process.exit(0)
}

// These people opted in before confirmation existed; importing them as
// unconfirmed would mean never mailing the very list this is meant to restore.
const { error, count } = await supabase.from('subscribers').insert(
  fresh.map((email) => ({
    email,
    source: 'formspree-import',
    confirmed: true,
  })),
  { count: 'exact' },
)

if (error) {
  console.error('insert failed:', error.message)
  process.exit(1)
}

console.log(`imported ${count ?? fresh.length} subscribers`)
