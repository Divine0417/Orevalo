import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { Check, Close } from '@/components/icons'

export const metadata = {
  title: 'Confirm your email — Orevalo',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

/**
 * Double opt-in landing page.
 *
 * Clicking here is what proves the person owns the address they typed. Until
 * that happens the row stays `confirmed = false` and is excluded from sends,
 * so nobody can quietly enrol someone else's inbox.
 */
export default async function ConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams

  if (!token || !isSupabaseConfigured) return <Failed />

  const supabase = await createClient()
  const { data, error } = await supabase.rpc('confirm_with_token', { token })

  if (error || data !== true) return <Failed />

  return (
    <Shell>
      <span className="mb-4 flex size-14 items-center justify-center rounded-full bg-moss/12 text-2xl text-moss">
        <Check />
      </span>
      <h1 className="mb-3 font-display text-2xl font-semibold">You are confirmed</h1>
      <p className="mb-6 text-[0.95rem] leading-[1.7] text-muted">
        We will send new internships and scholarships as we curate them. Every email has an
        unsubscribe link.
      </p>
      <Link
        href="/internships"
        className="rounded-full bg-clay px-7 py-3 font-bold text-white no-underline transition-colors hover:bg-clay-dark"
      >
        Browse internships
      </Link>
    </Shell>
  )
}

function Failed() {
  return (
    <Shell>
      <span className="mb-4 flex size-14 items-center justify-center rounded-full bg-[#fff0eb] text-2xl text-[#8b3a1a]">
        <Close />
      </span>
      <h1 className="mb-3 font-display text-2xl font-semibold">That link did not work</h1>
      <p className="mb-6 text-[0.95rem] leading-[1.7] text-muted">
        It may have expired or already been used. Sign up again on the home page, or email{' '}
        <strong className="text-ink">hello@orevalo.com</strong>.
      </p>
      <Link
        href="/#alerts"
        className="rounded-full border-[1.5px] border-line px-7 py-3 font-semibold text-muted no-underline hover:border-clay hover:text-clay"
      >
        Sign up again
      </Link>
    </Shell>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-cream px-5 py-12">
      <div className="flex w-full max-w-[480px] flex-col items-center rounded-3xl border border-clay/10 bg-white p-10 text-center max-sm:p-6">
        {children}
      </div>
    </main>
  )
}
