import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { Check, Close } from '@/components/icons'

export const metadata = {
  title: 'Unsubscribe — Orevalo',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

/**
 * One-click unsubscribe.
 *
 * No login and no confirmation step: the copy on the signup form promises "one
 * click", and making someone sign in to leave a mailing list is a dark pattern.
 * The token in the link is the authorisation.
 */
export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams

  if (!token || !isSupabaseConfigured) return <Failed reason="missing" />

  const supabase = await createClient()
  const { data, error } = await supabase.rpc('unsubscribe_with_token', { token })

  if (error || data !== true) return <Failed reason={error ? 'error' : 'unknown'} />

  return (
    <Shell>
      <span className="mb-4 flex size-14 items-center justify-center rounded-full bg-moss/12 text-2xl text-moss">
        <Check />
      </span>
      <h1 className="mb-3 font-display text-2xl font-semibold">You are unsubscribed</h1>
      <p className="mb-6 text-[0.95rem] leading-[1.7] text-muted">
        We will not email you again. No hard feelings — the internship board stays free and open
        whether or not you are on the list.
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

function Failed({ reason }: { reason: 'missing' | 'unknown' | 'error' }) {
  return (
    <Shell>
      <span className="mb-4 flex size-14 items-center justify-center rounded-full bg-[#fff0eb] text-2xl text-[#8b3a1a]">
        <Close />
      </span>
      <h1 className="mb-3 font-display text-2xl font-semibold">
        {reason === 'missing' ? 'That link is incomplete' : 'That link did not work'}
      </h1>
      <p className="mb-6 text-[0.95rem] leading-[1.7] text-muted">
        {reason === 'unknown'
          ? 'It may have already been used, or the address may have been removed already.'
          : 'Something went wrong on our side.'}{' '}
        Email <strong className="text-ink">hello@orevalo.com</strong> and we will take you off the
        list by hand.
      </p>
      <Link
        href="/"
        className="rounded-full border-[1.5px] border-line px-7 py-3 font-semibold text-muted no-underline hover:border-clay hover:text-clay"
      >
        Back to orevalo.com
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
