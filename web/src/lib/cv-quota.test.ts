import { describe, expect, it } from 'vitest'
import {
  FREE_CV_CREATION_LIMIT,
  canCreateCv,
  canEditCv,
  getCvQuota,
  quotaMessage,
} from './cv-quota'

describe('free CV quota', () => {
  it('allows two creation slots and reports the remainder', () => {
    expect(FREE_CV_CREATION_LIMIT).toBe(2)
    expect(getCvQuota(0)).toEqual({ creations: 0, remaining: 2 })
    expect(getCvQuota(1)).toEqual({ creations: 1, remaining: 1 })
    expect(getCvQuota(2)).toEqual({ creations: 2, remaining: 0 })
  })

  it('allows the first edit without consuming another slot', () => {
    expect(canEditCv(2, 0)).toBe(true)
    expect(canEditCv(1, 0)).toBe(true)
  })

  it('counts a second edit as a new creation', () => {
    expect(canEditCv(1, 1)).toBe(true)
    expect(canEditCv(2, 1)).toBe(false)
  })

  it('blocks new CVs after the monthly limit', () => {
    expect(canCreateCv(2)).toBe(false)
    expect(quotaMessage()).toContain('Upgrade to Plus or Premium')
    expect(quotaMessage()).toContain('next month')
  })
})