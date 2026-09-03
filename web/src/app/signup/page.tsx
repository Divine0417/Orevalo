import type { Metadata } from 'next'
import Link from 'next/link'
import SignupForm from './SignupForm'
import AuthShell from '@/components/AuthShell'

export const metadata: Metadata = {
  title: 'Create an account',
  robots: { index: false, follow: true },
}

export default function SignupPage() {
  return (
    <AuthShell
      title="Create your account"
      subtitle="Save opportunities you want to come back to, and get them matched to you as Orevalo grows."
      footer={
        <>
          Already have one?{' '}
          <Link href="/login" className="font-semibold text-clay no-underline">
            Sign in
          </Link>
        </>
      }
    >
      <SignupForm />
    </AuthShell>
  )
}
