import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCurrentUser } from '@/lib/supabase/server'
import { getListingBySlug } from '@/lib/listings.server'
import { formatDeadline } from '@/lib/listings'
import OpportunityActions from '@/components/OpportunityActions'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const listing = await getListingBySlug(slug)
  return { title: listing ? `${listing.title} at ${listing.company}` : 'Internship' }
}

export default async function InternshipDetail({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ preview?: string }> }) {
  const { slug } = await params
  const { preview } = await searchParams
  const { isAdmin } = await getCurrentUser()
  const listing = await getListingBySlug(slug, Boolean(preview && isAdmin))
  if (!listing) notFound()

  return <main className="mx-auto max-w-[760px] px-5 py-12">
    <Link href="/internships" className="text-sm font-semibold text-clay no-underline">Back to internships</Link>
    {!listing.published && <p className="mt-6 rounded-xl bg-clay/10 px-4 py-3 text-sm font-semibold text-clay">Preview mode: this listing is not public.</p>}
    <p className="mt-10 text-sm font-bold uppercase tracking-[0.1em] text-clay">{listing.company}</p>
    <h1 className="mt-3 font-display text-4xl font-semibold">{listing.title}</h1>
    <p className="mt-4 text-muted">{listing.location} · {listing.field} · Deadline {formatDeadline(listing.deadline)}</p>
    <p className="mt-10 whitespace-pre-wrap text-[1rem] leading-[1.8] text-muted">{listing.description ?? 'Review the role details and apply through the original provider.'}</p>
    <OpportunityActions kind="listing" opportunityId={listing.id} applyUrl={listing.apply_url} />
    {listing.source_name && <p className="mt-6 text-sm text-muted">Source: {listing.source_url ? <a href={listing.source_url} className="text-clay">{listing.source_name}</a> : listing.source_name}{listing.verified_at ? ` · Verified ${new Date(listing.verified_at).toLocaleDateString('en-GB')}` : ''}</p>}
  </main>
}