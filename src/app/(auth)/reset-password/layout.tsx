import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Reset Password | Cursive',
  description: 'Set a new password for your Cursive account.',
  openGraph: {
    title: 'Reset Password | Cursive',
    description: 'Set a new password for your Cursive account.',
    url: 'https://leads.meetcursive.com/reset-password',
    siteName: 'Cursive',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Reset Password | Cursive',
    description: 'Set a new password for your Cursive account.',
  },
}

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
