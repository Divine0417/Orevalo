import type { Metadata } from 'next'
import Link from 'next/link'
import SiteFooter from '@/components/SiteFooter'
import SiteNav from '@/components/SiteNav'

export const metadata: Metadata = {
    title: 'Terms of Service',
    description: 'The terms that apply when you use Orevalo.',
}

export default function TermsPage() {
    return (
        <>
            <SiteNav />
            <main className="mx-auto max-w-[820px] px-5 py-16 sm:py-24">
                <Link href="/" className="text-sm font-semibold text-clay no-underline hover:text-clay-dark">
                    Back to home
                </Link>
                <p className="mt-10 text-sm font-bold uppercase tracking-[0.12em] text-clay">Legal</p>
                <h1 className="mt-3 font-display text-4xl font-semibold text-ink sm:text-5xl">Terms of Service</h1>
                <p className="mt-4 text-sm text-muted">Last updated: September 3, 2026</p>

                <div className="mt-12 space-y-10 text-[0.98rem] leading-[1.8] text-muted">
                    <section>
                        <h2 className="font-display text-2xl font-semibold text-ink">Using Orevalo</h2>
                        <p className="mt-3">Orevalo provides education and career tools, opportunity listings, saved opportunities, and related services for students and graduates. You agree to provide accurate information, keep your account secure, and use the service lawfully.</p>
                    </section>
                    <section>
                        <h2 className="font-display text-2xl font-semibold text-ink">Accounts</h2>
                        <p className="mt-3">You are responsible for activity under your account. Email addresses must be confirmed before email-and-password accounts can access protected features. Google sign-in is subject to Google&apos;s authentication and account policies.</p>
                    </section>
                    <section>
                        <h2 className="font-display text-2xl font-semibold text-ink">Opportunities and advice</h2>
                        <p className="mt-3">Listings and educational guidance are provided for information only. Check the original provider&apos;s requirements, deadlines, eligibility rules, and application instructions before relying on any listing. Orevalo does not guarantee acceptance, employment, funding, or academic results.</p>
                    </section>
                    <section>
                        <h2 className="font-display text-2xl font-semibold text-ink">Acceptable use</h2>
                        <p className="mt-3">Do not misuse the service, attempt unauthorized access, submit deceptive or harmful material, interfere with other users, or use listings to send spam. We may suspend access when necessary to protect users or the service.</p>
                    </section>
                    <section>
                        <h2 className="font-display text-2xl font-semibold text-ink">Contact</h2>
                        <p className="mt-3">Questions about these terms can be sent to <a className="font-semibold text-clay" href="mailto:hello@orevalo.com">hello@orevalo.com</a>.</p>
                    </section>
                </div>
            </main>
            <SiteFooter />
        </>
    )
}
