'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

type Transaction = {
  id: string
  date: string
  description: string
  credits_in: number
  credits_out: number
  balance: number
  type: 'purchase' | 'usage'
}

type HistoryResponse = {
  transactions: Transaction[]
  total: number
  offset: number
  limit: number
  summary: {
    totalIn: number
    totalOut: number
    currentBalance: number
  }
}

const DATE_RANGE_OPTIONS = [
  { label: 'Last 30 days', value: 30 },
  { label: 'Last 90 days', value: 90 },
  { label: 'Last 365 days', value: 365 },
  { label: 'All time', value: 0 },
]

const PAGE_SIZE = 50

export default function UsageClient() {
  const [days, setDays] = useState(30)
  const [offset, setOffset] = useState(0)

  const { data, isLoading, isError } = useQuery<HistoryResponse>({
    queryKey: ['credit-history', days, offset],
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: String(PAGE_SIZE),
        offset: String(offset),
        days: String(days),
      })
      const response = await fetch(`/api/marketplace/credits/history?${params}`)
      if (!response.ok) throw new Error('Failed to fetch credit history')
      return response.json()
    },
  })

  const handleExportCSV = useCallback(async () => {
    // Fetch all transactions for the selected range (no pagination)
    const params = new URLSearchParams({
      limit: '100',
      offset: '0',
      days: String(days),
    })
    const response = await fetch(`/api/marketplace/credits/history?${params}`)
    if (!response.ok) return
    const result: HistoryResponse = await response.json()

    const rows = [
      ['Date', 'Description', 'Credits In', 'Credits Out', 'Balance', 'Type'],
      ...result.transactions.map((t) => [
        new Date(t.date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        }),
        t.description,
        t.credits_in > 0 ? String(t.credits_in) : '',
        t.credits_out > 0 ? String(t.credits_out) : '',
        String(t.balance),
        t.type,
      ]),
    ]

    const csv = rows.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `cursive-credit-history-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [days])

  const handleDaysChange = (newDays: number) => {
    setDays(newDays)
    setOffset(0)
  }

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 0
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1

  return (
    <div className="space-y-6">
      {/* Back link + header */}
      <div className="flex items-center gap-3">
        <Link
          href="/settings/billing"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Billing
        </Link>
      </div>

      {/* Summary cards */}
      {isLoading ? (
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-20 rounded-lg" />
          <Skeleton className="h-20 rounded-lg" />
          <Skeleton className="h-20 rounded-lg" />
        </div>
      ) : data?.summary ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-5 pb-4">
              <p className="text-xs text-muted-foreground mb-1">Current Balance</p>
              <p className="text-2xl font-bold text-foreground">
                {data.summary.currentBalance.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">marketplace credits</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-4">
              <p className="text-xs text-muted-foreground mb-1">Total Purchased</p>
              <p className="text-2xl font-bold text-green-600">
                +{data.summary.totalIn.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">all time</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-4">
              <p className="text-xs text-muted-foreground mb-1">Total Used</p>
              <p className="text-2xl font-bold text-red-600">
                -{data.summary.totalOut.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">all time</p>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Transactions table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle>Credit Transactions</CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Date range filter */}
              <div className="flex items-center gap-1 rounded-lg border border-border p-0.5">
                {DATE_RANGE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleDaysChange(opt.value)}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                      days === opt.value
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {/* Export CSV */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                disabled={!data || data.total === 0}
              >
                <svg className="h-3.5 w-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : isError ? (
            <div className="py-12 text-center">
              <p className="text-sm text-muted-foreground">Failed to load transaction history. Please try again.</p>
            </div>
          ) : !data || data.transactions.length === 0 ? (
            <div className="py-12 text-center">
              <svg className="mx-auto h-10 w-10 text-muted-foreground/40 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
              </svg>
              <p className="text-sm text-muted-foreground">No transactions found for this period.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto -mx-6">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="pl-6 pr-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Date
                      </th>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Description
                      </th>
                      <th className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Credits In
                      </th>
                      <th className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Credits Out
                      </th>
                      <th className="pl-4 pr-6 py-2.5 text-right text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Balance
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {data.transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-muted/30 transition-colors">
                        <td className="pl-6 pr-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                          {new Date(tx.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                          <span className="block text-xs text-muted-foreground/70">
                            {new Date(tx.date).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-foreground">{tx.description}</span>
                            <Badge
                              variant="outline"
                              className={`text-[10px] shrink-0 ${
                                tx.type === 'purchase'
                                  ? 'border-green-200 text-green-700 bg-green-50'
                                  : 'border-gray-200 text-gray-500 bg-gray-50'
                              }`}
                            >
                              {tx.type === 'purchase' ? 'Purchase' : 'Usage'}
                            </Badge>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {tx.credits_in > 0 ? (
                            <span className="text-sm font-medium text-green-600">
                              +{tx.credits_in.toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground/40">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {tx.credits_out > 0 ? (
                            <span className="text-sm font-medium text-red-600">
                              -{tx.credits_out.toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground/40">—</span>
                          )}
                        </td>
                        <td className="pl-4 pr-6 py-3 text-right">
                          <span className="text-sm font-semibold text-foreground">
                            {tx.balance.toLocaleString()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 mt-2 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    Showing {offset + 1}–{Math.min(offset + PAGE_SIZE, data.total)} of{' '}
                    {data.total} transactions
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
                      disabled={offset === 0}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setOffset(offset + PAGE_SIZE)}
                      disabled={offset + PAGE_SIZE >= data.total}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
