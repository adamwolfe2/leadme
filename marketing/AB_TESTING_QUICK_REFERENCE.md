# A/B Testing Quick Reference

One-page guide for running A/B tests on Cursive marketing site.

---

## 🚀 Quick Start

### 1. Basic Implementation (30 seconds)

```tsx
import { ABTestWrapper } from '@/lib/ab-testing';

<ABTestWrapper testId="your-test-id">
  {(variant) => (
    <button>{variant.name}</button>
  )}
</ABTestWrapper>
```

### 2. With Conversion Tracking (1 minute)

```tsx
import { useABTest } from '@/lib/ab-testing';

const { variant, trackConversion } = useABTest('your-test-id');

<button onClick={() => trackConversion('button_clicked')}>
  {variant?.name || 'Default Text'}
</button>
```

---

## 📊 Sample Size Cheat Sheet

| Your Current Rate | Want to Detect | Need Per Variant |
|-------------------|----------------|------------------|
| 5% | 20% lift | ~1,800 visitors |
| 5% | 30% lift | ~800 visitors |
| 10% | 20% lift | ~900 visitors |
| 10% | 30% lift | ~400 visitors |

**Formula**: `Test Duration = (Sample × Variants) / Daily Traffic`

Example: 1,800 sample × 2 variants = 3,600 / 500 daily = ~7 days

---

## ⚙️ Create New Test (5 steps)

### Step 1: Update Edge Config

```bash
vercel edge-config update ab-tests --value '{
  "tests": {
    "your-test-id": {
      "id": "your-test-id",
      "name": "Your Test Name",
      "enabled": true,
      "traffic": 100,
      "variants": [
        { "id": "control", "name": "Control", "weight": 50 },
        { "id": "variant-b", "name": "Variant B", "weight": 50 }
      ],
      "startDate": "2026-02-10T00:00:00Z",
      "endDate": "2026-03-10T23:59:59Z"
    }
  }
}'
```

### Step 2: Implement in Code

```tsx
<ABTestWrapper testId="your-test-id">
  {(variant) => <YourComponent variant={variant} />}
</ABTestWrapper>
```

### Step 3: Test Locally

```bash
pnpm dev
# Visit http://localhost:3000
# Check console for: [A/B Test View] { testId: '...', variantId: '...' }
```

### Step 4: Deploy

```bash
git add .
git commit -m "Add your-test-id A/B test"
git push origin main
```

### Step 5: Verify

- Check GA4: Realtime → Events → Look for `ab_test_view`
- Clear cookies and verify consistent variant
- Monitor for 24 hours

---

## 🎯 Components & Hooks

### `<ABTestWrapper>`

Best for: Simple variant rendering

```tsx
<ABTestWrapper testId="test-id">
  {(variant) => <div>{variant.name}</div>}
</ABTestWrapper>
```

### `useABTest()`

Best for: Complex logic with conversions

```tsx
const { variant, trackConversion, isLoading } = useABTest('test-id');

if (isLoading) return <Loading />;

return (
  <button onClick={() => trackConversion()}>
    {variant?.name}
  </button>
);
```

### `<ABTestSwitch>`

Best for: Completely different UIs

```tsx
<ABTestSwitch testId="test-id">
  {{
    control: <ComponentA />,
    'variant-b': <ComponentB />,
    'variant-c': <ComponentC />,
  }}
</ABTestSwitch>
```

### `<ABTestVariant>`

Best for: Conditional sections

```tsx
<ABTestVariant testId="test-id" variantId="control">
  <ControlUI />
</ABTestVariant>

<ABTestVariant testId="test-id" variantId="variant-b">
  <VariantUI />
</ABTestVariant>
```

---

## 📈 Tracking Events

### View (Automatic)

```tsx
// Tracked automatically when variant assigned
<ABTestWrapper testId="test-id">
  {(variant) => <Component />}
</ABTestWrapper>
```

### Conversion (Manual)

```tsx
const { trackConversion } = useABTest('test-id');

<button onClick={() => trackConversion('button_clicked')}>
  Click Me
</button>
```

### Secondary Metrics

```typescript
import { trackABTestMetric } from '@/lib/ab-testing';

trackABTestMetric('test-id', variant.id, 'time_on_page', 45);
trackABTestMetric('test-id', variant.id, 'scroll_depth', 75);
```

---

## 🧪 Testing & Debug

### Force Variant (for QA)

```tsx
<ABTestWrapper testId="test-id" forceVariant="variant-b">
  {(variant) => <Component />}
</ABTestWrapper>
```

### Show Debug Info (dev only)

```tsx
import { ABTestDebug } from '@/lib/ab-testing';

<ABTestDebug testId="test-id" />
// Shows variant in bottom-right corner
```

### Clear All Tests

```typescript
import { clearAllTestAssignments } from '@/lib/ab-testing';

clearAllTestAssignments();
// Clears localStorage, resets all variant assignments
```

---

## ✅ Pre-Launch Checklist

- [ ] Hypothesis documented
- [ ] Sample size calculated
- [ ] Edge Config updated
- [ ] Code implemented
- [ ] QA on all variants (mobile + desktop)
- [ ] Analytics tracking verified
- [ ] Start/end dates set
- [ ] Team notified

---

## 📊 Analyzing Results

### When Sample Size Reached

```typescript
import { calculatePValue, calculateConfidenceInterval } from '@/lib/ab-testing/utils';

// Check significance
const pValue = calculatePValue(
  controlConversions,
  controlSample,
  variantConversions,
  variantSample
);

if (pValue < 0.05) {
  console.log('✅ Statistically significant!');
}

// Get confidence intervals
const [lower, upper] = calculateConfidenceInterval(conversions, sample);
console.log(`95% CI: [${lower*100}%, ${upper*100}%]`);
```

### Decision Framework

| Result | p-value | Action |
|--------|---------|--------|
| Winner | < 0.05 | ✅ Implement variant |
| Loser | < 0.05 | 🔄 Keep control |
| Inconclusive | > 0.05 | 🤔 Run longer or move on |

---

## 🛠 Common Commands

### View Edge Config

```bash
vercel edge-config get ab-tests
```

### Update Test (Enable/Disable)

```bash
vercel edge-config update ab-tests --value '{ "tests": { "test-id": { "enabled": false } } }'
```

### Pull Env Vars

```bash
vercel env pull .env.local
```

---

## 📖 Full Documentation

- **Complete Guide**: `.agents/ab-testing-framework.md`
- **Setup Instructions**: `marketing/SETUP_AB_TESTING.md`
- **Test Tracker**: `.agents/ab-testing-dashboard-template.md`
- **Code Examples**: `marketing/app/examples/`

---

## 🆘 Troubleshooting

| Issue | Fix |
|-------|-----|
| Test not showing | Check `enabled: true` in Edge Config |
| Analytics not tracking | Verify `NEXT_PUBLIC_GA_MEASUREMENT_ID` set |
| Variant not consistent | Check localStorage is enabled in browser |
| Edge Config error | Run `vercel env pull` to update local vars |

---

## 📞 Support

**Marketing**: marketing@cursive.com
**Engineering**: eng@cursive.com

**Calculators**:
- Sample Size: https://www.evanmiller.org/ab-testing/sample-size.html
- Significance: https://www.optimizely.com/sample-size-calculator/

---

## 🎯 Priority Tests Ready to Launch

1. **Homepage Hero CTA** - 3 variants, ~1,000/variant, 2-3 weeks
2. **Pricing Page Structure** - 3 variants, ~500/variant, 3-4 weeks
3. **Blog CTA Placement** - 3 variants, ~2,000/variant, 4 weeks
4. **Exit Intent Offer** - 3 variants, ~1,500/variant, 2 weeks

See `.agents/ab-testing-framework.md` for full details on each test.

---

**Last Updated**: 2026-02-04
**Version**: 1.0
