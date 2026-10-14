import type { OpportunityRequirement } from '@/lib/opportunity-requirements'

export default function OpportunityRequirements({ requirements }: { requirements: OpportunityRequirement[] }) {
  return (
    <section className="mt-10 border-y border-line py-7" aria-labelledby="requirements-heading">
      <h2 id="requirements-heading" className="font-display text-2xl font-semibold">Requirements</h2>
      {requirements.length ? (
        <ul className="mt-4 space-y-3">
          {requirements.map(({ label, detail }, index) => (
            <li key={`${label}-${index}`} className="flex gap-3 text-[0.95rem] leading-[1.65]">
              <span aria-hidden="true" className="mt-[0.65em] size-1.5 shrink-0 rounded-full bg-clay" />
              <p><strong className="text-ink">{label}:</strong> <span className="text-muted">{detail}</span></p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-[0.92rem] leading-[1.7] text-muted">The source did not specify eligibility requirements. Check the provider&apos;s full listing before applying.</p>
      )}
    </section>
  )
}