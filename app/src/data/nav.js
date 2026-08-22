/**
 * Site navigation.
 *
 * Add a page here and it appears in the nav on every screen size — desktop
 * gets it inline, mobile gets it in the menu. This is the only place that
 * needs editing when a new page ships.
 *
 * Roadmap pages that will slot in as they are built:
 *   Phase 1 -> { to: '/scholarships', label: 'Scholarships' }
 *   Phase 2 -> { to: '/cv-builder',   label: 'CV Builder' }
 */

export const navLinks = [
  { to: '/internships', label: 'Internships' },
  { to: '/student-leaders', label: 'Student Leaders' },
]

export const footerLinks = [
  { to: '/internships', label: 'Internships' },
  { to: '/student-leaders', label: 'Student Leaders Program' },
  { to: '/research', label: 'Student Research Survey' },
]

/** Primary call to action. `href` is an in-page anchor, `to` would be a route. */
export const navCta = { href: '/#waitlist', label: 'Join Waitlist' }
