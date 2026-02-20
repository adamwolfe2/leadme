import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign Up | Cursive',
  description: 'Create your free Cursive account and start receiving verified, high-intent business leads today.',
  openGraph: {
    title: 'Sign Up for Cursive',
    description: 'Create your free account and start receiving verified business leads.',
    url: 'https://leads.meetcursive.com/signup',
    siteName: 'Cursive',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sign Up for Cursive',
    description: 'Create your free account and start receiving verified business leads.',
  },
}

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
