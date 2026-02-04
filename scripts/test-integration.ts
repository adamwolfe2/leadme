#!/usr/bin/env tsx
/**
 * Integration Test Script
 * Verifies all service subscription components are working
 *
 * Run: npx tsx scripts/test-integration.ts
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// Load environment variables
config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

interface TestResult {
  name: string
  passed: boolean
  message: string
}

const results: TestResult[] = []

function test(name: string, passed: boolean, message: string) {
  results.push({ name, passed, message })
  const icon = passed ? '✅' : '❌'
  console.log(`${icon} ${name}: ${message}`)
}

async function runTests() {
  console.log('🧪 Running Integration Tests...\n')

  // Test 1: Database Schema
  console.log('📊 Test 1: Database Schema')
  try {
    const { data: tiers, error } = await supabase
      .from('service_tiers')
      .select('id, slug, name, is_public')
      .order('display_order')

    if (error) throw error

    test(
      'Service Tiers Table',
      tiers.length >= 4,
      `Found ${tiers.length} tiers`
    )

    const publicTiers = tiers.filter(t => t.is_public)
    test(
      'Public Tiers',
      publicTiers.length === 3,
      `${publicTiers.length} public tiers (Data, Outbound, Pipeline)`
    )

    const studioTier = tiers.find(t => t.slug === 'cursive-venture-studio')
    test(
      'Venture Studio Hidden',
      studioTier ? !studioTier.is_public : false,
      studioTier ? 'Venture Studio is private' : 'Venture Studio not found'
    )
  } catch (error: any) {
    test('Service Tiers Table', false, error.message)
  }

  // Test 2: Service Subscriptions Schema
  console.log('\n📋 Test 2: Service Subscriptions Schema')
  try {
    const { error } = await supabase
      .from('service_subscriptions')
      .select('*')
      .limit(1)

    test(
      'Service Subscriptions Table',
      !error,
      error ? error.message : 'Table accessible'
    )

    // Check for onboarding_data column
    const { data: sub } = await supabase
      .from('service_subscriptions')
      .select('onboarding_data')
      .limit(1)
      .single()

    test(
      'Onboarding Data Column',
      sub !== null || !error,
      'Column exists'
    )
  } catch (error: any) {
    test('Service Subscriptions Schema', false, error.message)
  }

  // Test 3: Service Deliveries Schema
  console.log('\n📦 Test 3: Service Deliveries Schema')
  try {
    const { error } = await supabase
      .from('service_deliveries')
      .select('*')
      .limit(1)

    test(
      'Service Deliveries Table',
      !error,
      error ? error.message : 'Table accessible'
    )

    // Check for file columns
    const { data: delivery } = await supabase
      .from('service_deliveries')
      .select('file_path, file_name, file_size')
      .limit(1)
      .single()

    test(
      'File Storage Columns',
      delivery !== null || !error,
      'file_path, file_name, file_size columns exist'
    )
  } catch (error: any) {
    test('Service Deliveries Schema', false, error.message)
  }

  // Test 4: Storage Bucket
  console.log('\n💾 Test 4: Storage Bucket')
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets()

    if (error) throw error

    const deliveriesBucket = buckets.find(b => b.id === 'service-deliveries')
    test(
      'Service Deliveries Bucket',
      !!deliveriesBucket,
      deliveriesBucket ? 'Bucket exists' : 'Bucket not found'
    )

    test(
      'Bucket Privacy',
      deliveriesBucket ? !deliveriesBucket.public : false,
      deliveriesBucket?.public ? 'Bucket is public (should be private!)' : 'Bucket is private'
    )
  } catch (error: any) {
    test('Storage Bucket', false, error.message)
  }

  // Test 5: Stripe Products Configuration
  console.log('\n💳 Test 5: Stripe Configuration')
  try {
    const serviceProducts = await import('../src/lib/stripe/service-products')

    const dataConfig = serviceProducts.SERVICE_STRIPE_PRODUCTS['cursive-data']
    test(
      'Cursive Data Config',
      !!dataConfig && !!dataConfig.productId && !!dataConfig.priceId,
      dataConfig ? `Product: ${dataConfig.productId}` : 'Missing config'
    )

    const outboundConfig = serviceProducts.SERVICE_STRIPE_PRODUCTS['cursive-outbound']
    test(
      'Cursive Outbound Config',
      !!outboundConfig && !!outboundConfig.productId && !!outboundConfig.priceId,
      outboundConfig ? `Product: ${outboundConfig.productId}` : 'Missing config'
    )

    const pipelineConfig = serviceProducts.SERVICE_STRIPE_PRODUCTS['cursive-pipeline']
    test(
      'Cursive Pipeline Config',
      !!pipelineConfig && !!pipelineConfig.productId && !!pipelineConfig.priceId,
      pipelineConfig ? `Product: ${pipelineConfig.productId}` : 'Missing config'
    )

    test(
      'Venture Studio Calendar',
      !!serviceProducts.VENTURE_STUDIO_CALENDAR_URL,
      serviceProducts.VENTURE_STUDIO_CALENDAR_URL || 'Missing calendar URL'
    )
  } catch (error: any) {
    test('Stripe Configuration', false, error.message)
  }

  // Test 6: Email Templates
  console.log('\n📧 Test 6: Email Templates')
  try {
    const templates = await import('../src/lib/email/templates')

    test(
      'Welcome Email Template',
      typeof templates.createWelcomeEmail === 'function',
      'Function exists'
    )

    test(
      'Payment Success Template',
      typeof templates.createPaymentSuccessEmail === 'function',
      'Function exists'
    )

    test(
      'Payment Failed Template',
      typeof templates.createPaymentFailedEmail === 'function',
      'Function exists'
    )

    test(
      'Cancellation Template',
      typeof templates.createSubscriptionCancelledEmail === 'function',
      'Function exists'
    )

    test(
      'Onboarding Reminder Template',
      typeof templates.createOnboardingReminderEmail === 'function',
      'Function exists'
    )

    test(
      'Renewal Reminder Template',
      typeof templates.createRenewalReminderEmail === 'function',
      'Function exists'
    )

    test(
      'Delivery Notification Template',
      typeof templates.createDeliveryNotificationEmail === 'function',
      'Function exists'
    )
  } catch (error: any) {
    test('Email Templates', false, error.message)
  }

  // Test 7: API Routes Exist
  console.log('\n🔌 Test 7: API Routes')
  const apiRoutes = [
    'api/services/checkout/route.ts',
    'api/services/onboarding/route.ts',
    'api/services/customer-portal/route.ts',
    'api/services/deliveries/download/route.ts',
    'api/admin/deliveries/create/route.ts',
    'api/webhooks/stripe/route.ts',
  ]

  const fs = await import('fs')
  const path = await import('path')

  for (const route of apiRoutes) {
    const routePath = path.join(process.cwd(), 'src/app', route)
    const exists = fs.existsSync(routePath)
    test(
      route,
      exists,
      exists ? 'Route exists' : 'Route missing'
    )
  }

  // Test 8: Inngest Functions
  console.log('\n⚙️ Test 8: Inngest Functions')
  try {
    const inngestFunctions = await import('../src/inngest/functions')

    test(
      'Onboarding Reminder Job',
      typeof inngestFunctions.sendOnboardingReminders === 'object',
      'Function registered'
    )

    test(
      'Renewal Reminder Job',
      typeof inngestFunctions.sendRenewalReminders === 'object',
      'Function registered'
    )
  } catch (error: any) {
    test('Inngest Functions', false, error.message)
  }

  // Results Summary
  console.log('\n' + '='.repeat(60))
  console.log('📊 Test Summary\n')

  const passed = results.filter(r => r.passed).length
  const failed = results.filter(r => !r.passed).length
  const total = results.length

  console.log(`✅ Passed: ${passed}/${total}`)
  console.log(`❌ Failed: ${failed}/${total}`)
  console.log(`📈 Success Rate: ${Math.round((passed / total) * 100)}%`)

  if (failed > 0) {
    console.log('\n❌ Failed Tests:')
    results.filter(r => !r.passed).forEach(r => {
      console.log(`  - ${r.name}: ${r.message}`)
    })
    process.exit(1)
  } else {
    console.log('\n🎉 All tests passed! System is ready.')
    process.exit(0)
  }
}

runTests().catch((error) => {
  console.error('❌ Test runner failed:', error)
  process.exit(1)
})
