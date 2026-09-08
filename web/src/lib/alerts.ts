export type AlertOpportunity = {
  field: string
  location: string
  degree_level: string
}

export type AlertRecipient = {
  fields: string[]
  locations: string[]
  degree_levels: string[]
}

export function matchesAlert(opportunity: AlertOpportunity, recipient: AlertRecipient) {
  const fieldMatches =
    recipient.fields.length === 0 || opportunity.field === 'Any' || recipient.fields.includes(opportunity.field)
  const locationMatches =
    recipient.locations.length === 0 ||
    opportunity.location === 'Pan-African' ||
    recipient.locations.includes(opportunity.location)
  const degreeMatches =
    recipient.degree_levels.length === 0 ||
    opportunity.degree_level === 'Any' ||
    recipient.degree_levels.includes(opportunity.degree_level)
  return fieldMatches && locationMatches && degreeMatches
}
