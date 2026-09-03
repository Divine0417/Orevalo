import { describe, expect, it } from 'vitest'
import { APPLICATION_STATUSES, isApplicationStatus } from './supabase/types'

describe('application tracking statuses', () => {
  it('contains every supported workflow stage', () => {
    expect(APPLICATION_STATUSES).toEqual([
      'interested',
      'preparing',
      'applied',
      'interviewing',
      'accepted',
      'rejected',
    ])
  })

  it('accepts only known statuses', () => {
    expect(isApplicationStatus('applied')).toBe(true)
    expect(isApplicationStatus('pending')).toBe(false)
    expect(isApplicationStatus('')).toBe(false)
  })
})
