import { describe, expect, it } from 'vitest'
import { composeReviewUpdate, normalizeReviewStatus } from './review-status'

describe('normalizeReviewStatus', () => {
  it('derives a review status from existing published flags', () => {
    expect(normalizeReviewStatus({ published: true, status: null })).toBe('published')
    expect(normalizeReviewStatus({ published: false, status: null })).toBe('pending')
    expect(normalizeReviewStatus({ published: true, status: 'pending' })).toBe('pending')
    expect(normalizeReviewStatus({ published: false, status: 'rejected' })).toBe('rejected')
  })

  it('turns approval and rejection into public visibility fields', () => {
    expect(composeReviewUpdate('approved')).toEqual({ published: true, status: 'published', archived_at: null })
    expect(composeReviewUpdate('rejected', 'broken link')).toEqual({
      published: false,
      status: 'rejected',
      rejection_reason: 'broken link',
    })
  })
})
