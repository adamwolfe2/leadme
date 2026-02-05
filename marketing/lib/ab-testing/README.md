# A/B Testing Framework

Production-ready A/B testing framework for Cursive marketing website.

## Quick Start

### 1. Basic Component Usage

```tsx
import { ABTestWrapper } from '@/lib/ab-testing';

export default function Hero() {
  return (
    <ABTestWrapper testId="homepage-hero-cta">
      {(variant) => (
        <button className="cta-button">
          {variant.name}
        </button>
      )}
    </ABTestWrapper>
  );
}
```

### 2. Hook Usage with Conversion Tracking

```tsx
import { useABTest } from '@/lib/ab-testing';

export default function PricingPage() {
  const { variant, trackConversion } = useABTest('pricing-page-structure');

  const handleContactClick = () => {
    trackConversion('contact_form_clicked');
    // Navigate to contact form
  };

  return (
    <div>
      {variant?.id === 'control' && <ThreeTierPricing />}
      {variant?.id === 'variant-b' && <TwoTierPricing />}
      {variant?.id === 'variant-c' && <SinglePlanPricing />}
    </div>
  );
}
```

### 3. Multi-Variant Switch

```tsx
import { ABTestSwitch } from '@/lib/ab-testing';

<ABTestSwitch testId="exit-intent-offer">
  {{
    control: <FreeReportOffer />,
    'variant-b': <FreeTrialOffer />,
    'variant-c': <CaseStudyOffer />,
  }}
</ABTestSwitch>
```

## Features

- **Vercel Edge Config Integration** - Fast, edge-computed variant assignment
- **Automatic Analytics Tracking** - GA4 and PostHog integration
- **Consistent User Experience** - localStorage + cookies for stable variants
- **Statistical Tools** - Sample size calculators, significance testing
- **TypeScript Support** - Full type safety
- **React Hooks & Components** - Easy integration in Next.js

## API Reference

### Components

#### `<ABTestWrapper>`

Main component for A/B testing.

**Props**:
- `testId` (string, required) - Unique test identifier
- `children` (function, required) - Render function receiving variant
- `forceVariant` (string, optional) - Force specific variant (for testing)
- `onVariantAssigned` (function, optional) - Callback when variant assigned
- `trackExposure` (boolean, optional) - Auto-track exposure (default: true)
- `loadingFallback` (ReactNode, optional) - Show while loading config

**Example**:
```tsx
<ABTestWrapper testId="homepage-hero-cta">
  {(variant) => <Button>{variant.name}</Button>}
</ABTestWrapper>
```

#### `<ABTestSwitch>`

Conditional rendering based on variant.

**Props**:
- `testId` (string, required)
- `children` (Record<string, ReactNode>, required) - Map of variant ID to component
- `fallback` (ReactNode, optional) - Fallback if no variant assigned

**Example**:
```tsx
<ABTestSwitch testId="pricing-structure">
  {{
    control: <PricingA />,
    'variant-b': <PricingB />,
  }}
</ABTestSwitch>
```

#### `<ABTestVariant>`

Show component only for specific variant.

**Props**:
- `testId` (string, required)
- `variantId` (string, required)
- `children` (ReactNode, required)

**Example**:
```tsx
<ABTestVariant testId="homepage-cta" variantId="control">
  <Button>Book a Demo</Button>
</ABTestVariant>
```

### Hooks

#### `useABTest(testId, forceVariant?)`

Hook for programmatic A/B testing.

**Returns**:
```typescript
{
  test: ABTest | null;
  variant: TestVariant | null;
  isLoading: boolean;
  isActive: boolean;
  trackConversion: (conversionType?: string) => void;
}
```

**Example**:
```tsx
const { variant, trackConversion, isActive } = useABTest('homepage-hero-cta');

if (isActive && variant?.id === 'variant-b') {
  // Show variant B
}

// Track conversion
trackConversion('demo_booked');
```

### Analytics Functions

#### `trackABTestView(testId, variantId)`

Track when user views a variant (auto-called by components).

#### `trackABTestConversion(testId, variantId, conversionType?)`

Track conversion event.

**Example**:
```typescript
trackABTestConversion('homepage-hero-cta', 'variant-b', 'demo_booked');
```

#### `trackABTestMetric(testId, variantId, metricName, metricValue)`

Track secondary metrics.

**Example**:
```typescript
trackABTestMetric('pricing-page', 'control', 'time_on_page', 45);
```

### Utility Functions

#### `calculateSampleSize(baselineRate, mde, alpha?, power?)`

Calculate required sample size per variant.

**Parameters**:
- `baselineRate` (number) - Current conversion rate (0-1)
- `mde` (number) - Minimum detectable effect as decimal (0.2 = 20% lift)
- `alpha` (number, optional) - Significance level (default: 0.05)
- `power` (number, optional) - Statistical power (default: 0.8)

**Returns**: Sample size per variant

**Example**:
```typescript
const sampleSize = calculateSampleSize(0.05, 0.20);
// Returns ~1,800 per variant for 5% baseline, 20% lift
```

#### `calculateTestDuration(sampleSize, dailyTraffic, numVariants?)`

Calculate test duration in days.

**Example**:
```typescript
const days = calculateTestDuration(1800, 500, 2);
// Returns 8 days for 1,800 sample @ 500 daily visitors, 2 variants
```

#### `calculatePValue(controlConversions, controlSample, variantConversions, variantSample)`

Calculate statistical significance.

**Returns**: p-value (significant if < 0.05)

**Example**:
```typescript
const pValue = calculatePValue(50, 1000, 70, 1000);
if (pValue < 0.05) {
  console.log('Statistically significant!');
}
```

## Configuration

### Edge Config Setup

1. Install Vercel CLI:
```bash
npm i -g vercel
vercel login
```

2. Create Edge Config:
```bash
vercel env add EDGE_CONFIG
```

3. Update test configuration:
```bash
vercel edge-config update ab-tests --value '{
  "tests": {
    "homepage-hero-cta": {
      "id": "homepage-hero-cta",
      "name": "Homepage Hero CTA",
      "enabled": true,
      "traffic": 100,
      "variants": [
        { "id": "control", "name": "Book a Demo", "weight": 50 },
        { "id": "variant-b", "name": "See Cursive in Action", "weight": 50 }
      ]
    }
  }
}'
```

### Environment Variables

```bash
# Vercel Edge Config
EDGE_CONFIG="https://edge-config.vercel.com/..."

# Google Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID="G-XXXXXXXXXX"

# PostHog (optional)
NEXT_PUBLIC_POSTHOG_KEY="phc_..."
NEXT_PUBLIC_POSTHOG_HOST="https://app.posthog.com"
```

## Testing & Debugging

### Force Specific Variant

```tsx
<ABTestWrapper testId="homepage-hero-cta" forceVariant="variant-b">
  {(variant) => <Button>{variant.name}</Button>}
</ABTestWrapper>
```

### Debug Component

```tsx
import { ABTestDebug } from '@/lib/ab-testing';

// Shows current variant in bottom-right corner (dev only)
<ABTestDebug testId="homepage-hero-cta" />
```

### Clear Test Assignments

```typescript
import { clearAllTestAssignments } from '@/lib/ab-testing';

// Clear all localStorage test assignments
clearAllTestAssignments();
```

## Best Practices

### 1. Always Calculate Sample Size First

```typescript
const sampleSize = calculateSampleSize(baselineRate, mde);
const duration = calculateTestDuration(sampleSize, dailyTraffic);

// Only proceed if duration is reasonable (< 8 weeks)
```

### 2. Track Both Views and Conversions

```tsx
// View tracked automatically by component
<ABTestWrapper testId="test-id">
  {(variant) => (
    <Button
      onClick={() => {
        // Track conversion manually
        trackABTestConversion('test-id', variant.id, 'button_clicked');
      }}
    >
      {variant.name}
    </Button>
  )}
</ABTestWrapper>
```

### 3. Use Guardrail Metrics

Track metrics that shouldn't get worse:

```typescript
trackABTestMetric('test-id', variant.id, 'bounce_rate', 0.35);
trackABTestMetric('test-id', variant.id, 'time_on_page', 45);
```

### 4. Don't Peek at Results Early

Set sample size target and wait for it. Peeking increases false positives.

### 5. Run Tests for Full Weeks

Minimum 1 week to capture day-of-week variation.

## File Structure

```
lib/ab-testing/
├── index.ts              # Main exports
├── feature-flags.ts      # Edge Config integration
├── test-wrapper.tsx      # React components & hooks
├── analytics.ts          # Analytics tracking
├── utils.ts              # Helper functions
└── README.md            # This file
```

## Support

- Full documentation: `/.agents/ab-testing-framework.md`
- Sample size guide: `/.agents/skills/ab-test-setup/references/sample-size-guide.md`
- Test templates: `/.agents/skills/ab-test-setup/references/test-templates.md`

## License

Internal use only - Cursive Marketing Team
