import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Close, Menu } from './icons/Icons.jsx'
import { footerLinks, navCta, navLinks } from '../data/nav.js'
import './SiteNav.css'

/**
 * Site-wide navigation.
 *
 * Links come from `src/data/nav.js`, so adding a page is a one-line change and
 * it shows up on every screen size. Below 640px the inline links move into a
 * toggle menu rather than being hidden — a page in the list is always reachable.
 */
export default function SiteNav() {
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)

  // Close on navigation, so the menu never stays open over the new page.
  useEffect(() => setOpen(false), [pathname])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  // On the home page the CTA is an in-page anchor; elsewhere it goes home first.
  const ctaHref = pathname === '/' ? '#waitlist' : navCta.href

  return (
    <nav className="site-nav">
      <div className="site-nav__bar">
        <Link to="/" className="site-nav__logo">
          Ore<span>valo</span>
        </Link>

        <div className="site-nav__links">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`site-nav__link ${pathname === to ? 'is-active' : ''}`}
            >
              {label}
            </Link>
          ))}
          <a href={ctaHref} className="site-nav__cta">
            {navCta.label}
          </a>
        </div>

        <button
          type="button"
          className="site-nav__toggle"
          aria-expanded={open}
          aria-controls="site-nav-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <Close size="1.35em" /> : <Menu size="1.35em" />}
        </button>
      </div>

      {/* The menu carries every page, not just the two in the bar, so nothing
          is unreachable on a phone. */}
      <div id="site-nav-menu" className={`site-nav__menu ${open ? 'is-open' : ''}`}>
        {footerLinks.map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            className={`site-nav__menu-link ${pathname === to ? 'is-active' : ''}`}
          >
            {label}
          </Link>
        ))}
        <a href={ctaHref} className="site-nav__menu-cta" onClick={() => setOpen(false)}>
          {navCta.label}
        </a>
      </div>
    </nav>
  )
}
