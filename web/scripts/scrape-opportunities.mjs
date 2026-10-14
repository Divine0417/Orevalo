#!/usr/bin/env node

import { pathToFileURL } from 'node:url'
import { createClient } from '@supabase/supabase-js'

const DEFAULT_USER_AGENT = 'OrevaloOpportunityBot/1.0 (+https://orevalo.com/contact)'
const LISTING_FIELDS = ['Engineering', 'Business', 'Technology', 'Finance', 'Healthcare']
const LISTING_LOCATIONS = ['Lagos', 'Abuja', 'Remote', 'Other']
const SCHOLARSHIP_COUNTRIES = ['Pan-African', 'Nigeria', 'Ghana', 'Kenya', 'South Africa', 'Other']
const SCHOLARSHIP_FIELDS = ['Any', 'Engineering', 'Business', 'Technology', 'Finance', 'Healthcare']
const DEGREE_LEVELS = ['Any', 'Undergraduate', 'Masters', 'PhD']
const LISTING_FIELD_KEYWORDS = {
  Engineering: ['engineering', 'technical', 'civil', 'mechanical', 'electrical', 'construction', 'site engineering', 'oil and gas', 'energy', 'mining', 'manufacturing', 'shipping', 'aerospace', 'architectural'],
  Healthcare: ['healthcare', 'medical', 'pharmaceutical', 'nurse', 'doctor', 'clinical', 'hospital', 'clinic', 'caregiver', 'health'],
  Finance: ['finance', 'account', 'audit', 'banking', 'business analysis', 'insurance', 'treasury', 'risk management', 'compliance', 'procurement', 'storekeeping', 'supply chain'],
  Business: ['business', 'sales', 'marketing', 'management', 'operations', 'human resources', 'hr', 'project management', 'customer care', 'consultancy', 'administration', 'logistics', 'strategic', 'product management', 'communications', 'public relations'],
  Technology: ['technology', 'software', 'ai', 'artificial intelligence', 'data', 'ict', 'computer', 'digital', 'product', 'design', 'ux', 'creative', 'media production', 'filmmaker', 'grok', 'capcut', 'programming', 'cybersecurity', 'analytics', 'editorial'],
}

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
    .replace(/&#(x[\da-f]+|\d+);/gi, (_match, code) => String.fromCodePoint(code[0].toLowerCase() === 'x' ? Number.parseInt(code.slice(1), 16) : Number.parseInt(code, 10)))
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
  const readable = String(value).match(/\d{1,2}\s+[A-Za-z]{3,9}\s+\d{4}/)?.[0] ?? String(value)
  const parsed = Date.parse(readable)
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
      const source = match[1].trim()
      let parsed
      try {
        parsed = JSON.parse(source)
      } catch {
        const repaired = source.replace(/"(?:\\.|[^"\\])*"/gs, (value) => value.replace(/[\u0000-\u001f]/g, (character) => JSON.stringify(character).slice(1, -1)))
        parsed = JSON.parse(repaired)
      }
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

export function inferField(text) {
  const lower = String(text ?? '').toLowerCase()
  if (!lower) return 'Other'
  for (const field of LISTING_FIELDS) {
    const keywords = LISTING_FIELD_KEYWORDS[field] ?? []
    if (keywords.some((keyword) => lower.includes(keyword))) return field
  }
  if (lower.includes('remote') || lower.includes('telecommute') || lower.includes('online')) return 'Technology'
  return 'Other'
}

export function inferLocation(text) {
  const lower = String(text ?? '').toLowerCase()
  if (!lower) return 'Other'
  if (/(remote|telecommute|work from home|online)/i.test(lower)) return 'Remote'
  if (/\blagos\b/i.test(lower)) return 'Lagos'
  if (/\babuja\b|federal capital/i.test(lower)) return 'Abuja'
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

function opportunityDescription(value) {
  let html = String(value ?? '')
  for (let index = 0; index < 3; index += 1) html = decodeHtml(html)
  html = html
    .replace(/<(script|style|nav|header|footer|form|aside)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<li\b[^>]*>/gi, '\n- ')
    .replace(/<\/(?:p|div|section|article|h[1-6]|li|br)\s*>/gi, '\n')
    .replace(/<br\b[^>]*>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
  return html
    .split(/\r?\n/)
    .map((line) => cleanText(line))
    .filter((line) => line && !/send this job to a friend|send this to a friend|share this job|subscribe on telegram|build your cv for free/i.test(line))
    .join('\n')
    .slice(0, 4000)
}

function structuredValue(value) {
  if (typeof value === 'string' || typeof value === 'number') return String(value).trim()
  if (Array.isArray(value)) return value.map(structuredValue).filter(Boolean).join('; ')
  if (!value || typeof value !== 'object') return ''
  if (value.monthsOfExperience != null) return `${value.monthsOfExperience} months`
  if (value.yearsOfExperience != null) return `${value.yearsOfExperience} years`
  return firstString(value.credentialCategory, value.educationalLevel, value.name, value.description, value.value)
}

function labelRequirement(value) {
  if (/\b(master|bachelor|degree|diploma|education|academic)\b/i.test(value)) return 'Degree level'
  if (/\b(nationality|national|citizen|citizenship)\b/i.test(value)) return 'Nationality'
  if (/\b(nigeria|ghana|kenya|south africa|african|resident|residence)\b/i.test(value)) return 'Eligible location'
  if (/\b(years?|months?)\b.*\b(experience|work|relevant)\b|\b(experience|work)\b.*\b(years?|months?)\b/i.test(value)) return 'Experience'
  if (/\b(field|course|discipline|study|speciali[sz]ation)\b/i.test(value)) return 'Field of study'
  return 'Requirement'
}

function requirementsFromPosting(jobPosting, description) {
  const requirements = []
  const add = (label, value) => {
    const detail = structuredValue(value)
    if (detail && !requirements.some((item) => item.label === label && item.detail.toLowerCase() === detail.toLowerCase())) {
      requirements.push({ label, detail })
    }
  }

  add('Degree level', jobPosting.educationRequirements)
  add('Experience', jobPosting.experienceRequirements)
  add('Eligible location', jobPosting.applicantLocationRequirements)
  add('Field of study', jobPosting.educationalRequirements)
  add('Eligibility', jobPosting.eligibility)

  let html = String(description ?? '')
  for (let index = 0; index < 3; index += 1) html = decodeHtml(html)
  const requirementHeading = /<(?:h[1-6]|p|div)\b[^>]*>(?:(?!<\/(?:h[1-6]|p|div)>)[\s\S]){0,140}?(?:requirements|eligibility|qualifications|who can apply)(?:(?!<\/(?:h[1-6]|p|div)>)[\s\S]){0,140}?<\/(?:h[1-6]|p|div)>/i.exec(html)
  if (requirementHeading) {
    const section = html.slice(requirementHeading.index + requirementHeading[0].length).split(/<h[1-6]\b/i)[0]
    for (const match of section.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)) {
      const detail = opportunityDescription(match[1]).replace(/^-\s*/, '').trim()
      if (detail) add(labelRequirement(detail), detail)
    }
  }
  return requirements
}

function isProcurementNotice(title, description) {
  return /\b(?:request for (?:proposals?|quotations?|bids?)|call for (?:proposals?|expressions? of interest)|expression of interest|RFP|RFQ|EOI|tender|procurement notice|invitation to bid)\b/i.test(`${title} ${description}`)
}

function hostKey(value) {
  try {
    return new URL(value).hostname.toLowerCase().replace(/^www\./, '')
  } catch {
    return ''
  }
}

function preferredApplyUrl(html, sourceUrl, fallbackUrl) {
  const sourceHost = hostKey(sourceUrl)
  const external = (value) => {
    const url = absoluteUrl(value, sourceUrl)
    return /^https?:\/\//i.test(url) && hostKey(url) !== sourceHost ? url : ''
  }
  const anchors = [...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)].map((match) => {
    const href = match[1].match(/\bhref\s*=\s*["']([^"']+)["']/i)?.[1] ?? ''
    const label = htmlText(match[2])
    return { href, label, url: external(decodeHtml(href)) }
  })
  const official = anchors.find(({ url, label }) => url && /apply|application|official|career|click here|website/i.test(label))
  if (official) return official.url
  const jsonApply = jsonLdValues(html).flatMap((item) => [item?.applicationUrl, item?.url]).map(external).find(Boolean)
  if (jsonApply) return jsonApply
  const applyPath = anchors.find(({ url }) => url && /\/apply(?:\/|$)|\/application(?:\/|$)/i.test(new URL(url).pathname))
  if (applyPath) return applyPath.url
  const sourceApply = anchors.find(({ href, label }) => /apply|application/i.test(label) && hostKey(absoluteUrl(decodeHtml(href), sourceUrl)) === sourceHost)
  return sourceApply ? absoluteUrl(decodeHtml(sourceApply.href), sourceUrl) : fallbackUrl
}

function linksToPath(html, sourceUrl, pattern) {
  return [...html.matchAll(/href=["']([^"']+)["']/gi)]
    .map((match) => ({ url: absoluteUrl(decodeHtml(match[1]), sourceUrl), text: '' }))
    .filter((link) => pattern.test(link.url))
}

function dateAfterLabel(text, label) {
  const match = text.match(new RegExp(`${label}[^\\n]{0,100}?((?:\\d{4}-\\d{2}-\\d{2})|(?:\\d{1,2} [A-Za-z]{3,9} \\d{4})|(?:[A-Za-z]{3,9} \\d{1,2},? \\d{4}))`, 'i'))
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

export function extractMyJobMagListing(detailHtml, sourceUrl) {
  const jobPosting = jsonLdValues(detailHtml).find((item) => item?.['@type'] === 'JobPosting') ?? null
  if (!jobPosting) return null
  const pageTitle = cleanText(decodeHtml(detailHtml.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? ''))
  const title = firstString(
    jobPosting?.title,
    pageTitle.split(/\s+at\s+/i)[0]
  )
  const company = firstString(
    jobPosting?.hiringOrganization?.name,
    jobPosting?.hiringOrganization,
    pageTitle.match(/\s+at\s+(.+?)(?:\s+[A-Z][a-z]+,?\s+\d{4}\s+\|\s+MyJobMag|\s+\|\s+MyJobMag)?$/i)?.[1],
    ''
  )
  const structuredLocation = locationText(jobPosting?.jobLocation)
  const locationLine = firstString(structuredLocation, jobPosting?.jobLocationType)
  const deadline = isoDate(jobPosting.validThrough) ?? isoDate(detailHtml.match(/\bDeadline:\s*([^<\r\n]+)/i)?.[1]) ?? dateAfterLabel(htmlText(detailHtml), 'Deadline')
  const description = opportunityDescription(jobPosting.description)
  const normalizedTitle = title.replace(/\s+at\s+.+$/i, '').trim()
  const normalizedCompany = company.replace(/\s+\|\s+MyJobMag.*$/i, '').trim()

  if (!normalizedCompany || !normalizedTitle || !deadline || /send this job to a friend|send this to a friend|share this job/i.test(normalizedTitle) || isProcurementNotice(normalizedTitle, description)) {
    return null
  }

  return {
    company: normalizedCompany,
    title: normalizedTitle,
    location: inferLocation(`${locationLine} ${jobPosting?.jobLocationType ?? ''}`),
    field: inferField(`${jobPosting?.occupationalCategory ?? ''} ${jobPosting?.industry ?? ''} ${normalizedTitle}`),
    deadline,
    apply_url: preferredApplyUrl(detailHtml, sourceUrl, sourceUrl),
    description,
    requirements: requirementsFromPosting(jobPosting, jobPosting.description),
  }
}

async function extractMyJobMagListings(indexHtml, sourceUrl) {
  const detailLinks = [...new Map(linksToPath(indexHtml, sourceUrl, /\/job\//i).map((link) => [link.url, link])).values()]
  const limit = Number(process.env.SCRAPER_DETAIL_LIMIT ?? 25)
  const records = []
  for (const link of detailLinks.slice(0, limit)) {
    try {
      const detailHtml = await fetchPage(link.url)
      const record = extractMyJobMagListing(detailHtml, link.url)
      if (!record) continue
      records.push(record)
    } catch (error) {
      console.warn(`[scraper] skipped MyJobMag detail ${link.url}: ${error.message}`)
    }
  }
  return records
}

async function extractScholars4DevScholarships(indexHtml, sourceUrl) {
  const cards = [...indexHtml.matchAll(/<h2[^>]*>\s*<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>([\s\S]*?)(?=<h2\b|$)/gi)]
  const limit = Number(process.env.SCRAPER_DETAIL_LIMIT ?? 25)
  const records = []

  for (const match of cards.slice(0, limit)) {
    try {
      const name = cleanText(decodeHtml(match[2]))
      const detailUrl = absoluteUrl(decodeHtml(match[1]), sourceUrl)
      const text = htmlText(match[0])
      const deadline = isoDate(match[0].match(/Deadline:\s*([^<\r\n]+)/i)?.[1]) ?? dateAfterLabel(text, 'Deadline')
      const studyIn = cleanText(decodeHtml(match[0].match(/Study in:\s*([^<\r\n]+)/i)?.[1] ?? ''))
      const summaryLine = text.match(/\b([^\r\n]{2,120})\s+(?:Bachelors?|Masters?|PhD|Doctoral)[^\r\n]*/i)?.[1] ?? ''
      const degreeLevel = inferDegree(text)
      const funder = cleanText(summaryLine.replace(name, '').replace(/\s+(?:Bachelors?|Masters?|PhD|Doctoral).*$/i, ''))
      if (!name || !funder || !deadline || !detailUrl) continue
      let detailHtml = ''
      try {
        detailHtml = await fetchPage(detailUrl)
      } catch (error) {
        console.warn(`[scraper] using Scholars4Dev source link for ${detailUrl}: ${error.message}`)
      }
      const scholarshipPosting = jsonLdValues(detailHtml).find((item) => item?.['@type'] !== 'JobPosting' && item?.name) ?? null
      const detailDescription = opportunityDescription(scholarshipPosting?.description ?? '')
      const eligibility = firstString(
        structuredValue(scholarshipPosting?.eligibilityRequirements),
        structuredValue(scholarshipPosting?.eligibility),
        text.match(/Eligibility:\s*([^\r\n]+)/i)?.[1]
      )
      const requirements = requirementsFromPosting({
        educationRequirements: scholarshipPosting?.educationRequirements ?? degreeLevel,
        educationalRequirements: scholarshipPosting?.educationalRequirements ?? (text.match(/(?:Field|Study area):\s*([^\r\n]+)/i)?.[1] ?? ''),
        experienceRequirements: scholarshipPosting?.experienceRequirements,
        applicantLocationRequirements: scholarshipPosting?.applicantLocationRequirements,
        eligibility: eligibility || scholarshipPosting?.description,
      }, scholarshipPosting?.description ?? '')
      if (studyIn && studyIn !== text) requirements.push({ label: 'Study location', detail: cleanText(studyIn) })
      const applyUrl = detailHtml ? preferredApplyUrl(detailHtml, detailUrl, detailUrl) : detailUrl
      const completeEligibility = eligibility || requirements.filter((item) => item.label === 'Eligibility' || item.label === 'Requirement').map((item) => item.detail).join('\n')
      records.push({
        name,
        funder,
        country: inferCountry(studyIn || text),
        field: SCHOLARSHIP_FIELDS.find((field) => field !== 'Any' && text.toLowerCase().includes(field.toLowerCase())) ?? 'Any',
        degree_level: degreeLevel,
        deadline,
        eligibility: completeEligibility || null,
        apply_url: applyUrl,
        description: detailDescription || text.slice(0, 4000),
        requirements,
      })
    } catch (error) {
      console.warn(`[scraper] skipped Scholars4Dev detail ${match[1]}: ${error.message}`)
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
      apply_url: preferredApplyUrl(html, sourceUrl, absoluteUrl(firstString(item.applicationUrl, item.url), sourceUrl)),
      description: cleanText(item.description),
      requirements: requirementsFromPosting(item, item.description),
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
      apply_url: preferredApplyUrl(block, sourceUrl, applyUrl),
      description: text,
      requirements: [],
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
      apply_url: preferredApplyUrl(html, sourceUrl, absoluteUrl(firstString(item.applicationUrl, item.url), sourceUrl)),
      description: cleanText(item.description),
      requirements: requirementsFromPosting(item, item.description),
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
      apply_url: preferredApplyUrl(block, sourceUrl, applyUrl),
      description: text,
      requirements: [],
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
    description: record.description || null, requirements: record.requirements ?? [], source_name: sourceName, source_url: sourceUrl, verified_at: null,
  }
  return {
    slug: slugify(record.name), name: record.name, funder: record.funder, country: record.country, field: record.field,
    degree_level: record.degree_level, deadline: record.deadline, eligibility: record.eligibility || null, apply_url: record.apply_url,
    published: false, status: 'pending', description: record.description || null, requirements: record.requirements ?? [], source_name: sourceName, source_url: sourceUrl, verified_at: null,
  }
}

export async function scrapeSource({ sourceUrl, kind, sourceName, dryRun = false }) {
  if (!sourceUrl || !['listing', 'scholarship'].includes(kind) || !sourceName) throw new Error('Provide sourceUrl, kind listing|scholarship, and sourceName.')

  const html = await fetchPage(sourceUrl)
  const hostname = new URL(sourceUrl).hostname
  const isMyJobMag = hostname.endsWith('myjobmag.com') && kind === 'listing'
  const isScholars4Dev = hostname.endsWith('scholars4dev.com') && kind === 'scholarship'
  const extracted = isMyJobMag
    ? await extractMyJobMagListings(html, sourceUrl)
    : isScholars4Dev
      ? await extractScholars4DevScholarships(html, sourceUrl)
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
  const fresh = records.filter((record) => {
    if (known.has(record.slug) || known.has(record.apply_url)) return false
    known.add(record.slug)
    known.add(record.apply_url)
    return true
  })
  if (fresh.length === 0) return { ...summary, inserted: 0, duplicates: records.length }
  const { error } = await supabase.from(table).insert(fresh)
  if (error) throw error
  return { ...summary, inserted: fresh.length, duplicates: records.length - fresh.length, status: 'pending' }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = parseArgs(process.argv.slice(2))
  if (args.help) printHelp()
  else scrapeSource({ sourceUrl: args.url, kind: args.kind, sourceName: args['source-name'], dryRun: Boolean(args.dryRun) })
    .then((summary) => console.log(JSON.stringify(summary, null, 2)))
    .catch((error) => {
      console.error(`[scraper] ${error.message}`)
      process.exitCode = 1
    })
}
