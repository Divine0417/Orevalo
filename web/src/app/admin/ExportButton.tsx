'use client'

import { useState } from 'react'

/**
 * Copies the subscriber list to the clipboard.
 *
 * Copy rather than a CSV download: the list is going straight into the "BCC"
 * field of an email while Phase 0 curation is still manual, and a downloaded
 * file would just be opened and re-copied.
 */
export default function ExportButton({ rows }: { rows: string[] }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(rows.join(', '))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard needs a secure context; fall back to a prompt the user can
      // copy from manually rather than failing silently.
      window.prompt('Copy the subscriber list:', rows.join(', '))
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="cursor-pointer rounded-full border-[1.5px] border-line bg-white px-5 py-2.5 text-[0.88rem] font-semibold text-muted transition-colors hover:border-clay hover:text-clay"
    >
      {copied ? 'Copied' : `Copy ${rows.length} ${rows.length === 1 ? 'email' : 'emails'}`}
    </button>
  )
}
