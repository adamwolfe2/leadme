# A/B Testing Setup Guide

Quick start guide for setting up A/B testing infrastructure on Cursive marketing site.

## Prerequisites

- Vercel account with project deployed
- Google Analytics 4 property (or PostHog account)
- Node.js 18+ and npm/pnpm installed
- Access to Vercel team settings

---

## Step 1: Install Dependencies

```bash
cd marketing
pnpm install @vercel/edge-config
```

---

## Step 2: Set Up Vercel Edge Config

### 2.1 Create Edge Config via CLI

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Login to Vercel
vercel login

# Link project (if not already linked)
vercel link

# Create Edge Config
vercel edge-config create ab-tests
```

### 2.2 Add Edge Config to Environment Variables

```bash
# Copy the Edge Config connection string from output
# Add to Vercel project
vercel env add EDGE_CONFIG production
# Paste the connection string when prompted
```

### 2.3 Initialize Test Configuration

```bash
# Create initial test config
vercel edge-config update ab-tests --value '{
  "tests": {
    "homepage-hero-cta": {
      "id": "homepage-hero-cta",
      "name": "Homepage Hero CTA Test",
      "enabled": false,
      "traffic": 100,
      "variants": [
        { "id": "control", "name": "Book a Demo", "weight": 50 },
        { "id": "variant-b", "name": "See Cursive in Action", "weight": 50 }
      ],
      "startDate": null,
      "endDate": null
    }
  }
}'
```

---

## Step 3: Configure Analytics

### Option A: Google Analytics 4

1. Create GA4 property at https://analytics.google.com
2. Get Measurement ID (format: `G-XXXXXXXXXX`)
3. Add to environment variables:

```bash
vercel env add NEXT_PUBLIC_GA_MEASUREMENT_ID production
# Enter your G-XXXXXXXXXX when prompted
```

4. Initialize in app:

```tsx
// app/layout.tsx
import { initializeGoogleAnalytics } from '@/lib/ab-testing';

export default function RootLayout({ children }) {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) {
      initializeGoogleAnalytics(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID);
    }
  }, []);

  return <html>{children}</html>;
}
```

### Option B: PostHog

1. Create account at https://posthog.com
2. Get API key from project settings
3. Add to environment variables:

```bash
vercel env add NEXT_PUBLIC_POSTHOG_KEY production
vercel env add NEXT_PUBLIC_POSTHOG_HOST production
# Enter https://app.posthog.com for host
```

4. Initialize in app:

```tsx
// app/layout.tsx
import { initializePostHog } from '@/lib/ab-testing';

export default function RootLayout({ children }) {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      initializePostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY);
    }
  }, []);

  return <html>{children}</html>;
}
```

---

## Step 4: Local Development Setup

### 4.1 Pull Environment Variables

```bash
vercel env pull .env.local
```

### 4.2 Verify `.env.local`

Your `.env.local` should now include:

```bash
EDGE_CONFIG="https://edge-config.vercel.com/ecfg_xxxxxxxxxxxxx?token=xxxxx"
NEXT_PUBLIC_GA_MEASUREMENT_ID="G-XXXXXXXXXX"
# OR
NEXT_PUBLIC_POSTHOG_KEY="phc_xxxxxxxxxxxxx"
NEXT_PUBLIC_POSTHOG_HOST="https://app.posthog.com"
```

---

## Step 5: Implement Your First Test

### 5.1 Add Test to Edge Config

```bash
vercel edge-config update ab-tests --value '{
  "tests": {
    "homepage-hero-cta": {
      "id": "homepage-hero-cta",
      "name": "Homepage Hero CTA Test",
      "enabled": true,
      "traffic": 100,
      "variants": [
        { "id": "control", "name": "Book a Demo", "weight": 50 },
        { "id": "variant-b", "name": "See Cursive in Action", "weight": 50 }
      ],
      "startDate": "2026-02-10T00:00:00Z",
      "endDate": "2026-02-24T23:59:59Z"
    }
  }
}'
```

### 5.2 Implement in Code

```tsx
// app/page.tsx
import { ABTestWrapper } from '@/lib/ab-testing';

export default function HomePage() {
  return (
    <section className="hero">
      <h1>Turn Anonymous Visitors Into Leads</h1>

      <ABTestWrapper testId="homepage-hero-cta">
        {(variant) => (
          <button className="cta-button">
            {variant.name}
          </button>
        )}
      </ABTestWrapper>
    </section>
  );
}
```

### 5.3 Test Locally

```bash
pnpm dev
```

Open http://localhost:3000 and:
- Check browser console for `[A/B Test View]` logs
- Try clearing localStorage and reloading (should get consistent variant)
- Check Network tab for analytics events

---

## Step 6: QA Checklist

Before launching test:

- [ ] Edge Config updated with test configuration
- [ ] Variants sum to 100% weight
- [ ] Test start/end dates set correctly
- [ ] All variants implemented in code
- [ ] Analytics tracking verified (GA4 or PostHog)
- [ ] Test renders correctly in all variants
- [ ] Mobile and desktop tested
- [ ] localStorage persistence working
- [ ] Conversion tracking implemented
- [ ] Debug component shows correct variant

### Testing Different Variants

```tsx
// Force specific variant for testing
<ABTestWrapper testId="homepage-hero-cta" forceVariant="variant-b">
  {(variant) => <Button>{variant.name}</Button>}
</ABTestWrapper>

// Or use debug component
<ABTestDebug testId="homepage-hero-cta" />
```

---

## Step 7: Launch Test

### 7.1 Enable Test in Edge Config

```bash
# Update enabled flag to true
vercel edge-config update ab-tests --value '{
  "tests": {
    "homepage-hero-cta": {
      "enabled": true,
      "startDate": "2026-02-10T00:00:00Z",
      ...
    }
  }
}'
```

### 7.2 Deploy to Production

```bash
git add .
git commit -m "Launch homepage hero CTA A/B test"
git push origin main

# Or trigger deployment
vercel --prod
```

### 7.3 Verify in Production

1. Visit production site
2. Check browser console for A/B test logs (in dev mode)
3. Verify GA4 events: Realtime → Events → Look for `ab_test_view`
4. Clear cookies and verify variant consistency

---

## Step 8: Monitor Test

### Daily Checks

```bash
# Check Edge Config status
vercel edge-config ls

# View current config
vercel edge-config get ab-tests
```

### Analytics Monitoring

**Google Analytics 4**:
1. Go to Reports → Engagement → Events
2. Look for `ab_test_view` and `ab_test_conversion` events
3. Create custom report:
   - Dimension: `event_name`, `test_id`, `variant_id`
   - Metric: Event count

**PostHog**:
1. Go to Insights → Trends
2. Filter by `ab_test_view` and `ab_test_conversion`
3. Group by `variant_id`

---

## Step 9: Analyze Results

When test reaches sample size:

### 9.1 Export Data

```tsx
// From analytics dashboard or custom query
const results = await getTestResults('homepage-hero-cta');

// Or export to CSV
exportTestResultsToCSV('homepage-hero-cta', results);
```

### 9.2 Calculate Significance

```typescript
import { calculatePValue, calculateConfidenceInterval } from '@/lib/ab-testing/utils';

const pValue = calculatePValue(
  controlConversions,
  controlSample,
  variantConversions,
  variantSample
);

console.log('Significant:', pValue < 0.05);
```

### 9.3 Document Decision

See `.agents/ab-testing-framework.md` for results template.

---

## Step 10: Roll Out Winner

### Option A: Update Default (Remove Test)

```tsx
// Replace test with winning variant
<button className="cta-button">
  See Cursive in Action {/* variant-b won */}
</button>
```

### Option B: Keep Test Running (Ramp Up Winner)

```bash
# Gradually increase winner traffic
vercel edge-config update ab-tests --value '{
  "tests": {
    "homepage-hero-cta": {
      "variants": [
        { "id": "control", "weight": 20 },
        { "id": "variant-b", "weight": 80 }
      ]
    }
  }
}'
```

### Option C: Disable Test

```bash
vercel edge-config update ab-tests --value '{
  "tests": {
    "homepage-hero-cta": {
      "enabled": false
    }
  }
}'
```

---

## Common Issues & Solutions

### Issue: EDGE_CONFIG not found

**Solution**: Verify environment variable is set
```bash
vercel env ls
# Should show EDGE_CONFIG
```

### Issue: Test not showing up

**Solution**: Check test is enabled and dates are valid
```bash
vercel edge-config get ab-tests
# Verify "enabled": true and dates
```

### Issue: Analytics not tracking

**Solution**: Verify measurement ID and analytics script loaded
```bash
# Check browser console
window.gtag // Should be function
window.posthog // Should be object
```

### Issue: Variant not consistent

**Solution**: Check localStorage is enabled
```javascript
// In browser console
localStorage.getItem('ab_test_homepage-hero-cta')
// Should return variant ID
```

---

## Advanced: Managing Multiple Tests

### Update Multiple Tests

```bash
vercel edge-config update ab-tests --value '{
  "tests": {
    "homepage-hero-cta": { ... },
    "pricing-page-structure": { ... },
    "blog-cta-placement": { ... }
  }
}'
```

### Organize by Status

```json
{
  "tests": {
    // Active tests
    "homepage-hero-cta": { "enabled": true, ... },

    // Planned tests
    "pricing-structure": { "enabled": false, ... },

    // Archived (keep for reference)
    "exit-intent-v1": { "enabled": false, "archived": true, ... }
  }
}
```

---

## Resources

- **Full Documentation**: `/.agents/ab-testing-framework.md`
- **Code Examples**: `/marketing/app/examples/`
- **Vercel Edge Config Docs**: https://vercel.com/docs/storage/edge-config
- **GA4 Events Guide**: https://developers.google.com/analytics/devguides/collection/ga4/events
- **PostHog Docs**: https://posthog.com/docs

---

## Support

**Questions?** Contact marketing or engineering team.

**Bug Reports?** Open issue in project repository.

**Feature Requests?** Add to backlog in `.agents/ab-testing-framework.md`
