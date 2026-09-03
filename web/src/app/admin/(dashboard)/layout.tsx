import { redirect } from 'next/navigation'
import AdminShell from '../AdminShell'
import { signOut } from '../actions'
import { getCurrentUser } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/supabase/config'

export const metadata = {
  title: 'Admin — Orevalo',
  robots: { index: false, follow: false },
}

/** Admins edit data; nothing here may be served from cache. */
export const dynamic = 'force-dynamic'

/**
 * Gate + chrome for every /admin route.
 *
 * The auth check lives here rather than in each page so a new admin page
 * cannot accidentally ship unprotected. /admin/login opts out by rendering its
 * own layout — it must be reachable while signed out.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured) return <Notice title="Supabase is not configured">{CONFIG_HELP}</Notice>

  const { user, profile, isAdmin } = await getCurrentUser()
  if (!user) redirect('/admin/login')

  const email = profile?.email ?? user.email ?? ''

  if (!isAdmin) {
    return (
      <Notice title="Not an admin">
        <p className="mb-5">
          You are signed in as <strong className="text-ink">{email}</strong>, but that account does
          not have the admin role. Run this once in the Supabase SQL editor:
        </p>
        <pre className="overflow-x-auto rounded-xl bg-ink p-4 text-[0.8rem] text-cream">
          {`update public.profiles\nset role = 'admin'\nwhere email = '${email}';`}
        </pre>
        <form action={signOut} className="mt-5">
          <button
            type="submit"
            className="cursor-pointer rounded-full border-[1.5px] border-line px-5 py-2.5 text-[0.85rem] font-semibold text-muted hover:border-clay hover:text-clay"
          >
            Sign out
          </button>
        </form>
      </Notice>
    )
  }

  return (
    <AdminShell email={email} signOutAction={signOut}>
      {children}
    </AdminShell>
  )
}

const CONFIG_HELP = (
  <p>
    Copy <code className="rounded bg-cream px-1.5 py-0.5">.env.local.example</code> to{' '}
    <code className="rounded bg-cream px-1.5 py-0.5">.env.local</code>, fill in your project URL and
    publishable key, then restart the dev server.
  </p>
)

function Notice({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-cream px-5 py-12">
      <div className="w-full max-w-[560px] rounded-3xl border border-clay/10 bg-white p-8 text-[0.92rem] leading-[1.7] text-muted max-sm:p-6">
        <h1 className="mb-3 font-display text-2xl font-semibold text-ink">{title}</h1>
        {children}
      </div>
    </main>
  )
}
