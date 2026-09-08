'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Briefcase, Close, Document, GraduationCap, Envelope, Medal, Menu } from '@/components/icons'

/**
 * Admin chrome: sidebar on desktop, slide-down menu on mobile.
 *
 * Sections mirror the roadmap rather than the database — an admin thinks in
 * "the two Phase 1 features and the people waiting to hear about them", not in
 * tables.
 */
const SECTIONS = [
  { href: '/admin', label: 'Overview', icon: null, exact: true },
  { href: '/admin/listings', label: 'Internships', icon: Briefcase },
  { href: '/admin/scholarships', label: 'Scholarships', icon: GraduationCap },
  { href: '/admin/subscribers', label: 'Subscribers', icon: Envelope },
  { href: '/admin/applications', label: 'Applications', icon: Medal },
  { href: '/admin/research', label: 'Research', icon: Document },
  { href: '/admin/import', label: 'Import CSV', icon: Document },
  { href: '/admin/analytics', label: 'Analytics', icon: Document },
]

export default function AdminShell({
  email,
  signOutAction,
  children,
}: {
  email: string
  signOutAction: () => Promise<void>
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  const nav = (
    <nav className="flex flex-col gap-1">
      {SECTIONS.map(({ href, label, icon: Icon, exact }) => (
        <Link
          key={href}
          href={href}
          onClick={() => setOpen(false)}
          className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-[0.92rem] font-semibold no-underline transition-colors ${
            isActive(href, exact)
              ? 'bg-clay text-white'
              : 'text-muted hover:bg-clay/8 hover:text-clay'
          }`}
        >
          {Icon ? <Icon size="1.05em" /> : <span className="size-[1.05em]" />}
          {label}
        </Link>
      ))}
    </nav>
  )

  return (
    <div className="min-h-screen bg-cream">
      {/* Mobile bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-line bg-white/90 px-4 py-3 backdrop-blur-md lg:hidden">
        <Link href="/admin" className="font-display text-lg font-semibold text-clay no-underline">
          Ore<span className="text-ink">valo</span>
          <span className="ml-2 text-[0.7rem] font-bold tracking-[0.08em] text-muted uppercase">
            Admin
          </span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? 'Close menu' : 'Open menu'}
          className="flex size-10 cursor-pointer items-center justify-center rounded-xl border-[1.5px] border-clay/25 text-clay"
        >
          {open ? <Close size="1.2em" /> : <Menu size="1.2em" />}
        </button>
      </header>

      {open && (
        <div className="border-b border-line bg-white px-4 py-4 lg:hidden">
          {nav}
          <SignOut email={email} action={signOutAction} className="mt-4 border-t border-line pt-4" />
        </div>
      )}

      <div className="flex">
        {/* Desktop sidebar */}
        <aside className="sticky top-0 hidden h-screen w-[248px] shrink-0 flex-col justify-between border-r border-line bg-white px-4 py-6 lg:flex">
          <div>
            <Link
              href="/admin"
              className="mb-8 block px-2 font-display text-xl font-semibold text-clay no-underline"
            >
              Ore<span className="text-ink">valo</span>
              <span className="mt-0.5 block text-[0.68rem] font-bold tracking-[0.12em] text-muted uppercase">
                Admin
              </span>
            </Link>
            {nav}
          </div>
          <SignOut email={email} action={signOutAction} />
        </aside>

        <main className="min-w-0 flex-1 px-8 py-10 max-lg:px-4 max-lg:py-6">{children}</main>
      </div>
    </div>
  )
}

function SignOut({
  email,
  action,
  className = '',
}: {
  email: string
  action: () => Promise<void>
  className?: string
}) {
  return (
    <div className={className}>
      <p className="mb-2 px-2 truncate text-[0.78rem] text-muted" title={email}>
        {email}
      </p>
      <Link
        href="/internships"
        className="mb-2 block px-2 text-[0.82rem] font-semibold text-muted no-underline hover:text-clay"
      >
        View public board
      </Link>
      <form action={action}>
        <button
          type="submit"
          className="w-full cursor-pointer rounded-xl border-[1.5px] border-line px-4 py-2 text-[0.82rem] font-semibold text-muted transition-colors hover:border-clay hover:text-clay"
        >
          Sign out
        </button>
      </form>
    </div>
  )
}
