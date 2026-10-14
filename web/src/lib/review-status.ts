export type ReviewStatus = 'pending' | 'published' | 'rejected' | 'archived'

export type ReviewStatusInput = {
  published?: boolean | null
  status?: string | null
}

export function normalizeReviewStatus(input: ReviewStatusInput): ReviewStatus {
  const raw = (input.status ?? '').toLowerCase()

  if (raw === 'published' || raw === 'rejected' || raw === 'archived') {
    return raw
  }

  if (raw === 'pending') {
    return 'pending'
  }

  if (input.published === true) {
    return 'published'
  }

  return 'pending'
}

export function composeReviewUpdate(
  action: 'approved' | 'rejected',
  rejectionReason?: string | null,
): {
  published: boolean
  status: ReviewStatus
  rejection_reason?: string | null
  archived_at?: string | null
} {
  if (action === 'approved') {
    return { published: true, status: 'published', archived_at: null }
  }

  return {
    published: false,
    status: 'rejected',
    rejection_reason: rejectionReason?.trim() || null,
  }
}
