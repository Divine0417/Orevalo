# Orevalo — Product Roadmap & Build Plan

> Internal Document - CEO Reference

## 1. Company Overview

Orevalo is an AI-powered education and career platform built for African university students and recent graduates. We exist to close the gap between brilliant African students and the opportunities they deserve - scholarships, internships, career guidance, and academic support, all in one place.

The platform is currently in early validation with a live landing page at orevalo.com, an active waitlist, and 12+ validated research respondents who confirmed our top two priority features: internship and job discovery, and scholarship finding.

| Detail | Information |
| --- | --- |
| Company Name | Orevalo |
| Domain | orevalo.com |
| Stage | Pre-launch - Early Validation |
| CEO | Ozonah Mmasichukwu Favour |
| Primary Market | Nigerian university students and recent graduates |
| Expansion Target | Pan-African - Ghana, Kenya, South Africa and beyond |
| Tech Stack | Next.js, Supabase, Node.js, Tailwind CSS |
| Current Hosting | GitHub Pages (orevalo.com) |
| Email | hello@orevalo.com |

## 2. Validated Research Findings

Before any technical build, direct research was conducted with 12+ Nigerian students and recent graduates. These findings directly determine what we build first and in what order.

| Finding | Data |
| --- | --- |
| Total respondents | 12 Nigerian students and graduates |
| Top pain point #1 | Finding internships and jobs - mentioned by majority of respondents |
| Top pain point #2 | Finding scholarships - mentioned by most respondents |
| Most wanted feature | Internship and Job Board |
| Second most wanted | Scholarship Finder |
| Willingness to pay | 83% willing to pay something |
| Target price point | NGN 1,000 to 3,000 per month |
| Current tools used | Google, WhatsApp groups, LinkedIn - no dedicated platform |
| AI usage | 67% already use AI tools |

**Key insight: No respondent mentioned a dedicated African scholarship or internship platform as a tool they currently use. The market gap is confirmed.**

## 3. Core Features - Build Order

Six features have been defined for Orevalo. They are built in the order validated by user research - most urgent pain point first.

| Priority | Feature | Phase | Status |
| --- | --- | --- | --- |
| 1 | Internship and Job Board | Phase 1 | Build first |
| 2 | Scholarship Finder | Phase 1 | Build first |
| 3 | CV Builder | Phase 2 | Build second |
| 4 | Cover Letter Generator | Phase 2 | Build second |
| 5 | Opportunity Alerts | Phase 3 | Build third |
| 6 | AI Chat Tutor | Phase 3 | Requires funding for AI API costs |

### PHASE 0 - Manual Curation

*ACTIVE NOW | June 2026 - August 2026*

Phase 0 is the pre-build validation phase. No code is written for the platform yet. Instead, we manually curate real opportunities and deliver them to our research respondents to confirm they will actually engage with the product before we build it.

**What we are doing:**

- Curated a list of 20 real internships and scholarships for Nigerian students
- Emailed all 12+ research respondents with the curated list
- Tracking engagement - replies, clicks, feedback
- Running the Founding Student Leaders Program to build community
- Growing the waitlist organically through social media content

**Phase 0 success criteria:**

- 5 or more of the 12+ respondents engage with the curated list
- At least 3 pieces of feedback collected on what was useful or missing
- Phase 0 validated - green light given to CTO to begin Phase 1 build

### PHASE 1 - Core Platform - Internship Board and Scholarship Finder

*NEXT - STARTING NOW | August 2026 - September 2026*

Phase 1 is the first technical build phase. The CTO builds the two most validated features - the Internship Board and the Scholarship Finder - as the foundation of the Orevalo platform.

**Internship and Job Board:**

- A curated, filterable database of internships and graduate jobs for African students
- Listings manually added by the Orevalo team initially, later submitted by employers
- Filter by field of study, location, and deadline
- Each listing shows company, role, location, deadline, and apply link
- Responsive - works on mobile and desktop
- Built on Supabase database with Next.js frontend

**Scholarship Finder:**

- A curated database of scholarships open to African students
- Filter by country, field of study, and degree level
- Each listing shows scholarship name, funder, deadline, eligibility, and apply link
- Updated regularly by the Orevalo team

**Phase 1 technical requirements:**

- Supabase database for storing listings
- Admin panel for adding and editing listings without touching code
- Public-facing pages at orevalo.com/internships and orevalo.com/scholarships
- Search and filter functionality
- Mobile responsive design matching Orevalo brand colours
- Fast load times - optimised for users with limited data

**Phase 1 success criteria:**

- Both pages live on orevalo.com
- At least 50 real listings in each database at launch
- At least 100 users visit and engage with the listings within the first two weeks
- Zero critical bugs reported in the first week

### PHASE 2 - Career Tools - CV Builder and Cover Letter Generator

*PHASE 1 COMPLETE FIRST | October 2026 - November 2026*

Phase 2 adds the career document tools validated as the third and fourth priority by user research. These features turn Orevalo from an opportunity discovery platform into a full career preparation platform.

**CV Builder:**

- Professional CV templates designed for African graduates applying locally and internationally
- ATS-friendly formatting - optimised to pass automated screening systems
- Simple form-based builder - students fill in details and download a PDF
- Multiple templates to choose from
- Export as PDF

**Cover Letter Generator:**

- Students input the job title, company, and their background
- AI generates a tailored cover letter in seconds
- Editable before downloading
- Export as PDF or copy to clipboard

**Phase 2 success criteria:**

- CV Builder and Cover Letter Generator live on orevalo.com
- At least 200 CVs generated in the first month
- User satisfaction score above 4 out of 5 from feedback

### PHASE 3 - Intelligence Layer - Alerts and AI Tutor

*REQUIRES FUNDING | December 2026 onwards*

Phase 3 adds the AI and personalisation layer that makes Orevalo intelligent rather than just a directory. This phase requires external funding to cover AI API costs.

**Opportunity Alerts:**

- Students create a profile with their course, interests, and location
- Orevalo sends personalised email or WhatsApp alerts when new matching opportunities are added
- Deadline reminders sent 7 days and 1 day before close
- Students never miss an opportunity again

**AI Chat Tutor:**

- Students ask any academic question in plain language
- AI provides clear, honest explanations in a conversational format
- Available 24 hours a day, 7 days a week
- Covers all subjects and degree levels
- Powered by a large language model API - requires ongoing API cost budget

**Phase 3 funding requirement:**

AI API costs make Phase 3 dependent on external funding. The target is to raise $10,000 USD or generate equivalent revenue from the premium tier before building Phase 3 features.

## 5. Business Model

| Tier | Price | Features |
| --- | --- | --- |
| Free | NGN 0 forever | Internship Board, Scholarship Finder, Basic CV Builder, limited AI Tutor |
| Premium | NGN 2,000/month | Everything in Free plus unlimited AI Tutor, priority alerts, advanced CV and cover letter tools, exclusive opportunities |

Revenue projection at 1,000 paying users: NGN 2,000,000 per month. 83% of research respondents indicated willingness to pay.

## 6. Technical Stack

| Layer | Technology | Reason |
| --- | --- | --- |
| Frontend | Next.js + Tailwind CSS | Fast, SEO-friendly, mobile-first |
| Database | Supabase | Free tier, built-in auth, real-time, PostgreSQL |
| Backend | Node.js + Supabase Functions | Lightweight, scalable |
| Hosting | Vercel (frontend) + Supabase (backend) | Free tiers sufficient for early stage |
| Email | Zoho Mail | Professional domain email, already configured |
| Forms | Formspree | Waitlist and research form, already live |
| Analytics | Google Analytics | Already installed on orevalo.com |
| AI API | Gemini or Groq | Phase 3 only - pending funding |
| Payments | Paystack | Nigerian payment integration for premium tier |

## 7. Current Traction

| Metric | Status |
| --- | --- |
| Landing page | Live at orevalo.com |
| Waitlist signups | Active and growing |
| Research respondents | 12+ Nigerian students surveyed |
| Social media | @OrevaloAI on X, Instagram, LinkedIn, Facebook |
| Professional email | hello@orevalo.com via Zoho Mail |
| Institutional partner | Edoofa partnership in progress |
| Student Leaders Program | Live at orevalo.com/student-leaders.html |
| Phase 0 | Curated list of 20 opportunities sent to 12+ respondents |

## 8. Immediate Next Steps

- **Sign Founders and Shareholders Agreement - CEO and CTO**
- **CTO completes test task - Internship Listings Page**
- CTO given GitHub access after agreement signing
- Phase 1 build begins - Internship Board and Scholarship Finder
- Phase 0 engagement tracked and reported
- Grant and accelerator applications submitted
- CAC registration targeted within 6 months of agreement signing

---

*Orevalo | orevalo.com | hello@orevalo.com*
