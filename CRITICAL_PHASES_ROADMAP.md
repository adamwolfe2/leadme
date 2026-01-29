# Critical Phases Roadmap - OpenInfo Platform

**Created:** 2026-01-29
**Status:** Priority Planning
**Goal:** Get to revenue-generating MVP as fast as possible

---

## 🚨 CRITICAL PATH (Blocks Revenue)

These phases are **essential** to have a functioning, revenue-generating platform. Without these, the platform cannot operate.

---

## Phase 1: Lead Data Population 🎯 **CRITICAL**

**Status:** 🔴 Blocking Everything
**Timeline:** 1-2 days
**Why Critical:** The CRM is beautiful but EMPTY. Without leads, there's nothing to manage or sell.

### What's Needed:

#### 1.1 Test Data Seeding
- [ ] Create seed script with 500+ realistic test leads
- [ ] Mix of industries (Healthcare, HVAC, Door-to-Door, etc.)
- [ ] Varied enrichment scores (some with phone, email, LinkedIn)
- [ ] Geographic distribution across US states
- [ ] Different freshness levels (0-30 days old)
- [ ] Assigned to test workspaces via routing rules

**Files to Create:**
- `scripts/seed-leads.ts` - Bulk insert test leads
- `scripts/generate-test-leads.ts` - Realistic lead generator

#### 1.2 CSV Bulk Upload Testing
- [ ] Test the existing CSV upload API (`/api/leads/bulk-upload`)
- [ ] Validate data parsing and enrichment
- [ ] Test routing logic with real data
- [ ] Error handling for bad CSV data

#### 1.3 Clay Integration Testing
- [ ] Test Clay webhook endpoint (`/api/webhooks/clay`)
- [ ] Verify lead creation from Clay data
- [ ] Test automatic routing to workspaces
- [ ] Monitor Inngest job execution

**Success Criteria:**
- ✅ 500+ leads in database across 3 verticals
- ✅ Leads correctly routed to workspaces
- ✅ CRM table shows real data
- ✅ Filters and search work with data

**Blockers Removed:**
- Can test CRM with real data
- Can test routing accuracy
- Can build marketplace with actual inventory

---

## Phase 2: Buyer Marketplace 🛒 **CRITICAL**

**Status:** 🔴 Blocking Revenue
**Timeline:** 3-4 days
**Why Critical:** This is THE revenue engine. No marketplace = no sales = no business.

### What's Needed:

#### 2.1 Available Leads View
- [ ] Table showing leads available for purchase
- [ ] Filtered by buyer's workspace routing rules
- [ ] Shows: Industry, Company Name, Location, Freshness, Price
- [ ] Hides: Email, Phone, Full Name (until purchased)
- [ ] Sorting by price, freshness, industry
- [ ] Pagination for large inventories

#### 2.2 Lead Preview Modal
- [ ] Click lead to see detailed preview (without contact info)
- [ ] Shows: Company details, industry, location, intent signals, enrichment score
- [ ] Shows price calculation breakdown
- [ ] "Purchase" button with price
- [ ] Purchase history (if lead was previously purchased)

#### 2.3 Purchase Flow
- [ ] Click "Purchase" → Stripe Checkout session
- [ ] Process payment via Stripe
- [ ] On success: Create `lead_purchases` record
- [ ] On success: Add lead to buyer's CRM
- [ ] On success: Send email with lead details (CSV attachment)
- [ ] On failure: Show error, don't charge

#### 2.4 Purchase History Page
- [ ] Table of all purchased leads
- [ ] Shows: Purchase date, price, lead details
- [ ] Filter by date range, industry
- [ ] Export all purchased leads to CSV
- [ ] Total spend summary

**Files to Create:**
```
src/app/marketplace/
├── page.tsx                          # Available leads table
├── components/
│   ├── MarketplaceLeadsTable.tsx     # Lead listing
│   ├── LeadPreviewModal.tsx          # Preview before purchase
│   ├── PurchaseButton.tsx            # Stripe checkout trigger
│   └── PurchaseHistoryTable.tsx      # Past purchases
src/app/api/marketplace/
├── available-leads/route.ts          # GET leads for buyer
├── purchase/route.ts                 # POST create purchase
└── purchase-history/route.ts         # GET buyer's purchases
src/lib/stripe/
└── create-checkout-session.ts        # Stripe integration
```

**Database Tables Needed:**
```sql
-- Already exists in migration, just needs to be applied
lead_purchases (
  id, lead_id, buyer_workspace_id,
  price_paid, purchased_at, stripe_payment_intent_id
)
```

**Success Criteria:**
- ✅ Buyers can browse available leads
- ✅ Buyers can purchase leads with Stripe
- ✅ Purchased leads appear in buyer's CRM
- ✅ Email sent with lead details
- ✅ Purchase history tracking works

**Blockers Removed:**
- Platform generates revenue
- Buyers get value (leads they purchased)
- Can onboard real customers

---

## Phase 3: Lead Detail Sidebar 📋 **CRITICAL**

**Status:** 🟡 Needed for Usability
**Timeline:** 2-3 days
**Why Critical:** Table view is insufficient. Users need to see full lead details, add notes, track activity.

### What's Needed:

#### 3.1 Sidebar Panel
- [ ] Click lead row → sidebar slides in from right
- [ ] Full lead information (name, email, phone, company, etc.)
- [ ] Enrichment data (LinkedIn, intent signals)
- [ ] Company details (size, industry, location)
- [ ] Lead source and freshness
- [ ] Edit button for inline updates

#### 3.2 Activity Timeline
- [ ] Chronological list of all activities
- [ ] Shows: Status changes, notes added, emails sent, calls logged
- [ ] User avatars and timestamps
- [ ] "Add Note" quick action
- [ ] "Log Call" quick action
- [ ] "Send Email" quick action

#### 3.3 Notes Section
- [ ] Add notes to leads
- [ ] Rich text editor (mentions, formatting)
- [ ] Edit/delete own notes
- [ ] Notes show in activity timeline
- [ ] Real-time updates (if multiple users)

#### 3.4 Quick Actions
- [ ] Click-to-call (tel: link)
- [ ] Click-to-email (mailto: link)
- [ ] Copy contact info to clipboard
- [ ] Share lead with teammate
- [ ] Archive lead
- [ ] Mark as contacted

**Files to Create:**
```
src/app/crm/leads/components/
├── LeadDetailSidebar.tsx            # Main sidebar container
├── LeadInfoSection.tsx              # Contact details
├── ActivityTimeline.tsx             # Activity feed
├── NotesSection.tsx                 # Notes UI
├── QuickActions.tsx                 # Action buttons
└── CallLogModal.tsx                 # Log call dialog
```

**Success Criteria:**
- ✅ Click lead → sidebar opens with full details
- ✅ Can add notes to leads
- ✅ Can see activity history
- ✅ Quick actions work (email, call, copy)
- ✅ Sidebar is responsive on mobile

**Blockers Removed:**
- Users can actually use leads effectively
- Can track interactions and history
- Professional CRM experience

---

## Phase 4: Data Export & Delivery 📤 **CRITICAL**

**Status:** 🟡 Needed for Buyer Satisfaction
**Timeline:** 1-2 days
**Why Critical:** Buyers need to get their data out. Many will import into their own CRM or use with other tools.

### What's Needed:

#### 4.1 CSV Export from CRM
- [ ] "Export" button on leads table
- [ ] Exports selected leads (or all if none selected)
- [ ] CSV includes all lead fields
- [ ] Download triggers immediately
- [ ] Formats data properly (no JSON blobs)

#### 4.2 Email Delivery on Purchase
- [ ] When lead is purchased, send email to buyer
- [ ] Email includes: Lead details in HTML table
- [ ] Email includes: CSV attachment
- [ ] Email includes: Link to view in CRM
- [ ] Professional branded email template

#### 4.3 Bulk Export from Purchase History
- [ ] "Export All Purchases" button on purchase history page
- [ ] Exports all leads buyer has purchased
- [ ] Includes purchase date and price in export
- [ ] Download large CSVs (1000+ leads)

**Files to Create:**
```
src/app/api/crm/leads/export/route.ts       # CSV export endpoint
src/lib/email/templates/
├── lead-purchased.tsx                       # Email template
└── generate-lead-csv.ts                     # CSV generator
src/lib/email/send-lead-email.ts            # Send with Resend
```

**Success Criteria:**
- ✅ Can export leads from CRM as CSV
- ✅ Email sent immediately on purchase
- ✅ Email includes CSV attachment
- ✅ Can export all purchase history

**Blockers Removed:**
- Buyers can use leads in their own tools
- Professional delivery experience
- Reduces support requests ("how do I get my data?")

---

## Phase 5: Workspace Onboarding 🏢 **CRITICAL**

**Status:** 🟡 Needed to Scale
**Timeline:** 2-3 days
**Why Critical:** Can't manually provision workspaces. Need self-service onboarding for buyers.

### What's Needed:

#### 5.1 Sign Up Flow for Buyers
- [ ] Landing page with "Sign Up" CTA
- [ ] Google OAuth sign-up
- [ ] Collect: Company name, industry, target geography
- [ ] Create workspace automatically
- [ ] Create initial routing rules based on preferences
- [ ] Redirect to marketplace

#### 5.2 Workspace Setup Wizard
- [ ] Step 1: Industry selection (Healthcare, HVAC, Solar, etc.)
- [ ] Step 2: Geographic targeting (states, regions)
- [ ] Step 3: Lead preferences (min enrichment score, freshness)
- [ ] Step 4: Billing setup (Stripe Connect for auto-payments)
- [ ] Preview: Show sample leads they'd receive
- [ ] Confirm and create workspace

#### 5.3 Automatic Routing Rule Creation
- [ ] Based on industry selection, create routing rules
- [ ] Based on geography, set up state filters
- [ ] Set appropriate priority levels
- [ ] Test routing with simulation
- [ ] Show buyer: "You'll receive leads matching: [criteria]"

#### 5.4 Billing Setup
- [ ] Stripe Connect for payment methods
- [ ] Add credit card during onboarding
- [ ] Set up for automatic payments
- [ ] Or: Pre-purchase credits system

**Files to Create:**
```
src/app/onboarding/
├── page.tsx                          # Onboarding wizard
├── components/
│   ├── IndustrySelector.tsx          # Industry picker
│   ├── GeographySelector.tsx         # State/region picker
│   ├── PreferencesForm.tsx           # Lead preferences
│   └── BillingSetup.tsx              # Stripe setup
src/app/api/onboarding/
├── create-workspace/route.ts         # POST workspace creation
└── setup-routing/route.ts            # POST routing rules
```

**Success Criteria:**
- ✅ New users can sign up in < 3 minutes
- ✅ Workspace created automatically
- ✅ Routing rules configured based on preferences
- ✅ Billing set up for purchases
- ✅ User sees marketplace with relevant leads

**Blockers Removed:**
- Can onboard real customers at scale
- No manual workspace provisioning
- Self-service growth

---

## 🟢 IMPORTANT (But Not Blocking)

These improve quality but aren't blocking revenue:

---

## Phase 6: Email Integration 📧

**Timeline:** 2-3 days
**Why Important:** Buyers want to email leads directly from CRM

### What's Needed:
- [ ] Gmail integration (OAuth)
- [ ] Compose email in CRM
- [ ] Send email via Gmail API
- [ ] Track emails in activity timeline
- [ ] Email templates
- [ ] Track opens/clicks (optional)

---

## Phase 7: Lead Scoring & Enrichment 🎯

**Timeline:** 2-3 days
**Why Important:** Better lead quality = higher prices = more revenue

### What's Needed:
- [ ] Intent score calculation (real algorithm)
- [ ] Email verification via API (ZeroBounce, etc.)
- [ ] Phone verification via API (Twilio Lookup, etc.)
- [ ] LinkedIn profile enrichment
- [ ] Company data enrichment (Clearbit, etc.)
- [ ] Visual indicators for high-quality leads

---

## Phase 8: Partner Dashboard 🤝

**Timeline:** 3-4 days
**Why Important:** Need to onboard data partners (Clay users, agencies)

### What's Needed:
- [ ] Partner sign-up flow
- [ ] Lead upload UI (CSV, API)
- [ ] Sales dashboard (how many leads sold)
- [ ] Revenue tracking (50% split calculation)
- [ ] Payout dashboard (Stripe Connect)
- [ ] Partner API docs

---

## Phase 9: Multi-Tenant Domain Routing 🌐

**Timeline:** 2-3 days
**Why Important:** White-label capability for partners

### What's Needed:
- [ ] Subdomain routing (acme.leadme.com)
- [ ] Custom domain support (leads.acme.com)
- [ ] Workspace branding (logo, colors)
- [ ] Custom email templates
- [ ] Test tenant isolation

---

## Phase 10: Advanced Search & Filters 🔍

**Timeline:** 2-3 days
**Why Important:** Buyers need to find specific leads

### What's Needed:
- [ ] Advanced filter builder (AND/OR logic)
- [ ] Saved searches
- [ ] Company size filter
- [ ] Revenue filter
- [ ] Technology filter (if enriched)
- [ ] Intent signal filter

---

## 📊 PRIORITY SUMMARY

### Must Have for MVP (Weeks 1-2):
1. ✅ **Week 1 CRM** - COMPLETE
2. 🔴 **Phase 1: Lead Data** - CRITICAL (1-2 days)
3. 🔴 **Phase 2: Marketplace** - CRITICAL (3-4 days)
4. 🟡 **Phase 3: Lead Detail** - CRITICAL (2-3 days)
5. 🟡 **Phase 4: Export/Delivery** - CRITICAL (1-2 days)

**Total: ~2 weeks to revenue-generating MVP**

### Should Have for Scale (Weeks 3-4):
6. 🟡 **Phase 5: Workspace Onboarding** - CRITICAL for growth (2-3 days)
7. 🟢 **Phase 6: Email Integration** - Quality of life (2-3 days)
8. 🟢 **Phase 7: Lead Scoring** - Revenue optimization (2-3 days)

**Total: +2 weeks to self-service platform**

### Nice to Have for Expansion (Weeks 5-8):
9. 🟢 **Phase 8: Partner Dashboard** - Partner network (3-4 days)
10. 🟢 **Phase 9: Multi-Tenant Domains** - White-label (2-3 days)
11. 🟢 **Phase 10: Advanced Search** - Power users (2-3 days)

---

## 🎯 RECOMMENDED SEQUENCE

### Week 1-2: Get to Revenue
```
Day 1-2:   Phase 1 (Lead Data)
Day 3-6:   Phase 2 (Marketplace)
Day 7-9:   Phase 3 (Lead Detail)
Day 10-11: Phase 4 (Export)
Day 12:    Testing & Bug Fixes
```

**Outcome:**
- ✅ Functioning marketplace
- ✅ Can sell leads
- ✅ Buyers get value
- ✅ Generate first revenue

### Week 3-4: Scale to Self-Service
```
Day 13-15: Phase 5 (Onboarding)
Day 16-18: Phase 6 (Email)
Day 19-21: Phase 7 (Lead Scoring)
Day 22-24: Polish & Optimization
```

**Outcome:**
- ✅ Self-service onboarding
- ✅ Better lead quality
- ✅ Professional buyer experience
- ✅ Can onboard 10+ customers

### Month 2: Partner Network & Scale
```
Week 5-6:  Phase 8 (Partner Dashboard)
Week 7:    Phase 9 (Multi-Tenant)
Week 8:    Phase 10 (Advanced Search)
```

**Outcome:**
- ✅ Partner ecosystem
- ✅ White-label capability
- ✅ Advanced features
- ✅ Scale to 100+ customers

---

## 🚀 IMMEDIATE NEXT STEPS

After you finish testing the CRM, here's the exact order:

### Step 1: Validate Routing Logic
```bash
pnpm test:routing
```
- Ensure 100% accuracy
- Fix any conflicts
- Verify distribution

### Step 2: Apply Database Migration
```bash
supabase db push
```
- Apply lead routing tables
- Apply marketplace tables
- Verify RLS policies

### Step 3: Seed Test Data (Phase 1)
```bash
pnpm seed:leads
```
- Generate 500+ realistic leads
- Route to test workspaces
- Validate CRM shows data

### Step 4: Build Marketplace (Phase 2)
- Start with available leads table
- Add preview modal
- Implement Stripe checkout
- Test full purchase flow

---

## 💡 KEY INSIGHTS

### Why This Order?
1. **Lead Data First** → Can't test anything without leads
2. **Marketplace Second** → This is the revenue engine
3. **Lead Detail Third** → Makes CRM actually usable
4. **Export Fourth** → Professional delivery
5. **Onboarding Fifth** → Enables self-service growth

### What Gets You to Revenue Fastest?
**Phases 1-4 (10-12 days)** = Functioning business

Everything else is optimization and scale.

### What's the Riskiest Part?
**Phase 2 (Marketplace)** - Complex Stripe integration, need to get payment flow perfect. Budget extra time for testing.

### Where Can You Cut Scope?
- Phase 6 (Email) → Can be manual at first
- Phase 7 (Scoring) → Can use simple scoring initially
- Phase 10 (Advanced Search) → Basic search is fine for MVP

### Where Should You NOT Cut Scope?
- Phase 1 (Data) → No data = no platform
- Phase 2 (Marketplace) → No marketplace = no revenue
- Phase 4 (Export) → Buyers expect this

---

## 📈 SUCCESS METRICS

### After Phase 1-4 (MVP):
- ✅ 500+ leads in database
- ✅ 3 test workspaces with routing rules
- ✅ Can purchase a lead end-to-end
- ✅ Lead appears in buyer's CRM
- ✅ Email delivered with CSV
- ✅ $0 → $100 first revenue

### After Phase 5 (Self-Service):
- ✅ 5+ real customers onboarded
- ✅ $1,000+ in revenue
- ✅ 60%+ sell-through rate
- ✅ < 3 minute onboarding time
- ✅ Zero manual provisioning

### After Phase 8 (Partner Network):
- ✅ 3+ data partners onboarded
- ✅ 10,000+ leads/month flowing
- ✅ $10,000+ monthly revenue
- ✅ 70%+ sell-through rate
- ✅ Automated payouts working

---

## 🎬 CONCLUSION

**Bottom Line:** Focus on **Phases 1-4** to get to revenue ASAP (10-12 days).

Everything else is optimization, scale, and nice-to-haves.

**Critical path:**
1. Data → Marketplace → Lead Detail → Export → Revenue 💰

Once you have revenue, you can justify the time investment in the other phases.

---

**Next Action:** Test the CRM, then let's knock out Phase 1 (Lead Data) tomorrow! 🚀
