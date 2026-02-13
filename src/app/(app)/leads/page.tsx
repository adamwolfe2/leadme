'use client'

/**
 * My Leads Page
 * View and manage workspace leads with real-time updates
 */

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select-radix'
import { Search, Mail, Phone, Building, Star } from 'lucide-react'
import { useRealtimeLeads } from '@/hooks/use-realtime-leads'
import { RealtimeIndicator } from '@/components/realtime/realtime-indicator'
import { SkeletonLeadsTable } from '@/components/ui/skeleton'

export default function LeadsPage() {
  const [search, setSearch] = useState('')
  const [sourceFilter, setSourceFilter] = useState<string>('all')

  // Fetch leads
  const { data: leadsData, isLoading } = useQuery({
    queryKey: ['leads', { search, source: sourceFilter }],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      params.append('per_page', '100')

      const response = await fetch(`/api/leads?${params}`)
      if (!response.ok) throw new Error('Failed to fetch leads')
      return response.json()
    },
  })

  const leads = leadsData?.data || []

  // Get workspace ID from first lead or from user context
  const workspaceId = leads[0]?.workspace_id

  // Enable real-time updates
  useRealtimeLeads({
    workspaceId: workspaceId || '',
    enabled: !!workspaceId,
    showToasts: true,
  })

  const getSourceBadgeColor = (source: string) => {
    switch (source) {
      case 'audiencelab_pixel':
        return 'bg-blue-500'
      case 'audiencelab_database':
        return 'bg-green-500'
      case 'marketplace':
        return 'bg-purple-500'
      case 'upload':
        return 'bg-orange-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="container mx-auto py-4 sm:py-8 px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">My Leads</h1>
          <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
            Manage and track your workspace leads
          </p>
        </div>
        {workspaceId && <RealtimeIndicator workspaceId={workspaceId} />}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Leads ({leads.length})</CardTitle>
          <CardDescription>
            All leads across your workspace with live updates
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or company..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="All Sources" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="audiencelab_pixel">Pixel</SelectItem>
                <SelectItem value="audiencelab_database">Database</SelectItem>
                <SelectItem value="marketplace">Marketplace</SelectItem>
                <SelectItem value="upload">Upload</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          {isLoading ? (
            <SkeletonLeadsTable />
          ) : leads.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg font-medium">No leads found</p>
              <p className="text-sm mt-2">
                {search || sourceFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Start by browsing the marketplace or adding a pixel'}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Added</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leads.map((lead: any) => (
                      <TableRow key={lead.id}>
                      <TableCell className="font-medium">
                        {lead.first_name} {lead.last_name}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm">
                          {lead.email && (
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3 text-muted-foreground" />
                              <span>{lead.email}</span>
                            </div>
                          )}
                          {lead.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              <span>{lead.phone}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm">
                          {lead.company_name && (
                            <div className="flex items-center gap-1">
                              <Building className="h-3 w-3 text-muted-foreground" />
                              <span>{lead.company_name}</span>
                            </div>
                          )}
                          {lead.job_title && (
                            <div className="text-muted-foreground">{lead.job_title}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getSourceBadgeColor(lead.source)}>
                          {lead.source.replace('audiencelab_', '')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star
                            className={`h-4 w-4 ${getScoreColor(lead.score)}`}
                            fill="currentColor"
                          />
                          <span className={`font-medium ${getScoreColor(lead.score)}`}>
                            {lead.score}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(lead.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {leads.map((lead: any) => (
                <Card key={lead.id} className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">
                          {lead.first_name} {lead.last_name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={`${getSourceBadgeColor(lead.source)} text-xs`}>
                            {lead.source.replace('audiencelab_', '')}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <Star
                              className={`h-3 w-3 ${getScoreColor(lead.score)}`}
                              fill="currentColor"
                            />
                            <span className={`text-sm font-medium ${getScoreColor(lead.score)}`}>
                              {lead.score}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {lead.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="truncate">{lead.email}</span>
                      </div>
                    )}

                    {lead.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span>{lead.phone}</span>
                      </div>
                    )}

                    {lead.company_name && (
                      <div className="flex items-center gap-2 text-sm">
                        <Building className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <div>
                          <p>{lead.company_name}</p>
                          {lead.job_title && (
                            <p className="text-xs text-muted-foreground">{lead.job_title}</p>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="text-xs text-muted-foreground pt-2 border-t">
                      Added {new Date(lead.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
