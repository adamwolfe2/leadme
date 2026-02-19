export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { requireAdmin, getAllWorkspaces } from '@/lib/auth/admin'
import { DncClient } from './DncClient'

export default async function DncPage() {
  try {
    await requireAdmin()
  } catch {
    redirect('/dashboard?error=admin_required')
  }

  const result = await getAllWorkspaces({ limit: 200 })

  return <DncClient workspaces={result.workspaces || []} />
}
