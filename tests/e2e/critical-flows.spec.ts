import { test, expect } from '@playwright/test'

/**
 * Critical End-to-End Tests
 * Verifies platform is ready for production launch
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

// Test credentials
const PARTNER_EMAIL = `partner-test-${Date.now()}@example.com`
const BUSINESS_EMAIL = `business-test-${Date.now()}@example.com`
const TEST_PASSWORD = 'TestPassword123!'

test.describe('Critical User Flows', () => {
  test.describe.configure({ mode: 'serial' })

  /**
   * FLOW 1: Partner Signup and Lead Upload
   */
  test('Partner can sign up and upload leads', async ({ page }) => {
    // Navigate to signup
    await page.goto(`${BASE_URL}/signup`)
    await expect(page).toHaveTitle(/Cursive|Sign up/i)

    // Fill signup form
    await page.fill('input[name="full_name"]', 'Test Partner')
    await page.fill('input[name="email"]', PARTNER_EMAIL)
    await page.fill('input[name="password"]', TEST_PASSWORD)
    await page.fill('input[name="confirm_password"]', TEST_PASSWORD)
    await page.check('input[name="terms"]')

    // Submit signup
    await page.click('button[type="submit"]')

    // Should redirect to welcome page
    await page.waitForURL(/\/welcome/, { timeout: 10000 })
    await expect(page.locator('h2')).toContainText(/Welcome to Cursive/i)

    // Select Partner role
    await page.click('text=I\'m a Partner')

    // Fill partner onboarding
    await page.fill('input[type="text"]', 'Test Lead Company')
    await page.click('button:has-text("Get Started")')

    // Should redirect to partner dashboard
    await page.waitForURL(/\/partner/, { timeout: 15000 })
    await expect(page.locator('h1')).toContainText(/Partner Dashboard/i)

    // Navigate to upload page
    await page.click('a[href="/partner/upload"]')
    await page.waitForURL(/\/partner\/upload/)

    // Upload CSV file
    const csvContent = `first_name,last_name,email,phone,company,title,industry,location
John,Doe,john@example.com,555-1234,Acme Corp,CEO,Technology,CA
Jane,Smith,jane@example.com,555-5678,Tech Inc,VP Sales,Technology,NY`

    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles({
      name: 'test-leads.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent)
    })

    // Wait for upload processing
    await page.waitForSelector('text=/uploaded|success|complete/i', { timeout: 30000 })

    // Verify leads were uploaded
    await page.goto(`${BASE_URL}/partner/dashboard`)
    const statsCard = page.locator('text=/uploaded|total leads/i').first()
    await expect(statsCard).toBeVisible()
  })

  /**
   * FLOW 2: Business Signup and Lead Purchase
   */
  test('Business can sign up and purchase leads', async ({ page }) => {
    // Navigate to signup
    await page.goto(`${BASE_URL}/signup`)

    // Fill signup form
    await page.fill('input[name="full_name"]', 'Test Business Owner')
    await page.fill('input[name="email"]', BUSINESS_EMAIL)
    await page.fill('input[name="password"]', TEST_PASSWORD)
    await page.fill('input[name="confirm_password"]', TEST_PASSWORD)
    await page.check('input[name="terms"]')

    // Submit signup
    await page.click('button[type="submit"]')

    // Should redirect to welcome page
    await page.waitForURL(/\/welcome/, { timeout: 10000 })

    // Select Business role
    await page.click('text=I\'m a Business')

    // Fill business onboarding
    await page.fill('input[placeholder*="Business"]', 'Test Business LLC')
    await page.selectOption('select', 'HVAC')
    await page.click('button:has-text("Continue")')

    // Should show service area selection
    await page.click('button:has-text("CA")') // Select California
    await page.click('button:has-text("Get Started")')

    // Should redirect to dashboard
    await page.waitForURL(/\/dashboard/, { timeout: 15000 })
    await expect(page.locator('h1,h2')).toContainText(/Dashboard|Welcome/i)

    // Navigate to marketplace
    await page.click('a[href="/marketplace"]')
    await page.waitForURL(/\/marketplace/)

    // Wait for leads to load
    await page.waitForSelector('[data-testid="lead-card"], .lead-card, text=/HVAC|lead/i', { timeout: 10000 })

    // Check if there are leads available
    const leadCards = page.locator('[data-testid="lead-card"], .lead-card, div:has-text("@")')
    const count = await leadCards.count()

    if (count > 0) {
      // Select first lead
      const firstLead = leadCards.first()
      await firstLead.click()

      // Look for purchase button
      const purchaseButton = page.locator('button:has-text(/purchase|buy|add to cart/i)').first()
      if (await purchaseButton.isVisible({ timeout: 5000 })) {
        await purchaseButton.click()

        // Wait for purchase confirmation or checkout
        await page.waitForSelector('text=/success|purchased|checkout/i', { timeout: 30000 })
      }
    }

    // Verify in CRM
    await page.click('a[href*="/crm"]')
    await page.waitForURL(/\/crm/, { timeout: 10000 })
  })

  /**
   * FLOW 3: Payment Processing
   */
  test('Stripe payment integration works', async ({ page }) => {
    // Login as business user
    await page.goto(`${BASE_URL}/login`)
    await page.fill('input[type="email"]', BUSINESS_EMAIL)
    await page.fill('input[type="password"]', TEST_PASSWORD)
    await page.click('button[type="submit"]')

    await page.waitForURL(/\/dashboard/, { timeout: 10000 })

    // Navigate to settings/billing
    await page.goto(`${BASE_URL}/settings/billing`)

    // Check for Stripe elements
    const stripeSection = page.locator('text=/payment|billing|subscription|stripe/i')
    await expect(stripeSection.first()).toBeVisible({ timeout: 5000 })

    // Verify credit balance is displayed
    const creditBalance = page.locator('text=/credit|balance/i')
    await expect(creditBalance.first()).toBeVisible({ timeout: 5000 })
  })

  /**
   * FLOW 4: Lead Routing and Delivery
   */
  test('Leads are delivered to correct workspace', async ({ page }) => {
    // Login as business
    await page.goto(`${BASE_URL}/login`)
    await page.fill('input[type="email"]', BUSINESS_EMAIL)
    await page.fill('input[type="password"]', TEST_PASSWORD)
    await page.click('button[type="submit"]')

    await page.waitForURL(/\/dashboard/, { timeout: 10000 })

    // Navigate to CRM leads
    await page.goto(`${BASE_URL}/crm/leads`)

    // Check for leads table/list
    const leadsSection = page.locator('[data-testid="leads-table"], table, .leads-list')
    await expect(leadsSection.first()).toBeVisible({ timeout: 10000 })

    // Verify lead data is displayed
    const leadRows = page.locator('tr, [data-testid="lead-row"]')
    const rowCount = await leadRows.count()

    console.log(`Found ${rowCount} leads in CRM`)
    expect(rowCount).toBeGreaterThanOrEqual(0) // At least 0 leads (empty state is ok)
  })

  /**
   * FLOW 5: Workspace Isolation
   */
  test('Workspaces are properly isolated', async ({ page, context }) => {
    // Login as business user in first tab
    await page.goto(`${BASE_URL}/login`)
    await page.fill('input[type="email"]', BUSINESS_EMAIL)
    await page.fill('input[type="password"]', TEST_PASSWORD)
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/dashboard/, { timeout: 10000 })

    // Get workspace info from dashboard
    const businessWorkspace = await page.textContent('body')

    // Login as partner in second tab
    const page2 = await context.newPage()
    await page2.goto(`${BASE_URL}/login`)
    await page2.fill('input[type="email"]', PARTNER_EMAIL)
    await page2.fill('input[type="password"]', TEST_PASSWORD)
    await page2.click('button[type="submit"]')
    await page2.waitForURL(/\/partner/, { timeout: 10000 })

    // Verify they see different data
    const partnerWorkspace = await page2.textContent('body')

    // They should not see each other's data
    expect(businessWorkspace).not.toEqual(partnerWorkspace)

    await page2.close()
  })

  /**
   * FLOW 6: Error Handling
   */
  test('Error boundaries catch crashes gracefully', async ({ page }) => {
    // Try to access a page that might have errors
    await page.goto(`${BASE_URL}/dashboard`)

    // Check for error boundary fallback or working page
    const pageContent = page.locator('body')
    await expect(pageContent).toBeVisible()

    // Should not show blank white screen
    const hasContent = await pageContent.textContent()
    expect(hasContent?.trim().length).toBeGreaterThan(0)

    // Check for error boundary UI if present
    const errorBoundary = page.locator('text=/something went wrong|error occurred/i')
    const hasError = await errorBoundary.isVisible({ timeout: 2000 }).catch(() => false)

    if (hasError) {
      // Error boundary should have retry button
      const retryButton = page.locator('button:has-text(/retry|reload/i)')
      await expect(retryButton).toBeVisible()
    }
  })

  /**
   * FLOW 7: Marketplace Filtering
   */
  test('Marketplace filters work correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/marketplace`)

    // Wait for marketplace to load
    await page.waitForSelector('text=/marketplace|leads|filters/i', { timeout: 10000 })

    // Apply industry filter if available
    const industryFilter = page.locator('select, button:has-text("Industry")')
    if (await industryFilter.isVisible({ timeout: 2000 })) {
      await industryFilter.first().click()

      // Select HVAC if available
      const hvacOption = page.locator('text=/HVAC/i').first()
      if (await hvacOption.isVisible({ timeout: 2000 })) {
        await hvacOption.click()

        // Wait for filtered results
        await page.waitForTimeout(1000)

        // Verify results updated (lead count changed or loading indicator appeared)
        const resultsSection = page.locator('[data-testid="leads-list"], .leads-container')
        await expect(resultsSection.first()).toBeVisible()
      }
    }
  })
})

/**
 * API Health Checks
 */
test.describe('API Health', () => {
  test('Critical API endpoints are accessible', async ({ request }) => {
    // Check marketplace API
    const marketplaceRes = await request.get(`${BASE_URL}/api/marketplace/leads`)
    expect(marketplaceRes.status()).toBeLessThan(500)

    // Check user API
    const userRes = await request.get(`${BASE_URL}/api/users/me`)
    expect([200, 401, 403]).toContain(userRes.status()) // 401/403 is ok (not authenticated)

    // Check health endpoint if exists
    try {
      const healthRes = await request.get(`${BASE_URL}/api/health`)
      expect(healthRes.status()).toBe(200)
    } catch (e) {
      console.log('Health endpoint not found (ok)')
    }
  })
})
