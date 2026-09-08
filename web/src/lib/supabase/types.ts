/**
 * Database types.
 *
 * Hand-written to match supabase/migrations/0001_listings_and_profiles.sql.
 * Once the schema settles, replace this file with generated output:
 *
 *   npx supabase gen types typescript --project-id <ref> > src/lib/supabase/types.ts
 *
 * Keeping it hand-written for now avoids a CLI login being required just to
 * type-check the project.
 */

export type UserRole = 'student' | 'admin'

export type ListingRow = {
  id: string
  slug: string
  company: string
  title: string
  location: string
  field: string
  /** ISO date, YYYY-MM-DD. */
  deadline: string
  apply_url: string
  description: string | null
  source_name: string | null
  source_url: string | null
  verified_at: string | null
  featured: boolean
  archived_at: string | null
  published: boolean
  created_at: string
  updated_at: string
}

export type ListingInsert = Omit<ListingRow, 'id' | 'created_at' | 'updated_at' | 'description' | 'source_name' | 'source_url' | 'verified_at' | 'featured' | 'archived_at'> & {
  id?: string
  published?: boolean
  description?: string | null
  source_name?: string | null
  source_url?: string | null
  verified_at?: string | null
  featured?: boolean
  archived_at?: string | null
}

export type ProfileRow = {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  created_at: string
  /** Added in migration 0005 — optional, and only used for Phase 3 matching. */
  university: string | null
  course: string | null
  year_of_study: string | null
  country: string | null
}

export type ScholarshipRow = {
  id: string
  slug: string
  name: string
  funder: string
  country: string
  field: string
  degree_level: string
  /** Nullable: many scholarships are rolling or vary by partner university. */
  deadline: string | null
  eligibility: string | null
  apply_url: string
  description: string | null
  source_name: string | null
  source_url: string | null
  verified_at: string | null
  featured: boolean
  archived_at: string | null
  published: boolean
  created_at: string
  updated_at: string
}

export type ScholarshipInsert = Omit<ScholarshipRow, 'id' | 'created_at' | 'updated_at' | 'description' | 'source_name' | 'source_url' | 'verified_at' | 'featured' | 'archived_at'> & {
  id?: string
  published?: boolean
  description?: string | null
  source_name?: string | null
  source_url?: string | null
  verified_at?: string | null
  featured?: boolean
  archived_at?: string | null
}

export type SubscriberRow = {
  id: string
  email: string
  source: string
  confirmed: boolean
  unsubscribed: boolean
  created_at: string
  /** Added in migration 0003 — authorises one-click unsubscribe. */
  unsubscribe_token: string
  /** Added in migration 0003 — proves the student owns the address. */
  confirm_token: string
  confirmed_at: string | null
  source_ip: string | null
}

export type SubscriberInsert = {
  id?: string
  email: string
  source?: string
  confirmed?: boolean
  unsubscribed?: boolean
  created_at?: string
  source_ip?: string | null
}

export type LeaderApplicationRow = {
  id: string
  full_name: string
  email: string
  country: string
  university: string
  course: string
  year: string
  connection: string
  challenge: string
  why: string
  referral: string | null
  status: 'new' | 'reviewing' | 'accepted' | 'rejected'
  notes: string | null
  created_at: string
}

export type LeaderApplicationInsert = Omit<LeaderApplicationRow, 'id' | 'created_at' | 'status' | 'notes'> & {
  id?: string
  status?: LeaderApplicationRow['status']
  notes?: string | null
  created_at?: string
}

export type ResearchResponseRow = {
  id: string
  first_name: string
  email: string
  country: string
  status: string | null
  field_of_study: string | null
  answers: Record<string, unknown>
  created_at: string
}

export type ResearchResponseInsert = Omit<ResearchResponseRow, 'id' | 'created_at'> & {
  id?: string
  created_at?: string
}

export type SavedOpportunityRow = {
  id: string
  user_id: string
  kind: 'listing' | 'scholarship'
  slug: string
  status: ApplicationStatus
  notes: string | null
  created_at: string
}

export type ApplicationStatus =
  | 'interested'
  | 'preparing'
  | 'applied'
  | 'interviewing'
  | 'accepted'
  | 'rejected'

export const APPLICATION_STATUSES: ApplicationStatus[] = [
  'interested',
  'preparing',
  'applied',
  'interviewing',
  'accepted',
  'rejected',
]

export function isApplicationStatus(value: string): value is ApplicationStatus {
  return APPLICATION_STATUSES.includes(value as ApplicationStatus)
}

export type SavedOpportunityInsert = {
  id?: string
  user_id: string
  kind: 'listing' | 'scholarship'
  slug: string
  status?: ApplicationStatus
  notes?: string | null
  created_at?: string
}

export type AlertPreferencesRow = {
  user_id: string
  fields: string[]
  locations: string[]
  degree_levels: string[]
  frequency: 'off' | 'daily' | 'weekly'
  deadline_reminders: boolean
  created_at: string
  updated_at: string
}

export type AlertPreferencesInsert = Omit<AlertPreferencesRow, 'created_at' | 'updated_at'> & {
  created_at?: string
  updated_at?: string
}

export type AlertDeliveryRow = {
  id: string
  recipient_key: string
  user_id: string | null
  subscriber_id: string | null
  kind: 'listing' | 'scholarship'
  slug: string
  reason: 'new' | 'deadline_7' | 'deadline_1'
  sent_at: string
}

export type AlertDeliveryInsert = Omit<AlertDeliveryRow, 'id' | 'sent_at' | 'recipient_key'> & {
  id?: string
  sent_at?: string
}

export type OpportunityReportRow = {
  id: string
  kind: 'listing' | 'scholarship'
  opportunity_id: string
  reason: string
  reporter_email: string | null
  created_at: string
}

export type OpportunityEventRow = {
  id: string
  kind: 'listing' | 'scholarship'
  opportunity_id: string
  event: 'view' | 'apply_click'
  session_key: string | null
  created_at: string
}

export type Database = {
  public: {
    Tables: {
      listings: {
        Row: ListingRow
        Insert: ListingInsert
        Update: Partial<ListingInsert>
        Relationships: []
      }
      profiles: {
        Row: ProfileRow
        Insert: Omit<ProfileRow, 'created_at'> & { created_at?: string }
        Update: Partial<Omit<ProfileRow, 'id'>>
        Relationships: []
      }
      scholarships: {
        Row: ScholarshipRow
        Insert: ScholarshipInsert
        Update: Partial<ScholarshipInsert>
        Relationships: []
      }
      subscribers: {
        Row: SubscriberRow
        Insert: SubscriberInsert
        Update: Partial<SubscriberInsert>
        Relationships: []
      }
      leader_applications: {
        Row: LeaderApplicationRow
        Insert: LeaderApplicationInsert
        Update: Partial<LeaderApplicationInsert>
        Relationships: []
      }
      research_responses: {
        Row: ResearchResponseRow
        Insert: ResearchResponseInsert
        Update: Partial<ResearchResponseInsert>
        Relationships: []
      }
      saved_opportunities: {
        Row: SavedOpportunityRow
        Insert: SavedOpportunityInsert
        Update: Partial<SavedOpportunityInsert>
        Relationships: []
      }
      alert_preferences: {
        Row: AlertPreferencesRow
        Insert: AlertPreferencesInsert
        Update: Partial<AlertPreferencesInsert>
        Relationships: []
      }
      alert_deliveries: {
        Row: AlertDeliveryRow
        Insert: AlertDeliveryInsert
        Update: Partial<AlertDeliveryInsert>
        Relationships: []
      }
      opportunity_reports: {
        Row: OpportunityReportRow
        Insert: Omit<OpportunityReportRow, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Omit<OpportunityReportRow, 'id'>>
        Relationships: []
      }
      opportunity_events: {
        Row: OpportunityEventRow
        Insert: Omit<OpportunityEventRow, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Omit<OpportunityEventRow, 'id'>>
        Relationships: []
      }
    }
    Views: Record<never, never>
    Functions: {
      is_admin: {
        Args: Record<never, never>
        Returns: boolean
      }
      /** Token-authorised writes callable while signed out. */
      unsubscribe_with_token: {
        Args: { token: string }
        Returns: boolean
      }
      confirm_with_token: {
        Args: { token: string }
        Returns: boolean
      }
    }
    Enums: {
      user_role: UserRole
    }
    CompositeTypes: Record<never, never>
  }
}
