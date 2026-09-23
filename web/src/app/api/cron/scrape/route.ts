import { NextRequest, NextResponse } from 'next/server'
import { SCRAPER_SOURCES } from '../../../../../scripts/scraper-sources.mjs'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 300

const CRON_SECRET = process.env.CRON_SECRET ?? ''

export async function GET(request: NextRequest) {
  if (!CRON_SECRET || request.headers.get('authorization') !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // The cron is dry-run unless explicitly enabled in deployment settings.
    const dryRun = process.env.SCRAPER_CRON_WRITE !== 'true'
    const { scrapeSource } = await import('../../../../../scripts/scrape-opportunities.mjs')
    const results = []

    for (const source of SCRAPER_SOURCES.filter((item) => item.enabled)) {
      try {
        results.push(await scrapeSource({ sourceUrl: source.url, kind: source.kind, sourceName: source.name, dryRun }))
      } catch (error) {
        results.push({ source: source.name, error: error instanceof Error ? error.message : 'Source failed' })
      }
    }

    const failed = results.filter((result) => 'error' in result)
    return NextResponse.json({ ok: failed.length === 0, dryRun, results }, { status: failed.length ? 502 : 200 })
  } catch (error) {
    console.error('[scrape-cron] failed:', error)
    return NextResponse.json({ error: 'Scraper job failed' }, { status: 500 })
  }
}