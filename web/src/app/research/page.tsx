import type { Metadata } from 'next'
import Link from 'next/link'
import ResearchSurveyForm from '@/components/ResearchSurveyForm'
import { ArrowLeft, GlobeAfrica } from '@/components/icons'

export const metadata: Metadata = {
  title: 'Student Research',
  description:
    'Five minutes of your honest answers shape what Orevalo builds for African students.',
}

export default function ResearchPage() {
  return (
    <div className="min-h-screen bg-cream px-5 py-10 max-sm:px-4">
      <div className="mx-auto max-w-[680px]">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-[7px] text-[0.85rem] font-semibold text-muted no-underline transition-colors hover:text-clay"
        >
          <ArrowLeft /> Back to home
        </Link>

        <header className="mb-12 text-center">
          <p className="mb-4 font-display text-[2rem] font-semibold">
            <span className="text-clay">Ore</span>valo
          </p>
          <p className="mb-5 inline-flex items-center gap-2 rounded-full bg-moss/10 px-4 py-1.5 text-[0.75rem] font-semibold tracking-[0.08em] text-moss uppercase">
            <GlobeAfrica /> Student Research — 5 mins
          </p>
          <h1 className="mb-3 font-display text-[1.8rem] leading-[1.3] font-semibold tracking-[-0.02em]">
            Help us build the platform African students actually need
          </h1>
          <p className="mx-auto max-w-[500px] leading-[1.6] text-muted">
            We want to hear directly from you. Your honest answers shape everything we build. There
            are no right or wrong answers.
          </p>
        </header>

        <ResearchSurveyForm />

        <p className="mt-6 text-center text-[0.8rem] leading-[1.6] text-muted">
          Your responses go directly to the Orevalo team.
          <br />
          We read every single one. Built with purpose by{' '}
          <strong className="text-clay">Orevalo</strong>.
        </p>
      </div>
    </div>
  )
}
