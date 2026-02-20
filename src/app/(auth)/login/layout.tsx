import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Log In | Cursive',
  description: 'Log in to your Cursive account to manage leads, track purchases, and grow your business.',
  openGraph: {
    title: 'Log In | Cursive',
    description: 'Log in to your Cursive account to manage leads and grow your business.',
    url: 'https://leads.meetcursive.com/login',
    siteName: 'Cursive',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Log In | Cursive',
    description: 'Log in to your Cursive account to manage leads and grow your business.',
  },
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
