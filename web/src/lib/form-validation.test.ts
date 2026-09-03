import { describe, expect, it } from 'vitest'
import {
  FORM_CONNECTIONS,
  FORM_COUNTRIES,
  FORM_STATUSES,
  FORM_YEARS,
  validEmail,
  withinLength,
} from './form-validation'

describe('form validation rules', () => {
  it('accepts normal emails and rejects malformed values', () => {
    expect(validEmail('student@example.com')).toBe(true)
    expect(validEmail('student@')).toBe(false)
    expect(validEmail('student.example.com')).toBe(false)
  })

  it('enforces trimmed maximum lengths', () => {
    expect(withinLength('  answer  ', 6)).toBe(true)
    expect(withinLength('1234567', 6)).toBe(false)
  })

  it('contains the values used by the public forms', () => {
    expect(FORM_COUNTRIES.has('Nigeria')).toBe(true)
    expect(FORM_YEARS.has('1st Year')).toBe(true)
    expect(FORM_CONNECTIONS.has('Very connected')).toBe(true)
    expect(FORM_STATUSES.has('undergraduate')).toBe(true)
    expect(FORM_STATUSES.has('invalid')).toBe(false)
  })
})
