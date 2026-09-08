'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import Modal from './Modal'
import { createListing, updateListing, type ActionResult } from './actions'
import { FIELDS, LOCATIONS, type Listing } from '@/lib/listings'
import type { ListingRow } from '@/lib/supabase/types'

const inputClass =
  'w-full rounded-xl border-[1.5px] border-line bg-cream px-4 py-3 text-[0.95rem] outline-none focus-visible:border-clay focus-visible:bg-white'

const labelClass = 'text-[0.75rem] font-bold tracking-[0.08em] text-muted uppercase'

/**
 * Create/edit form for a listing.
 *
 * One component for both modes so the field list, validation messages and
 * layout cannot drift apart between "add" and "edit".
 */
export default function ListingForm({
  listing,
  onDone,
}: {
  listing?: ListingRow
  onDone?: () => void
}) {
  const editing = Boolean(listing)
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    editing ? updateListing : createListing,
    null,
  )
  const formRef = useRef<HTMLFormElement>(null)
  const firstFieldRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!state?.ok) return

    if (editing) {
      onDone?.()
      return
    }

    // Creating: clear the fields but stay put. Getting to the Phase 1 target of
    // 50 listings means adding many in a row, and reopening the dialog each
    // time would be the slowest part of the job.
    formRef.current?.reset()
    firstFieldRef.current?.focus()
  }, [state, editing, onDone])

  return (
    <form ref={formRef} action={action} className="flex flex-col gap-4">
      {listing && <input type="hidden" name="id" value={listing.id} />}

      <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
        <label className="flex flex-col gap-2">
          <span className={labelClass}>Company</span>
          <input
            ref={firstFieldRef}
            name="company"
            required
            defaultValue={listing?.company}
            placeholder="e.g. Flutterwave"
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className={labelClass}>Role title</span>
          <input
            name="title"
            required
            defaultValue={listing?.title}
            placeholder="e.g. Software Engineering Intern"
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className={labelClass}>Field</span>
          <select name="field" required defaultValue={listing?.field ?? ''} className={inputClass}>
            <option value="" disabled>
              Select a field
            </option>
            {FIELDS.map((f) => (
              <option key={f}>{f}</option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2">
          <span className={labelClass}>Location</span>
          <select
            name="location"
            required
            defaultValue={listing?.location ?? ''}
            className={inputClass}
          >
            <option value="" disabled>
              Select a location
            </option>
            {LOCATIONS.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2">
          <span className={labelClass}>Deadline</span>
          <input
            type="date"
            name="deadline"
            required
            defaultValue={listing?.deadline}
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className={labelClass}>Apply link</span>
          <input
            type="url"
            name="apply_url"
            required
            defaultValue={listing?.apply_url}
            placeholder="https://..."
            className={inputClass}
          />
        </label>
      </div>

      <label className="flex flex-col gap-2"><span className={labelClass}>Description</span><textarea name="description" defaultValue={listing?.description ?? ''} className={`${inputClass} min-h-24`} /></label>
      <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
        <label className="flex flex-col gap-2"><span className={labelClass}>Source name</span><input name="source_name" defaultValue={listing?.source_name ?? ''} placeholder="Company careers page" className={inputClass} /></label>
        <label className="flex flex-col gap-2"><span className={labelClass}>Source link</span><input type="url" name="source_url" defaultValue={listing?.source_url ?? ''} placeholder="https://..." className={inputClass} /></label>
        <label className="flex flex-col gap-2"><span className={labelClass}>Last verified</span><input type="date" name="verified_at" defaultValue={listing?.verified_at?.slice(0, 10) ?? ''} className={inputClass} /></label>
      </div>

      <label className="flex cursor-pointer items-center gap-3 text-[0.9rem]">
        <input
          type="checkbox"
          name="published"
          defaultChecked={listing?.published ?? true}
          className="size-4 accent-clay"
        />
        Visible on the public board
      </label>
      <label className="flex cursor-pointer items-center gap-3 text-[0.9rem]"><input type="checkbox" name="featured" defaultChecked={listing?.featured ?? false} className="size-4 accent-clay" />Feature on the public board</label>

      {state && !state.ok && (
        <p
          role="alert"
          className="rounded-xl border border-[#e07a50] bg-[#fff0eb] px-4 py-3 text-[0.88rem] text-[#8b3a1a]"
        >
          {state.message}
        </p>
      )}

      {state?.ok && !editing && (
        <p className="rounded-xl border border-moss/40 bg-moss/10 px-4 py-3 text-[0.88rem] text-moss">
          Listing added and live on the board.
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="cursor-pointer rounded-full bg-clay px-7 py-3 font-bold text-white transition-colors hover:bg-clay-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? 'Saving...' : editing ? 'Save changes' : 'Add listing'}
        </button>
        {onDone && (
          <button
            type="button"
            onClick={onDone}
            className="cursor-pointer rounded-full border-[1.5px] border-line px-7 py-3 font-semibold text-muted transition-colors hover:border-clay hover:text-clay"
          >
            {editing ? 'Cancel' : 'Done'}
          </button>
        )}
      </div>
    </form>
  )
}

/**
 * Trigger + dialog.
 *
 * The button stays in the page header where it belongs; the form opens over the
 * page instead of replacing the button inside a flex row, which left it
 * squeezed into a narrow column beside the heading.
 */
export function AddListingPanel() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="shrink-0 cursor-pointer rounded-full bg-clay px-7 py-3 font-bold text-white transition-colors hover:bg-clay-dark"
      >
        Add a listing
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="New listing">
        <ListingForm onDone={() => setOpen(false)} />
      </Modal>
    </>
  )
}

export type { Listing }
