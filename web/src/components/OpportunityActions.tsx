'use client'

import { useEffect, useState } from 'react'
import { ArrowRight } from './icons'

type Props = {
  kind: 'listing' | 'scholarship'
  opportunityId: string
  applyUrl: string
}

export default function OpportunityActions({ kind, opportunityId, applyUrl }: Props) {
  const [reporting, setReporting] = useState(false)
  const [reason, setReason] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    void fetch('/api/opportunity-events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind, opportunityId, event: 'view' }),
    })
  }, [kind, opportunityId])

  async function report(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const response = await fetch('/api/opportunity-reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind, opportunityId, reason }),
    })
    setMessage(response.ok ? 'Thanks. We will review this information.' : 'We could not send that report.')
    if (response.ok) setReason('')
  }

  function apply() {
    void fetch('/api/opportunity-events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind, opportunityId, event: 'apply_click' }),
      keepalive: true,
    })
  }

  return <div className="mt-10 flex flex-col gap-5">
    <a href={applyUrl} target="_blank" rel="noreferrer" onClick={apply} className="inline-flex w-fit items-center gap-2.5 rounded-full bg-clay px-7 py-3.5 font-bold text-white no-underline hover:bg-clay-dark">
      Apply now <ArrowRight />
    </a>
    <div>
      <button type="button" onClick={() => setReporting((value) => !value)} className="text-sm font-semibold text-muted hover:text-clay">Report incorrect information</button>
      {reporting && <form onSubmit={report} className="mt-3 flex max-w-[520px] flex-col gap-3">
        <textarea required value={reason} onChange={(event) => setReason(event.target.value)} maxLength={1000} placeholder="What should we check?" className="min-h-24 rounded-xl border border-line bg-white px-4 py-3 text-sm" />
        <button type="submit" className="w-fit rounded-full border border-line px-5 py-2 text-sm font-semibold text-muted hover:border-clay hover:text-clay">Send report</button>
        {message && <p className="text-sm text-muted">{message}</p>}
      </form>}
    </div>
  </div>
}
