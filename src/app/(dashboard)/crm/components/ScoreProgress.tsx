// Score Progress Bar Component
// Displays intent/freshness scores with visual progress indicator (Twenty-style)

'use client'

import { cn } from '@/lib/utils'

interface ScoreProgressProps {
  score: number | null
  className?: string
  showBar?: boolean
}

function getScoreColor(score: number | null): string {
  if (score === null) return 'text-gray-400'
  if (score >= 70) return 'text-green-600 dark:text-green-400'
  if (score >= 40) return 'text-yellow-600 dark:text-yellow-400'
  return 'text-red-600 dark:text-red-400'
}

function getScoreBgColor(score: number | null): string {
  if (score === null) return 'bg-gray-400'
  if (score >= 70) return 'bg-green-600 dark:bg-green-400'
  if (score >= 40) return 'bg-yellow-600 dark:bg-yellow-400'
  return 'bg-red-600 dark:bg-red-400'
}

export function ScoreProgress({ score, className, showBar = true }: ScoreProgressProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {showBar && (
        <div className="w-10 h-1 bg-muted rounded-full overflow-hidden">
          <div
            className={cn('h-full transition-all duration-300', getScoreBgColor(score))}
            style={{ width: score !== null ? `${score}%` : '0%' }}
          />
        </div>
      )}
      <span className={cn('text-xs font-normal tabular-nums', getScoreColor(score))}>
        {score !== null ? score : '-'}
      </span>
    </div>
  )
}
