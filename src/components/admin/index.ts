/**
 * Admin Components Index
 * Cursive Platform
 *
 * Export all admin dashboard and management components.
 */

// Admin Statistics
export {
  MetricCard,
  AdminOverviewGrid,
  SystemStatus,
  RecentActivity,
  type MetricCardProps,
  type AdminMetrics as AdminStats,
  type SystemService,
  type ActivityItem,
} from './admin-stats'

// User Management
export {
  UserTable,
  UserEditModal,
  ConfirmActionModal,
  type AdminUser,
} from './user-management'

// Impersonation
export { ImpersonationBanner } from './impersonation-banner'
