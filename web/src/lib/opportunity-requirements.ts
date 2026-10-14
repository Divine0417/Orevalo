export type OpportunityRequirement = {
  label: string
  detail: string
}

export function normalizeRequirements(value: unknown): OpportunityRequirement[] {
  if (!Array.isArray(value)) return []
  return value.flatMap((entry) => {
    if (!entry || typeof entry !== 'object') return []
    const label = String((entry as { label?: unknown }).label ?? '').trim()
    const detail = String((entry as { detail?: unknown }).detail ?? '').trim()
    return label && detail ? [{ label, detail }] : []
  })
}

export function parseRequirementInput(value: unknown): OpportunityRequirement[] {
  return String(value ?? '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 30)
    .map((line) => {
      const separator = line.indexOf(':')
      return separator > 0
        ? { label: line.slice(0, separator).trim(), detail: line.slice(separator + 1).trim() }
        : { label: 'Requirement', detail: line }
    })
    .filter((requirement) => requirement.label && requirement.detail)
}

export function formatRequirementInput(value: unknown): string {
  return normalizeRequirements(value).map(({ label, detail }) => `${label}: ${detail}`).join('\n')
}

export function scholarshipRequirements(scholarship: {
  requirements?: unknown
  degree_level: string
  field: string
  country: string
  eligibility?: string | null
}): OpportunityRequirement[] {
  const saved = normalizeRequirements(scholarship.requirements)
  if (saved.length) return saved

  return [
    scholarship.degree_level && { label: 'Degree level', detail: scholarship.degree_level },
    scholarship.field && { label: 'Field of study', detail: scholarship.field },
    scholarship.country && { label: 'Study location', detail: scholarship.country },
    scholarship.eligibility && { label: 'Eligibility', detail: scholarship.eligibility },
  ].filter((item): item is OpportunityRequirement => Boolean(item))
}