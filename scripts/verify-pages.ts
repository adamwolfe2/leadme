// Page and API Route Verification Checklist
// Use this to manually verify all routes work after deployment

const pages = [
  // Public/Auth
  { path: '/', name: 'Landing Page', requiresAuth: false },
  { path: '/login', name: 'Login', requiresAuth: false },
  { path: '/signup', name: 'Signup', requiresAuth: false },
  { path: '/reset-password', name: 'Password Reset', requiresAuth: false },

  // Dashboard
  { path: '/dashboard', name: 'Dashboard', requiresAuth: true },
  { path: '/leads', name: 'Leads List', requiresAuth: true },
  { path: '/queries', name: 'Queries', requiresAuth: true },
  { path: '/campaigns', name: 'Campaigns', requiresAuth: true },

  // Marketplace (Buyer)
  { path: '/marketplace', name: 'Marketplace Browse', requiresAuth: true },
  { path: '/marketplace/credits', name: 'Credits Purchase', requiresAuth: true },
  { path: '/marketplace/history', name: 'Purchase History', requiresAuth: true },

  // Partner Portal
  { path: '/partner', name: 'Partner Dashboard', requiresAuth: true, partnerOnly: true },
  { path: '/partner/login', name: 'Partner Login', requiresAuth: false },
  { path: '/partner/register', name: 'Partner Registration', requiresAuth: false },
  { path: '/partner/upload', name: 'Partner Upload', requiresAuth: true, partnerOnly: true },
  { path: '/partner/payouts', name: 'Partner Payouts', requiresAuth: true, partnerOnly: true },

  // Admin
  { path: '/admin/partners', name: 'Admin Partners', requiresAuth: true, adminOnly: true },
  { path: '/admin/marketplace', name: 'Admin Marketplace', requiresAuth: true, adminOnly: true },

  // Settings
  { path: '/settings', name: 'Settings', requiresAuth: true },
  { path: '/settings/billing', name: 'Billing Settings', requiresAuth: true },
  { path: '/settings/integrations', name: 'Integrations', requiresAuth: true },
]

const apiRoutes = [
  // Marketplace APIs
  { method: 'GET', path: '/api/marketplace/leads', name: 'Browse Leads' },
  { method: 'POST', path: '/api/marketplace/purchase', name: 'Purchase Leads' },
  { method: 'GET', path: '/api/marketplace/credits', name: 'Get Credits' },
  { method: 'POST', path: '/api/marketplace/credits', name: 'Buy Credits' },
  { method: 'GET', path: '/api/marketplace/history', name: 'Purchase History' },
  { method: 'GET', path: '/api/marketplace/download/[purchaseId]', name: 'Download CSV' },

  // Partner APIs
  { method: 'POST', path: '/api/partner/auth/register', name: 'Partner Register' },
  { method: 'POST', path: '/api/partner/auth/login', name: 'Partner Login' },
  { method: 'GET', path: '/api/partner/dashboard', name: 'Partner Dashboard' },
  { method: 'POST', path: '/api/partner/upload/initiate', name: 'Upload Initiate' },
  { method: 'POST', path: '/api/partner/upload/complete', name: 'Upload Complete' },
  { method: 'GET', path: '/api/partner/payouts', name: 'Get Payouts' },
  { method: 'POST', path: '/api/partner/payouts/request', name: 'Request Payout' },
  { method: 'POST', path: '/api/partner/stripe/connect', name: 'Stripe Connect' },

  // Admin APIs
  { method: 'POST', path: '/api/admin/partners/[id]/approve', name: 'Approve Partner' },
  { method: 'POST', path: '/api/admin/partners/[id]/reject', name: 'Reject Partner' },

  // Webhooks
  { method: 'POST', path: '/api/webhooks/stripe', name: 'Stripe Webhook' },
  { method: 'POST', path: '/api/webhooks/audiencelab/superpixel', name: 'AudienceLab Webhook' },

  // Inngest
  { method: 'ALL', path: '/api/inngest', name: 'Inngest Handler' },
]

const featureChecklist = {
  // Authentication
  'User signup with email': 'CHECK',
  'User login': 'CHECK',
  'Password reset': 'CHECK',
  'Session management': 'CHECK',

  // Marketplace - Buyer
  'Browse leads with filters': 'CHECK',
  'Add to cart': 'CHECK',
  'Purchase with credits': 'CHECK',
  'Purchase with Stripe': 'CHECK',
  'Download purchased leads CSV': 'CHECK',
  'View purchase history': 'CHECK',
  'Buy credit packages': 'CHECK',

  // Marketplace - Partner
  'Partner registration': 'CHECK',
  'Partner API key login': 'CHECK',
  'CSV upload with mapping': 'CHECK',
  'Upload progress tracking': 'CHECK',
  'Partner dashboard stats': 'CHECK',
  'Stripe Connect onboarding': 'CHECK',
  'Request payout': 'CHECK',
  'View payout history': 'CHECK',

  // Admin
  'View pending partners': 'CHECK',
  'Approve partner': 'CHECK',
  'Reject partner': 'CHECK',
  'Marketplace stats dashboard': 'CHECK',

  // Background Jobs
  'CSV processing': 'CHECK',
  'Email verification': 'CHECK',
  'Commission processing': 'CHECK',
  'Freshness updates': 'CHECK',
  'Payout processing': 'CHECK',

  // Email Campaigns
  'Create campaign': 'VERIFY',
  'Add leads to campaign': 'VERIFY',
  'Send emails': 'VERIFY',
  'Track opens/clicks': 'VERIFY',
  'A/B testing': 'VERIFY',

  // Notifications
  'In-app notifications': 'VERIFY',
  'Email notifications': 'VERIFY',

  // Security
  'RLS on all tables': 'VERIFY AFTER MIGRATION',
  'Workspace isolation': 'CHECK',
  'Partner isolation': 'CHECK',
  'Admin-only routes': 'CHECK',
}

console.log('📄 PAGES TO VERIFY:\n')
pages.forEach((p) => {
  const flags = [
    p.requiresAuth ? '🔒' : '🌐',
    p.partnerOnly ? '👤' : '',
    p.adminOnly ? '⚙️' : '',
  ]
    .filter(Boolean)
    .join(' ')
  console.log(`  ${flags} ${p.path.padEnd(30)} - ${p.name}`)
})

console.log('\n🔌 API ROUTES TO VERIFY:\n')
apiRoutes.forEach((r) => {
  console.log(`  ${r.method.padEnd(6)} ${r.path.padEnd(50)} - ${r.name}`)
})

console.log('\n✅ FEATURE CHECKLIST:\n')
Object.entries(featureChecklist).forEach(([feature, status]) => {
  const icon = status === 'CHECK' ? '✅' : status === 'VERIFY' ? '🔍' : '⏳'
  console.log(`  ${icon} ${feature.padEnd(50)} [${status}]`)
})

console.log('\n📋 VERIFICATION INSTRUCTIONS:\n')
console.log('1. Run security audit: pnpm tsx scripts/audit-security.ts')
console.log('2. Apply SQL migrations in Supabase SQL Editor')
console.log('3. Test critical flows:')
console.log('   - Buyer: Browse → Purchase → Download')
console.log('   - Partner: Register → Upload → Dashboard')
console.log('   - Admin: Approve → View Stats')
console.log('4. Check Inngest dashboard for job registration')
console.log('5. Verify RLS policies with multi-tenant test')
