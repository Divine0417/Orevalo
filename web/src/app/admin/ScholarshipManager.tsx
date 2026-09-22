'use client'

import { useActionState, useEffect, useRef, useState, useTransition } from 'react'
import Modal from './Modal'
import { approveScholarship, archiveScholarship, createScholarship, deleteScholarship, rejectScholarship, setScholarshipFeatured, setScholarshipPublished, updateScholarship } from './scholarship-actions'
import type { ActionResult } from './actions'
import { COUNTRIES, DEGREE_LEVELS, SCHOLARSHIP_FIELDS } from '@/lib/scholarships'
import { formatDeadline } from '@/lib/listings'
import type { ScholarshipRow as ScholarshipRowType } from '@/lib/supabase/types'

export type ScholarshipRow = ScholarshipRowType

const inputClass = 'w-full rounded-xl border-[1.5px] border-line bg-cream px-4 py-3 text-[0.95rem] outline-none focus-visible:border-clay focus-visible:bg-white'
const labelClass = 'text-[0.75rem] font-bold tracking-[0.08em] text-muted uppercase'

function ScholarshipForm({ scholarship, onDone }: { scholarship?: ScholarshipRow; onDone?: () => void }) {
  const editing = Boolean(scholarship)
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(editing ? updateScholarship : createScholarship, null)
  const formRef = useRef<HTMLFormElement>(null)
  const firstFieldRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!state?.ok) return
    if (editing) {
      onDone?.()
      return
    }
    formRef.current?.reset()
    firstFieldRef.current?.focus()
  }, [state, editing, onDone])

  return (
    <form ref={formRef} action={action} className="flex flex-col gap-4">
      {scholarship && <input type="hidden" name="id" value={scholarship.id} />}
      <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
        <label className="flex flex-col gap-2"><span className={labelClass}>Scholarship name</span><input ref={firstFieldRef} name="name" required defaultValue={scholarship?.name} className={inputClass} /></label>
        <label className="flex flex-col gap-2"><span className={labelClass}>Funder</span><input name="funder" required defaultValue={scholarship?.funder} className={inputClass} /></label>
        <label className="flex flex-col gap-2"><span className={labelClass}>Country</span><select name="country" required defaultValue={scholarship?.country ?? ''} className={inputClass}><option value="" disabled>Select a country</option>{COUNTRIES.map((value) => <option key={value}>{value}</option>)}</select></label>
        <label className="flex flex-col gap-2"><span className={labelClass}>Field</span><select name="field" required defaultValue={scholarship?.field ?? ''} className={inputClass}><option value="" disabled>Select a field</option>{SCHOLARSHIP_FIELDS.map((value) => <option key={value}>{value}</option>)}</select></label>
        <label className="flex flex-col gap-2"><span className={labelClass}>Degree level</span><select name="degree_level" required defaultValue={scholarship?.degree_level ?? ''} className={inputClass}><option value="" disabled>Select a degree level</option>{DEGREE_LEVELS.map((value) => <option key={value}>{value}</option>)}</select></label>
        <label className="flex flex-col gap-2"><span className={labelClass}>Deadline (optional)</span><input type="date" name="deadline" defaultValue={scholarship?.deadline ?? ''} className={inputClass} /></label>
        <label className="col-span-2 flex flex-col gap-2 max-sm:col-span-1"><span className={labelClass}>Description</span><textarea name="description" defaultValue={scholarship?.description ?? ''} className={`${inputClass} min-h-24`} /></label>
        <label className="col-span-2 flex flex-col gap-2 max-sm:col-span-1"><span className={labelClass}>Eligibility</span><textarea name="eligibility" defaultValue={scholarship?.eligibility ?? ''} className={`${inputClass} min-h-24`} /></label>
        <label className="flex flex-col gap-2"><span className={labelClass}>Source name</span><input name="source_name" defaultValue={scholarship?.source_name ?? ''} className={inputClass} /></label>
        <label className="flex flex-col gap-2"><span className={labelClass}>Source link</span><input type="url" name="source_url" defaultValue={scholarship?.source_url ?? ''} placeholder="https://..." className={inputClass} /></label>
        <label className="flex flex-col gap-2"><span className={labelClass}>Last verified</span><input type="date" name="verified_at" defaultValue={scholarship?.verified_at?.slice(0, 10) ?? ''} className={inputClass} /></label>
        <label className="col-span-2 flex flex-col gap-2 max-sm:col-span-1"><span className={labelClass}>Apply link</span><input type="url" name="apply_url" required defaultValue={scholarship?.apply_url} placeholder="https://..." className={inputClass} /></label>
      </div>
      <label className="flex cursor-pointer items-center gap-3 text-[0.9rem]"><input type="checkbox" name="published" defaultChecked={scholarship?.published ?? true} className="size-4 accent-clay" />Visible on the public finder</label>
      <label className="flex cursor-pointer items-center gap-3 text-[0.9rem]"><input type="checkbox" name="featured" defaultChecked={scholarship?.featured ?? false} className="size-4 accent-clay" />Feature on the public finder</label>
      {state && !state.ok && <p role="alert" className="rounded-xl border border-[#e07a50] bg-[#fff0eb] px-4 py-3 text-[0.88rem] text-[#8b3a1a]">{state.message}</p>}
      {state?.ok && !editing && <p className="rounded-xl border border-moss/40 bg-moss/10 px-4 py-3 text-[0.88rem] text-moss">Scholarship added and live on the finder.</p>}
      <div className="flex gap-3"><button type="submit" disabled={pending} className="cursor-pointer rounded-full bg-clay px-7 py-3 font-bold text-white hover:bg-clay-dark disabled:cursor-not-allowed disabled:opacity-60">{pending ? 'Saving...' : editing ? 'Save changes' : 'Add scholarship'}</button>{onDone && <button type="button" onClick={onDone} className="cursor-pointer rounded-full border-[1.5px] border-line px-7 py-3 font-semibold text-muted hover:border-clay hover:text-clay">{editing ? 'Cancel' : 'Done'}</button>}</div>
    </form>
  )
}

export function AddScholarshipPanel() {
  const [open, setOpen] = useState(false)
  return <><button type="button" onClick={() => setOpen(true)} className="shrink-0 cursor-pointer rounded-full bg-clay px-7 py-3 font-bold text-white hover:bg-clay-dark">Add a scholarship</button><Modal open={open} onClose={() => setOpen(false)} title="New scholarship"><ScholarshipForm onDone={() => setOpen(false)} /></Modal></>
}

export function ScholarshipRowItem({ scholarship }: { scholarship: ScholarshipRow }) {
  const [editing, setEditing] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [rejecting, setRejecting] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function run(fn: () => Promise<ActionResult>) {
    setError(null)
    startTransition(async () => {
      const result = await fn()
      if (!result.ok) setError(result.message)
    })
  }

  if (editing) return <li className="rounded-2xl border border-clay/30 bg-white p-6 max-sm:p-4"><h3 className="mb-5 font-display text-lg font-semibold">Editing {scholarship.name}</h3><ScholarshipForm scholarship={scholarship} onDone={() => setEditing(false)} /></li>

  return <li className={`rounded-2xl border bg-white p-5 ${scholarship.published ? 'border-line' : 'border-dashed border-muted/40 opacity-70'} ${pending ? 'opacity-50' : ''}`}>
    <div className="flex items-start justify-between gap-4 max-sm:flex-col">
      <div className="min-w-0">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <span className="text-[0.85rem] font-bold text-clay">{scholarship.funder}</span>
          <span className="rounded-full bg-cream-deep px-2.5 py-0.5 text-[0.68rem] font-bold tracking-[0.06em] text-muted uppercase">{scholarship.field}</span>
          {!scholarship.published && <span className="rounded-full bg-ink/8 px-2.5 py-0.5 text-[0.68rem] font-bold tracking-[0.06em] text-muted uppercase">{scholarship.status === 'rejected' ? 'Rejected' : scholarship.status === 'pending' ? 'Pending review' : 'Hidden'}</span>}
          {scholarship.featured && <span className="rounded-full bg-moss/10 px-2.5 py-0.5 text-[0.68rem] font-bold text-moss uppercase">Featured</span>}
        </div>
        <h3 className="font-display text-[1.1rem] font-semibold">{scholarship.name}</h3>
        <p className="mt-1 text-[0.85rem] text-muted">{scholarship.country} · {scholarship.degree_level}{scholarship.deadline ? ` · Deadline ${formatDeadline(scholarship.deadline)}` : ' · Rolling deadline'}</p>
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        {!scholarship.published && <a href={`/scholarships/${scholarship.slug}?preview=1`} target="_blank" rel="noreferrer" className="rounded-full border-[1.5px] border-line px-4 py-2 text-[0.82rem] font-semibold text-muted no-underline hover:border-clay hover:text-clay">Preview</a>}
        <button type="button" disabled={pending} onClick={() => setEditing(true)} className="cursor-pointer rounded-full border-[1.5px] border-line px-4 py-2 text-[0.82rem] font-semibold text-muted hover:border-clay hover:text-clay disabled:cursor-not-allowed">Edit</button>
        <button type="button" disabled={pending} onClick={() => run(() => setScholarshipFeatured(scholarship.id, !scholarship.featured))} className="cursor-pointer rounded-full border-[1.5px] border-line px-4 py-2 text-[0.82rem] font-semibold text-muted hover:border-clay hover:text-clay disabled:cursor-not-allowed">{scholarship.featured ? 'Unfeature' : 'Feature'}</button>
        {!scholarship.published ? (
          <>
            <button type="button" disabled={pending} onClick={() => run(() => approveScholarship(scholarship.id))} className="cursor-pointer rounded-full bg-moss px-4 py-2 text-[0.82rem] font-bold text-white disabled:cursor-not-allowed">Approve</button>
            {rejecting ? (
              <span className="flex items-center gap-2 rounded-full border border-line bg-white px-2 py-1.5">
                <input
                  value={rejectReason}
                  onChange={(event) => setRejectReason(event.target.value)}
                  placeholder="Short reason"
                  className="w-36 rounded-full border border-line bg-cream px-3 py-1.5 text-[0.76rem] outline-none focus:border-clay"
                />
                <button
                  type="button"
                  disabled={pending || !rejectReason.trim()}
                  onClick={() => {
                    const reason = rejectReason.trim()
                    if (!reason) {
                      setError('Add a short reason before rejecting.')
                      return
                    }
                    run(() => rejectScholarship(scholarship.id, reason))
                    setRejecting(false)
                    setRejectReason('')
                  }}
                  className="cursor-pointer rounded-full bg-[#8b3a1a] px-3 py-1.5 text-[0.76rem] font-bold text-white disabled:cursor-not-allowed"
                >
                  Reject
                </button>
                <button type="button" onClick={() => { setRejecting(false); setRejectReason('') }} className="cursor-pointer text-[0.76rem] font-semibold text-muted hover:text-ink">Cancel</button>
              </span>
            ) : (
              <button type="button" disabled={pending} onClick={() => setRejecting(true)} className="cursor-pointer rounded-full border-[1.5px] border-[#e07a50]/50 px-4 py-2 text-[0.82rem] font-semibold text-[#8b3a1a] hover:border-[#8b3a1a] disabled:cursor-not-allowed">Reject</button>
            )}
          </>
        ) : (
          <button type="button" disabled={pending} onClick={() => run(() => setScholarshipPublished(scholarship.id, !scholarship.published))} className="cursor-pointer rounded-full border-[1.5px] border-line px-4 py-2 text-[0.82rem] font-semibold text-muted hover:border-clay hover:text-clay disabled:cursor-not-allowed">Hide</button>
        )}
        {!scholarship.archived_at && <button type="button" disabled={pending} onClick={() => run(() => archiveScholarship(scholarship.id))} className="cursor-pointer rounded-full border-[1.5px] border-line px-4 py-2 text-[0.82rem] font-semibold text-muted hover:border-clay hover:text-clay disabled:cursor-not-allowed">Archive</button>}
        {confirming ? <span className="flex items-center gap-2"><button type="button" disabled={pending} onClick={() => run(() => deleteScholarship(scholarship.id))} className="cursor-pointer rounded-full bg-[#8b3a1a] px-4 py-2 text-[0.82rem] font-bold text-white disabled:cursor-not-allowed">Delete for good</button><button type="button" onClick={() => setConfirming(false)} className="cursor-pointer text-[0.82rem] font-semibold text-muted hover:text-ink">Cancel</button></span> : <button type="button" disabled={pending} onClick={() => setConfirming(true)} className="cursor-pointer rounded-full border-[1.5px] border-[#e07a50]/50 px-4 py-2 text-[0.82rem] font-semibold text-[#8b3a1a] hover:border-[#8b3a1a] disabled:cursor-not-allowed">Delete</button>}
      </div>
    </div>
    {error && <p role="alert" className="mt-3 text-[0.85rem] font-semibold text-[#8b3a1a]">{error}</p>}
  </li>
}
