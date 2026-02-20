/**
 * Admin Revenue Dashboard
 * Cursive Platform
 *
 * Server component showing key business revenue metrics:
 * - MRR estimate, credits sold/redeemed, active workspaces, partner payouts
 * - Daily revenue table (last 30 days)
 * - Top 10 spenders
 * - Revenue by credit package
 * - Partner section with pending payouts and top earners
 */

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getUserWithRole } from '@/lib/auth/roles'
import { safeError } from '@/lib/utils/log-sanitizer'

export const dynamic = 'force-dynamic'

// ─── Types ───────────────────────────────────────────────────────────────────

interface DailyRevenue {
  date: string
  credits: number
  value: number
  count: number
}

interface SpenderRow {
  workspace_id: string
  name: string
  total_spend: number
  this_month_spend: number
}

interface PackageRow {
  package_name: string
  count: number
  total_credits: number
  total_value: number
}

interface PartnerRow {
  partner_id: string
  name: string
  earnings: number
}

interface RevenueData {
  overview: {
    estimated_mrr: number
    credits_sold_count: number
    credits_sold_units: number
    credits_sold_value: number
    credits_redeemed: number
    active_workspaces: number
    pending_payouts_count: number
    pending_payouts_value: number
    commissions_this_month: number
  }
  dailyRevenue: DailyRevenue[]
  topSpenders: SpenderRow[]
  revenueByPackage: PackageRow[]
  topPartners: PartnerRow[]
}

// ─── Data fetching ────────────────────────────────────────────────────────────

async function fetchRevenueData(): Promise<RevenueData | null> {
  try {
    const supabase = createAdminClient()

    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()

    const [
      creditPurchasesThisMonth,
      creditPurchasesLast30Days,
      topSpendersAllTime,
      creditPurchasesAllPackages,
      creditsRedeemedThisMonth,
      pendingPayouts,
      partnerEarningsThisMonth,
      topPartnersByEarnings,
    ] = await Promise.all([
      supabase
        .from('credit_purchases')
        .select('workspace_id, credits, amount_paid, package_name')
        .eq('status', 'completed')
        .gte('created_at', monthStart),

      supabase
        .from('credit_purchases')
        .select('created_at, credits, amount_paid')
        .eq('status', 'completed')
        .gte('created_at', thirtyDaysAgo)
        .order('created_at', { ascending: true }),

      supabase
        .from('credit_purchases')
        .select('workspace_id, amount_paid, workspaces(name)')
        .eq('status', 'completed'),

      supabase
        .from('credit_purchases')
        .select('package_name, credits, amount_paid')
        .eq('status', 'completed'),

      supabase
        .from('marketplace_purchases')
        .select('credits_used')
        .eq('status', 'completed')
        .gte('created_at', monthStart),

      supabase
        .from('payout_requests')
        .select('amount')
        .eq('status', 'pending'),

      supabase
        .from('partner_earnings')
        .select('amount')
        .gte('created_at', monthStart),

      supabase
        .from('partner_earnings')
        .select('partner_id, amount, partners(name)')
        .gte('created_at', monthStart),
    ])

    const thisMonthPurchases = creditPurchasesThisMonth.data || []
    const totalCreditsSoldCount = thisMonthPurchases.length
    const totalCreditsSoldUnits = thisMonthPurchases.reduce((s, r) => s + (r.credits || 0), 0)
    const totalCreditsSoldValue = thisMonthPurchases.reduce((s, r) => s + Number(r.amount_paid || 0), 0)
    const estimatedMRR = totalCreditsSoldValue

    const dailyMap: Record<string, DailyRevenue> = {}
    const last30Purchases = creditPurchasesLast30Days.data || []
    last30Purchases.forEach((row) => {
      const day = new Date(row.created_at).toISOString().split('T')[0]
      if (!dailyMap[day]) dailyMap[day] = { date: day, credits: 0, value: 0, count: 0 }
      dailyMap[day].credits += row.credits || 0
      dailyMap[day].value += Number(row.amount_paid || 0)
      dailyMap[day].count += 1
    })
    const dailyRevenue = Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date))

    const spenderMap: Record<string, SpenderRow> = {}
    const allSpenders = (topSpendersAllTime.data || []) as any[]
    allSpenders.forEach((row) => {
      const wid = row.workspace_id
      if (!spenderMap[wid]) {
        spenderMap[wid] = {
          workspace_id: wid,
          name: row.workspaces?.name || wid.slice(0, 8),
          total_spend: 0,
          this_month_spend: 0,
        }
      }
      spenderMap[wid].total_spend += Number(row.amount_paid || 0)
    })
    thisMonthPurchases.forEach((row) => {
      const wid = row.workspace_id
      if (spenderMap[wid]) {
        spenderMap[wid].this_month_spend += Number(row.amount_paid || 0)
      }
    })
    const topSpenders = Object.values(spenderMap)
      .sort((a, b) => b.total_spend - a.total_spend)
      .slice(0, 10)

    const packageMap: Record<string, PackageRow> = {}
    const allPackages = creditPurchasesAllPackages.data || []
    allPackages.forEach((row) => {
      const name = row.package_name || 'unknown'
      if (!packageMap[name]) packageMap[name] = { package_name: name, count: 0, total_credits: 0, total_value: 0 }
      packageMap[name].count += 1
      packageMap[name].total_credits += row.credits || 0
      packageMap[name].total_value += Number(row.amount_paid || 0)
    })
    const revenueByPackage = Object.values(packageMap).sort((a, b) => b.total_value - a.total_value)

    const redeemedRows = creditsRedeemedThisMonth.data || []
    const totalCreditsRedeemed = redeemedRows.reduce((s, r) => s + (r.credits_used || 0), 0)

    const activeWorkspaceIds = new Set(thisMonthPurchases.map((r) => r.workspace_id))
    const activeWorkspacesCount = activeWorkspaceIds.size

    const pendingPayoutRows = pendingPayouts.data || []
    const totalPendingPayouts = pendingPayoutRows.length
    const totalPendingPayoutsValue = pendingPayoutRows.reduce((s, r) => s + Number(r.amount || 0), 0)

    const earningsRows = partnerEarningsThisMonth.data || []
    const totalCommissionsThisMonth = earningsRows.reduce((s, r) => s + Number(r.amount || 0), 0)

    const partnerEarningsMap: Record<string, PartnerRow> = {}
    const topEarningsRows = (topPartnersByEarnings.data || []) as any[]
    topEarningsRows.forEach((row) => {
      const pid = row.partner_id
      if (!partnerEarningsMap[pid]) {
        partnerEarningsMap[pid] = {
          partner_id: pid,
          name: row.partners?.name || pid.slice(0, 8),
          earnings: 0,
        }
      }
      partnerEarningsMap[pid].earnings += Number(row.amount || 0)
    })
    const topPartners = Object.values(partnerEarningsMap)
      .sort((a, b) => b.earnings - a.earnings)
      .slice(0, 5)

    return {
      overview: {
        estimated_mrr: estimatedMRR,
        credits_sold_count: totalCreditsSoldCount,
        credits_sold_units: totalCreditsSoldUnits,
        credits_sold_value: totalCreditsSoldValue,
        credits_redeemed: totalCreditsRedeemed,
        active_workspaces: activeWorkspacesCount,
        pending_payouts_count: totalPendingPayouts,
        pending_payouts_value: totalPendingPayoutsValue,
        commissions_this_month: totalCommissionsThisMonth,
      },
      dailyRevenue,
      topSpenders,
      revenueByPackage,
      topPartners,
    }
  } catch (error) {
    safeError('Admin revenue page data fetch error:', error)
    return null
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  return new Intl.NumberFormat('en-US').format(Math.round(n))
}

function fmtUSD(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n)
}

function fmtDate(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white border border-zinc-200 rounded-lg p-4">
      <div className="text-[12px] text-zinc-500 mb-1">{label}</div>
      <div className="text-2xl font-semibold text-zinc-900 tracking-tight">{value}</div>
      {sub && <div className="text-[12px] text-zinc-400 mt-1">{sub}</div>}
    </div>
  )
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
      <div className="px-5 py-3 border-b border-zinc-100">
        <h2 className="text-[14px] font-medium text-zinc-900">{title}</h2>
      </div>
      <div className="overflow-x-auto">{children}</div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function AdminRevenuePage() {
  // Auth: verify admin via layout-level server check
  const supabase = await createClient()
  const { data: { user: sessionUser }, error: authError } = await supabase.auth.getUser()

  if (authError || !sessionUser) {
    redirect('/login?error=unauthorized')
  }

  const userWithRole = await getUserWithRole(sessionUser)
  if (!userWithRole || (userWithRole.role !== 'owner' && userWithRole.role !== 'admin')) {
    redirect('/dashboard?error=admin_required')
  }

  const data = await fetchRevenueData()

  const now = new Date()
  const monthLabel = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="max-w-[1400px] mx-auto px-6 py-8">

        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-zinc-900">Revenue Dashboard</h1>
          <p className="text-[13px] text-zinc-500 mt-1">
            Credit sales, workspace activity, and partner payouts — {monthLabel}
          </p>
        </div>

        {!data ? (
          <div className="bg-white border border-zinc-200 rounded-lg p-8 text-center text-zinc-500 text-[13px]">
            Failed to load revenue data. Check server logs for details.
          </div>
        ) : (
          <>
            {/* ── Top Stats ──────────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <StatCard
                label="Estimated MRR"
                value={fmtUSD(data.overview.estimated_mrr)}
                sub="Credit sales this month"
              />
              <StatCard
                label="Credits Sold This Month"
                value={fmt(data.overview.credits_sold_units)}
                sub={`${data.overview.credits_sold_count} purchase${data.overview.credits_sold_count !== 1 ? 's' : ''} · ${fmtUSD(data.overview.credits_sold_value)}`}
              />
              <StatCard
                label="Credits Redeemed This Month"
                value={fmt(data.overview.credits_redeemed)}
                sub="Via marketplace purchases"
              />
              <StatCard
                label="Active Workspaces This Month"
                value={fmt(data.overview.active_workspaces)}
                sub="Purchased credits this month"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              <StatCard
                label="Partner Payouts Pending"
                value={fmtUSD(data.overview.pending_payouts_value)}
                sub={`${data.overview.pending_payouts_count} payout request${data.overview.pending_payouts_count !== 1 ? 's' : ''}`}
              />
              <StatCard
                label="Partner Commissions This Month"
                value={fmtUSD(data.overview.commissions_this_month)}
                sub="Sum of all partner earnings"
              />
              <div className="bg-white border border-zinc-200 rounded-lg p-4 flex items-center justify-center">
                <a
                  href="/admin/payouts"
                  className="text-[13px] font-medium text-zinc-700 hover:text-zinc-900 underline underline-offset-2"
                >
                  Manage Payouts
                </a>
              </div>
            </div>

            {/* ── Daily Revenue Last 30 Days ─────────────────────────────────── */}
            <div className="mb-6">
              <SectionCard title="Daily Revenue — Last 30 Days">
                {data.dailyRevenue.length === 0 ? (
                  <div className="px-5 py-8 text-center text-zinc-400 text-[13px]">No revenue recorded in the last 30 days</div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-zinc-50 border-b border-zinc-100">
                      <tr>
                        <th className="px-5 py-2.5 text-left text-[12px] font-medium text-zinc-500">Date</th>
                        <th className="px-5 py-2.5 text-right text-[12px] font-medium text-zinc-500">Purchases</th>
                        <th className="px-5 py-2.5 text-right text-[12px] font-medium text-zinc-500">Credits Sold</th>
                        <th className="px-5 py-2.5 text-right text-[12px] font-medium text-zinc-500">Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.dailyRevenue.map((row) => (
                        <tr key={row.date} className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50">
                          <td className="px-5 py-2.5 text-[13px] text-zinc-700">{fmtDate(row.date)}</td>
                          <td className="px-5 py-2.5 text-[13px] text-zinc-600 text-right">{fmt(row.count)}</td>
                          <td className="px-5 py-2.5 text-[13px] text-zinc-600 text-right">{fmt(row.credits)}</td>
                          <td className="px-5 py-2.5 text-[13px] font-medium text-zinc-900 text-right">{fmtUSD(row.value)}</td>
                        </tr>
                      ))}
                      {/* Totals row */}
                      <tr className="border-t-2 border-zinc-200 bg-zinc-50">
                        <td className="px-5 py-2.5 text-[12px] font-semibold text-zinc-700">Totals</td>
                        <td className="px-5 py-2.5 text-[12px] font-semibold text-zinc-700 text-right">
                          {fmt(data.dailyRevenue.reduce((s, r) => s + r.count, 0))}
                        </td>
                        <td className="px-5 py-2.5 text-[12px] font-semibold text-zinc-700 text-right">
                          {fmt(data.dailyRevenue.reduce((s, r) => s + r.credits, 0))}
                        </td>
                        <td className="px-5 py-2.5 text-[12px] font-semibold text-zinc-900 text-right">
                          {fmtUSD(data.dailyRevenue.reduce((s, r) => s + r.value, 0))}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                )}
              </SectionCard>
            </div>

            {/* ── Two-column: Top Spenders + Revenue by Package ─────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Top 10 Spenders */}
              <SectionCard title="Top 10 Spenders (All-Time)">
                {data.topSpenders.length === 0 ? (
                  <div className="px-5 py-8 text-center text-zinc-400 text-[13px]">No purchase data available</div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-zinc-50 border-b border-zinc-100">
                      <tr>
                        <th className="px-5 py-2.5 text-left text-[12px] font-medium text-zinc-500">#</th>
                        <th className="px-5 py-2.5 text-left text-[12px] font-medium text-zinc-500">Workspace</th>
                        <th className="px-5 py-2.5 text-right text-[12px] font-medium text-zinc-500">All-Time</th>
                        <th className="px-5 py-2.5 text-right text-[12px] font-medium text-zinc-500">This Month</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.topSpenders.map((row, i) => (
                        <tr key={row.workspace_id} className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50">
                          <td className="px-5 py-2.5 text-[12px] text-zinc-400">{i + 1}</td>
                          <td className="px-5 py-2.5 text-[13px] text-zinc-800">{row.name}</td>
                          <td className="px-5 py-2.5 text-[13px] font-medium text-zinc-900 text-right">{fmtUSD(row.total_spend)}</td>
                          <td className="px-5 py-2.5 text-[13px] text-zinc-600 text-right">
                            {row.this_month_spend > 0 ? fmtUSD(row.this_month_spend) : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </SectionCard>

              {/* Revenue by Package */}
              <SectionCard title="Revenue by Credit Package (All-Time)">
                {data.revenueByPackage.length === 0 ? (
                  <div className="px-5 py-8 text-center text-zinc-400 text-[13px]">No package data available</div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-zinc-50 border-b border-zinc-100">
                      <tr>
                        <th className="px-5 py-2.5 text-left text-[12px] font-medium text-zinc-500">Package</th>
                        <th className="px-5 py-2.5 text-right text-[12px] font-medium text-zinc-500">Purchases</th>
                        <th className="px-5 py-2.5 text-right text-[12px] font-medium text-zinc-500">Credits</th>
                        <th className="px-5 py-2.5 text-right text-[12px] font-medium text-zinc-500">Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.revenueByPackage.map((row) => (
                        <tr key={row.package_name} className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50">
                          <td className="px-5 py-2.5 text-[13px] text-zinc-800 capitalize">
                            {row.package_name.replace(/-/g, ' ')}
                          </td>
                          <td className="px-5 py-2.5 text-[13px] text-zinc-600 text-right">{fmt(row.count)}</td>
                          <td className="px-5 py-2.5 text-[13px] text-zinc-600 text-right">{fmt(row.total_credits)}</td>
                          <td className="px-5 py-2.5 text-[13px] font-medium text-zinc-900 text-right">{fmtUSD(row.total_value)}</td>
                        </tr>
                      ))}
                      <tr className="border-t-2 border-zinc-200 bg-zinc-50">
                        <td className="px-5 py-2.5 text-[12px] font-semibold text-zinc-700">Totals</td>
                        <td className="px-5 py-2.5 text-[12px] font-semibold text-zinc-700 text-right">
                          {fmt(data.revenueByPackage.reduce((s, r) => s + r.count, 0))}
                        </td>
                        <td className="px-5 py-2.5 text-[12px] font-semibold text-zinc-700 text-right">
                          {fmt(data.revenueByPackage.reduce((s, r) => s + r.total_credits, 0))}
                        </td>
                        <td className="px-5 py-2.5 text-[12px] font-semibold text-zinc-900 text-right">
                          {fmtUSD(data.revenueByPackage.reduce((s, r) => s + r.total_value, 0))}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                )}
              </SectionCard>
            </div>

            {/* ── Partner Section ───────────────────────────────────────────── */}
            <SectionCard title="Top 5 Earning Partners — This Month">
              {data.topPartners.length === 0 ? (
                <div className="px-5 py-8 text-center text-zinc-400 text-[13px]">No partner earnings recorded this month</div>
              ) : (
                <table className="w-full">
                  <thead className="bg-zinc-50 border-b border-zinc-100">
                    <tr>
                      <th className="px-5 py-2.5 text-left text-[12px] font-medium text-zinc-500">#</th>
                      <th className="px-5 py-2.5 text-left text-[12px] font-medium text-zinc-500">Partner</th>
                      <th className="px-5 py-2.5 text-right text-[12px] font-medium text-zinc-500">Earnings This Month</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.topPartners.map((row, i) => (
                      <tr key={row.partner_id} className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50">
                        <td className="px-5 py-2.5 text-[12px] text-zinc-400">{i + 1}</td>
                        <td className="px-5 py-2.5 text-[13px] text-zinc-800">{row.name}</td>
                        <td className="px-5 py-2.5 text-[13px] font-medium text-zinc-900 text-right">{fmtUSD(row.earnings)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </SectionCard>
          </>
        )}
      </div>
    </div>
  )
}
