import { describe, expect, it } from 'vitest'
import { matchesAlert } from './alerts'

describe('matchesAlert', () => {
  const opportunity = { field: 'Technology', location: 'Remote', degree_level: 'Undergraduate' }

  it('matches empty filters as all options', () => {
    expect(matchesAlert(opportunity, { fields: [], locations: [], degree_levels: [] })).toBe(true)
  })

  it('matches selected field and location', () => {
    expect(matchesAlert(opportunity, { fields: ['Technology'], locations: ['Remote'], degree_levels: ['Undergraduate'] })).toBe(true)
    expect(matchesAlert(opportunity, { fields: ['Finance'], locations: ['Remote'], degree_levels: [] })).toBe(false)
    expect(matchesAlert(opportunity, { fields: ['Technology'], locations: ['Lagos'], degree_levels: [] })).toBe(false)
  })

  it('matches scholarship Any values and degree filters', () => {
    const scholarship = { field: 'Any', location: 'Pan-African', degree_level: 'Any' }
    expect(matchesAlert(scholarship, { fields: ['Finance'], locations: ['Lagos'], degree_levels: ['PhD'] })).toBe(true)
  })

  it('rejects a mismatched degree level', () => {
    expect(matchesAlert(opportunity, { fields: [], locations: [], degree_levels: ['PhD'] })).toBe(false)
  })
})
