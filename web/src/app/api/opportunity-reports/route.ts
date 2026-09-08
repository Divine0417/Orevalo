import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const reason = typeof body?.reason === 'string' ? body.reason.trim() : ''
  if (!body || !['listing', 'scholarship'].includes(body.kind) || !reason || reason.length > 1000) {
    return NextResponse.json({ error: 'Invalid report' }, { status: 400 })
  }
  if (!/^[0-9a-f-]{36}$/i.test(String(body.opportunityId))) {
    return NextResponse.json({ error: 'Invalid opportunity' }, { status: 400 })
  }

  const supabase = await createClient()
  const { error } = await supabase.from('opportunity_reports').insert({
    kind: body.kind,
    opportunity_id: body.opportunityId,
    reason,
    reporter_email: typeof body.email === 'string' ? body.email.slice(0, 200) : null,
  })
  if (error) return NextResponse.json({ error: 'Could not submit report' }, { status: 500 })
  return NextResponse.json({ ok: true })
}