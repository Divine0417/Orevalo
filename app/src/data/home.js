/**
 * Content for the landing page.
 *
 * Kept out of the components so copy edits never mean touching JSX, and so the
 * arrays that will eventually come from an API (opportunities, testimonials)
 * already have a stable shape to be swapped in behind.
 */

import {
  AlarmClock,
  Bell,
  Books,
  Briefcase,
  Check,
  ArrowRight,
  CircleOutline,
  Document,
  Envelope,
  Frustrated,
  GlobeAfrica,
  GlobeGrid,
  GraduationCap,
  LinkIcon,
  Robot,
  Search,
  Stopwatch,
} from '../components/icons/Icons.jsx'

export const WAITLIST_COUNT = 113

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

export const features = [
  {
    icon: Robot,
    tone: 'ic-clay',
    title: 'AI Chat Tutor',
    body: 'Ask any academic question in plain language. Get clear, honest explanations — like having a patient tutor available 24/7, at no extra cost.',
  },
  {
    icon: GraduationCap,
    tone: 'ic-green',
    title: 'Scholarship Finder',
    body: 'Browse a curated, regularly updated database of scholarships, fellowships, and grants open to African students — filtered to what matches you.',
  },
  {
    icon: Briefcase,
    tone: 'ic-amber',
    title: 'Internship & Job Board',
    body: 'Discover internships, graduate jobs, and entry-level opportunities updated daily. No more checking five platforms at once.',
  },
  {
    icon: Document,
    tone: 'ic-purple',
    title: 'CV Builder',
    body: 'Create a professional, ATS-friendly CV in minutes using templates built for African graduates applying locally and internationally.',
  },
  {
    icon: Envelope,
    tone: 'ic-blue',
    title: 'Cover Letter Generator',
    body: 'Write tailored cover letters for each application. Tell Orevalo the role and your background — it handles the words.',
  },
  {
    icon: Bell,
    tone: 'ic-rose',
    title: 'Opportunity Alerts',
    body: 'Get notified when new scholarships, internships, competitions, and grants match your profile. Never miss a deadline again.',
  },
]

export const steps = [
  {
    num: '01',
    title: 'Create your free account',
    body: "Sign up in under a minute. No credit card, no complicated setup. Just your email and you're in.",
  },
  {
    num: '02',
    title: 'Tell us about yourself',
    body: 'Your course, your goals, your interests. The more Orevalo knows, the better it matches opportunities to you.',
  },
  {
    num: '03',
    title: 'Study, build, and apply',
    body: 'Use the AI tutor to study, build your CV, find scholarships, and apply — all without leaving the platform.',
  },
  {
    num: '04',
    title: 'Get alerts and stay ahead',
    body: 'Orevalo watches for new opportunities that match your profile and alerts you before deadlines close.',
  },
]

/** Deadline lines all carry the alarm-clock icon that used to be an emoji. */
export const opportunities = [
  {
    type: 'scholarship',
    typeLabel: 'Scholarship',
    title: 'Tony Elumelu Foundation Entrepreneurship Programme',
    body: '$5,000 seed capital plus mentorship for African entrepreneurs. Open to all African nationals.',
    deadline: 'Opens January annually',
  },
  {
    type: 'internship',
    typeLabel: 'Internship',
    title: 'Google STEP Internship Programme',
    body: 'Paid internship for first and second year university students interested in computer science. Remote and onsite roles available.',
    deadline: 'Applications open September',
  },
  {
    type: 'scholarship',
    typeLabel: 'Scholarship',
    title: 'Mastercard Foundation Scholars Program',
    body: 'Full scholarships for academically talented yet economically disadvantaged young Africans to study at partner universities.',
    deadline: 'Varies by partner university',
  },
  {
    type: 'internship',
    typeLabel: 'Internship',
    title: 'Dangote Group Graduate Trainee Program',
    body: "Paid graduate trainee positions across engineering, finance, supply chain, and more at Africa's largest conglomerate.",
    deadline: 'Rolling applications',
  },
  {
    type: 'scholarship',
    typeLabel: 'Scholarship',
    title: 'NNPC/SNEPCo National University Scholarship',
    body: 'Scholarship for Nigerian university students in science, engineering, and related courses. Covers tuition and stipend.',
    deadline: 'Opens Q1 annually',
  },
  {
    type: 'internship',
    typeLabel: 'Internship',
    title: 'Access Bank WAVE Internship',
    body: 'Six-month paid internship for young Nigerians across banking, tech, operations, and customer experience divisions.',
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
 * `state` drives both the dot styling and which icon it gets:
 * done -> check, active -> arrow, soon -> hollow circle.
 */
export const timeline = [
  {
    state: 'done',
    icon: Check,
    date: 'May 2026',
    title: 'User research completed',
    body: 'Spoke directly with Nigerian university students and validated the core problem and features.',
  },
  {
    state: 'done',
    icon: Check,
    date: 'June 2026',
    title: 'Platform launched',
    body: 'orevalo.com went live. Waitlist opened. Brand identity and social media established.',
  },
  {
    state: 'done',
    icon: Check,
    date: 'July 2026',
    title: 'Technical co-founder onboarded',
    body: 'Samuel Egwu joined as CTO bringing MSc Computer Science and real AI deployment experience.',
  },
  {
    state: 'active',
    icon: ArrowRight,
    date: 'Now',
    title: 'MVP in development',
    body: 'Building the internship board and CV builder. First real features coming soon.',
  },
  {
    state: 'soon',
    icon: CircleOutline,
    date: 'Q4 2026',
    title: 'MVP Launch',
    body: 'Waitlist members get first access. Internship board, scholarship finder, and CV builder go live.',
  },
  {
    state: 'soon',
    icon: CircleOutline,
    date: '2027',
    title: 'Full platform launch',
    body: 'All six features live. University partnerships activated. Pan-African expansion begins.',
  },
]

export const faqs = [
  {
    q: 'Is Orevalo free to use?',
    a: 'Yes. Orevalo is free to get started with no credit card required. We will offer a premium plan with advanced features but the core tools will always have a free tier.',
  },
  {
    q: 'When does Orevalo launch?',
    a: 'We are targeting a Q4 2026 MVP launch for waitlist members. Join the waitlist now to be among the first to get access when we open the doors.',
  },
  {
    q: 'Is Orevalo only for Nigerian students?',
    a: 'We are starting with Nigeria as our primary market but Orevalo is built for all African university students. Students from Ghana, Kenya, South Africa and across the continent are welcome to join the waitlist.',
  },
  {
    q: 'What courses or universities does Orevalo support?',
    a: 'Orevalo is designed for students across all disciplines and universities. Whether you are studying engineering, medicine, arts, or business at any African university, the platform is built for you.',
  },
  {
    q: 'How is Orevalo different from LinkedIn or Jobberman?',
    a: 'LinkedIn and Jobberman are built for professionals and focused on job listings. Orevalo combines AI tutoring, scholarship discovery, CV building, internship matching, cover letter generation, and opportunity alerts specifically for African university students in one place. We are built for where you are now, not where you hope to be.',
  },
  {
    q: 'Can my university partner with Orevalo?',
    a: 'Yes. We offer university licensing that gives all enrolled students full premium access at no personal cost. If you would like to bring Orevalo to your institution, reach out to us at hello@orevalo.com.',
  },
]
