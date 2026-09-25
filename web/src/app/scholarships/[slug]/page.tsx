import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCurrentUser } from '@/lib/supabase/server'
import { getScholarshipBySlug } from '@/lib/scholarships.server'
import { formatDeadline } from '@/lib/listings'
import OpportunityActions from '@/components/OpportunityActions'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const scholarship = await getScholarshipBySlug(slug)
  return { title: scholarship?.name ?? 'Scholarship' }
}

export default async function ScholarshipDetail({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ preview?: string }> }) {
  const { slug } = await params
  const { preview } = await searchParams
  const { isAdmin } = await getCurrentUser()
  const scholarship = await getScholarshipBySlug(slug, preview === '1' && isAdmin)
  if (!scholarship) notFound()

  return <main className="mx-auto max-w-[760px] px-5 py-12">
    <Link href="/scholarships" className="text-sm font-semibold text-clay no-underline">Back to scholarships</Link>
    {!scholarship.published && <p className="mt-6 rounded-xl bg-clay/10 px-4 py-3 text-sm font-semibold text-clay">Preview mode: this scholarship is not public.</p>}
    <p className="mt-10 text-sm font-bold uppercase tracking-[0.1em] text-clay">{scholarship.funder}</p>
    <h1 className="mt-3 font-display text-4xl font-semibold">{scholarship.name}</h1>
    <p className="mt-4 text-muted">{scholarship.country} · {scholarship.field} · {scholarship.degree_level} · {scholarship.deadline ? `Deadline ${formatDeadline(scholarship.deadline)}` : 'Rolling deadline'}</p>
    <p className="mt-10 whitespace-pre-wrap text-[1rem] leading-[1.8] text-muted">{scholarship.description ?? scholarship.eligibility ?? 'Review the eligibility requirements and apply through the original provider.'}</p>
    <OpportunityActions kind="scholarship" opportunityId={scholarship.id} applyUrl={scholarship.apply_url} />
    {scholarship.source_name && <p className="mt-6 text-sm text-muted">Source: {scholarship.source_url ? <a href={scholarship.source_url} className="text-clay">{scholarship.source_name}</a> : scholarship.source_name}{scholarship.verified_at ? ` · Verified ${new Date(scholarship.verified_at).toLocaleDateString('en-GB')}` : ''}</p>}
  </main>
}