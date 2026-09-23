#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'

const DEFAULT_USER_AGENT = 'OrevaloOpportunityBot/1.0 (+https://orevalo.com/contact)'
const LISTING_FIELDS = ['Engineering', 'Business', 'Technology', 'Finance', 'Healthcare']
const LISTING_LOCATIONS = ['Lagos', 'Abuja', 'Remote', 'Other']
const SCHOLARSHIP_COUNTRIES = ['Pan-African', 'Nigeria', 'Ghana', 'Kenya', 'South Africa', 'Other']
const SCHOLARSHIP_FIELDS = ['Any', 'Engineering', 'Business', 'Technology', 'Finance', 'Healthcare']
const DEGREE_LEVELS = ['Any', 'Undergraduate', 'Masters', 'PhD']

function parseArgs(argv) {
  const args = {}
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index]
    if (value === '--dry-run') args.dryRun = true
    else if (value === '--help' || value === '-h') args.help = true
    else if (value.startsWith('--')) args[value.slice(2)] = argv[++index]
  }
  return args
}

function printHelp() {
  console.log(`Usage: npm run scrape -- --url <source-url> --kind <listing|scholarship> --source-name <name> [--dry-run]

Required:
  --url          Source page or feed to fetch
  --kind         listing or scholarship
  --source-name  Human-readable source name

Optional:
  --dry-run      Extract and validate without writing to Supabase
  --help         Show this help

The scraper expects JSON-LD JobPosting/item data or repeated semantic <article>
blocks. It never publishes scraped rows; successful inserts are pending review.`)
}

function cleanText(value) {
  return String(value ?? '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

function decodeHtml(value) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
}

function absoluteUrl(value, sourceUrl) {
  try {
    return new URL(value, sourceUrl).toString()
  } catch {
    return ''
  }
}

function isoDate(value) {
  if (!value) return null
  const match = String(value).match(/\d{4}-\d{2}-\d{2}/)
  if (match) return match[0]
  const parsed = Date.parse(String(value))
  if (Number.isNaN(parsed)) return null
  return new Date(parsed).toISOString().slice(0, 10)
}

function slugify(value) {
  return cleanText(value).toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80)
}

function firstString(...values) {
  return values.find((value) => typeof value === 'string' && cleanText(value)) ?? ''
}

function jsonLdValues(html) {
  const values = []
  for (const match of html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const parsed = JSON.parse(match[1].trim())
      values.push(...(Array.isArray(parsed) ? parsed : [parsed]))
    } catch {
      // A malformed JSON-LD block should not prevent other extraction paths.
    }
  }
  return values.flatMap((value) => value?.itemListElement ?? value?.['@graph'] ?? value).filter(Boolean)
}

function locationText(value) {
  if (typeof value === 'string') return value
  if (Array.isArray(value)) return locationText(value[0])
  return firstString(value?.name, value?.address?.addressLocality, value?.address?.addressRegion, value?.address?.addressCountry)
}

function inferField(text) {
  const lower = text.toLowerCase()
  return LISTING_FIELDS.find((field) => lower.includes(field.toLowerCase())) ?? 'Other'
}

function inferLocation(text) {
  const lower = text.toLowerCase()
  return LISTING_LOCATIONS.find((location) => lower.includes(location.toLowerCase())) ?? 'Other'
}

function inferCountry(text) {
  const lower = text.toLowerCase()
  return SCHOLARSHIP_COUNTRIES.find((country) => lower.includes(country.toLowerCase())) ?? 'Other'
}

function inferDegree(text) {
  const lower = text.toLowerCase()
  return DEGREE_LEVELS.find((level) => level !== 'Any' && lower.includes(level.toLowerCase())) ?? 'Any'
}

function articleBlocks(html) {
  return [...html.matchAll(/<article\b[^>]*>([\s\S]*?)<\/article>/gi)].map((match) => match[1])
}

function linkFrom(block, sourceUrl) {
  const match = block.match(/<a\b[^>]*href=["']([^"']+)["'][^>]*>/i)
  return match ? absoluteUrl(decodeHtml(match[1]), sourceUrl) : ''
}

function headingFrom(block) {
  const match = block.match(/<h[1-4]\b[^>]*>([\s\S]*?)<\/h[1-4]>/i)
  return match ? cleanText(decodeHtml(match[1])) : ''
}

function htmlText(html) {
  return cleanText(decodeHtml(html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ')))
}

function linksToPath(html, sourceUrl, pattern) {
  return [...html.matchAll(/href=["']([^"']+)["']/gi)]
    .map((match) => ({ url: absoluteUrl(decodeHtml(match[1]), sourceUrl), text: '' }))
    .filter((link) => pattern.test(link.url))
}

function dateAfterLabel(text, label) {
  const match = text.match(new RegExp(`${label}[^\\n]{0,100}?((?:\\d{4}-\\d{2}-\\d{2})|(?:[A-Za-z]{3,9} \\d{1,2},? \\d{4}))`, 'i'))
  return isoDate(match?.[1])
}

async function fetchPage(url) {
  const response = await fetch(url, {
    headers: {
      'user-agent': process.env.SCRAPER_USER_AGENT ?? DEFAULT_USER_AGENT,
      accept: 'text/html,application/xhtml+xml,application/json',
    },
    signal: AbortSignal.timeout(20_000),
  })
  if (!response.ok) throw new Error(`Source returned HTTP ${response.status} for ${url}.`)
  return response.text()
}

async function extractMyJobMagListings(indexHtml, sourceUrl) {
  const detailLinks = [...new Map(linksToPath(indexHtml, sourceUrl, /\/job\//i).map((link) => [link.url, link])).values()]
  const limit = Number(process.env.SCRAPER_DETAIL_LIMIT ?? 25)
  const records = []
  for (const link of detailLinks.slice(0, limit)) {
    try {
      const detailHtml = await fetchPage(link.url)
      const text = htmlText(detailHtml)
      const pageTitle = cleanText(decodeHtml(detailHtml.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? ''))
      const title = firstString(headingFrom(detailHtml), pageTitle.split(/\s+at\s+/i)[0], link.text)
      const company = pageTitle.match(/\s+at\s+(.+?)(?:\s+September,?\s+\d{4}|\s+\|\s+MyJobMag)?$/i)?.[1]?.trim() ?? ''
      const locationLine = text.match(/Location\s+(.{2,160}?)(?:Job Field|Salary|Posted:|Deadline:)/i)?.[1] ?? text
      const fieldLine = text.match(/Job Field\s+(.{2,120}?)(?:Salary|Industry|About the Opportunity|Posted:|Deadline:)/i)?.[1] ?? text
      const deadline = isoDate(detailHtml.match(/\bDeadline:\s*([^<\r\n]+)/i)?.[1]) ?? dateAfterLabel(text, 'Deadline')
      if (!company || !title || !deadline) continue
      records.push({
        company,
        title: title.replace(/\s+at\s+.+$/i, '').trim(),
        location: inferLocation(locationLine),
        field: inferField(fieldLine),
        deadline,
        apply_url: link.url,
        description: text.slice(0, 4000),
      })
    } catch (error) {
      console.warn(`[scraper] skipped MyJobMag detail ${link.url}: ${error.message}`)
    }
  }
  return records
}

function extractListingObjects(html, sourceUrl) {
  const records = []
  for (const item of jsonLdValues(html)) {
    if (item['@type'] !== 'JobPosting' && !item.title) continue
    const organization = typeof item.hiringOrganization === 'object' ? item.hiringOrganization.name : item.hiringOrganization
    const location = locationText(item.jobLocation)
    records.push({
      company: firstString(organization, item.employer),
      title: firstString(item.title, item.name),
      location: inferLocation(location),
      field: inferField(`${item.title ?? ''} ${item.description ?? ''}`),
      deadline: isoDate(item.validThrough),
      apply_url: absoluteUrl(firstString(item.url, item.sameAs), sourceUrl),
      description: cleanText(item.description),
    })
  }
  for (const block of articleBlocks(html)) {
    const text = cleanText(block)
    const title = headingFrom(block)
    const applyUrl = linkFrom(block, sourceUrl)
    if (title && applyUrl) records.push({
      company: firstString(text.split(/\s[-|·]\s/)[0]),
      title,
      location: inferLocation(text),
      field: inferField(text),
      deadline: isoDate(text.match(/(?:deadline|closes?|closing)[^\d]*(\d{4}-\d{2}-\d{2}|[A-Za-z]+ \d{1,2},? \d{4})/i)?.[1]),
      apply_url: applyUrl,
      description: text,
    })
  }
  return records
}

function extractScholarshipObjects(html, sourceUrl) {
  const records = []
  for (const item of jsonLdValues(html)) {
    if (!item.name || item['@type'] === 'JobPosting') continue
    const text = `${item.name} ${item.description ?? ''}`
    records.push({
      name: item.name,
      funder: firstString(item.provider?.name, item.sponsor?.name, item.organizer?.name),
      country: inferCountry(text),
      field: SCHOLARSHIP_FIELDS.find((field) => field !== 'Any' && text.toLowerCase().includes(field.toLowerCase())) ?? 'Any',
      degree_level: inferDegree(text),
      deadline: isoDate(item.endDate ?? item.validThrough),
      eligibility: cleanText(item.eligibility),
      apply_url: absoluteUrl(firstString(item.url, item.sameAs), sourceUrl),
      description: cleanText(item.description),
    })
  }
  for (const block of articleBlocks(html)) {
    const text = cleanText(block)
    const name = headingFrom(block)
    const applyUrl = linkFrom(block, sourceUrl)
    if (name && applyUrl) records.push({
      name,
      funder: firstString(text.split(/\s[-|·]\s/)[0]),
      country: inferCountry(text),
      field: SCHOLARSHIP_FIELDS.find((field) => field !== 'Any' && text.toLowerCase().includes(field.toLowerCase())) ?? 'Any',
      degree_level: inferDegree(text),
      deadline: isoDate(text.match(/(?:deadline|closes?|closing)[^\d]*(\d{4}-\d{2}-\d{2}|[A-Za-z]+ \d{1,2},? \d{4})/i)?.[1]),
      eligibility: null,
      apply_url: applyUrl,
      description: text,
    })
  }
  return records
}

function validate(record, kind) {
  const required = kind === 'listing'
    ? ['company', 'title', 'location', 'field', 'deadline', 'apply_url']
    : ['name', 'funder', 'country', 'field', 'degree_level', 'apply_url']
  if (required.some((key) => !record[key])) return false
  if (!/^https?:\/\//i.test(record.apply_url)) return false
  if (kind === 'listing' && (!LISTING_FIELDS.includes(record.field) || !LISTING_LOCATIONS.includes(record.location) || !/^\d{4}-\d{2}-\d{2}$/.test(record.deadline))) return false
  if (kind === 'scholarship' && (!SCHOLARSHIP_COUNTRIES.includes(record.country) || !SCHOLARSHIP_FIELDS.includes(record.field) || !DEGREE_LEVELS.includes(record.degree_level))) return false
  return true
}

function toInsert(record, kind, sourceName, sourceUrl) {
  if (kind === 'listing') return {
    slug: slugify(`${record.company}-${record.title}`), company: record.company, title: record.title, location: record.location,
    field: record.field, deadline: record.deadline, apply_url: record.apply_url, published: false, status: 'pending',
    description: record.description || null, source_name: sourceName, source_url: sourceUrl, verified_at: null,
  }
  return {
    slug: slugify(record.name), name: record.name, funder: record.funder, country: record.country, field: record.field,
    degree_level: record.degree_level, deadline: record.deadline, eligibility: record.eligibility || null, apply_url: record.apply_url,
    published: false, status: 'pending', description: record.description || null, source_name: sourceName, source_url: sourceUrl, verified_at: null,
  }
}

export async function scrapeSource({ sourceUrl, kind, sourceName, dryRun = false }) {
  if (!sourceUrl || !['listing', 'scholarship'].includes(kind) || !sourceName) throw new Error('Provide sourceUrl, kind listing|scholarship, and sourceName.')

  const html = await fetchPage(sourceUrl)
  const isMyJobMag = new URL(sourceUrl).hostname.endsWith('myjobmag.com') && kind === 'listing'
  const extracted = isMyJobMag
    ? await extractMyJobMagListings(html, sourceUrl)
    : kind === 'listing'
      ? extractListingObjects(html, sourceUrl)
      : extractScholarshipObjects(html, sourceUrl)
  const unique = new Map()
  for (const record of extracted) if (validate(record, kind)) unique.set(`${record.apply_url}|${kind}`, toInsert(record, kind, sourceName, sourceUrl))
  const records = [...unique.values()]
  const summary = { source: sourceName, url: sourceUrl, kind, extracted: extracted.length, valid: records.length, dryRun }
  if (dryRun || records.length === 0) return summary

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for writes.')
  const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } })
  const table = kind === 'listing' ? 'listings' : 'scholarships'
  const { data: existing, error: existingError } = await supabase.from(table).select('slug, apply_url')
  if (existingError) throw existingError
  const known = new Set((existing ?? []).flatMap((row) => [row.slug, row.apply_url]))
  const fresh = records.filter((record) => !known.has(record.slug) && !known.has(record.apply_url))
  if (fresh.length === 0) return { ...summary, inserted: 0, duplicates: records.length }
  const { error } = await supabase.from(table).insert(fresh)
  if (error) throw error
  return { ...summary, inserted: fresh.length, duplicates: records.length - fresh.length, status: 'pending' }
}

if (import.meta.url === `file://${process.argv[1].replaceAll('\\', '/')}`) {
  const args = parseArgs(process.argv.slice(2))
  if (args.help) printHelp()
  else scrapeSource({ sourceUrl: args.url, kind: args.kind, sourceName: args['source-name'], dryRun: Boolean(args.dryRun) })
    .then((summary) => console.log(JSON.stringify(summary, null, 2)))
    .catch((error) => {
      console.error(`[scraper] ${error.message}`)
      process.exitCode = 1
    })
}
