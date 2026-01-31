'use client'

import { ReactNode } from 'react'
import { useSearchParams } from 'next/navigation'
import { ChatPanel } from './chat-panel'

interface StudioLayoutProps {
  children: ReactNode
}

export function StudioLayout({ children }: StudioLayoutProps) {
  const searchParams = useSearchParams()
  const workspaceId = searchParams.get('workspace')

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-6">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>

      {/* Chat Panel - Fixed on right side */}
      <div className="w-96 flex-shrink-0">
        <div className="sticky top-0 h-[calc(100vh-6rem)]">
          <ChatPanel workspaceId={workspaceId || undefined} />
        </div>
      </div>
    </div>
  )
}
