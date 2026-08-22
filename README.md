# Orevalo

Africa's AI education and career platform — AI tutoring, scholarship discovery, an internship
board, CV building and opportunity alerts, built for African university students.

Live at **[orevalo.com](https://orevalo.com)** · **<hello@orevalo.com>**

> **Status:** pre-launch, early validation. The landing page, research form and Student Leaders
> Program are live and the waitlist is growing. Phase 0 (manual curation — real opportunities
> emailed to research respondents) is running now; Phase 1 builds the Internship Board and
> Scholarship Finder. See [`orevalo-roadmap.md`](orevalo-roadmap.md).

---

## What's in this repository

The repo holds two things side by side, on purpose:

| Area | What it is | Status |
| --- | --- | --- |
| **Repo root** (`index.html`, `student-leaders.html`, …) | The static site currently serving orevalo.com | **Live** — deployed from `main` via GitHub Pages |
| **[`app/`](app/)** | A React port of the whole site, plus the new internship listings page | In development — not yet deployed |

The static pages are deliberately left untouched while the React app is built up. Nothing in
`app/` affects the live site until the deploy is deliberately switched over.

Planning lives in **[`orevalo-roadmap.md`](orevalo-roadmap.md)** — phases, validated research,
business model, stack of record and next steps. It is a conversion of `orevalo-roadmap.docx`
(the CEO's original), kept in the repo so the plan is diffable and readable in a pull request.
**The `.docx` remains the authority**; regenerate the Markdown rather than editing it by hand
when the plan changes.

---

## The static site (live)

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

## The React app (`app/`)

A Vite + React 19 single-page app that ports all four pages and adds the internship listings page.

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

### Planned stack vs. what is in `app/` today

The roadmap specifies a different stack from the one this React app is built on. Nothing here is
deployed yet, so this is still an open decision:

| Layer | Roadmap specifies | `app/` currently uses |
| --- | --- | --- |
| Frontend | Next.js + Tailwind CSS | React 19 + Vite, scoped plain CSS |
| Routing | Next.js file-based | React Router |
| Database | Supabase (PostgreSQL) | none — listings are a local module |
| Backend | Node.js + Supabase Functions | none |
| Hosting | Vercel | GitHub Pages (static site only) |
| Payments | Paystack | n/a until Premium ships |
| AI API | Gemini or Groq | n/a — Phase 3, pending funding |

`app/` is a faithful React port of the existing site plus the internship listings page. Migrating it
to Next.js + Tailwind later is mechanical — the components, icon set and data modules all carry
over; routing and styling are what change.

### Backend

There is no backend yet. Forms post directly to Formspree, and internship listings live in
`src/data/listings.js`. That module is shaped like an API response — ISO dates, stable ids, no
pre-formatted labels — so a Supabase table can slot in behind it: replace the import in
`Internships.jsx` with a query into state, and nothing else in the page has to change.

Phase 1 also calls for an admin panel so listings can be added and edited without touching code.

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
