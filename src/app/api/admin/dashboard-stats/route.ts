import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { getUserWithRole } from "@/lib/auth/roles"
import { safeError } from "@/lib/utils/log-sanitizer"

export async function GET() {
  try {
    // Auth check — must be admin/owner
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const userWithRole = await getUserWithRole(session.user)
    if (!userWithRole || (userWithRole.role !== "owner" && userWithRole.role !== "admin")) {
      return NextResponse.json({ error: "Admin required" }, { status: 403 })
    }

    const adminClient = createAdminClient()
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7).toISOString()

    // Run all stat queries in parallel, each non-fatal
    const [
      totalUsersResult,
      newTodayResult,
      leadsWeekResult,
      activeQueriesResult,
      creditsPurchasedResult,
      failedEnrichmentsResult,
    ] = await Promise.allSettled([
      adminClient.from("users").select("id", { count: "exact", head: true }),
      adminClient
        .from("users")
        .select("id", { count: "exact", head: true })
        .gte("created_at", todayStart),
      adminClient
        .from("leads")
        .select("id", { count: "exact", head: true })
        .gte("created_at", weekStart),
      adminClient
        .from("queries")
        .select("id", { count: "exact", head: true })
        .eq("is_active", true),
      adminClient
        .from("credit_transactions")
        .select("amount")
        .eq("transaction_type", "purchase")
        .gte("created_at", monthStart),
      adminClient
        .from("failed_operations")
        .select("id", { count: "exact", head: true })
        .gte("created_at", todayStart),
    ])

    const totalUsers =
      totalUsersResult.status === "fulfilled" ? (totalUsersResult.value.count ?? 0) : 0
    const newToday =
      newTodayResult.status === "fulfilled" ? (newTodayResult.value.count ?? 0) : 0
    const leadsThisWeek =
      leadsWeekResult.status === "fulfilled" ? (leadsWeekResult.value.count ?? 0) : 0
    const activeQueries =
      activeQueriesResult.status === "fulfilled" ? (activeQueriesResult.value.count ?? 0) : 0
    const creditsPurchasedThisMonth =
      creditsPurchasedResult.status === "fulfilled"
        ? (creditsPurchasedResult.value.data ?? []).reduce(
            (sum: number, t: { amount: number }) => sum + Number(t.amount),
            0
          )
        : 0
    const failedOpsToday =
      failedEnrichmentsResult.status === "fulfilled"
        ? (failedEnrichmentsResult.value.count ?? 0)
        : 0

    return NextResponse.json({
      totalUsers,
      newToday,
      leadsThisWeek,
      activeQueries,
      creditsPurchasedThisMonth,
      failedOpsToday,
    })
  } catch (error) {
    safeError("[AdminDashboardStats] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
