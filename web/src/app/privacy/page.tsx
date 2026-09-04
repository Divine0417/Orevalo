import type { Metadata } from 'next'
import Link from 'next/link'
import SiteFooter from '@/components/SiteFooter'
import SiteNav from '@/components/SiteNav'

export const metadata: Metadata = {
    title: 'Privacy Policy',
    description: 'How Orevalo collects, uses, and protects information.',
}

export default function PrivacyPage() {
    return (
        <>
            <SiteNav />
            <main className="mx-auto max-w-[820px] px-5 py-16 sm:py-24">
                <Link href="/" className="text-sm font-semibold text-clay no-underline hover:text-clay-dark">
                    Back to home
                </Link>
                <p className="mt-10 text-sm font-bold uppercase tracking-[0.12em] text-clay">Legal</p>
                <h1 className="mt-3 font-display text-4xl font-semibold text-ink sm:text-5xl">Privacy Policy</h1>
                <p className="mt-4 text-sm text-muted">Last updated: September 3, 2026</p>

                <div className="mt-12 space-y-10 text-[0.98rem] leading-[1.8] text-muted">
                    <section>
                        <h2 className="font-display text-2xl font-semibold text-ink">Information we collect</h2>
                        <p className="mt-3">When you create an account, we collect your name, email address, password credentials, and any profile details you choose to provide. We also collect information you submit through opportunity applications, research forms, or alerts.</p>
                    </section>
                    <section>
                        <h2 className="font-display text-2xl font-semibold text-ink">How we use information</h2>
                        <p className="mt-3">We use information to provide accounts, save opportunities, send requested alerts, process applications, improve Orevalo, and protect the service. We do not sell personal information.</p>
                    </section>
                    <section>
                        <h2 className="font-display text-2xl font-semibold text-ink">Authentication and providers</h2>
                        <p className="mt-3">Authentication is provided by Supabase. You may also sign in with Google. When you use Google sign-in, Google shares the account information needed to create and authenticate your Orevalo account.</p>
                    </section>
                    <section>
                        <h2 className="font-display text-2xl font-semibold text-ink">Your choices</h2>
                        <p className="mt-3">You may update your profile, unsubscribe from opportunity alerts, or request account information or deletion by emailing <a className="font-semibold text-clay" href="mailto:hello@orevalo.com">hello@orevalo.com</a>.</p>
                    </section>
                    <section>
                        <h2 className="font-display text-2xl font-semibold text-ink">Contact</h2>
                        <p className="mt-3">Questions about this policy can be sent to <a className="font-semibold text-clay" href="mailto:hello@orevalo.com">hello@orevalo.com</a>.</p>
                    </section>
                </div>
            </main>
            <SiteFooter />
        </>
    )
}
