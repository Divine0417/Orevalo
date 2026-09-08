import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  if (!body || !['listing', 'scholarship'].includes(body.kind) || !['view', 'apply_click'].includes(body.event)) {
    return NextResponse.json({ error: 'Invalid event' }, { status: 400 })
  }
  if (!/^[0-9a-f-]{36}$/i.test(String(body.opportunityId))) {
    return NextResponse.json({ error: 'Invalid opportunity' }, { status: 400 })
  }

  const supabase = await createClient()
  const { error } = await supabase.from('opportunity_events').insert({
    kind: body.kind,
    opportunity_id: body.opportunityId,
    event: body.event,
    session_key: typeof body.sessionKey === 'string' ? body.sessionKey.slice(0, 120) : null,
  })
  if (error) return NextResponse.json({ error: 'Could not record event' }, { status: 500 })
  return NextResponse.json({ ok: true })
}