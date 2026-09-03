import { describe, expect, it } from 'vitest'
import { matchesAlert } from './alerts'

describe('matchesAlert', () => {
  const opportunity = { field: 'Technology', location: 'Remote' }

  it('matches empty filters as all options', () => {
    expect(matchesAlert(opportunity, { fields: [], locations: [] })).toBe(true)
  })

  it('matches selected field and location', () => {
    expect(matchesAlert(opportunity, { fields: ['Technology'], locations: ['Remote'] })).toBe(true)
    expect(matchesAlert(opportunity, { fields: ['Finance'], locations: ['Remote'] })).toBe(false)
    expect(matchesAlert(opportunity, { fields: ['Technology'], locations: ['Lagos'] })).toBe(false)
  })
})
