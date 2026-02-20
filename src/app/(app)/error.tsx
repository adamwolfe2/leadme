'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { AlertTriangle, Home, RefreshCw } from 'lucide-react'
import { safeError } from '@/lib/utils/log-sanitizer'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to monitoring service
    safeError('[AppError]', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-lg w-full p-6 sm:p-8">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-6">
            <AlertTriangle className="h-8 w-8" />
          </div>

          <h1 className="text-2xl font-semibold text-foreground mb-2">
            Something went wrong
          </h1>

          <p className="text-sm text-muted-foreground mb-6 max-w-md">
            We encountered an unexpected error. Your data is safe. Please try refreshing the page or return to the dashboard.
          </p>

          {error.digest && (
            <div className="bg-muted px-4 py-2 rounded-lg mb-6 w-full">
              <p className="text-xs text-muted-foreground font-mono">
                Error ID: {error.digest}
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Button onClick={reset} className="w-full sm:w-auto">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full">
                <Home className="h-4 w-4 mr-2" />
                Go to Dashboard
              </Button>
            </Link>
          </div>

          <p className="text-xs text-muted-foreground mt-6">
            If this problem persists, please contact support
          </p>
        </div>
      </Card>
    </div>
  )
}
