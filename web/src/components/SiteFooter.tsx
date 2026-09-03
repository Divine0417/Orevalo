import Link from 'next/link'
import { productNav } from '@/lib/content'
import { Instagram, LinkedIn, XTwitter } from './icons'

/**
 * Live product pages first, then the marketing sections the nav deliberately
 * leaves out — pricing and roadmap belong here, not in a product nav.
 */
const PAGES = [
  ...productNav,
  { href: '/#features', label: 'Features' },
  { href: '/#roadmap', label: 'Roadmap' },
  { href: '/#pricing', label: 'Pricing' },
  { href: '/#alerts', label: 'Get opportunities' },
  { href: '/student-leaders', label: 'Student Leaders' },
  { href: '/research', label: 'Research survey' },
]

const SOCIALS = [
  { href: 'https://x.com/OrevaloAI', label: 'Twitter / X', Icon: XTwitter },
  { href: 'https://instagram.com/orevaloai', label: 'Instagram', Icon: Instagram },
  { href: 'https://www.linkedin.com/company/orevalo/', label: 'LinkedIn', Icon: LinkedIn },
]

export default function SiteFooter() {
  return (
    <footer className="bg-ink px-[5vw] py-12 text-center text-[0.85rem] text-cream/50">
      <span className="mb-1 block font-display text-2xl font-semibold text-clay-light">Orevalo</span>
      <p className="mb-7 text-cream/45 italic">Study smart. Build your future.</p>

      <nav
        aria-label="Pages"
        className="mx-auto mb-6 flex max-w-[560px] flex-wrap justify-center gap-x-6 gap-y-2 border-b border-cream/10 pb-6"
      >
        {PAGES.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="font-semibold text-cream/75 no-underline transition-colors hover:text-clay-light"
          >
            {label}
          </Link>
        ))}
      </nav>

      <div className="mb-5 flex flex-wrap justify-center gap-3">
        {SOCIALS.map(({ href, label, Icon }) => (
          <a
            key={href}
            href={href}
            target="_blank"
            rel="noreferrer"
            aria-label={label}
            className="inline-flex items-center gap-2 rounded-full border border-cream/15 px-4 py-2 text-[0.8rem] font-semibold text-cream/70 no-underline transition-colors hover:border-clay-light hover:text-clay-light"
          >
            <Icon /> {label}
          </a>
        ))}
      </div>

      <p className="mb-2">
        <a
          href="mailto:hello@orevalo.com"
          className="text-cream/70 no-underline hover:text-clay-light"
        >
          hello@orevalo.com
        </a>
      </p>
      <p className="text-cream/40">© 2026 Orevalo. Built with purpose for African students.</p>
    </footer>
  )
}
