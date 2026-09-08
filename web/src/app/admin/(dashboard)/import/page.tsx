'use client'

import { useActionState } from 'react'
import { importOpportunities } from '../../import-actions'
import type { ActionResult } from '../../actions'

export default function ImportPage() {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(importOpportunities, null)
  return <div className="mx-auto max-w-[720px]">
    <h1 className="font-display text-3xl font-semibold">Import opportunities</h1>
    <p className="mt-2 text-[0.92rem] leading-[1.6] text-muted">Upload a CSV to add unpublished records for review. Duplicate rows are ignored within the file; existing slugs are rejected.</p>
    <form action={action} className="mt-8 flex flex-col gap-5 rounded-2xl border border-line bg-white p-6">
      <label className="flex flex-col gap-2 text-sm font-semibold">Type<select name="kind" required className="rounded-xl border border-line bg-cream px-4 py-3"><option value="listing">Internships</option><option value="scholarship">Scholarships</option></select></label>
      <label className="flex flex-col gap-2 text-sm font-semibold">CSV file<input type="file" name="file" accept=".csv,text/csv" required className="rounded-xl border border-line bg-cream px-4 py-3" /></label>
      <p className="text-[0.82rem] leading-[1.6] text-muted">Internship columns: company, title, location, field, deadline, apply_url. Scholarship columns: name, funder, country, field, degree_level, deadline, apply_url. Optional: description, eligibility, source_name, source_url.</p>
      {state && !state.ok && <p role="alert" className="rounded-xl border border-[#e07a50] bg-[#fff0eb] px-4 py-3 text-sm text-[#8b3a1a]">{state.message}</p>}
      {state?.ok && <p className="rounded-xl border border-moss/40 bg-moss/10 px-4 py-3 text-sm text-moss">Imported as unpublished records. Review and publish them from the relevant admin page.</p>}
      <button type="submit" disabled={pending} className="w-fit rounded-full bg-clay px-6 py-3 font-bold text-white disabled:opacity-60">{pending ? 'Importing...' : 'Import CSV'}</button>
    </form>
  </div>
}
