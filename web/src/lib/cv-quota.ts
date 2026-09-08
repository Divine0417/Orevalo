export const FREE_CV_CREATION_LIMIT = 2

export type CvQuota = {
  creations: number
  remaining: number
}

/**
 * A first edit is included with each CV. Any later edit consumes one of the
 * monthly creation slots, so a CV edited twice has used two slots.
 */
export function getCvQuota(creations: number): CvQuota {
  const used = Math.max(0, Math.floor(creations))
  return {
    creations: used,
    remaining: Math.max(0, FREE_CV_CREATION_LIMIT - used),
  }
}

export function canCreateCv(creations: number) {
  return getCvQuota(creations).remaining > 0
}

export function canEditCv(creations: number, editCount: number) {
  if (editCount < 1) return true
  return canCreateCv(creations)
}

export function quotaMessage() {
  return 'You have used your 2 free CV creations this month. Upgrade to Plus or Premium, or wait until next month when your limit resets.'
}