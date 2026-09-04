# Orevalo

Africa's AI education and career platform — AI tutoring, scholarship discovery, an internship
board, CV building and opportunity alerts, built for African university students.

Live at **[orevalo.com](https://orevalo.com)** · **<hello@orevalo.com>**

> **Status:** early platform release. The Next.js application is ready for Vercel deployment and
> includes authentication, Supabase-backed listings and scholarships, saved opportunities, an admin
> area, and opportunity alerts. The original static site and Vite prototype are also retained in
> this repository. See [`orevalo-roadmap.md`](orevalo-roadmap.md) for the product plan.

---

## What's in this repository

The repo holds two things side by side, on purpose:

| Area | What it is | Status |
| --- | --- | --- |
| **[`web/`](web/)** | Next.js application with Supabase auth, listings, scholarships, forms, admin tools and alerts | **Primary app** — deploy to Vercel |
| **Repo root** (`index.html`, `student-leaders.html`, …) | The original static marketing site and forms | Legacy static site — deployable with GitHub Pages |
| **[`app/`](app/)** | Vite + React prototype of the marketing site and internship page | Prototype — not the Vercel app |

The deployable application is `web/`. The root static pages and `app/` are kept for reference and
should not be confused with the Next.js application.

Planning lives in **[`orevalo-roadmap.md`](orevalo-roadmap.md)** — phases, validated research,
business model, stack of record and next steps. It is a conversion of `orevalo-roadmap.docx`
(the CEO's original), kept in the repo so the plan is diffable and readable in a pull request.
**The `.docx` remains the authority**; regenerate the Markdown rather than editing it by hand
when the plan changes.

---

## The Next.js app (`web/`)

This is the current application. It uses Next.js 16, React 19, Supabase, and Vercel Cron. Forms
and account workflows are implemented in the app; the database schema and row-level security
migrations are in [`web/supabase/migrations/`](web/supabase/migrations/).

### Run locally

```bash
cd web
npm install
npm run dev       # http://localhost:3000
```

Validate a production build locally with:

```bash
cd web
npm run build
npm start         # requires the build above
```

### Vercel deployment

Create a Vercel project connected to this repository with these settings:

| Setting | Value |
| --- | --- |
| Root Directory | `web` |
| Framework Preset | Next.js |
| Install Command | `npm install` |
| Build Command | `npm run build` |
| Output Directory | Leave blank (Next.js default) |

Add the following environment variables in Vercel for the required environments:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY)
SUPABASE_SERVICE_ROLE_KEY
CRON_SECRET
NEXT_PUBLIC_SITE_URL
```

Optional email delivery variables are:

```text
RESEND_API_KEY
EMAIL_FROM
```

Set `NEXT_PUBLIC_SITE_URL` to the deployed URL, such as
`https://your-project.vercel.app`, and update it when a custom domain is connected. Never commit
`.env.local` or any service-role, email, or cron secret. Use [`web/.env.local.example`](web/.env.local.example)
as the local configuration template. The Vercel Cron job in [`web/vercel.json`](web/vercel.json)
runs `/api/cron/alerts` daily at 08:00 UTC.

After deployment, add the Vercel and custom-domain URLs to Supabase Authentication URL
Configuration, including the callback URLs used by login, signup, and password reset.

### Password reset email

Supabase Auth sends password-reset emails directly. Copy
[`web/email-templates/password-recovery.html`](web/email-templates/password-recovery.html) into
Supabase **Authentication → Email Templates → Reset Password**. Keep `{{ .ConfirmationURL }}`
unchanged so Supabase inserts the secure link to `/reset-password`.

If Supabase custom SMTP is unavailable, use the Resend-based Send Email Hook guide:
[`web/docs/supabase-send-email-hook.md`](web/docs/supabase-send-email-hook.md). It covers the
Edge Function, secrets, Auth Hook configuration, testing, and troubleshooting.

### Admin account

Promote `hello@orevalo.com` after creating and confirming the account by following
[`web/docs/admin-account.md`](web/docs/admin-account.md). Admin access is role-based through
Supabase and is not hard-coded into the application.

### Tests and checks

```bash
cd web
npm run lint
npm test
npm run test:rls
```

## The static site

Four self-contained pages. Each one carries its own inline `<style>` block and vanilla JS — no
build step, no dependencies. Deployed straight from `main` by GitHub Pages, with `CNAME` pointing
at the custom domain and `.nojekyll` telling Pages not to run Jekyll over the files.

| File | Page |
| --- | --- |
| [`index.html`](index.html) | Landing page — hero, features, roadmap, FAQ, waitlist |
| [`student-leaders.html`](student-leaders.html) | Founding Student Leaders Program + application form |
| [`orevalo-research-form.html`](orevalo-research-form.html) | Student research survey (4 sections) |
| [`thank-you.html`](thank-you.html) | Post-signup confirmation |

Form submissions go to **Formspree** (`formspree.io/f/xpqgljzy`). Analytics is **Google Analytics**
(`G-5VFKQ578P5`), with a `waitlist_signup` conversion event fired on successful signup.

To work on these, open the file in a browser — that's the whole loop.

---

## The Vite prototype (`app/`)

A Vite + React 19 single-page prototype that ports all four static pages and adds the internship
listings page. It is separate from the production Next.js app in `web/`.

### Running it

```bash
cd app
npm install
npm run dev      # http://localhost:5173
```

```bash
npm run build    # production bundle into app/dist
npm run preview  # serve that bundle locally
```

### Routes

| Route | Page | Ported from |
| --- | --- | --- |
| `/` | Landing page | `index.html` |
| `/internships` | Internship listings | *new* |
| `/student-leaders` | Student Leaders Program | `student-leaders.html` |
| `/research` | Research survey | `orevalo-research-form.html` |
| `/thank-you` | Signup confirmation | `thank-you.html` |

### Layout

```text
app/
├── index.html              # Vite entry — fonts, favicons, GA tag
├── public/                 # favicons, copied from the repo root
└── src/
    ├── main.jsx            # React root + BrowserRouter
    ├── App.jsx             # routes and per-route <title>
    ├── components/icons/
    │   └── Icons.jsx       # every icon on the site, as inline SVG
    ├── data/
    │   ├── home.js         # landing page copy: features, FAQ, roadmap…
    │   └── listings.js     # internship listings + date helpers
    ├── pages/              # one .jsx + one .css per page
    └── styles/global.css   # reset only
```

**Two conventions worth knowing before editing:**

1. **Page styles are scoped.** Every rule in a page's CSS is prefixed with that page's class
   (`.page-home`, `.page-internships`, `.page-leaders`, …). The original pages use genuinely
   different palettes and typefaces — the landing page is Fraunces on `#FDF6ED` sand, the Student
   Leaders page is Georgia on `#FAF3EC` cream — and scoping is what stops them bleeding into each
   other now that they share one document. **Keep the prefix when you add a rule.**

2. **Copy lives in `src/data/`, not in JSX.** Edit the wording of a feature card or an FAQ answer
   in `data/home.js`; the components just map over it.

### Icons: no emoji

The static pages use emoji for feature icons, deadline markers, social buttons and timeline states.
The React port replaces **all ~50 of them** with inline SVG in
[`Icons.jsx`](app/src/components/icons/Icons.jsx) — emoji render differently on every platform
(and some, like the weary face, read as unintentionally comic in a serious context). The SVGs
inherit `currentColor` and size to `1em` by default, so they take on the colour and scale of
whatever text they sit beside.

```jsx
import { Briefcase } from '../components/icons/Icons.jsx'

<Briefcase />                          // 1em, inherits colour
<Briefcase size="2rem" />              // explicit size
<Briefcase title="Internships" />      // adds a label for screen readers
```

Icons are decorative by default (`aria-hidden`) — pass `title` only when the icon is the *only*
thing conveying the meaning.

### Internship listings

[`src/data/listings.js`](app/src/data/listings.js) holds the listings and the two field/location
vocabularies the filter dropdowns are built from. The shape is deliberately API-like: `deadline` is
an ISO date string rather than a formatted label, so filtering, sorting and the "closing soon" badge
all work without re-parsing prose.

Both dropdowns filter live, and the page renders an empty state when nothing matches.

**Adding a listing** — append an object to the `listings` array:

```js
{
  id: 'company-role-2026',           // unique, kebab-case
  company: 'Company Name',
  title: 'Role Title',
  location: 'Lagos',                 // one of LOCATIONS
  field: 'Technology',               // one of FIELDS
  deadline: '2026-12-01',            // ISO, not a label
  applyUrl: 'https://…',
}
```

---

## Brand

| Token | Value | Use |
| --- | --- | --- |
| Cream | `#FAF3EC` | Page background (internships, student leaders, research form) |
| Sand | `#FDF6ED` | Page background (landing page) |
| Burnt orange | `#C4622D` / `#C8622A` | Primary — buttons, links, accents |
| Dark brown | `#2C1A0E` / `#1E1612` | Text, dark sections, footers |
| Green | `#2E7D5E` | Status and success states |

Two palettes coexist because the pages were built at different times; the pairs differ by only a
few points of lightness. **New work should use the `#FAF3EC` / `#C4622D` / `#2C1A0E` set.**

**Type:** [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) for body copy,
[Fraunces](https://fonts.google.com/specimen/Fraunces) for the logo and headings. Both from Google
Fonts. The Student Leaders page is the exception — it uses Georgia and Arial, preserved as-is.

**Tagline:** *Study smart. Build your future.*

---

## Roadmap

Summarised from **[`orevalo-roadmap.md`](orevalo-roadmap.md)** — read that for the full plan.
Build order follows the research rather than intuition: 12+ Nigerian students named internship
discovery and scholarship finding as their top two pain points, 83% said they would pay something
(target NGN 1,000–3,000/month), and **no respondent named an existing African opportunities
platform they already use.**

| Phase | Window | Scope |
| --- | --- | --- |
| **0 — Manual curation** | Jun–Aug 2026 | No platform code. Curated opportunities emailed to research respondents to prove engagement; Student Leaders Program; waitlist growth |
| **1 — Core platform** | Aug–Sep 2026 | Internship Board + Scholarship Finder, admin panel, 50+ real listings each at launch |
| **2 — Career tools** | Oct–Nov 2026 | CV Builder (ATS-friendly, PDF export) + Cover Letter Generator |
| **3 — Intelligence layer** | Dec 2026 onwards | Opportunity Alerts + AI Chat Tutor — **gated on funding** (~$10k) for AI API costs |

Feature build order: Internship Board → Scholarship Finder → CV Builder → Cover Letter Generator →
Opportunity Alerts → AI Chat Tutor.

**Business model:** Free tier forever (board, finder, basic CV builder); Premium at NGN 2,000/month
(unlimited AI tutor, priority alerts, advanced tools, exclusive opportunities). Payments via
Paystack.

### Where the internships page fits

The roadmap lists **"CTO completes test task — Internship Listings Page"** as an immediate next
step, and Phase 1 then wants that same page in production at `orevalo.com/internships` alongside
`orevalo.com/scholarships`. The page in [`app/`](app/src/pages/Internships.jsx) already meets the
Phase 1 listing spec — company, role, location, deadline and apply link, filterable by field and
location, responsive — but is missing the parts Phase 1 adds:

- Listings served from Supabase instead of a local module
- An admin panel for adding and editing listings without touching code
- A matching `/scholarships` page (filter by country, field of study, degree level)
- 50+ real listings before launch

### Prototype stack vs. production stack

The roadmap specifies a different stack from the one this React app is built on. Nothing here is
deployed yet, so this is still an open decision:

| Layer | `web/` production app | `app/` prototype |
| --- | --- | --- |
| Frontend | Next.js + React | React 19 + Vite |
| Routing | Next.js file-based routing | React Router |
| Database | Supabase (PostgreSQL) | none — listings are local data |
| Backend | Next.js server actions and route handlers | none |
| Hosting | Vercel | Local development only |
| Payments | Paystack | n/a until Premium ships |
| AI API | Gemini or Groq | n/a — Phase 3, pending funding |

`app/` is a faithful React port of the original site plus the internship listings page. New product
work should target `web/` unless the prototype is being maintained intentionally.

### Backend

The production backend lives inside `web/`: Supabase provides authentication, PostgreSQL data and
row-level security, while Next.js server actions and route handlers handle mutations and scheduled
alerts. Apply the SQL migrations in [`web/supabase/migrations/`](web/supabase/migrations/) to a
Supabase project before using the authenticated or admin features. The original static pages and
the Vite prototype continue to post forms directly to Formspree.

---

## Contributing

This repository is a fork of [`jojofave/Orevalo`](https://github.com/jojofave/Orevalo). Work is done
on a branch and lands upstream through a pull request:

```bash
git fetch upstream
git checkout -b feat/your-change upstream/main
# … make changes …
git push -u origin feat/your-change
```

Then open the PR against `jojofave/Orevalo:main`.

---

© 2026 Orevalo. Built with purpose for African students.
