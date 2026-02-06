import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Popup Test | Cursive (Internal)',
  robots: {
    index: false,
    follow: false,
  },
}

export default function PopupTestLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
