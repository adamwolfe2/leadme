'use client'

import * as React from 'react'
import { cn } from '@/lib/design-system'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
}

function Skeleton({
  className,
  variant = 'default',
  width,
  height,
  style,
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse bg-muted',
        variant === 'default' && 'rounded-md',
        variant === 'circular' && 'rounded-full',
        variant === 'rectangular' && 'rounded-none',
        className
      )}
      style={{
        width: width,
        height: height,
        ...style,
      }}
      {...props}
    />
  )
}

function SkeletonText({
  lines = 3,
  className,
}: {
  lines?: number
  className?: string
}) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            'h-4',
            i === lines - 1 && 'w-4/5'
          )}
        />
      ))}
    </div>
  )
}

function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-card p-6 space-y-4',
        className
      )}
    >
      <Skeleton className="h-5 w-1/3" />
      <SkeletonText lines={2} />
    </div>
  )
}

function SkeletonTable({
  rows = 5,
  columns = 4,
  className,
}: {
  rows?: number
  columns?: number
  className?: string
}) {
  return (
    <div className={cn('rounded-lg border border-border overflow-hidden', className)}>
      {/* Header */}
      <div className="bg-muted/50 border-b border-border p-4 flex gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* Body */}
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="p-4 flex gap-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton key={colIndex} className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function SkeletonAvatar({
  size = 'default',
  className,
}: {
  size?: 'sm' | 'default' | 'lg'
  className?: string
}) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    default: 'h-10 w-10',
    lg: 'h-12 w-12',
  }

  return (
    <Skeleton
      variant="circular"
      className={cn(sizeClasses[size], className)}
    />
  )
}

function SkeletonStatCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-card p-5',
        className
      )}
    >
      <Skeleton className="h-4 w-1/2 mb-2" />
      <Skeleton className="h-8 w-1/3" />
      <div className="flex items-center gap-2 mt-3">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  )
}

function SkeletonLeadCard({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-lg border border-border p-4 space-y-3', className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-1/3" />
          <div className="flex gap-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-12" />
          </div>
        </div>
      </div>
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-3/4" />
      <div className="pt-2 border-t">
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  )
}

function SkeletonLeadsTable({ rows = 10 }: { rows?: number }) {
  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block">
        <SkeletonTable rows={rows} columns={6} />
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonLeadCard key={i} />
        ))}
      </div>
    </>
  )
}

function SkeletonMarketplace() {
  return (
    <div className="space-y-6">
      {/* Filter section */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-full sm:w-[200px]" />
        <Skeleton className="h-10 w-full sm:w-[200px]" />
      </div>

      {/* Cards grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border p-6 space-y-4">
            <div className="flex items-start justify-between">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-5 w-16" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
            </div>
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

export {
  Skeleton,
  SkeletonText,
  SkeletonCard,
  SkeletonTable,
  SkeletonAvatar,
  SkeletonStatCard,
  SkeletonLeadCard,
  SkeletonLeadsTable,
  SkeletonMarketplace,
}
