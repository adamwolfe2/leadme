import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/helpers'
import UsageClient from './UsageClient'

export const metadata: Metadata = { title: 'Credit Usage History | Cursive' }

export default async function UsagePage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  return <UsageClient />
}
