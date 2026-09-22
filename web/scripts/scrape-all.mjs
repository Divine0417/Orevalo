#!/usr/bin/env node

import { spawn } from 'node:child_process'
import { SCRAPER_SOURCES } from './scraper-sources.mjs'

const args = new Set(process.argv.slice(2))
const writeMode = args.has('--write')
const dryRun = !writeMode
const delayMs = Number(process.env.SCRAPER_DELAY_MS ?? 3000)

function runSource(source) {
  return new Promise((resolve) => {
    const childArgs = [
      'scripts/scrape-opportunities.mjs',
      '--url', source.url,
      '--kind', source.kind,
      '--source-name', source.name,
    ]
    if (dryRun) childArgs.push('--dry-run')

    console.log(`\n[scraper] ${dryRun ? 'Auditing' : 'Importing'} ${source.name} (${source.kind})`)
    const child = spawn(process.execPath, childArgs, { stdio: 'inherit', env: process.env })
    child.on('close', (code) => resolve({ source: source.id, code: code ?? 1 }))
    child.on('error', () => resolve({ source: source.id, code: 1 }))
  })
}

async function main() {
  if (args.has('--help') || args.has('-h')) {
    console.log(`Usage: npm run scrape:all [-- --write]

Default: run every enabled source in dry-run mode.
--write: insert new records as pending (requires Supabase credentials).
SCRAPER_DELAY_MS controls the delay between sources; default is 3000.`)
    return
  }

  if (writeMode && (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY)) {
    throw new Error('Write mode requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.')
  }

  const sources = SCRAPER_SOURCES.filter((source) => source.enabled)
  const results = []
  for (let index = 0; index < sources.length; index += 1) {
    results.push(await runSource(sources[index]))
    if (index < sources.length - 1) await new Promise((resolve) => setTimeout(resolve, delayMs))
  }

  console.log('\n[scraper] Batch summary')
  console.table(results)
  if (results.some((result) => result.code !== 0)) process.exitCode = 1
}

main().catch((error) => {
  console.error(`[scraper] ${error.message}`)
  process.exitCode = 1
})
