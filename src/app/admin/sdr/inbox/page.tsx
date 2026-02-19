export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { requireAdmin, getAllWorkspaces } from '@/lib/auth/admin'
import { InboxClient } from './InboxClient'

export default async function SdrInboxPage() {
  try {
    await requireAdmin()
  } catch {
    redirect('/dashboard?error=admin_required')
  }

  const result = await getAllWorkspaces({ limit: 200 })

  return <InboxClient workspaces={result.workspaces || []} />
}
