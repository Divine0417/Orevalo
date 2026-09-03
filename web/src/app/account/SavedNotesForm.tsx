'use client'

import { useState, useTransition } from 'react'
import { updateSavedNotes } from '../auth-actions'

export default function SavedNotesForm({ id, initialNotes }: { id: string; initialNotes: string | null }) {
  const [notes, setNotes] = useState(initialNotes ?? '')
  const [editing, setEditing] = useState(!initialNotes)
  const [error, setError] = useState('')
  const [pending, startTransition] = useTransition()

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!editing) {
      setError('')
      setEditing(true)
      return
    }

    setError('')
    startTransition(async () => {
      const result = await updateSavedNotes(id, notes)
      if (result.ok) {
        setNotes(notes.trim())
        setEditing(false)
      } else {
        setError(result.message)
      }
    })
  }

  return (
    <form onSubmit={submit} className="mt-4 border-t border-line pt-4">
      <label className="flex flex-col gap-1.5">
        <span className="text-[0.68rem] font-bold tracking-[0.08em] text-muted uppercase">Private notes</span>
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          disabled={!editing || pending}
          maxLength={2000}
          placeholder="Add a reminder, contact, or next step..."
          rows={2}
          className="w-full resize-y rounded-xl border-[1.5px] border-line bg-cream px-3.5 py-2.5 text-[0.84rem] text-ink outline-none focus-visible:border-clay"
        />
      </label>
      <div className="mt-2 flex items-center justify-between gap-3">
        <span className="text-[0.72rem] text-muted">{notes.length}/2000</span>
        <button type="submit" disabled={pending} className="cursor-pointer rounded-full border-[1.5px] border-clay px-4 py-2 text-[0.78rem] font-bold text-clay hover:bg-clay hover:text-white disabled:opacity-60">
          {pending ? 'Saving...' : editing ? 'Save note' : 'Edit note'}
        </button>
      </div>
      {error && <p role="alert" className="mt-2 text-[0.75rem] text-[#8b3a1a]">{error}</p>}
    </form>
  )
}