/**
 * Uploaded Leads Table Component
 * Displays partner's uploaded leads with status and revenue
 */

'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'

interface Lead {
  id: string
  business_name: string | null
  industry: string | null
  status: string | null
  upload_date: string
  sold_at?: string | null
  partner_commission?: number | null
}

interface UploadedLeadsTableProps {
  leads: Lead[]
}

export function UploadedLeadsTable({ leads }: UploadedLeadsTableProps) {
  if (leads.length === 0) {
    return (
      <div className="glass-card p-12 text-center rounded-lg border">
        <div className="max-w-sm mx-auto space-y-3">
          <div className="text-4xl">📊</div>
          <h3 className="text-lg font-semibold">No leads uploaded yet</h3>
          <p className="text-sm text-muted-foreground">
            Upload your first CSV to start earning commissions from lead sales
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="glass-card overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Company</TableHead>
            <TableHead>Industry</TableHead>
            <TableHead>Uploaded</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Revenue</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => (
            <TableRow
              key={lead.id}
              className="hover:bg-muted/50 transition-colors"
            >
              <TableCell className="font-medium">
                {lead.business_name || 'Unknown Business'}
              </TableCell>
              <TableCell>{lead.industry || 'N/A'}</TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {formatDistanceToNow(new Date(lead.upload_date), {
                  addSuffix: true,
                })}
              </TableCell>
              <TableCell>
                <Badge
                  variant={lead.status === 'sold' ? 'default' : 'secondary'}
                  className={
                    lead.status === 'sold'
                      ? 'bg-emerald-500 hover:bg-emerald-600'
                      : ''
                  }
                >
                  {lead.status === 'sold' ? '✓ Sold' : 'Available'}
                </Badge>
              </TableCell>
              <TableCell className="text-right font-semibold">
                {lead.status === 'sold' && lead.partner_commission
                  ? `$${lead.partner_commission.toFixed(2)}`
                  : '-'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
