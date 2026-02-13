/**
 * Email Sequences Page
 * List and manage automated email sequences
 */

import { Suspense } from 'react'
import { EmailSequencesList } from '@/components/email-sequences/email-sequences-list'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export default function EmailSequencesPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Email Sequences</h1>
          <p className="text-muted-foreground mt-2">
            Create automated email sequences to nurture leads
          </p>
        </div>
        <Button asChild>
          <Link href="/email-sequences/new">
            <Plus className="mr-2 h-4 w-4" />
            New Sequence
          </Link>
        </Button>
      </div>

      <Suspense fallback={<div>Loading sequences...</div>}>
        <EmailSequencesList />
      </Suspense>
    </div>
  )
}
