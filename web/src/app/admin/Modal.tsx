'use client'

import { useEffect, useRef } from 'react'
import { Close } from '@/components/icons'

/**
 * Modal built on the native <dialog>.
 *
 * `showModal()` gives focus trapping, Escape-to-close, inert background content
 * and top-layer stacking with no z-index fights — all things a hand-rolled
 * overlay has to reimplement badly.
 *
 * Exists because the add forms previously rendered in place of their trigger
 * button, which sat in a flex header row: the form was squeezed into a narrow
 * column beside the page title.
 */
export default function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    // Guard both ways: calling showModal on an open dialog throws.
    if (open && !el.open) el.showModal()
    if (!open && el.open) el.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      // A click landing on the dialog element itself is a backdrop click; the
      // panel inside stops propagation, so this cannot fire from within.
      onClick={(e) => {
        if (e.target === ref.current) onClose()
      }}
      className="m-auto w-[min(680px,92vw)] rounded-3xl border-0 bg-transparent p-0 backdrop:bg-ink/60 backdrop:backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[86vh] overflow-y-auto rounded-3xl bg-white p-8 text-ink max-sm:p-5"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <h2 className="font-display text-2xl font-semibold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full border-[1.5px] border-line text-muted transition-colors hover:border-clay hover:text-clay"
          >
            <Close size="1.1em" />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  )
}
