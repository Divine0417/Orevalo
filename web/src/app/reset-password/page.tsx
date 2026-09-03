import type { Metadata } from 'next'
import Link from 'next/link'
import ResetPasswordForm from './ResetPasswordForm'
import AuthShell from '@/components/AuthShell'

export const metadata: Metadata = {
  title: 'Set a new password',
  robots: { index: false, follow: false },
}

export default function ResetPasswordPage() {
  return (
    <AuthShell
      title="Set a new password"
      subtitle="Choose a new password for your Orevalo account."
      footer={
        <>
          Remembered it?{' '}
          <Link href="/login" className="font-semibold text-clay no-underline">
            Back to sign in
          </Link>
        </>
      }
    >
      <ResetPasswordForm />
    </AuthShell>
  )
}
