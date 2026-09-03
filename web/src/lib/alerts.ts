export type AlertOpportunity = {
  field: string
  location: string
}

export type AlertRecipient = {
  fields: string[]
  locations: string[]
}

export function matchesAlert(opportunity: AlertOpportunity, recipient: AlertRecipient) {
  const fieldMatches = recipient.fields.length === 0 || recipient.fields.includes(opportunity.field)
  const locationMatches = recipient.locations.length === 0 || recipient.locations.includes(opportunity.location)
  return fieldMatches && locationMatches
}
