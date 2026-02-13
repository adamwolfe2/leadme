/**
 * Create New Email Sequence Page
 */

import { CreateSequenceForm } from '@/components/email-sequences/create-sequence-form'

export default function NewEmailSequencePage() {
  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create Email Sequence</h1>
        <p className="text-muted-foreground mt-2">
          Set up an automated email sequence to nurture your leads
        </p>
      </div>

      <CreateSequenceForm />
    </div>
  )
}
