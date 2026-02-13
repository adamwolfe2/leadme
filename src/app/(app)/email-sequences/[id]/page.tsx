/**
 * Email Sequence Detail Page
 * View and edit sequence with steps
 */

import { Suspense } from 'react'
import { SequenceBuilder } from '@/components/email-sequences/sequence-builder'

export default async function EmailSequenceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <div className="container mx-auto py-8">
      <Suspense fallback={<div>Loading sequence...</div>}>
        <SequenceBuilder sequenceId={id} />
      </Suspense>
    </div>
  )
}
