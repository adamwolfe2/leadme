import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Forgot Password | Cursive',
  description: 'Reset your Cursive account password. Enter your email to receive a password reset link.',
  openGraph: {
    title: 'Forgot Password | Cursive',
    description: 'Reset your Cursive account password.',
    url: 'https://leads.meetcursive.com/forgot-password',
    siteName: 'Cursive',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Forgot Password | Cursive',
    description: 'Reset your Cursive account password.',
  },
}

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
