'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { productNav } from '@/lib/content'
import { Close, Menu } from './icons'

/**
 * Site navigation.
 *
 * The links ARE the product: `productNav` is derived from the features list, so
 * a tool appears here only once it has a real page. Pricing, roadmap and the
 * other marketing sections live in the footer — a nav full of anchors to
 * sections about things we have not built yet is noise.
 *
 * Links are never dropped at a breakpoint, only relocated into the menu.
 */
const NAV_LINKS = productNav

export default function SiteNav({ signedIn = false }: { signedIn?: boolean }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  useEffect(() => setOpen(false), [pathname])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <nav className="sticky top-0 z-100 border-b border-clay/12 bg-cream/92 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between gap-4 px-[5vw] max-sm:px-4">
        <Link
          href="/"
          className="shrink-0 font-display text-2xl font-semibold tracking-[-0.02em] whitespace-nowrap text-clay no-underline max-sm:text-xl"
        >
          Ore<span className="text-ink">valo</span>
        </Link>

        <div className="flex shrink-0 items-center gap-5 max-sm:hidden">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-[0.875rem] font-semibold whitespace-nowrap text-ink/70 no-underline transition-colors hover:text-clay"
            >
              {label}
            </Link>
          ))}
          {/* Browsing is already a nav link, so the CTA is the one thing the
              nav cannot do: get new opportunities sent to you. */}
          {signedIn ? (
            <Link
              href="/account"
              className="rounded-full bg-clay px-5 py-2.5 text-[0.875rem] leading-none font-semibold whitespace-nowrap text-white no-underline transition-colors hover:bg-clay-dark"
            >
              My account
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-[0.875rem] font-semibold whitespace-nowrap text-ink/70 no-underline transition-colors hover:text-clay"
              >
                Sign in
              </Link>
              <a
                href="/#alerts"
                className="rounded-full bg-clay px-5 py-2.5 text-[0.875rem] leading-none font-semibold whitespace-nowrap text-white no-underline transition-colors hover:bg-clay-dark"
              >
                Get opportunities
              </a>
            </>
          )}
        </div>

        <button
          type="button"
          aria-expanded={open}
          aria-controls="site-nav-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((v) => !v)}
          className="hidden size-[42px] shrink-0 cursor-pointer items-center justify-center rounded-xl border-[1.5px] border-clay/25 bg-white/70 text-clay transition-colors hover:border-clay max-sm:inline-flex"
        >
          {open ? <Close size="1.35em" /> : <Menu size="1.35em" />}
        </button>
      </div>

      {open && (
        <div
          id="site-nav-menu"
          className="flex flex-col border-t border-clay/12 bg-cream/98 px-4 pt-2 pb-4 sm:hidden"
        >
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="block border-b border-clay/10 px-1 py-3.5 font-semibold text-ink no-underline"
            >
              {label}
            </Link>
          ))}
          {signedIn ? (
            <Link
              href="/account"
              onClick={() => setOpen(false)}
              className="mt-3 rounded-full bg-clay px-5 py-3.5 text-center font-bold text-white no-underline"
            >
              My account
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="block border-b border-clay/10 px-1 py-3.5 font-semibold text-ink no-underline"
              >
                Sign in
              </Link>
              <a
                href="/#alerts"
                onClick={() => setOpen(false)}
                className="mt-3 rounded-full bg-clay px-5 py-3.5 text-center font-bold text-white no-underline"
              >
                Get opportunities
              </a>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
