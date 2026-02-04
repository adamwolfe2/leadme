# End-to-End Testing Guide
# Service Subscriptions Platform

## Pre-Test Setup

### 1. Environment Variables
Verify these are set in `.env.local`:

```bash
# Stripe (use test mode keys first)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Resend
RESEND_API_KEY=re_29xKUaYo_8JXZRfdqxMM57pnzRB8Xs7SN

# Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Supabase (already configured)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

### 2. Stripe Webhook Setup
1. Install Stripe CLI: `brew install stripe/stripe-cli/stripe`
2. Login: `stripe login`
3. Forward webhooks to local: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
4. Copy webhook signing secret to `.env.local`

### 3. Database Verification
Run migrations:
```bash
# Check all migrations applied
npx supabase migration list

# If needed, apply manually
npx supabase db push
```

---

## Test Scenarios

### Test 1: Checkout Flow (Cursive Data - $1,000/mo)

**Goal:** Verify customer can purchase subscription

**Steps:**
1. ✅ Navigate to `/services/checkout?tier=cursive-data`
2. ✅ Sign up with test email: `test-customer@example.com`
3. ✅ Redirected to Stripe Checkout
4. ✅ Use test card: `4242 4242 4242 4242`, exp: `12/34`, CVC: `123`
5. ✅ Complete payment
6. ✅ Redirected to `/services/success?tier=cursive-data`

**Expected Results:**
- Success page shows "Welcome to Cursive Data"
- Email sent to test-customer@example.com (check Resend dashboard)
- Subject: "You're in. Here's what happens next."

**Database Checks:**
```sql
-- Verify subscription created
SELECT * FROM service_subscriptions
WHERE stripe_customer_id LIKE 'cus_%'
ORDER BY created_at DESC LIMIT 1;

-- Should show:
-- status: 'onboarding' or 'active'
-- monthly_price: 1000
-- stripe_subscription_id: sub_xxx
-- onboarding_completed: false
```

---

### Test 2: Stripe Webhook Processing

**Goal:** Verify webhooks create subscription records

**Stripe CLI Output:**
Watch for these events:
```
✅ customer.subscription.created
✅ invoice.payment_succeeded
✅ customer.subscription.updated
```

**Database After Webhooks:**
```sql
-- Check subscription status
SELECT
  ss.id,
  ss.status,
  ss.monthly_price,
  ss.onboarding_completed,
  st.name as tier_name
FROM service_subscriptions ss
JOIN service_tiers st ON st.id = ss.service_tier_id
ORDER BY ss.created_at DESC LIMIT 1;
```

**Expected:**
- Status: 'onboarding' (if tier requires onboarding) or 'active'
- Monthly price: 1000
- Tier name: 'Cursive Data'

---

### Test 3: Onboarding Flow

**Goal:** Customer completes targeting criteria

**Steps:**
1. ✅ Navigate to `/services/onboarding`
2. ✅ **Step 1:** Select industries (SaaS, E-commerce), company size (51-200), revenue ($1M-$5M)
3. ✅ Click "Next"
4. ✅ **Step 2:** Enter target titles:
   ```
   CEO
   VP of Sales
   Head of Growth
   ```
5. ✅ Select seniority: C-Level, VP
6. ✅ Click "Next"
7. ✅ **Step 3:** Select geo (United States), optional tech stack (Salesforce, HubSpot)
8. ✅ Click "Next"
9. ✅ **Step 4:** Fill out:
   - Use case: "Cold outbound email campaigns"
   - Ideal lead profile: "B2B SaaS companies, $1M+ ARR, 50-200 employees, based in US"
   - Exclusions: "No agencies, no consultants"
10. ✅ Click "Complete Onboarding"
11. ✅ Redirected to `/dashboard?onboarding=complete`

**Database Checks:**
```sql
SELECT
  onboarding_completed,
  onboarding_data
FROM service_subscriptions
WHERE id = 'YOUR_SUBSCRIPTION_ID';

-- Expected:
-- onboarding_completed: true
-- onboarding_data: {...all the criteria you entered}
```

**API Request:**
```bash
# Verify API route works
curl -X POST http://localhost:3000/api/services/onboarding \
  -H "Content-Type: application/json" \
  -d '{
    "subscription_id": "YOUR_SUB_ID",
    "onboarding_data": {...}
  }'
```

---

### Test 4: Admin - Create Delivery

**Goal:** Admin uploads lead list CSV

**Steps:**
1. ✅ Login as admin user
2. ✅ Navigate to `/admin/services/deliveries/create`
3. ✅ Select subscription from dropdown
4. ✅ Verify customer ICP displays (shows onboarding data)
5. ✅ Set delivery type: "Lead List"
6. ✅ Set period: Today to +30 days
7. ✅ Create test CSV file:
   ```csv
   company_name,contact_name,email,title,phone
   Acme Corp,John Doe,john@acme.com,CEO,555-1234
   Tech Inc,Jane Smith,jane@tech.com,VP Sales,555-5678
   ```
8. ✅ Upload CSV file (drag & drop or click)
9. ✅ Check "Send delivery notification email"
10. ✅ Click "Create Delivery"
11. ✅ Success message appears
12. ✅ Redirected to `/admin/services/deliveries`

**Expected Results:**
- Delivery shows in list with status "Delivered"
- Email sent to customer with download link
- Subject: "Your Lead List is ready"

**Database Checks:**
```sql
-- Verify delivery created
SELECT
  id,
  delivery_type,
  status,
  file_path,
  file_name,
  file_size,
  delivered_at
FROM service_deliveries
ORDER BY created_at DESC LIMIT 1;

-- Expected:
-- status: 'delivered'
-- file_path: 'workspace_id/delivery_id/filename.csv'
-- delivered_at: current timestamp
```

**Storage Checks:**
```sql
-- Verify file uploaded to Supabase Storage
SELECT name, metadata
FROM storage.objects
WHERE bucket_id = 'service-deliveries'
ORDER BY created_at DESC LIMIT 1;
```

---

### Test 5: Customer - Download Delivery

**Goal:** Customer downloads their lead list

**Steps:**
1. ✅ Login as customer (test-customer@example.com)
2. ✅ Navigate to `/services/manage`
3. ✅ Verify subscription details show:
   - Tier: "Cursive Data"
   - Price: "$1,000/mo"
   - Status: "Active"
   - Next billing date displayed
4. ✅ Verify delivery appears in "Deliveries" section
5. ✅ Click "Download" button
6. ✅ File downloads successfully
7. ✅ Open CSV and verify data matches what admin uploaded

**Expected Results:**
- Download initiates immediately
- File contains exact data uploaded by admin
- No errors in console

**API Test:**
```bash
# Test download API
curl -X POST http://localhost:3000/api/services/deliveries/download \
  -H "Content-Type: application/json" \
  -H "Cookie: YOUR_SESSION_COOKIE" \
  -d '{"delivery_id": "DELIVERY_ID"}'

# Should return:
# {
#   "download_url": "https://...signed-url...",
#   "file_name": "leads.csv"
# }
```

---

### Test 6: Stripe Customer Portal

**Goal:** Customer manages billing

**Steps:**
1. ✅ From `/services/manage`, click "Manage Billing"
2. ✅ Redirected to Stripe Customer Portal
3. ✅ Verify subscription shows correctly
4. ✅ Click "Update payment method"
5. ✅ Add new test card: `5555 5555 5555 4444`
6. ✅ Verify payment method updated
7. ✅ Click "Cancel subscription"
8. ✅ Confirm cancellation
9. ✅ Redirected back to `/services/manage`

**Expected Results:**
- Cancellation email sent
- Subject: "You're cancelled. Door's always open."
- Subscription status in dashboard shows "Cancelled"

**Database Checks:**
```sql
SELECT status, cancel_at_period_end, current_period_end
FROM service_subscriptions
WHERE id = 'YOUR_SUBSCRIPTION_ID';

-- Expected:
-- status: 'cancelled' (or 'active' with cancel_at_period_end = true)
```

---

### Test 7: Automated Reminder Emails

**Goal:** Verify scheduled jobs work

#### Test 7A: Onboarding Reminder

**Setup:**
```sql
-- Create test subscription with old created_at date
UPDATE service_subscriptions
SET created_at = NOW() - INTERVAL '4 days',
    onboarding_completed = false
WHERE id = 'YOUR_TEST_SUB_ID';
```

**Trigger Job:**
```bash
# Manually trigger via Inngest dashboard or API
curl -X POST http://localhost:3000/api/inngest \
  -H "Content-Type: application/json" \
  -d '{"name": "send-onboarding-reminders"}'
```

**Expected:**
- Email sent to customer
- Subject: "Let's get your first leads rolling"
- Check Inngest dashboard for job execution logs

#### Test 7B: Renewal Reminder

**Setup:**
```sql
-- Set renewal date to 7 days from now
UPDATE service_subscriptions
SET current_period_end = NOW() + INTERVAL '7 days',
    status = 'active',
    cancel_at_period_end = false
WHERE id = 'YOUR_TEST_SUB_ID';
```

**Trigger Job:**
```bash
# Manually trigger
curl -X POST http://localhost:3000/api/inngest \
  -H "Content-Type: application/json" \
  -d '{"name": "send-renewal-reminders"}'
```

**Expected:**
- Email sent to customer
- Subject: "Heads up: renewal in 7 days"
- Contains renewal date and amount

---

### Test 8: Payment Failed Flow

**Goal:** Verify payment failure handling

**Steps:**
1. ✅ In Stripe dashboard, set subscription to use declining card
2. ✅ Use test card that fails: `4000 0000 0000 0341`
3. ✅ Wait for Stripe to attempt charge (or trigger manually)
4. ✅ Webhook received: `invoice.payment_failed`

**Expected Results:**
- Subscription status → 'pending_payment'
- Email sent with subject: "Quick heads up: payment didn't go through"
- Customer can update payment method via portal

**Database:**
```sql
SELECT status FROM service_subscriptions
WHERE id = 'YOUR_SUB_ID';
-- Expected: 'pending_payment'
```

---

## Verification Checklist

### Email Delivery (Check Resend Dashboard)

- [ ] Welcome email sent after purchase
- [ ] Delivery notification sent after admin upload
- [ ] Onboarding reminder sent (manual trigger)
- [ ] Renewal reminder sent (manual trigger)
- [ ] Payment failed email sent (manual trigger)
- [ ] Cancellation email sent after cancel

### Database Integrity

- [ ] service_subscriptions record created
- [ ] onboarding_data populated after completion
- [ ] service_deliveries record created
- [ ] File uploaded to storage bucket
- [ ] Subscription status updates correctly

### API Routes Working

- [ ] POST `/api/services/checkout` - Creates Stripe session
- [ ] POST `/api/services/onboarding` - Saves onboarding data
- [ ] POST `/api/admin/deliveries/create` - Uploads file & creates delivery
- [ ] POST `/api/services/deliveries/download` - Returns signed URL
- [ ] POST `/api/services/customer-portal` - Creates Stripe portal session
- [ ] POST `/api/webhooks/stripe` - Processes webhooks

### UI/UX

- [ ] Checkout flow smooth, no errors
- [ ] Onboarding form validates properly
- [ ] Admin delivery creation shows customer ICP
- [ ] Customer portal displays subscription details
- [ ] Download button works without errors
- [ ] Success pages show correct messages

### Security

- [ ] Non-admin can't access `/admin/services`
- [ ] Customer can only download their own deliveries
- [ ] Workspace isolation enforced
- [ ] Signed URLs expire correctly
- [ ] RLS policies prevent cross-workspace access

---

## Common Issues & Fixes

### Issue: Webhook not received
**Fix:**
- Ensure Stripe CLI is running: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
- Check webhook endpoint is accessible
- Verify STRIPE_WEBHOOK_SECRET in `.env.local`

### Issue: Email not sending
**Fix:**
- Verify RESEND_API_KEY in `.env.local`
- Check Resend dashboard for errors
- Ensure domain `send@meetcursive.com` is verified

### Issue: File download fails
**Fix:**
- Check file exists in storage: Query `storage.objects`
- Verify RLS policies on storage bucket
- Check workspace_id in file path matches user's workspace

### Issue: Onboarding not saving
**Fix:**
- Check console for API errors
- Verify subscription_id is correct
- Ensure user has access to workspace

### Issue: Stripe customer portal errors
**Fix:**
- Verify stripe_customer_id exists in subscription
- Check Stripe account has Customer Portal enabled
- Ensure return_url is correct

---

## Performance Testing

### Load Test Scenarios

1. **100 simultaneous checkouts**
   - Use Stripe load testing
   - Monitor webhook processing time
   - Check database connection pool

2. **Large file uploads (50MB CSV)**
   - Test admin delivery creation
   - Monitor storage bucket limits
   - Check upload timeout settings

3. **Concurrent downloads**
   - 50 customers download at once
   - Monitor signed URL generation time
   - Check storage bandwidth

---

## Go-Live Checklist

Before switching to production:

- [ ] All tests pass in test mode
- [ ] Switch Stripe keys to live mode
- [ ] Update NEXT_PUBLIC_BASE_URL to production domain
- [ ] Verify Resend domain is production-ready
- [ ] Set up Stripe webhooks in production
- [ ] Configure Inngest in production environment
- [ ] Test one real subscription with refund
- [ ] Monitor error logs for 24 hours
- [ ] Set up alerting for failed jobs

---

## Monitoring & Alerts

Set up monitoring for:

1. **Stripe Webhooks**
   - Failed webhook deliveries
   - Payment failures
   - Subscription cancellations

2. **Inngest Jobs**
   - Failed job executions
   - Email sending failures
   - Job execution time

3. **Storage**
   - Upload failures
   - Download errors
   - Storage quota approaching limit

4. **Emails**
   - Bounce rate
   - Failed sends
   - Spam complaints

---

## Success Metrics to Track

After launch, monitor:

- Conversion rate (checkout → completed purchase)
- Onboarding completion rate
- Time to first delivery
- Download rate (deliveries → downloads)
- Churn rate by tier
- Average delivery size
- Customer support tickets
- Email open rates

---

**Test thoroughly in Stripe test mode before going live!**
