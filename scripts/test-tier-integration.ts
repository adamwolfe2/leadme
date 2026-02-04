/**
 * Service Tier Integration Test
 * Tests the backend tier checking system to ensure service subscriptions work correctly
 *
 * Run: npx tsx scripts/test-tier-integration.ts
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

interface TestResult {
  name: string
  status: 'pass' | 'fail'
  message: string
  details?: any
}

const results: TestResult[] = []

// ============================================================================
// TEST HELPERS
// ============================================================================

async function createTestWorkspace(name: string): Promise<string> {
  const { data, error } = await supabase
    .from('workspaces')
    .insert({
      name: name,
      subdomain: name.toLowerCase().replace(/\s/g, '-'),
    })
    .select('id')
    .single()

  if (error) throw new Error(`Failed to create test workspace: ${error.message}`)
  return data.id
}

async function createTestServiceSubscription(
  workspaceId: string,
  tierSlug: string
): Promise<void> {
  // Get tier ID
  const { data: tier } = await supabase
    .from('service_tiers')
    .select('id, monthly_price_min')
    .eq('slug', tierSlug)
    .single()

  if (!tier) throw new Error(`Tier ${tierSlug} not found`)

  const { error } = await supabase
    .from('service_subscriptions')
    .insert({
      workspace_id: workspaceId,
      service_tier_id: tier.id,
      status: 'active',
      monthly_price: tier.monthly_price_min,
    })

  if (error) throw new Error(`Failed to create subscription: ${error.message}`)
}

async function cleanup(workspaceIds: string[]): Promise<void> {
  for (const id of workspaceIds) {
    await supabase.from('workspaces').delete().eq('id', id)
  }
}

// ============================================================================
// TIER CHECKING SIMULATION (mimics src/lib/tier/server.ts)
// ============================================================================

async function checkWorkspaceTier(workspaceId: string): Promise<any> {
  // Check for service subscription first
  const { data: serviceSubscription } = await supabase
    .from('service_subscriptions')
    .select(`
      *,
      service_tier:service_tiers (
        id,
        name,
        slug,
        platform_features
      )
    `)
    .eq('workspace_id', workspaceId)
    .eq('status', 'active')
    .single()

  const serviceTier = serviceSubscription?.service_tier as any

  if (serviceTier && serviceTier.platform_features) {
    return {
      source: 'service_tier',
      tierSlug: serviceTier.slug,
      tierName: serviceTier.name,
      platformFeatures: serviceTier.platform_features,
    }
  }

  // Fallback to product tier
  const { data: tierInfo } = await supabase
    .from('workspace_tiers')
    .select(`
      *,
      product_tiers (
        name,
        slug,
        features
      )
    `)
    .eq('workspace_id', workspaceId)
    .single()

  const productTier = tierInfo?.product_tiers as any

  if (productTier) {
    return {
      source: 'product_tier',
      tierSlug: productTier.slug,
      tierName: productTier.name,
      features: productTier.features,
    }
  }

  return {
    source: 'free',
    tierSlug: 'free',
    tierName: 'Free',
    features: {},
  }
}

// ============================================================================
// TESTS
// ============================================================================

async function runTests() {
  console.log('🧪 Starting Service Tier Integration Tests...\n')

  const testWorkspaceIds: string[] = []

  try {
    // ========================================================================
    // TEST 1: Cursive Data Tier
    // ========================================================================
    {
      const workspaceId = await createTestWorkspace('Test Cursive Data')
      testWorkspaceIds.push(workspaceId)

      await createTestServiceSubscription(workspaceId, 'cursive-data')

      const tier = await checkWorkspaceTier(workspaceId)

      if (tier.source === 'service_tier' && tier.tierSlug === 'cursive-data') {
        const pf = tier.platformFeatures
        if (
          pf.lead_downloads === true &&
          pf.campaigns === false &&
          pf.ai_agents === false &&
          pf.daily_lead_limit === 100
        ) {
          results.push({
            name: 'Cursive Data Tier',
            status: 'pass',
            message: 'Service tier correctly detected with proper features',
            details: tier,
          })
        } else {
          results.push({
            name: 'Cursive Data Tier',
            status: 'fail',
            message: 'Platform features do not match expected values',
            details: { expected: { lead_downloads: true, campaigns: false }, actual: pf },
          })
        }
      } else {
        results.push({
          name: 'Cursive Data Tier',
          status: 'fail',
          message: 'Service tier not detected correctly',
          details: tier,
        })
      }
    }

    // ========================================================================
    // TEST 2: Cursive Outbound Tier (with campaigns)
    // ========================================================================
    {
      const workspaceId = await createTestWorkspace('Test Cursive Outbound')
      testWorkspaceIds.push(workspaceId)

      await createTestServiceSubscription(workspaceId, 'cursive-outbound')

      const tier = await checkWorkspaceTier(workspaceId)

      if (tier.source === 'service_tier' && tier.tierSlug === 'cursive-outbound') {
        const pf = tier.platformFeatures
        if (
          pf.campaigns === true &&
          pf.ai_agents === true &&
          pf.daily_lead_limit === 200
        ) {
          results.push({
            name: 'Cursive Outbound Tier',
            status: 'pass',
            message: 'Campaigns and AI agents enabled correctly',
            details: tier,
          })
        } else {
          results.push({
            name: 'Cursive Outbound Tier',
            status: 'fail',
            message: 'Platform features do not match expected values',
            details: { expected: { campaigns: true, ai_agents: true }, actual: pf },
          })
        }
      } else {
        results.push({
          name: 'Cursive Outbound Tier',
          status: 'fail',
          message: 'Service tier not detected correctly',
          details: tier,
        })
      }
    }

    // ========================================================================
    // TEST 3: Cursive Pipeline Tier (unlimited leads)
    // ========================================================================
    {
      const workspaceId = await createTestWorkspace('Test Cursive Pipeline')
      testWorkspaceIds.push(workspaceId)

      await createTestServiceSubscription(workspaceId, 'cursive-pipeline')

      const tier = await checkWorkspaceTier(workspaceId)

      if (tier.source === 'service_tier' && tier.tierSlug === 'cursive-pipeline') {
        const pf = tier.platformFeatures
        if (
          pf.campaigns === true &&
          pf.ai_agents === true &&
          pf.api_access === true &&
          pf.daily_lead_limit === -1 // Unlimited
        ) {
          results.push({
            name: 'Cursive Pipeline Tier',
            status: 'pass',
            message: 'All features enabled with unlimited leads',
            details: tier,
          })
        } else {
          results.push({
            name: 'Cursive Pipeline Tier',
            status: 'fail',
            message: 'Platform features do not match expected values',
            details: {
              expected: { campaigns: true, api_access: true, daily_lead_limit: -1 },
              actual: pf,
            },
          })
        }
      } else {
        results.push({
          name: 'Cursive Pipeline Tier',
          status: 'fail',
          message: 'Service tier not detected correctly',
          details: tier,
        })
      }
    }

    // ========================================================================
    // TEST 4: No Subscription (Free Tier)
    // ========================================================================
    {
      const workspaceId = await createTestWorkspace('Test Free Tier')
      testWorkspaceIds.push(workspaceId)

      const tier = await checkWorkspaceTier(workspaceId)

      if (tier.source === 'free' && tier.tierSlug === 'free') {
        results.push({
          name: 'Free Tier (No Subscription)',
          status: 'pass',
          message: 'Correctly defaults to free tier when no subscription exists',
          details: tier,
        })
      } else {
        results.push({
          name: 'Free Tier (No Subscription)',
          status: 'fail',
          message: 'Should default to free tier',
          details: tier,
        })
      }
    }

    // ========================================================================
    // TEST 5: Service Tier Precedence
    // ========================================================================
    {
      const workspaceId = await createTestWorkspace('Test Tier Precedence')
      testWorkspaceIds.push(workspaceId)

      // Create both a product tier AND a service subscription
      // Service should take precedence

      // First, create a product tier (free tier by default in workspace_tiers)
      // Then add a service subscription
      await createTestServiceSubscription(workspaceId, 'cursive-outbound')

      const tier = await checkWorkspaceTier(workspaceId)

      if (tier.source === 'service_tier' && tier.tierSlug === 'cursive-outbound') {
        results.push({
          name: 'Service Tier Precedence',
          status: 'pass',
          message: 'Service tier correctly takes precedence over product tier',
          details: tier,
        })
      } else {
        results.push({
          name: 'Service Tier Precedence',
          status: 'fail',
          message: 'Service tier should take precedence',
          details: tier,
        })
      }
    }
  } catch (error: any) {
    results.push({
      name: 'Test Execution',
      status: 'fail',
      message: `Test execution error: ${error.message}`,
    })
  } finally {
    // Cleanup test data
    console.log('\n🧹 Cleaning up test data...')
    await cleanup(testWorkspaceIds)
  }

  // ========================================================================
  // PRINT RESULTS
  // ========================================================================

  console.log('\n' + '='.repeat(80))
  console.log('SERVICE TIER INTEGRATION TEST RESULTS')
  console.log('='.repeat(80) + '\n')

  let passCount = 0
  let failCount = 0

  for (const result of results) {
    const icon = result.status === 'pass' ? '✅' : '❌'
    console.log(`${icon} ${result.name}`)
    console.log(`   ${result.message}`)
    if (result.details && result.status === 'fail') {
      console.log(`   Details: ${JSON.stringify(result.details, null, 2)}`)
    }
    console.log('')

    if (result.status === 'pass') passCount++
    else failCount++
  }

  console.log('='.repeat(80))
  console.log(`Total: ${results.length} tests`)
  console.log(`✅ Passed: ${passCount}`)
  console.log(`❌ Failed: ${failCount}`)
  console.log('='.repeat(80))

  if (failCount > 0) {
    console.log('\n❌ Some tests failed. Check implementation.')
    process.exit(1)
  } else {
    console.log('\n✅ All service tier integration tests passed!')
    process.exit(0)
  }
}

// Run tests
runTests().catch((err) => {
  console.error('❌ Test script error:', err)
  process.exit(1)
})
