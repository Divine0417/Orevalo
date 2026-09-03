import Link from 'next/link'

/** Shared frame for the sign-in and sign-up pages. */
export default function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
  footer: React.ReactNode
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-cream px-5 py-12">
      <div className="w-full max-w-[440px]">
        <Link
          href="/"
          className="mb-8 block text-center font-display text-2xl font-semibold text-clay no-underline"
        >
          Ore<span className="text-ink">valo</span>
        </Link>

        <div className="rounded-3xl border border-clay/10 bg-white p-8 shadow-[0_4px_24px_rgba(44,26,14,0.05)] max-sm:p-6">
          <h1 className="mb-1 font-display text-2xl font-semibold">{title}</h1>
          <p className="mb-6 text-[0.9rem] leading-[1.6] text-muted">{subtitle}</p>
          {children}
        </div>

        <div className="mt-6 text-center text-[0.88rem] text-muted">{footer}</div>

        {/* The boards are open. Never let an auth page imply otherwise. */}
        <p className="mt-6 rounded-2xl border border-line bg-white/60 px-4 py-3 text-center text-[0.82rem] leading-[1.6] text-muted">
          You do not need an account to browse.{' '}
          <Link href="/internships" className="font-semibold text-clay no-underline">
            Internships
          </Link>{' '}
          and{' '}
          <Link href="/scholarships" className="font-semibold text-clay no-underline">
            scholarships
          </Link>{' '}
          are open to everyone.
        </p>
      </div>
    </main>
  )
}

export const authInput =
  'w-full rounded-xl border-[1.5px] border-line bg-cream px-4 py-3 text-[0.95rem] outline-none transition-colors focus-visible:border-clay focus-visible:bg-white'

export const authLabel = 'text-[0.8rem] font-bold tracking-[0.08em] text-muted uppercase'
