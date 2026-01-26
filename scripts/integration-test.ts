/**
 * Integration Smoke Test Script
 * Tests the full campaign flow end-to-end
 *
 * Run with: npx tsx scripts/integration-test.ts
 */

import { createClient } from '@supabase/supabase-js'
import type { Database } from '../src/types/database.types'

// Initialize Supabase admin client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required')
  process.exit(1)
}

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// Test results tracking
interface TestResult {
  step: string
  passed: boolean
  error?: string
  data?: unknown
}

const results: TestResult[] = []

function log(message: string) {
  console.log(`\n${message}`)
}

function success(step: string, data?: unknown) {
  console.log(`  ✅ ${step}`)
  results.push({ step, passed: true, data })
}

function fail(step: string, error: string) {
  console.log(`  ❌ ${step}: ${error}`)
  results.push({ step, passed: false, error })
}

// Test data
const TEST_PREFIX = `test_${Date.now()}`

const testWorkspace = {
  name: `${TEST_PREFIX}_Integration Test Workspace`,
  slug: `${TEST_PREFIX}_integration-test`,
  subdomain: `${TEST_PREFIX}-test`,
}

const testUser = {
  auth_user_id: `${TEST_PREFIX}_auth-user-id`,
  email: `${TEST_PREFIX}@test.example.com`,
  full_name: 'Integration Test User',
  role: 'admin',
}

const testClientProfile = {
  company_name: 'Acme Corp',
  company_description: 'Leading provider of enterprise software solutions',
  website_url: 'https://acme.example.com',
  industry: 'Technology',
  company_size: '100-500',
  primary_offering: 'Enterprise CRM Platform',
  secondary_offerings: ['Data Analytics', 'Customer Support Tools'],
  value_propositions: [
    { id: 'vp1', title: 'Reduce costs by 30%', description: 'Our solution reduces operational costs significantly' },
    { id: 'vp2', title: 'Increase revenue by 25%', description: 'Proven revenue growth for our clients' },
    { id: 'vp3', title: 'Save 10 hours per week', description: 'Automation that gives time back' },
  ],
  trust_signals: [
    { type: 'client', value: '500+ Fortune 500 clients' },
    { type: 'award', value: 'Gartner Magic Quadrant Leader 2025' },
  ],
  pain_points: ['Manual data entry', 'Siloed information', 'Poor customer visibility'],
  target_industries: ['Technology', 'Healthcare', 'Finance'],
  target_company_sizes: ['50-200', '200-500', '500-1000'],
  target_seniorities: ['VP', 'Director', 'C-Level'],
  target_titles: ['VP of Sales', 'Director of Operations', 'CRO'],
}

const testTemplates = [
  {
    name: 'Introduction Template',
    subject: 'Quick question about {{company_name}}',
    body_html: `<p>Hi {{first_name}},</p>
<p>I noticed {{company_name}} has been growing rapidly in the {{industry}} space.</p>
<p>We've helped companies like yours reduce costs by 30% with our CRM platform.</p>
<p>Would you be open to a quick 15-minute call this week?</p>
<p>Best,<br/>{{sender_name}}</p>`,
    body_text: `Hi {{first_name}},\n\nI noticed {{company_name}} has been growing rapidly in the {{industry}} space.\n\nWe've helped companies like yours reduce costs by 30% with our CRM platform.\n\nWould you be open to a quick 15-minute call this week?\n\nBest,\n{{sender_name}}`,
    tone: 'professional',
    structure: 'problem-solution',
    cta_type: 'meeting',
    target_seniority: ['VP', 'Director'],
    source: 'custom',
  },
  {
    name: 'Follow-up Template',
    subject: 'Re: Quick question about {{company_name}}',
    body_html: `<p>Hi {{first_name}},</p>
<p>I wanted to follow up on my previous message.</p>
<p>I understand you're busy, but I think {{company_name}} could benefit from what we're building.</p>
<p>Here's a quick case study: {{trust_signal}}</p>
<p>Worth a chat?</p>
<p>Best,<br/>{{sender_name}}</p>`,
    body_text: `Hi {{first_name}},\n\nI wanted to follow up on my previous message.\n\nI understand you're busy, but I think {{company_name}} could benefit from what we're building.\n\nHere's a quick case study: {{trust_signal}}\n\nWorth a chat?\n\nBest,\n{{sender_name}}`,
    tone: 'casual',
    structure: 'follow-up',
    cta_type: 'reply',
    target_seniority: ['VP', 'Director', 'Manager'],
    source: 'custom',
  },
  {
    name: 'Value Proposition Template',
    subject: 'How {{company_name}} can {{value_prop}}',
    body_html: `<p>Hi {{first_name}},</p>
<p>{{personalization_hook}}</p>
<p>Many {{job_title}}s in {{industry}} face similar challenges. That's why we built a solution that helps you {{value_prop}}.</p>
<p>I'd love to show you how. Free to chat for 15 minutes?</p>
<p>Best,<br/>{{sender_name}}</p>`,
    body_text: `Hi {{first_name}},\n\n{{personalization_hook}}\n\nMany {{job_title}}s in {{industry}} face similar challenges. That's why we built a solution that helps you {{value_prop}}.\n\nI'd love to show you how. Free to chat for 15 minutes?\n\nBest,\n{{sender_name}}`,
    tone: 'professional',
    structure: 'value-first',
    cta_type: 'meeting',
    target_seniority: ['C-Level', 'VP'],
    source: 'custom',
  },
]

const testLeads = [
  {
    company_name: 'TechStart Inc',
    company_industry: 'Technology',
    email: 'john.doe@techstart.example.com',
    first_name: 'John',
    last_name: 'Doe',
    job_title: 'VP of Sales',
    linkedin_url: 'https://linkedin.com/in/johndoe',
    company_domain: 'techstart.example.com',
    source: 'integration_test',
    enrichment_status: 'pending',
    delivery_status: 'pending',
  },
  {
    company_name: 'HealthCo',
    company_industry: 'Healthcare',
    email: 'jane.smith@healthco.example.com',
    first_name: 'Jane',
    last_name: 'Smith',
    job_title: 'Director of Operations',
    linkedin_url: 'https://linkedin.com/in/janesmith',
    company_domain: 'healthco.example.com',
    source: 'integration_test',
    enrichment_status: 'pending',
    delivery_status: 'pending',
  },
  {
    company_name: 'FinanceFirst',
    company_industry: 'Finance',
    email: 'bob.wilson@financefirst.example.com',
    first_name: 'Bob',
    last_name: 'Wilson',
    job_title: 'CRO',
    linkedin_url: 'https://linkedin.com/in/bobwilson',
    company_domain: 'financefirst.example.com',
    source: 'integration_test',
    enrichment_status: 'pending',
    delivery_status: 'pending',
  },
  {
    company_name: 'RetailMax',
    company_industry: 'Retail',
    email: 'alice.johnson@retailmax.example.com',
    first_name: 'Alice',
    last_name: 'Johnson',
    job_title: 'VP of Marketing',
    linkedin_url: 'https://linkedin.com/in/alicejohnson',
    company_domain: 'retailmax.example.com',
    source: 'integration_test',
    enrichment_status: 'pending',
    delivery_status: 'pending',
  },
  {
    company_name: 'ManufactureCo',
    company_industry: 'Manufacturing',
    email: 'charlie.brown@manufactureco.example.com',
    first_name: 'Charlie',
    last_name: 'Brown',
    job_title: 'Director of Sales',
    linkedin_url: 'https://linkedin.com/in/charliebrown',
    company_domain: 'manufactureco.example.com',
    source: 'integration_test',
    enrichment_status: 'pending',
    delivery_status: 'pending',
  },
]

// Store IDs for cleanup
let workspaceId: string
let userId: string
let clientProfileId: string
let templateIds: string[] = []
let campaignId: string
let leadIds: string[] = []
let campaignLeadIds: string[] = []
let emailSendId: string

async function runTests() {
  log('🚀 Starting Integration Smoke Test')
  log('=' .repeat(60))

  try {
    // ============================================
    // STEP 1: Create Test Workspace
    // ============================================
    log('📁 STEP 1: Create Test Workspace')

    const { data: workspace, error: workspaceError } = await supabase
      .from('workspaces')
      .insert(testWorkspace)
      .select()
      .single()

    if (workspaceError || !workspace) {
      fail('Create workspace', workspaceError?.message || 'No workspace returned')
      return
    }
    workspaceId = workspace.id
    success('Create workspace', { id: workspaceId })

    // ============================================
    // STEP 2: Create Test User
    // ============================================
    log('👤 STEP 2: Create Test User')

    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({ ...testUser, workspace_id: workspaceId })
      .select()
      .single()

    if (userError || !user) {
      fail('Create user', userError?.message || 'No user returned')
      return
    }
    userId = user.id
    success('Create user', { id: userId })

    // ============================================
    // STEP 3: Create Client Profile
    // ============================================
    log('🏢 STEP 3: Create Client Profile')

    const { data: clientProfile, error: clientProfileError } = await supabase
      .from('client_profiles')
      .insert({ ...testClientProfile, workspace_id: workspaceId })
      .select()
      .single()

    if (clientProfileError || !clientProfile) {
      fail('Create client profile', clientProfileError?.message || 'No client profile returned')
      return
    }
    clientProfileId = clientProfile.id
    success('Create client profile', { id: clientProfileId })

    // ============================================
    // STEP 4: Create Email Templates
    // ============================================
    log('📝 STEP 4: Create Email Templates (3 templates)')

    for (const template of testTemplates) {
      const { data: createdTemplate, error: templateError } = await supabase
        .from('email_templates')
        .insert({ ...template, workspace_id: workspaceId })
        .select()
        .single()

      if (templateError || !createdTemplate) {
        fail(`Create template: ${template.name}`, templateError?.message || 'No template returned')
        continue
      }
      templateIds.push(createdTemplate.id)
      success(`Create template: ${template.name}`, { id: createdTemplate.id })
    }

    if (templateIds.length !== 3) {
      fail('Create all templates', `Only ${templateIds.length}/3 templates created`)
    }

    // ============================================
    // STEP 5: Create Campaign
    // ============================================
    log('📧 STEP 5: Create Email Campaign')

    const campaignData = {
      workspace_id: workspaceId,
      name: `${TEST_PREFIX} Integration Test Campaign`,
      description: 'Automated integration test campaign',
      status: 'draft',
      target_industries: ['Technology', 'Healthcare', 'Finance'],
      target_company_sizes: ['50-200', '200-500'],
      target_seniorities: ['VP', 'Director', 'C-Level'],
      value_propositions: testClientProfile.value_propositions,
      trust_signals: testClientProfile.trust_signals,
      selected_template_ids: templateIds,
      matching_mode: 'intelligent',
      sequence_steps: 3,
      days_between_steps: [3, 5],
    }

    const { data: campaign, error: campaignError } = await supabase
      .from('email_campaigns')
      .insert(campaignData)
      .select()
      .single()

    if (campaignError || !campaign) {
      fail('Create campaign', campaignError?.message || 'No campaign returned')
      return
    }
    campaignId = campaign.id
    success('Create campaign', { id: campaignId, status: campaign.status })

    // ============================================
    // STEP 6: Create Leads
    // ============================================
    log('👥 STEP 6: Create Test Leads (5 leads)')

    for (const lead of testLeads) {
      const { data: createdLead, error: leadError } = await supabase
        .from('leads')
        .insert({ ...lead, workspace_id: workspaceId })
        .select()
        .single()

      if (leadError || !createdLead) {
        fail(`Create lead: ${lead.email}`, leadError?.message || 'No lead returned')
        continue
      }
      leadIds.push(createdLead.id)
      success(`Create lead: ${lead.email}`, { id: createdLead.id })
    }

    // ============================================
    // STEP 7: Add Leads to Campaign
    // ============================================
    log('🔗 STEP 7: Add Leads to Campaign')

    for (const leadId of leadIds) {
      const { data: campaignLead, error: clError } = await supabase
        .from('campaign_leads')
        .insert({
          campaign_id: campaignId,
          lead_id: leadId,
          status: 'pending',
          current_step: 0,
        })
        .select()
        .single()

      if (clError || !campaignLead) {
        fail(`Add lead ${leadId} to campaign`, clError?.message || 'No campaign_lead returned')
        continue
      }
      campaignLeadIds.push(campaignLead.id)
      success(`Add lead to campaign`, { campaign_lead_id: campaignLead.id })
    }

    // ============================================
    // STEP 8: Simulate Enrichment
    // ============================================
    log('🔬 STEP 8: Simulate Lead Enrichment')

    for (const campaignLeadId of campaignLeadIds) {
      const enrichmentData = {
        company_summary: 'A growing company in their industry with strong market presence.',
        recent_news: ['Recently closed Series B funding', 'Launched new product line'],
        key_challenges: ['Scaling sales operations', 'Improving customer retention'],
        personalization_hooks: [
          'Noticed your recent product launch',
          'Your growth trajectory is impressive',
        ],
        decision_makers: ['CEO', 'CRO', 'VP Sales'],
        technology_stack: ['Salesforce', 'HubSpot', 'Slack'],
      }

      const { error: enrichError } = await supabase
        .from('campaign_leads')
        .update({
          enrichment_data: enrichmentData,
          enriched_at: new Date().toISOString(),
          status: 'ready',
        })
        .eq('id', campaignLeadId)

      if (enrichError) {
        fail(`Enrich lead ${campaignLeadId}`, enrichError.message)
      } else {
        success(`Enrich lead`, { campaign_lead_id: campaignLeadId })
      }
    }

    // Verify enrichment
    const { data: enrichedLeads, error: verifyEnrichError } = await supabase
      .from('campaign_leads')
      .select('id, status, enrichment_data')
      .eq('campaign_id', campaignId)
      .eq('status', 'ready')

    if (verifyEnrichError || !enrichedLeads) {
      fail('Verify enrichment', verifyEnrichError?.message || 'No enriched leads found')
    } else {
      success(`Verify enrichment: ${enrichedLeads.length} leads enriched`)
    }

    // ============================================
    // STEP 9: Compose Sample Emails
    // ============================================
    log('✍️ STEP 9: Compose Sample Emails')

    // Get a lead with enrichment data
    const { data: sampleCampaignLead } = await supabase
      .from('campaign_leads')
      .select(`
        *,
        lead:leads(*)
      `)
      .eq('campaign_id', campaignId)
      .eq('status', 'ready')
      .limit(1)
      .single()

    if (!sampleCampaignLead || !sampleCampaignLead.lead) {
      fail('Get sample lead for composition', 'No enriched lead found')
    } else {
      // Create a composed email
      const lead = sampleCampaignLead.lead as unknown as {
        email: string
        first_name: string
        company_name: string
        company_industry: string
        job_title: string
      }
      const template = testTemplates[0]
      const composedSubject = template.subject
        .replace('{{company_name}}', lead.company_name || 'Your Company')

      const composedBody = template.body_html
        .replace('{{first_name}}', lead.first_name || 'there')
        .replace('{{company_name}}', lead.company_name || 'your company')
        .replace('{{industry}}', lead.company_industry || 'your')
        .replace('{{sender_name}}', 'Integration Test')

      const { data: emailSend, error: composeError } = await supabase
        .from('email_sends')
        .insert({
          campaign_id: campaignId,
          workspace_id: workspaceId,
          lead_id: sampleCampaignLead.lead_id,
          campaign_lead_id: sampleCampaignLead.id,
          template_id: templateIds[0],
          to_email: lead.email || 'test@example.com',
          subject: composedSubject,
          body_html: composedBody,
          body_text: composedBody.replace(/<[^>]*>/g, ''),
          sequence_step: 1,
          status: 'pending_approval',
          tone_used: template.tone,
          structure_used: template.structure,
          cta_type_used: template.cta_type,
        })
        .select()
        .single()

      if (composeError || !emailSend) {
        fail('Compose email', composeError?.message || 'No email_send returned')
      } else {
        emailSendId = emailSend.id
        success('Compose email', {
          id: emailSendId,
          to: emailSend.to_email,
          subject: emailSend.subject,
        })
      }
    }

    // ============================================
    // STEP 10: Simulate Email Approval
    // ============================================
    log('✅ STEP 10: Simulate Email Approval')

    if (emailSendId) {
      const { error: approvalError } = await supabase
        .from('email_sends')
        .update({ status: 'approved' })
        .eq('id', emailSendId)

      if (approvalError) {
        fail('Approve email', approvalError.message)
      } else {
        success('Approve email', { id: emailSendId, status: 'approved' })
      }
    }

    // ============================================
    // STEP 11: Simulate Email Send (Mock Mode)
    // ============================================
    log('📤 STEP 11: Simulate Email Send')

    if (emailSendId) {
      const { error: sendError } = await supabase
        .from('email_sends')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
          provider: 'mock',
          provider_message_id: `mock_${Date.now()}`,
        })
        .eq('id', emailSendId)

      if (sendError) {
        fail('Send email (mock)', sendError.message)
      } else {
        success('Send email (mock)', { id: emailSendId, status: 'sent' })
      }

      // Update campaign_lead status
      const { error: clUpdateError } = await supabase
        .from('campaign_leads')
        .update({
          status: 'in_sequence',
          current_step: 1,
          last_email_sent_at: new Date().toISOString(),
        })
        .eq('campaign_id', campaignId)
        .eq('lead_id', sampleCampaignLead?.lead_id)

      if (clUpdateError) {
        fail('Update campaign_lead after send', clUpdateError.message)
      } else {
        success('Update campaign_lead after send')
      }
    }

    // ============================================
    // STEP 12: Simulate Reply Webhook
    // ============================================
    log('📨 STEP 12: Simulate Reply Webhook')

    // Check if email_replies table exists and create a mock reply
    const { data: emailSendData } = await supabase
      .from('email_sends')
      .select('*')
      .eq('id', emailSendId)
      .single()

    if (emailSendData) {
      // Update the email_send to mark as replied
      const { error: replyError } = await supabase
        .from('email_sends')
        .update({
          status: 'replied',
          replied_at: new Date().toISOString(),
        })
        .eq('id', emailSendId)

      if (replyError) {
        fail('Update email as replied', replyError.message)
      } else {
        success('Update email as replied', { id: emailSendId, status: 'replied' })
      }
    }

    // ============================================
    // STEP 13: Verify Reply Classification (Mock)
    // ============================================
    log('🤖 STEP 13: Simulate Reply Classification')

    // Mock reply classification by updating campaign_lead
    if (campaignLeadIds[0]) {
      const { error: classifyError } = await supabase
        .from('campaign_leads')
        .update({
          status: 'positive',
        })
        .eq('id', campaignLeadIds[0])

      if (classifyError) {
        fail('Classify reply', classifyError.message)
      } else {
        success('Classify reply as positive')
      }
    }

    // ============================================
    // STEP 14: Test Campaign State Machine
    // ============================================
    log('🔄 STEP 14: Test Campaign State Machine')

    // Test draft -> pending_review
    let { error: transition1Error } = await supabase
      .from('email_campaigns')
      .update({
        status: 'pending_review',
        submitted_for_review_at: new Date().toISOString(),
      })
      .eq('id', campaignId)

    if (transition1Error) {
      fail('Transition: draft -> pending_review', transition1Error.message)
    } else {
      success('Transition: draft -> pending_review')
    }

    // Test pending_review -> approved
    let { error: transition2Error } = await supabase
      .from('email_campaigns')
      .update({
        status: 'approved',
        reviewed_at: new Date().toISOString(),
        reviewed_by: userId,
      })
      .eq('id', campaignId)

    if (transition2Error) {
      fail('Transition: pending_review -> approved', transition2Error.message)
    } else {
      success('Transition: pending_review -> approved')
    }

    // Test approved -> active
    let { error: transition3Error } = await supabase
      .from('email_campaigns')
      .update({
        status: 'active',
      })
      .eq('id', campaignId)

    if (transition3Error) {
      fail('Transition: approved -> active', transition3Error.message)
    } else {
      success('Transition: approved -> active')
    }

    // ============================================
    // STEP 15: Verify Final State
    // ============================================
    log('🔍 STEP 15: Verify Final State')

    // Verify campaign
    const { data: finalCampaign, error: fcError } = await supabase
      .from('email_campaigns')
      .select('*')
      .eq('id', campaignId)
      .single()

    if (fcError || !finalCampaign) {
      fail('Verify campaign state', fcError?.message || 'Campaign not found')
    } else {
      success('Verify campaign state', {
        status: finalCampaign.status,
        total_sent: finalCampaign.total_sent,
      })
    }

    // Verify campaign leads
    const { data: finalLeads, error: flError } = await supabase
      .from('campaign_leads')
      .select('id, status, current_step')
      .eq('campaign_id', campaignId)

    if (flError) {
      fail('Verify campaign_leads state', flError.message)
    } else {
      const statusCounts = finalLeads?.reduce(
        (acc, l) => {
          acc[l.status] = (acc[l.status] || 0) + 1
          return acc
        },
        {} as Record<string, number>
      )
      success('Verify campaign_leads state', { count: finalLeads?.length, statusCounts })
    }

    // Verify email sends
    const { data: finalEmails, error: feError } = await supabase
      .from('email_sends')
      .select('id, status')
      .eq('campaign_id', campaignId)

    if (feError) {
      fail('Verify email_sends state', feError.message)
    } else {
      success('Verify email_sends state', { count: finalEmails?.length })
    }
  } catch (error) {
    fail('Unexpected error', error instanceof Error ? error.message : String(error))
  } finally {
    // ============================================
    // CLEANUP
    // ============================================
    await cleanup()

    // Print summary
    printSummary()
  }
}

async function cleanup() {
  log('\n🧹 CLEANUP: Removing test data')

  try {
    // Delete in reverse order of dependencies
    if (emailSendId) {
      await supabase.from('email_sends').delete().eq('campaign_id', campaignId)
      console.log('  - Deleted email_sends')
    }

    if (campaignLeadIds.length > 0) {
      await supabase.from('campaign_leads').delete().eq('campaign_id', campaignId)
      console.log('  - Deleted campaign_leads')
    }

    if (campaignId) {
      await supabase.from('email_campaigns').delete().eq('id', campaignId)
      console.log('  - Deleted campaign')
    }

    if (leadIds.length > 0) {
      await supabase.from('leads').delete().in('id', leadIds)
      console.log('  - Deleted leads')
    }

    if (templateIds.length > 0) {
      await supabase.from('email_templates').delete().in('id', templateIds)
      console.log('  - Deleted templates')
    }

    if (clientProfileId) {
      await supabase.from('client_profiles').delete().eq('id', clientProfileId)
      console.log('  - Deleted client_profile')
    }

    if (userId) {
      await supabase.from('users').delete().eq('id', userId)
      console.log('  - Deleted user')
    }

    if (workspaceId) {
      await supabase.from('workspaces').delete().eq('id', workspaceId)
      console.log('  - Deleted workspace')
    }

    console.log('  ✅ Cleanup complete')
  } catch (cleanupError) {
    console.log(`  ⚠️ Cleanup error: ${cleanupError}`)
  }
}

function printSummary() {
  log('\n' + '=' .repeat(60))
  log('📊 TEST SUMMARY')
  log('=' .repeat(60))

  const passed = results.filter((r) => r.passed).length
  const failed = results.filter((r) => !r.passed).length

  console.log(`\n  Total: ${results.length} tests`)
  console.log(`  ✅ Passed: ${passed}`)
  console.log(`  ❌ Failed: ${failed}`)

  if (failed > 0) {
    console.log('\n  Failed tests:')
    results
      .filter((r) => !r.passed)
      .forEach((r) => {
        console.log(`    - ${r.step}: ${r.error}`)
      })
  }

  console.log('\n' + '=' .repeat(60))

  // Exit with appropriate code
  process.exit(failed > 0 ? 1 : 0)
}

// Run the tests
runTests()
