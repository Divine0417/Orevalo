import { describe, expect, it } from 'vitest'
import { duplicateKey, parseCsv } from './opportunity-import'

describe('opportunity CSV import', () => {
  it('parses quoted commas and normalizes headers', () => {
    const [row] = parseCsv('Company,Title,Apply URL\n"Orevalo, Inc.",Intern,https://example.com/apply')
    expect(row).toEqual({ company: 'Orevalo, Inc.', title: 'Intern', apply_url: 'https://example.com/apply' })
  })

  it('creates stable duplicate keys from identity and URL', () => {
    expect(duplicateKey('listing', { company: 'Acme Ltd', title: 'Intern', apply_url: 'https://example.com/' }))
      .toBe(duplicateKey('listing', { company: 'acme ltd', title: 'intern', apply_url: 'https://example.com' }))
  })
})