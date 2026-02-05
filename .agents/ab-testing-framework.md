# A/B Testing Framework - Cursive Marketing

**Last Updated**: 2026-02-04
**Status**: Production-Ready
**Owner**: Marketing Team

This document outlines the complete A/B testing infrastructure for Cursive's marketing website, including framework implementation, priority tests, and best practices.

---

## Table of Contents

1. [Overview](#overview)
2. [Technical Implementation](#technical-implementation)
3. [Priority Tests](#priority-tests)
4. [Setting Up a New Test](#setting-up-a-new-test)
5. [Running Tests](#running-tests)
6. [Analyzing Results](#analyzing-results)
7. [Test Tracking Dashboard](#test-tracking-dashboard)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

---

## Overview

### What This Framework Provides

1. **Feature Flag System**: Vercel Edge Config for fast, edge-computed variant assignment
2. **React Components**: Easy-to-use components for A/B testing in Next.js
3. **Analytics Integration**: Automatic tracking with Google Analytics, PostHog
4. **Statistical Tools**: Sample size calculators, significance testing
5. **Consistent Experience**: Cookie/localStorage for stable variant assignment

### Tech Stack

- **Feature Flags**: Vercel Edge Config
- **Framework**: Next.js 14+ (App Router)
- **Analytics**: Google Analytics 4, PostHog
- **Language**: TypeScript
- **Storage**: localStorage + cookies for user consistency

---

## Technical Implementation

### File Structure

```
marketing/lib/ab-testing/
├── feature-flags.ts       # Edge Config integration, test configuration
├── test-wrapper.tsx       # React components for A/B testing
├── analytics.ts           # Analytics tracking integration
└── utils.ts              # Helper functions (variant assignment, stats)
```

### Key Components

#### 1. Feature Flags (`feature-flags.ts`)

Manages test configuration via Vercel Edge Config:

```typescript
// Get test configuration
const test = await getTest('homepage-hero-cta');

// Check if test is active
if (isTestActive(test)) {
  // Test is running
}
```

#### 2. Test Wrapper (`test-wrapper.tsx`)

React components for easy A/B testing:

```tsx
// Component-based approach
<ABTestWrapper testId="homepage-hero-cta">
  {(variant) => (
    <Button>{variant.name}</Button>
  )}
</ABTestWrapper>

// Hook-based approach
const { variant, trackConversion } = useABTest('homepage-hero-cta');
```

#### 3. Analytics (`analytics.ts`)

Tracks test views and conversions:

```typescript
// Automatically tracked on variant assignment
trackABTestView(testId, variantId);

// Track conversion
trackABTestConversion(testId, variantId, 'demo_booked');
```

#### 4. Utils (`utils.ts`)

Statistical and helper functions:

```typescript
// Calculate sample size
const sampleSize = calculateSampleSize(0.05, 0.20); // 5% baseline, 20% lift

// Calculate statistical significance
const pValue = calculatePValue(50, 1000, 70, 1000);
```

---

## Priority Tests

### Test 1: Homepage Hero CTA

**Test ID**: `homepage-hero-cta`

#### Hypothesis

Because users report uncertainty about what a demo includes (per user interviews), we believe using more specific CTA copy will increase demo booking rate by 20% for new visitors. We'll measure demo booking rate from homepage.

#### Variants

| Variant | CTA Copy | Rationale |
|---------|----------|-----------|
| **A (Control)** | "Book a Demo" | Current baseline, generic action |
| **B** | "See Cursive in Action" | Emphasizes product demonstration |
| **C** | "Identify Your Website Visitors" | Leads with primary value prop |

#### Metrics

**Primary Metric**:
- Demo booking rate (homepage → demo scheduled)
- Current baseline: ~3.5%
- Minimum detectable effect: 20% (3.5% → 4.2%)

**Secondary Metrics**:
- CTA click-through rate
- Time on page
- Scroll depth
- Exit rate

**Guardrail Metrics**:
- Form completion rate (ensure no drop-off)
- Qualified demo rate (ensure quality maintained)

#### Success Criteria

- **Statistical significance**: 95% confidence (p < 0.05)
- **Sample size**: ~1,000 visitors per variant (3,000 total)
- **Timeline**: 2-3 weeks
- **Winner declared if**: Primary metric improves by 15%+ with 95% confidence

#### Implementation

```tsx
// In homepage hero section
<ABTestWrapper testId="homepage-hero-cta">
  {(variant) => (
    <Button
      onClick={() => {
        trackABTestConversion('homepage-hero-cta', variant.id, 'cta_clicked');
        router.push('/book-demo');
      }}
    >
      {variant.name}
    </Button>
  )}
</ABTestWrapper>
```

---

### Test 2: Pricing Page Structure

**Test ID**: `pricing-page-structure`

#### Hypothesis

Because analytics show high pricing page exit rates and user feedback indicates "too many options," we believe simplifying pricing structure will reduce decision paralysis and increase contact form submission rate by 15% for qualified prospects.

#### Variants

| Variant | Structure | Description |
|---------|-----------|-------------|
| **A (Control)** | 3 Tiers | Data, Platform, Managed plans with full details |
| **B** | 2 Tiers + Contact | Platform, Enterprise + "Contact Sales" CTA |
| **C** | Single Plan | One plan + "Contact for Custom Pricing" |

#### Metrics

**Primary Metric**:
- Contact form submission rate
- Current baseline: ~8%
- MDE: 15% (8% → 9.2%)

**Secondary Metrics**:
- Time on pricing page
- Pricing page exit rate
- Feature comparison clicks
- Return visitor rate

**Guardrail Metrics**:
- Demo booking rate (ensure no negative impact)
- Qualified lead rate

#### Success Criteria

- **Statistical significance**: 95% confidence
- **Sample size**: ~500 visitors per variant (1,500 total)
- **Timeline**: 3-4 weeks
- **Winner**: Lowest exit rate + highest contact rate

#### Implementation

```tsx
// In pricing page
<ABTestSwitch testId="pricing-page-structure">
  {{
    control: <ThreeTierPricing />,
    'variant-b': <TwoTierPlusCTA />,
    'variant-c': <SinglePlanCustom />,
  }}
</ABTestSwitch>
```

---

### Test 3: Blog CTA Placement

**Test ID**: `blog-cta-placement`

#### Hypothesis

Because blog engagement data shows average scroll depth of 65% and exit before bottom CTA, we believe placing multiple CTAs throughout blog posts will increase blog → demo conversion rate by 25%.

#### Variants

| Variant | CTA Placement | Description |
|---------|---------------|-------------|
| **A (Control)** | Bottom only | Single CTA at end of post |
| **B** | Mid + Bottom | CTA at 50% + bottom |
| **C** | Inline | CTAs every 3-4 paragraphs |

#### Metrics

**Primary Metric**:
- Blog → Demo conversion rate
- Current baseline: ~1.2%
- MDE: 25% (1.2% → 1.5%)

**Secondary Metrics**:
- CTA click rate by position
- Average scroll depth
- Time on page
- CTA visibility rate

**Guardrail Metrics**:
- Bounce rate (ensure CTAs don't increase exits)
- Reading completion rate

#### Success Criteria

- **Statistical significance**: 90% confidence (lower due to blog traffic volume)
- **Sample size**: ~2,000 blog visitors per variant (6,000 total)
- **Timeline**: 4 weeks
- **Winner**: Highest conversion rate without increasing bounce

#### Implementation

```tsx
// In blog post layout
const { variant } = useABTest('blog-cta-placement');

// Render CTAs based on variant
{variant?.id === 'variant-c' && <InlineCTA />}
{(variant?.id === 'variant-b' || variant?.id === 'variant-c') && <MidPostCTA />}
<BottomCTA />
```

---

### Test 4: Exit Intent Popup Offer

**Test ID**: `exit-intent-offer`

#### Hypothesis

Because current exit intent popup has 8% email capture rate with generic free trial, we believe offering a specific lead magnet (free website visitor report) will increase email capture rate by 30%.

#### Variants

| Variant | Offer | Description |
|---------|-------|-------------|
| **A (Control)** | Free Website Visitor Report | "Get a free report of your site visitors" |
| **B** | Free 14-Day Trial | Standard trial offer |
| **C** | Case Study Download | "How [Company] identified 70% of visitors" |

#### Metrics

**Primary Metric**:
- Email capture rate (exit intent shown → email submitted)
- Current baseline: ~8%
- MDE: 30% (8% → 10.4%)

**Secondary Metrics**:
- Popup engagement rate (shown → interacted)
- Subsequent demo booking rate
- Email → Trial conversion
- Spam/fake email rate

**Guardrail Metrics**:
- User annoyance (measure via session replay)
- Return visitor rate (ensure not deterring)

#### Success Criteria

- **Statistical significance**: 95% confidence
- **Sample size**: ~1,500 exit intents per variant (4,500 total)
- **Timeline**: 2 weeks
- **Winner**: Highest email capture + demo booking rate

#### Implementation

```tsx
// Exit intent modal
const { variant, trackConversion } = useABTest('exit-intent-offer');

<ExitIntentModal
  onEmailSubmit={() => {
    trackConversion('email_captured');
  }}
>
  {variant?.id === 'control' && <FreeReportOffer />}
  {variant?.id === 'variant-b' && <FreeTrialOffer />}
  {variant?.id === 'variant-c' && <CaseStudyOffer />}
</ExitIntentModal>
```

---

## Setting Up a New Test

### Step 1: Define Test Configuration

Add test to `marketing/lib/ab-testing/feature-flags.ts`:

```typescript
const DEFAULT_CONFIG: ABTestConfig = {
  tests: {
    'your-test-id': {
      id: 'your-test-id',
      name: 'Your Test Name',
      enabled: false, // Start disabled
      traffic: 100, // Percentage of traffic to include
      variants: [
        { id: 'control', name: 'Control', weight: 50 },
        { id: 'variant-b', name: 'Variant B', weight: 50 },
      ],
      startDate: '2026-02-10',
      endDate: '2026-03-10',
    },
  },
};
```

### Step 2: Calculate Sample Size

Use the calculator in `utils.ts`:

```typescript
import { calculateSampleSize, calculateTestDuration } from './utils';

// Example: 5% baseline, want to detect 20% lift
const sampleSize = calculateSampleSize(0.05, 0.20);
// Result: ~1,800 per variant

// Calculate duration
const duration = calculateTestDuration(1800, 500, 2); // 500 daily visitors, 2 variants
// Result: ~8 days
```

Or use online calculator: https://www.evanmiller.org/ab-testing/sample-size.html

### Step 3: Implement Test in Code

```tsx
// Component-based
<ABTestWrapper testId="your-test-id">
  {(variant) => (
    <div>{variant.id === 'control' ? <ControlUI /> : <VariantUI />}</div>
  )}
</ABTestWrapper>

// Hook-based
const { variant, trackConversion } = useABTest('your-test-id');

return (
  <Button
    onClick={() => {
      // Your action
      trackConversion('button_clicked');
    }}
  >
    {variant?.name || 'Default Text'}
  </Button>
);
```

### Step 4: Set Up Analytics Tracking

Ensure events are tracked:

```typescript
// Automatic on variant assignment
trackABTestView(testId, variantId);

// Manual conversion tracking
trackABTestConversion(testId, variantId, 'conversion_type');

// Secondary metrics
trackABTestMetric(testId, variantId, 'time_on_page', 45);
```

### Step 5: Deploy to Vercel Edge Config

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Create Edge Config (first time)
vercel env add EDGE_CONFIG

# Update test configuration
vercel edge-config update ab-tests --value '{"tests": {...}}'
```

### Step 6: QA Testing

```tsx
// Force variant for testing
<ABTestWrapper testId="your-test-id" forceVariant="variant-b">
  {(variant) => <YourComponent />}
</ABTestWrapper>

// Or use debug component
<ABTestDebug testId="your-test-id" />
```

### Step 7: Enable Test

```typescript
// Update Edge Config
{
  enabled: true, // Change to true
  startDate: '2026-02-10', // Set start date
}
```

---

## Running Tests

### Pre-Launch Checklist

Before starting any test:

- [ ] Hypothesis documented (see test templates)
- [ ] Primary metric defined and measurable
- [ ] Sample size calculated
- [ ] Test duration estimated (min 1 week, max 8 weeks)
- [ ] All variants implemented and QA'd
- [ ] Analytics tracking verified (check GA4/PostHog)
- [ ] Edge Config updated with test configuration
- [ ] Stakeholders informed of test start date
- [ ] Calendar reminder for analysis date

### During Test Execution

**DO**:
- Monitor analytics daily for technical issues
- Check variant distribution (should be ~50/50 or as configured)
- Document external factors (campaigns, PR, outages)
- Ensure test reaches full sample size
- Take screenshots of all variants

**DON'T**:
- Peek at results and stop early (peeking problem)
- Make changes to variants mid-test
- Run conflicting tests on same page
- Share preliminary results (can bias team)
- Extend test indefinitely (max 8 weeks)

### Stopping Rules

**Stop test early ONLY if**:
- Technical issue detected (tracking broken, variant error)
- Severe negative impact on business metrics
- External event invalidates test (major product change, competitor action)

**Otherwise**: Run to completion (sample size reached + min 1 week)

---

## Analyzing Results

### Step 1: Verify Sample Size

```typescript
// Check if reached target sample
const targetSample = 1800;
const actualSample = 2100;
const percentComplete = (actualSample / targetSample) * 100; // 117%

// ✅ Good to analyze if ≥100%
// ⚠️ Preliminary if 80-99%
// ❌ Too early if <80%
```

### Step 2: Calculate Statistical Significance

```typescript
import { calculatePValue, calculateConfidenceInterval } from './utils';

// Example data
const controlConversions = 50;
const controlSample = 1000;
const variantConversions = 70;
const variantSample = 1000;

const pValue = calculatePValue(
  controlConversions,
  controlSample,
  variantConversions,
  variantSample
);

// p < 0.05 = statistically significant
console.log(pValue < 0.05 ? 'Significant' : 'Not significant');

// Confidence intervals
const [lowerControl, upperControl] = calculateConfidenceInterval(
  controlConversions,
  controlSample
);
const [lowerVariant, upperVariant] = calculateConfidenceInterval(
  variantConversions,
  variantSample
);
```

### Step 3: Analyze Secondary Metrics

Check if secondary metrics support primary result:

| Metric | Control | Variant | Change | Supports? |
|--------|---------|---------|--------|-----------|
| Primary: Conversion | 5.0% | 7.0% | +40% | ✅ Winner |
| Time on page | 45s | 52s | +16% | ✅ Yes |
| Scroll depth | 60% | 68% | +13% | ✅ Yes |
| Bounce rate | 40% | 38% | -5% | ✅ Yes |

### Step 4: Check Guardrail Metrics

Ensure nothing got worse:

- Support tickets: No increase
- Refund rate: No increase
- User complaints: No increase
- Quality metrics: Maintained or improved

### Step 5: Segment Analysis

Break down by key segments:

```
Mobile vs. Desktop:
- Mobile: +25% lift (significant)
- Desktop: +15% lift (significant)
→ Winner across both segments

New vs. Returning:
- New: +30% lift (significant)
- Returning: +5% lift (not significant)
→ Consider segmented rollout

Traffic Source:
- Organic: +20% lift
- Paid: +35% lift
- Direct: +10% lift
```

### Step 6: Document Decision

Use this template:

```markdown
## Test Results: [Test Name]

**Result**: ✅ Winner / ❌ Loser / ⚠️ Inconclusive

### Summary
- Test ran: [dates]
- Sample: [X visitors per variant]
- Winner: [Variant ID]
- Lift: [+X%]
- Significance: [p-value]

### Decision
- [ ] Implement variant for all users
- [ ] Keep control
- [ ] Retest with modifications
- [ ] Segment rollout (if winner for specific segment)

### Key Learnings
1. [What we learned]
2. [Why it worked/didn't work]
3. [What to test next]

### Next Steps
- [Action items]
- [Timeline]
```

---

## Test Tracking Dashboard

Use this spreadsheet template to track all tests:

### Active Tests

| Test ID | Name | Page | Status | Start Date | End Date | Sample Progress | Primary Metric | Current Lift |
|---------|------|------|--------|------------|----------|-----------------|----------------|--------------|
| homepage-hero-cta | Hero CTA Test | Homepage | Running | 2026-02-10 | 2026-02-24 | 45% | Demo booking | +12% (prelim) |
| pricing-page | Pricing Structure | Pricing | Planning | - | - | - | Contact rate | - |

### Completed Tests

| Test ID | Name | Dates | Result | Lift | Significance | Decision | Learnings |
|---------|------|-------|--------|------|--------------|----------|-----------|
| exit-intent-v1 | Exit Popup | 2026-01-15 to 2026-01-29 | Winner | +22% | p=0.03 | Implemented B | Specific offer beats generic |

### Test Backlog

| Priority | Test Name | Page | Hypothesis | Est. Impact | Est. Effort | Score |
|----------|-----------|------|------------|-------------|-------------|-------|
| 1 | Homepage Hero | Home | Specific CTA increases bookings | High | Low | 9 |
| 2 | Pricing Tiers | Pricing | Simpler pricing reduces paralysis | High | Medium | 8 |
| 3 | Blog CTAs | Blog | Multiple CTAs increase conversions | Medium | Low | 7 |

**Prioritization Formula**:
```
Score = (Potential Impact × 3) + (Confidence in Hypothesis × 2) + (5 - Effort)
```

- Potential Impact: 1-5 (revenue impact)
- Confidence: 1-5 (based on data/research)
- Effort: 1-5 (implementation complexity)

---

## Best Practices

### Test Design

**1. One Variable at a Time**
- ❌ Bad: Change headline + CTA + image
- ✅ Good: Change only CTA copy

**2. Make Changes Bold Enough**
- ❌ Bad: "Book Demo" vs. "Schedule Demo"
- ✅ Good: "Book Demo" vs. "See Your Website Visitors Now"

**3. Have Clear Hypothesis**
- ❌ Bad: "Let's test a new button color"
- ✅ Good: "Blue CTA will increase clicks by 15% because it contrasts better with background"

### Sample Size

**Don't underpower tests**:
- Small changes need large samples
- Use calculators to determine minimum size
- Better to wait than make wrong decision

**Sample Size Rules of Thumb**:
- Homepage test: 1-2 weeks
- Pricing page: 3-4 weeks
- Blog posts: 4-6 weeks (lower traffic)

### Test Duration

**Minimum**: 1 full week (capture day-of-week variation)

**Recommended**: 2 weeks for most tests

**Maximum**: 8 weeks (diminishing returns, external factors)

### Avoid P-Hacking

**The Peeking Problem**:
- Looking at results before sample size reached
- Stopping when you see significance
- Increases false positive rate from 5% to 30%+

**Solution**:
- Pre-determine sample size
- Don't peek until reached
- Use sequential testing if must peek (adjust thresholds)

### Multiple Testing Correction

If running multiple tests simultaneously:
- Adjust significance threshold (Bonferroni correction)
- Or test on different pages/audiences
- Don't run >3 tests concurrently

---

## Troubleshooting

### Issue: Variant distribution is skewed (not 50/50)

**Diagnosis**:
```typescript
// Check variant weights in config
const test = await getTest('test-id');
console.log(test.variants.map(v => v.weight)); // Should sum to 100
```

**Fix**: Adjust weights in Edge Config to ensure they sum to 100

### Issue: Analytics not tracking

**Diagnosis**:
```typescript
// Check browser console
// Should see: [A/B Test View] { testId: '...', variantId: '...' }

// Check GA4
// In Realtime → Events, look for 'ab_test_view' events
```

**Fix**:
- Verify Google Analytics is loaded
- Check `NEXT_PUBLIC_GA_MEASUREMENT_ID` env var
- Ensure `trackABTestView()` is called

### Issue: Users seeing different variants on page reload

**Diagnosis**: localStorage not persisting

**Fix**:
```typescript
// Check localStorage
console.log(localStorage.getItem('ab_test_homepage-hero-cta'));

// If null, check browser privacy settings
// Private/incognito mode doesn't persist localStorage
```

### Issue: Test not activating

**Diagnosis**:
```typescript
const test = await getTest('test-id');
console.log('Enabled:', test.enabled);
console.log('Active:', isTestActive(test));
console.log('Start:', test.startDate);
console.log('End:', test.endDate);
```

**Fix**:
- Ensure `enabled: true` in Edge Config
- Check start/end dates
- Verify Edge Config is deployed

### Issue: Results not statistically significant

**Possible Causes**:
1. Insufficient sample size (run longer)
2. Change too small to detect (make bolder)
3. High variance in data (segment analysis)
4. No real difference (keep control)

**Action**:
- Check sample size calculations
- Consider running longer (up to 8 weeks)
- If still not significant, call it and move on

---

## Sample Size Calculator

Quick reference table for common scenarios:

### Baseline: 5% conversion rate

| Lift | Sample/Variant | Total | Days @ 500/day | Days @ 1000/day |
|------|----------------|-------|----------------|-----------------|
| 10% | 7,200 | 14,400 | 29 days | 15 days |
| 20% | 1,800 | 3,600 | 8 days | 4 days |
| 30% | 800 | 1,600 | 4 days | 2 days |
| 50% | 310 | 620 | 2 days | 1 day |

### Baseline: 10% conversion rate

| Lift | Sample/Variant | Total | Days @ 500/day | Days @ 1000/day |
|------|----------------|-------|----------------|-----------------|
| 10% | 3,400 | 6,800 | 14 days | 7 days |
| 20% | 870 | 1,740 | 4 days | 2 days |
| 30% | 390 | 780 | 2 days | 1 day |
| 50% | 150 | 300 | 1 day | <1 day |

**Online Calculators**:
- Evan Miller: https://www.evanmiller.org/ab-testing/sample-size.html
- Optimizely: https://www.optimizely.com/sample-size-calculator/

---

## Environment Variables

Required environment variables:

```bash
# Vercel Edge Config (for feature flags)
EDGE_CONFIG="https://edge-config.vercel.com/..."

# Google Analytics (for tracking)
NEXT_PUBLIC_GA_MEASUREMENT_ID="G-XXXXXXXXXX"

# PostHog (optional, for additional analytics)
NEXT_PUBLIC_POSTHOG_KEY="phc_..."
NEXT_PUBLIC_POSTHOG_HOST="https://app.posthog.com"

# Custom analytics endpoint (optional)
NEXT_PUBLIC_ANALYTICS_ENDPOINT="https://api.yourdomain.com/analytics"
```

---

## Resources

### Internal
- A/B Test Skill: `.agents/skills/ab-test-setup/SKILL.md`
- Sample Size Guide: `.agents/skills/ab-test-setup/references/sample-size-guide.md`
- Test Templates: `.agents/skills/ab-test-setup/references/test-templates.md`

### External
- Vercel Edge Config: https://vercel.com/docs/storage/edge-config
- Google Analytics 4: https://developers.google.com/analytics/devguides/collection/ga4
- PostHog: https://posthog.com/docs
- Statistical Calculators: https://www.evanmiller.org/ab-testing/

### Books
- "Trustworthy Online Controlled Experiments" by Kohavi et al.
- "A/B Testing: The Most Powerful Way to Turn Clicks Into Customers" by Siroker & Koomen

---

## Approval & Updates

**Document Owner**: Marketing Team
**Technical Owner**: Engineering Team
**Review Cadence**: Quarterly
**Next Review**: 2026-05-01

**Change Log**:
- 2026-02-04: Initial framework creation
- TBD: Post-launch updates based on learnings

---

## Quick Start Guide

### For Marketers

1. Review priority tests (Test 1-4 above)
2. Decide which test to run first
3. Work with eng to implement
4. Monitor test progress in dashboard
5. Analyze results when complete
6. Document learnings

### For Engineers

1. Review technical implementation section
2. Set up Edge Config (one-time)
3. Install analytics tracking (one-time)
4. Implement test using `ABTestWrapper` or `useABTest`
5. QA with `forceVariant` prop
6. Deploy and enable test

### For Analysts

1. Verify tracking is working (GA4/PostHog)
2. Monitor daily for data quality issues
3. Calculate sample size progress
4. Run statistical analysis when complete
5. Create results report
6. Recommend next tests

---

**Questions?** Contact marketing team or open issue in project repo.
