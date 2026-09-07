import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { safeNext } from '@/lib/auth'
import { isMailerConfigured, sendWelcomeEmail } from '@/lib/email'

export async function GET(request: NextRequest) {
    const code = request.nextUrl.searchParams.get('code')
    const next = safeNext(request.nextUrl.searchParams.get('next') ?? '/account')
    const sendWelcome = request.nextUrl.searchParams.get('welcome') === '1'

    if (!code) return NextResponse.redirect(new URL('/login?error=oauth', request.url))

    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error || !data.user || !data.user.email_confirmed_at) {
        await supabase.auth.signOut()
        return NextResponse.redirect(new URL('/login?error=unconfirmed', request.url))
    }

    if (isMailerConfigured && (sendWelcome || data.user.app_metadata?.provider === 'google') && !data.user.user_metadata?.welcome_email_sent_at) {
        const fullName = String(data.user.user_metadata?.full_name ?? data.user.user_metadata?.name ?? '')
        const sent = await sendWelcomeEmail({
            to: data.user.email ?? '',
            firstName: fullName.split(/\s+/)[0] ?? 'there',
        })
        if (sent) await supabase.auth.updateUser({ data: { welcome_email_sent_at: new Date().toISOString() } })
    }

    return NextResponse.redirect(new URL(next, request.url))
}