/**
 * Landing page content.
 *
 * Sourced from orevalo-roadmap.md, which is the source of truth. Where the old
 * static landing page disagreed with the roadmap, the roadmap wins — see the
 * notes on `features` and `phases` in particular.
 *
 * Copy edits belong here, not in JSX.
 */

import {
  AlarmClock,
  Bell,
  Books,
  Briefcase,
  Check,
  CircleOutline,
  Document,
  Envelope,
  Frustrated,
  GlobeAfrica,
  GlobeGrid,
  GraduationCap,
  LinkIcon,
  Robot,
  Rocket,
  Search,
  Stopwatch,
} from '@/components/icons'

/**
 * People who gave us their email on orevalo.com.
 *
 * Deliberately NOT called a waitlist any more: the Internship Board is live and
 * usable without an account, so there is nothing to wait for. What these
 * students signed up for is opportunities in their inbox — which is exactly
 * what Phase 0 sends them.
 */
export const SUBSCRIBER_COUNT = 113

/** Research sample from roadmap section 2. */
export const RESEARCH = {
  respondents: '12+',
  willingToPay: '83%',
  alreadyUseAi: '67%',
  pricePoint: 'NGN 1,000–3,000',
}

export const strip = [
  { icon: GraduationCap, label: 'University Students' },
  { icon: GlobeGrid, label: 'Pan-African' },
  { icon: Robot, label: 'AI-Powered' },
  { icon: Briefcase, label: 'Career-Ready Tools' },
  { icon: Search, label: 'Scholarship Finder' },
]

export const universities = [
  'University of Lagos',
  'Obafemi Awolowo University',
  'University of Ibadan',
  'University of Benin',
  'Ahmadu Bello University',
  'Babcock University',
  'Adeleke University',
  'Veritas University',
]

export const painPoints = [
  { icon: Frustrated, text: 'Hours wasted searching scattered websites for scholarships with no clear results.' },
  { icon: Document, text: "CVs and cover letters that don't stand out because there's no guidance." },
  { icon: Books, text: 'No affordable AI tutor to help when studying gets hard.' },
  { icon: LinkIcon, text: "Career advice that's generic, not built for the African context." },
  { icon: Stopwatch, text: "Deadlines missed because opportunity alerts don't exist in one place." },
  { icon: GlobeAfrica, text: 'Brilliant students held back by lack of access, not lack of ability.' },
]

/**
 * The six features in ROADMAP BUILD ORDER (section 3), not the order the old
 * landing page used. Research put internship and scholarship discovery first;
 * the AI tutor is last because it is gated on funding for API costs.
 */
export const features = [
  {
    icon: Briefcase,
    tone: 'bg-clay/12 text-clay',
    title: 'Internship & Job Board',
    navLabel: 'Internships',
    body: 'Curated internships and graduate roles open to African students, filterable by field, location and deadline. Free to use, no account needed.',
    phase: 'Phase 1',
    status: 'live' as const,
    href: '/internships',
  },
  {
    icon: GraduationCap,
    tone: 'bg-moss/12 text-moss',
    title: 'Scholarship Finder',
    navLabel: 'Scholarships',
    body: 'A curated database of scholarships open to African students. Filter by country, field of study and degree level, with eligibility and apply links.',
    phase: 'Phase 1',
    status: 'live' as const,
    href: '/scholarships',
  },
  {
    icon: Document,
    tone: 'bg-[#d9a234]/20 text-[#8a6412]',
    title: 'CV Builder',
    navLabel: 'CV Builder',
    body: 'ATS-friendly templates designed for African graduates applying locally and internationally. Fill in a form, download a PDF.',
    phase: 'Phase 2',
    status: 'planned' as const,
  },
  {
    icon: Envelope,
    tone: 'bg-[#6446a0]/12 text-[#6446a0]',
    title: 'Cover Letter Generator',
    navLabel: 'Cover Letters',
    body: 'Give it the role, the company and your background. It writes a tailored cover letter you can edit before downloading.',
    phase: 'Phase 2',
    status: 'planned' as const,
  },
  {
    icon: Bell,
    tone: 'bg-[#326eb4]/12 text-[#326eb4]',
    title: 'Opportunity Alerts',
    navLabel: 'Alerts',
    body: 'Personalised email or WhatsApp alerts when matching opportunities appear, plus deadline reminders 7 days and 1 day before close.',
    phase: 'Phase 3',
    status: 'planned' as const,
  },
  {
    icon: Robot,
    tone: 'bg-[#be3c50]/12 text-[#be3c50]',
    title: 'AI Chat Tutor',
    navLabel: 'AI Tutor',
    body: 'Ask any academic question in plain language and get a clear, honest explanation. Available 24/7, across every subject and degree level.',
    phase: 'Phase 3',
    status: 'funding' as const,
  },
]

/**
 * How the product actually works today — no account step, because there is no
 * account. Rewrite this when auth and profiles land in a later phase.
 */
export const steps = [
  {
    num: '01',
    title: 'Open the board',
    body: 'No sign-up, no login, no paywall. Every listing is visible from the moment you land on the page.',
  },
  {
    num: '02',
    title: 'Filter to what fits you',
    body: 'Narrow by field and location to the roles you can actually apply for, instead of scrolling past everything else.',
  },
  {
    num: '03',
    title: 'Check the deadline, apply direct',
    body: 'Every listing shows when it closes and links straight to the employer. We never sit between you and the application.',
  },
  {
    num: '04',
    title: 'Get the next ones by email',
    body: 'Leave your email and we send new internships and scholarships as we curate them, so you see them while they are still open.',
  },
]

export const opportunities = [
  {
    type: 'Scholarship',
    title: 'Tony Elumelu Foundation Entrepreneurship Programme',
    body: '$5,000 seed capital plus mentorship for African entrepreneurs. Open to all African nationals.',
    deadline: 'Opens January annually',
  },
  {
    type: 'Internship',
    title: 'Google STEP Internship Programme',
    body: 'Paid internship for first and second year university students interested in computer science.',
    deadline: 'Applications open September',
  },
  {
    type: 'Scholarship',
    title: 'Mastercard Foundation Scholars Program',
    body: 'Full scholarships for academically talented yet economically disadvantaged young Africans.',
    deadline: 'Varies by partner university',
  },
  {
    type: 'Internship',
    title: 'Dangote Group Graduate Trainee Program',
    body: "Paid graduate trainee positions across engineering, finance and supply chain at Africa's largest conglomerate.",
    deadline: 'Rolling applications',
  },
  {
    type: 'Scholarship',
    title: 'NNPC/SNEPCo National University Scholarship',
    body: 'For Nigerian students in science, engineering and related courses. Covers tuition and stipend.',
    deadline: 'Opens Q1 annually',
  },
  {
    type: 'Internship',
    title: 'Access Bank WAVE Internship',
    body: 'Six-month paid internship across banking, tech, operations and customer experience.',
    deadline: 'Applications open Q2',
  },
]

export const DEADLINE_ICON = AlarmClock

export const testimonials = [
  {
    quote:
      'I spend hours every week searching different websites for scholarships and internships. By the time I find something relevant, the deadline has already passed.',
    name: 'Adaeze O.',
    school: 'Undergraduate, University of Lagos',
  },
  {
    quote:
      'Nobody taught me how to write a CV that actually gets responses. I have been applying for internships for six months and heard nothing back.',
    name: 'Chukwuemeka N.',
    school: 'Final Year, Obafemi Awolowo University',
  },
  {
    quote:
      'I would love an AI tutor that actually understands my curriculum. The ones I have tried are built for American students and the examples never relate to my context.',
    name: 'Fatima M.',
    school: 'Postgraduate, Ahmadu Bello University',
  },
]

/**
 * Phases from roadmap section 4.
 *
 * Deliberately NO dates. The roadmap carries specific month windows, but those
 * are internal: publishing them turns a plan into a promise, and a slipped
 * public date costs more trust than it buys. `status` communicates sequence
 * and progress without committing to a calendar.
 */
export const phases = [
  {
    state: 'done' as const,
    icon: Check,
    label: 'Phase 0',
    status: 'Complete',
    title: 'Manual curation',
    body: 'Twenty real internships and scholarships curated by hand and sent directly to our research respondents, to prove students engage before a line of platform code is written.',
  },
  {
    state: 'active' as const,
    icon: Rocket,
    label: 'Phase 1',
    status: 'In progress',
    title: 'Internship Board and Scholarship Finder',
    body: 'The two most validated features, built with an admin panel so the team can add listings without touching code. At least 50 real listings in each at launch.',
  },
  {
    state: 'soon' as const,
    icon: CircleOutline,
    label: 'Phase 2',
    status: 'Next',
    title: 'CV Builder and Cover Letter Generator',
    body: 'Career document tools that turn Orevalo from opportunity discovery into full career preparation. ATS-friendly templates, PDF export.',
  },
  {
    state: 'soon' as const,
    icon: CircleOutline,
    label: 'Phase 3',
    status: 'Planned',
    title: 'Opportunity Alerts and AI Chat Tutor',
    body: 'The intelligence layer. Dependent on external funding to cover AI API costs — the target is to raise or earn that before building it.',
  },
]

/** Staged pricing; paid features are intentionally marked as planned until live. */
export const pricing = [
  {
    name: 'Free',
    price: 'NGN 0',
    cadence: 'during launch',
    highlight: false,
    features: [
      'Browse internships and scholarships',
      'Basic account and profile',
      'Save a limited number of opportunities',
      'Apply through the original provider links',
    ],
  },
  {
    name: 'Plus',
    price: 'NGN 1,000',
    cadence: 'per month · coming soon',
    highlight: true,
    features: [
      'Everything in Free',
      'Unlimited saves and application tracking',
      'Personalised alerts and deadline reminders',
      'Early access and member pricing',
    ],
  },
  {
    name: 'Premium',
    price: 'NGN 2,000',
    cadence: 'per month · coming soon',
    highlight: false,
    features: [
      'Everything in Plus',
      'CV builder and export',
      'Tailored cover letters',
      'Advanced matching',
      'AI tutor when available',
    ],
  },
]

export const faqs = [
  {
    q: 'Do I need an account to use Orevalo?',
    a: 'No. The Internship Board is open right now — browse it, filter it, and apply directly through the employer link. No sign-up, no login, no paywall. Give us your email only if you want new opportunities sent to you.',
  },
  {
    q: 'Is Orevalo free to use?',
    a: 'Yes. Orevalo is free during launch. Plus members will get early access to personalised alerts and application tracking at NGN 1,000 per month. Premium will follow at NGN 2,000 per month with the full career and AI tools. There is no payment available today.',
  },
  {
    q: 'What is actually available today?',
    a: 'The Internship Board is live with curated roles open to African students, and we email new opportunities to everyone who signs up. The Scholarship Finder is in build. The CV Builder and Cover Letter Generator come next, and the alerts and AI tutor after that. Each card in the features section tells you exactly where it stands — we would rather say "not yet" than pretend.',
  },
  {
    q: 'Is Orevalo only for Nigerian students?',
    a: 'We are starting with Nigeria as our primary market, but Orevalo is built for all African university students. The board is open to everyone, and students from Ghana, Kenya, South Africa and across the continent are welcome to sign up for opportunity emails.',
  },
  {
    q: 'What courses or universities does Orevalo support?',
    a: 'Orevalo is designed for students across all disciplines and universities. Whether you are studying engineering, medicine, arts or business at any African university, the platform is built for you.',
  },
  {
    q: 'How is Orevalo different from LinkedIn or Jobberman?',
    a: 'LinkedIn and Jobberman are built for professionals and focused on job listings. Orevalo combines opportunity discovery, CV building, cover letters, alerts and AI tutoring specifically for African university students in one place. When we asked students what they use today, the answer was Google, WhatsApp groups and LinkedIn — no dedicated platform.',
  },
  {
    q: 'Can my university partner with Orevalo?',
    a: 'Yes. We offer university licensing that gives all enrolled students full premium access at no personal cost. To bring Orevalo to your institution, reach out at hello@orevalo.com.',
  },
]

/**
 * Product navigation.
 *
 * Derived from `features`, not hand-maintained: a feature appears in the nav
 * exactly when it has a real page to link to. Give a feature an `href` and a
 * `navLabel` when it ships and the nav picks it up — nothing else to edit, and
 * the nav can never advertise something that is not built.
 */
export const productNav = features
  .filter((f): f is typeof f & { href: string; navLabel: string } =>
    Boolean(f.href && f.navLabel),
  )
  .map(({ href, navLabel }) => ({ href, label: navLabel }))

export const socials = [
  { label: 'Twitter / X', href: 'https://x.com/OrevaloAI' },
  { label: 'Instagram', href: 'https://instagram.com/orevaloai' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/orevalo/' },
]
