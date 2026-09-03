import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { safeNext } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')
  const next = safeNext(request.nextUrl.searchParams.get('next') ?? '/account')

  if (!code) return NextResponse.redirect(new URL('/login?error=oauth', request.url))

  const supabase = await createClient()
  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !data.user || !data.user.email_confirmed_at) {
    await supabase.auth.signOut()
    return NextResponse.redirect(new URL('/login?error=unconfirmed', request.url))
  }

  return NextResponse.redirect(new URL(next, request.url))
}