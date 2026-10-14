import { describe, expect, it } from 'vitest'
import { formatRequirementInput, parseRequirementInput, scholarshipRequirements } from './opportunity-requirements'

describe('opportunity requirements', () => {
  it('round-trips labeled requirements from the admin text format', () => {
    const requirements = parseRequirementInput('Degree level: Bachelor\nExperience: Two years\nOpen to applicants')

    expect(requirements).toEqual([
      { label: 'Degree level', detail: 'Bachelor' },
      { label: 'Experience', detail: 'Two years' },
      { label: 'Requirement', detail: 'Open to applicants' },
    ])
    expect(formatRequirementInput(requirements)).toBe('Degree level: Bachelor\nExperience: Two years\nRequirement: Open to applicants')
  })

  it('composes existing scholarship fields into a requirements list', () => {
    expect(scholarshipRequirements({
      degree_level: 'Masters',
      field: 'Any',
      country: 'Pan-African',
      eligibility: 'Open to African nationals.',
    })).toEqual([
      { label: 'Degree level', detail: 'Masters' },
      { label: 'Field of study', detail: 'Any' },
      { label: 'Study location', detail: 'Pan-African' },
      { label: 'Eligibility', detail: 'Open to African nationals.' },
    ])
  })
})