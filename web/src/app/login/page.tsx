import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import LoginForm from './LoginForm'
import AuthShell from '@/components/AuthShell'

export const metadata: Metadata = {
  title: 'Sign in',
  robots: { index: false, follow: true },
}

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to see the opportunities you saved."
      footer={
        <>
          New here?{' '}
          <Link href="/signup" className="font-semibold text-clay no-underline">
            Create an account
          </Link>
        </>
      }
    >
      <Suspense fallback={<div className="h-[280px]" />}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  )
}
