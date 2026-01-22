// New Query Page

import { getCurrentUser } from '@/lib/auth/helpers'
import { redirect } from 'next/navigation'
import { QueryWizard } from '@/components/queries/query-wizard'

export default async function NewQueryPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  return <QueryWizard />
}
