import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'

/**
 * Fonts are self-hosted from src/fonts rather than fetched through
 * next/font/google.
 *
 * next/font/google downloads at BUILD time, which makes every build — and every
 * dev server start — depend on reaching fonts.googleapis.com. When that request
 * times out the build still succeeds but silently falls back to system fonts,
 * so the site ships looking wrong with only a warning in the log. Committing the
 * woff2 files removes the network from the equation entirely.
 *
 * Both are variable fonts, so one file covers the whole weight range instead of
 * one file per weight. latin-ext is included so accented names render properly.
 */
const jakarta = localFont({
  src: [
    { path: '../fonts/PlusJakartaSans-latin.woff2', style: 'normal' },
    { path: '../fonts/PlusJakartaSans-latin-ext.woff2', style: 'normal' },
  ],
  weight: '400 700',
  variable: '--font-jakarta',
  display: 'swap',
  fallback: ['system-ui', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
})

const fraunces = localFont({
  src: [
    { path: '../fonts/Fraunces-latin.woff2', style: 'normal' },
    { path: '../fonts/Fraunces-latin-ext.woff2', style: 'normal' },
    { path: '../fonts/Fraunces-Italic-latin.woff2', style: 'italic' },
    { path: '../fonts/Fraunces-Italic-latin-ext.woff2', style: 'italic' },
  ],
  weight: '400 700',
  variable: '--font-fraunces',
  display: 'swap',
  fallback: ['Georgia', 'Times New Roman', 'serif'],
})

export const metadata: Metadata = {
  metadataBase: new URL('https://orevalo.com'),
  title: {
    default: "Orevalo — Africa's AI Education & Career Platform",
    template: '%s — Orevalo',
  },
  description:
    'Orevalo brings AI tutoring, scholarship discovery, CV building and career guidance together for African university students.',
  openGraph: {
    title: "Orevalo — Africa's AI Education & Career Platform",
    description:
      'Internships, scholarships and career tools built for African university students.',
    url: 'https://orevalo.com',
    siteName: 'Orevalo',
    type: 'website',
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/favicon-192.png',
  },
}

export const viewport = {
  themeColor: '#2C1A0E',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${jakarta.variable} ${fraunces.variable}`}>
      <body>{children}</body>
    </html>
  )
}
