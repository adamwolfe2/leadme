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
  if (score >= 70) return 'text-emerald-700'
  if (score >= 40) return 'text-amber-600'
  return 'text-slate-600'
}

function getScoreBgColor(score: number | null): string {
  if (score === null) return 'bg-gray-400'
  if (score >= 70) return 'bg-emerald-600'
  if (score >= 40) return 'bg-amber-500'
  return 'bg-slate-400'
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
