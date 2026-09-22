# Opportunity Aggregation Engine: What We Do Next

**Status date:** September 21, 2026  
**Scope:** Phase 1 scale-up for internships and scholarships

## Context

Orevalo's long-term goal is to make opportunities for African and Nigerian students discoverable in one trusted place. The current target is still Phase 1: a live internship board and scholarship finder, growing toward 50 internships and 50 scholarships.

The current inventory is approximately **5/50 internships** and **3/50 scholarships**. Aggregation is not a new product phase. It is the way Phase 1 reaches useful scale without manually typing every record.

This work extends the existing system:

- Supabase remains the source of truth.
- New records use the existing listings and scholarships tables.
- CSV import and manual admin entry remain available.
- Admin review happens before anything becomes public.
- Resend, Vercel, DNS, and domain work remain separate infrastructure concerns.

## Verified Current State

| Area | Status | Evidence / meaning |
| --- | --- | --- |
| Manual CSV import | Done | `src/app/admin/(dashboard)/import/page.tsx` and `src/app/admin/import-actions.ts` accept CSV files and insert `published: false`. |
| Manual admin entry | Done | Existing listing and scholarship forms continue to work. |
| Pending storage | Partial | `published: false` acts as hidden/pending today, but there is no explicit status, rejection reason, or review history. |
| Pending filter | Partial | The admin listings page has an `All` and `Hidden` filter, but no `Pending` label or scraper-specific review view. |
| Approve action | Partial | `setPublished` can publish a record, but the review workflow is not presented as Approve/Reject and has no rejection reason. |
| Automatic source ingestion | Missing | No scraper, source registry, scheduled ingestion route, or external fetch pipeline exists. |
| Link and content verification | Missing | Import validates URL shape only. There is no automated HTTP check, scam-keyword scan, or near-duplicate check. |
| Source attribution | Partial | `source_name` and `source_url` columns exist and are shown on detail pages, but automated source records do not exist. |
| Admin pending notification | Missing | The current alert cron emails students about published opportunities and deadlines; it does not notify the team about pending records. |
| Student opportunity alerts | Done | `src/app/api/cron/alerts/route.ts` handles new published opportunities and 7-day/1-day reminders. |
| Detail view tracking | Connected | `OpportunityActions.tsx` posts `view` events to `/api/opportunity-events`. |
| Apply click tracking | Connected | `OpportunityActions.tsx` posts `apply_click` events to `/api/opportunity-events`. |
| Report tracking | Connected | Public report forms post to `/api/opportunity-reports`. |
| Admin analytics display | Partial | The Analytics page counts the latest 500 events and 100 reports only. It does not show subscribers or all-time totals. |
| Google Analytics in admin | Not connected | GA traffic is separate from the Supabase event counts used by the admin Analytics page. |
| Deadline archiving | Partial | The student alert cron archives expired records when it runs, but this is coupled to the student-alert job rather than a clearly owned maintenance job. |

## Non-negotiable verification policy

Nothing from an external source goes directly to the public board. Every scraped or imported record starts as **Pending** and must pass human review before it becomes Published.

A record must be held or rejected when:

1. The apply link is not on a credible company, institution, funder, or established job-board domain.
2. The link is a generic Google Form, WhatsApp link, Gmail address, or similar destination without clear institutional branding.
3. The opportunity asks applicants to pay for registration, processing, training, uniforms, or access.
4. The opportunity requests BVN, bank details, identity numbers, or other sensitive information before a legitimate application or interview stage.
5. The apply URL does not resolve to a working page or redirects to an unrelated destination.
6. The record is an exact or near duplicate of an existing opportunity.
7. Required fields are missing, malformed, or not supported by the source page.

The automated checks are triage signals, not permission to publish. A human reviewer remains the final decision-maker.

## Recommended implementation order

### 1. Make the review model explicit

Keep the current `published` behavior compatible, but add the fields needed for a real queue:

- `status`: `pending`, `published`, `rejected`, or `archived`
- `rejection_reason`, nullable
- `source_type`: `manual`, `csv`, or `scraper`
- `source_name` and `source_url`
- `last_checked_at`, nullable
- `apply_url_status`: `unchecked`, `working`, `broken`, or `redirected`
- `verification_flags`: JSON or a normalized verification table
- `reviewed_at` and `reviewed_by`, nullable

Before changing the schema, decide whether to migrate from `published` to `status` in one step or temporarily derive `status` from the current fields. The migration must preserve all existing records and keep CSV/manual entry working.

### 2. Build the Pending queue before the scraper

Add a clearly labeled Pending view to both admin opportunity tabs. Each row should show:

- Title, organization, deadline, and source
- Apply-link check result
- Scam or sensitive-data flags
- Duplicate warning
- Last checked timestamp
- Approve and Reject actions

Reject should accept an optional reason. Approval should change the record to Published and revalidate the public board. Rejection should keep the record out of public queries and remain visible in a review history or rejected filter.

### 3. Add a source registry and technical audit

Start with one source, not the whole list. Record for each source:

- URL and source owner
- Static HTML, RSS, API, PDF, or JavaScript-rendered
- Allowed request rate and robots/terms review
- Fields available: company, title, location, field, deadline, apply URL
- Stable selectors or extraction method
- Expected run frequency
- Contact or fallback method if the page changes

Initial source candidates:

- MyJobMag
- Jobberman
- Ngcareers
- UNILAG, University of Ibadan, and Covenant University career/notices pages
- Mastercard Foundation Scholars
- Tony Elumelu Foundation
- Opportunity Desk
- Scholars4Dev
- Dangote Group, MTN Nigeria, Flutterwave, PwC Nigeria, Access Bank, GTBank, and Zenith career pages

The first source should be selected after a quick audit for stable, permitted, structured content. Prefer a source with static HTML or a documented feed. Use a browser automation tool only when necessary for a JavaScript-rendered page.

### 4. Build one end-to-end ingestion job

The first scraper should:

1. Fetch one source politely with a timeout, user agent, and rate limit.
2. Extract the required fields.
3. Normalize dates, locations, URLs, and text.
4. Run URL, content, and duplicate checks.
5. Insert only new records as Pending.
6. Never update a published record silently.
7. Write a run log with source, started/finished time, new count, duplicate count, rejected count, and errors.
8. Notify the admin team when new Pending records are inserted or when a source run fails.

Use the existing slug/deduplication behavior as one layer, then add normalized URL and near-duplicate checks. Store the original source URL so every record can be audited.

### 5. Add admin notifications

Send a concise email to `team@orevalo.com` when a scraper creates one or more Pending records. The message should include:

- Source name
- Number of new records
- Link to the relevant Pending admin view
- Deadlines of the earliest records
- Any broken-link or high-risk flags

Also notify the team when a scheduled source run fails repeatedly. Do not send student-facing alerts for Pending records. Student alerts should continue to use only Published records.

### 6. Add re-check and expiry maintenance

Run source refreshes on a weekly cadence at first. Add a separate maintenance job, or clearly separate steps in the existing cron, to:

- Re-check links for Pending and Published records
- Flag records nearing their deadline for review
- Archive records after the deadline
- Record check results and timestamps
- Notify admins when a live link breaks or a source format changes

A failed source check must not automatically delete or publish data.

### 7. Repair the admin analytics picture

The public event path is connected, but the admin numbers need clearer definitions and complete aggregation.

Add these metrics to the admin Analytics page:

- Detail views, with a selected date range
- Apply clicks, with a selected date range
- Click-through rate: apply clicks divided by detail views
- Reports, with a selected date range
- Confirmed active subscribers
- New subscribers in the selected date range
- Optional per-opportunity breakdown for views and clicks

Do not use the latest-500/latest-100 query limits as the metric definition. Use database count queries or a server-side aggregate query with a date range. Add indexes if needed.

The current event callers should also send a stable session identifier if deduplication is desired. Decide whether repeat views should count as separate events or unique sessions, then document that definition. Google Analytics can remain a separate marketing/traffic tool; it should not be silently mixed with Supabase product analytics.

## Source audit worksheet

Complete this before implementing each source:

| Source | URL | Format | Static or JS | Required fields available | Rate/terms checked | Extraction plan | Owner |
| --- | --- | --- | --- | --- | --- | --- | --- |
| MyJobMag | TODO | TODO | TODO | TODO | TODO | TODO | TODO |
| Jobberman | TODO | TODO | TODO | TODO | TODO | TODO | TODO |
| Ngcareers | TODO | TODO | TODO | TODO | TODO | TODO | TODO |
| First selected source | TODO | TODO | TODO | TODO | TODO | TODO | TODO |

## Definition of ready for the first scraper

The first source is ready for production when:

- Its request and extraction method are permitted and documented.
- A scheduled run can complete without hammering the source.
- Malformed rows are rejected and logged.
- Broken links are held before entering Pending, or clearly flagged for review.
- Exact and near duplicates are handled.
- Every inserted record has source attribution.
- No inserted record is Published.
- The admin can filter, inspect, approve, and reject records.
- The team receives an email when new Pending records arrive.
- A failing source run is visible in logs and does not silently appear successful.
- Existing CSV import and manual entry still work.

## Definition of ready for partnerships

Partnership outreach should wait until the board can show reliable usage, including:

- Non-zero detail views and apply clicks from the Supabase event pipeline.
- A defined date range and trustworthy counts in Admin Analytics.
- Enough published opportunities to demonstrate a useful destination for students.
- Evidence that the review process protects students from broken links and scam listings.

## Immediate next actions

1. Choose the first source after the technical audit; do not build all source adapters at once.
2. Add an explicit Pending/review data model while preserving current CSV and manual workflows.
3. Build the Pending admin filter and Approve/Reject actions.
4. Add automated link and scam-keyword checks with visible flags.
5. Add the admin email notification for new Pending records.
6. Build and test one source end to end.
7. Replace the analytics page's limited event queries with date-ranged aggregate counts and add subscriber metrics.
8. Add scheduled re-check and expiry maintenance after the first source is stable.
