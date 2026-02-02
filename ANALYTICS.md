# Analytics Integration Guide

Comprehensive guide to Cursive's analytics and tracking system using PostHog.

## Overview

The platform uses **PostHog** for product analytics, feature flags, session recording, and user behavior tracking.

## Why PostHog?

- **Open source**: Self-hostable option
- **Privacy-focused**: GDPR compliant
- **Feature flags**: A/B testing built-in
- **Session recording**: Debug user issues
- **Event autocapture**: Automatic click tracking
- **SQL access**: Query raw data

## Setup

### Environment Variables

```env
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

### Installation

Already installed:
```bash
pnpm add posthog-js
```

### Provider Setup

Add to root layout:

```tsx
// app/layout.tsx
import { AnalyticsProvider } from '@/lib/analytics/provider'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html>
      <body>
        <AnalyticsProvider>
          {children}
        </AnalyticsProvider>
      </body>
    </html>
  )
}
```

## Event Tracking

### Basic Tracking

```typescript
import { track } from '@/lib/analytics/client'

// Track custom event
track('Button Clicked', {
  buttonName: 'Get Started',
  location: 'Hero Section',
})
```

### Predefined Events

Use predefined event helpers:

```typescript
import { authEvents, queryEvents, leadEvents } from '@/lib/analytics/events'

// Authentication
authEvents.signupCompleted(userId, 'email')
authEvents.loginCompleted(userId)
authEvents.logoutCompleted()

// Queries
queryEvents.queryCreated(queryId, topicName)
queryEvents.queryActivated(queryId)
queryEvents.queryPaused(queryId)

// Leads
leadEvents.leadViewed(leadId)
leadEvents.leadExported(count, 'csv')

// People Search
peopleSearchEvents.searchPerformed(filters, resultCount)
peopleSearchEvents.emailRevealed(resultId, creditsRemaining)

// Billing
billingEvents.checkoutStarted('pro', 'monthly')
billingEvents.subscriptionCreated('pro', 50)

// Credits
creditEvents.creditUsed('email_reveal', 1, 997)
creditEvents.creditLimitReached('free')

// Onboarding
onboardingEvents.onboardingStarted()
onboardingEvents.onboardingStepCompleted(1, 'Create Workspace')
onboardingEvents.onboardingCompleted()

// Features
featureEvents.featureUsed('export')
featureEvents.integrationConnected('slack')

// Errors
errorEvents.errorOccurred('Payment failed', { amount: 50 })
errorEvents.apiErrorOccurred('/api/leads', 500, 'Internal error')
```

## User Identification

### Identify User

```typescript
import { identify, setUserProperties } from '@/lib/analytics/client'

// After login
identify(userId, {
  email: user.email,
  name: user.full_name,
  plan: user.plan,
  workspace_id: user.workspace_id,
})

// Update properties
setUserProperties({
  plan: 'pro',
  credits_remaining: 1000,
})
```

### Reset on Logout

```typescript
import { reset } from '@/lib/analytics/client'

// On logout
reset()
```

## Page Views

Page views are automatically tracked via the `AnalyticsProvider`:

```typescript
// Manual page view tracking (if needed)
import { trackPageView } from '@/lib/analytics/client'

trackPageView('/custom-page')
```

## Feature Flags

### Check Feature Flag

```typescript
import { isFeatureEnabled, getFeatureFlag } from '@/lib/analytics/client'

// Boolean flag
if (isFeatureEnabled('new-dashboard')) {
  // Show new dashboard
}

// Multivariate flag
const variant = getFeatureFlag('pricing-page')
if (variant === 'variant-a') {
  // Show variant A
} else if (variant === 'variant-b') {
  // Show variant B
}
```

### React Hook

```typescript
import { useFeatureFlag } from '@/lib/analytics/hooks'

function MyComponent() {
  const newDashboard = useFeatureFlag('new-dashboard')

  if (newDashboard) {
    return <NewDashboard />
  }

  return <OldDashboard />
}
```

### On Feature Flags Load

```typescript
import { onFeatureFlags } from '@/lib/analytics/client'

onFeatureFlags((flags, variants) => {
  console.log('Feature flags loaded:', flags)
  console.log('Variants:', variants)
})
```

## Event Properties

### Standard Properties

Always included:
- `$current_url`: Current page URL
- `$referrer`: Referrer URL
- `$device_type`: mobile/desktop/tablet
- `$browser`: Browser name
- `$os`: Operating system
- `$screen_width`: Screen width
- `$screen_height`: Screen height

### Custom Properties

Add context to events:

```typescript
track('Lead Exported', {
  // Who
  user_id: userId,
  workspace_id: workspaceId,

  // What
  export_format: 'csv',
  lead_count: 150,

  // When
  timestamp: new Date().toISOString(),

  // Where
  page: '/data',

  // Why
  trigger: 'manual',  // or 'scheduled'
})
```

## Common Tracking Patterns

### Form Submission

```typescript
const handleSubmit = async (data: FormData) => {
  track('Form Submitted', {
    form_name: 'Create Query',
    fields: Object.keys(data),
  })

  try {
    await submitForm(data)
    track('Form Submission Success', { form_name: 'Create Query' })
  } catch (error) {
    track('Form Submission Failed', {
      form_name: 'Create Query',
      error: error.message,
    })
  }
}
```

### Button Click

```typescript
<button
  onClick={() => {
    track('Button Clicked', {
      button_name: 'Get Started',
      location: 'Hero Section',
    })
    router.push('/signup')
  }}
>
  Get Started
</button>
```

### Modal Open/Close

```typescript
const openModal = () => {
  setIsOpen(true)
  track('Modal Opened', { modal_name: 'Create Query' })
}

const closeModal = () => {
  setIsOpen(false)
  track('Modal Closed', { modal_name: 'Create Query' })
}
```

### Search

```typescript
const handleSearch = (query: string) => {
  track('Search Performed', {
    query,
    results_count: results.length,
    filters: activeFilters,
  })
}
```

### Error Tracking

```typescript
try {
  await riskyOperation()
} catch (error) {
  errorEvents.errorOccurred(error.message, {
    operation: 'riskyOperation',
    user_id: userId,
  })

  throw error
}
```

## A/B Testing

### Set Up Test

In PostHog dashboard:
1. Create feature flag
2. Set variants (control, test)
3. Define rollout percentage

### Implement Test

```typescript
import { getFeatureFlag } from '@/lib/analytics/client'

function PricingPage() {
  const variant = getFeatureFlag('pricing-test')

  if (variant === 'test') {
    return <NewPricingPage />
  }

  return <OldPricingPage />
}
```

### Track Test Exposure

```typescript
track('AB Test Exposed', {
  test_name: 'pricing-test',
  variant,
})
```

### Track Conversion

```typescript
track('AB Test Converted', {
  test_name: 'pricing-test',
  variant,
  conversion_action: 'signup',
})
```

## Session Recording

Sessions are automatically recorded (can be disabled).

### Disable for Specific Users

```typescript
import { posthog } from '@/lib/analytics/client'

// Disable recording
posthog.set_config({
  disable_session_recording: true,
})
```

### Privacy Controls

Sensitive data is automatically masked:
- Email addresses
- Phone numbers
- Credit card numbers
- Passwords

## Funnel Analysis

### Define Funnel

```typescript
// Track each step
track('Funnel Step 1', { funnel_name: 'Signup Funnel' })
track('Funnel Step 2', { funnel_name: 'Signup Funnel' })
track('Funnel Step 3', { funnel_name: 'Signup Funnel' })
```

### Example: Signup Funnel

```typescript
// Step 1: Visit signup page
track('Signup Page Visited')

// Step 2: Start signup
track('Signup Started', { method: 'email' })

// Step 3: Complete signup
track('Signup Completed', { userId })

// Step 4: Create workspace
track('Workspace Created', { workspaceId })

// Step 5: Create first query
track('First Query Created', { queryId })
```

## Performance Monitoring

Track performance metrics:

```typescript
track('Performance Metric', {
  metric_name: 'page_load_time',
  value: loadTime,
  page: '/dashboard',
})
```

## User Properties

### Set User Properties

```typescript
setUserProperties({
  // Demographic
  industry: 'Technology',
  company_size: '10-50',

  // Behavior
  queries_created: 5,
  leads_generated: 150,
  credits_used: 45,

  // Subscription
  plan: 'pro',
  billing_interval: 'monthly',
  ltv: 600,

  // Engagement
  last_active: new Date().toISOString(),
  days_since_signup: 30,
})
```

## Group Analytics

Track workspace-level metrics:

```typescript
import { posthog } from '@/lib/analytics/client'

posthog.group('workspace', workspaceId, {
  name: workspace.name,
  plan: workspace.plan,
  created_at: workspace.created_at,
  user_count: workspace.user_count,
  queries_count: workspace.queries_count,
})
```

## Event Volume Optimization

### Sampling

For high-volume events:

```typescript
// Only track 10% of events
if (Math.random() < 0.1) {
  track('High Volume Event', properties)
}
```

### Debouncing

For repeated events:

```typescript
import { debounce } from 'lodash'

const trackSearch = debounce((query: string) => {
  track('Search Performed', { query })
}, 1000)
```

## Privacy & Compliance

### GDPR Compliance

- Cookie consent banner
- User can opt-out
- Data deletion requests

### Opt-Out

```typescript
import { posthog } from '@/lib/analytics/client'

// Disable tracking
posthog.opt_out_capturing()

// Re-enable
posthog.opt_in_capturing()
```

### Data Retention

Configure in PostHog:
- Events: 7 years
- Session recordings: 3 months
- Person profiles: Indefinitely

## Debugging

### Enable Debug Mode

```typescript
import { posthog } from '@/lib/analytics/client'

posthog.debug()
```

### Check Console

Events appear in browser console with `[PostHog]` prefix.

### Verify Events

In PostHog dashboard:
1. Go to Events
2. Filter by user/event
3. Inspect properties

## Best Practices

1. **Use descriptive event names**: "Query Created" not "query_create"
2. **Include context**: Always add relevant properties
3. **Track outcomes**: Not just actions, but results
4. **Be consistent**: Use same naming conventions
5. **Don't over-track**: Focus on key user actions
6. **Test events**: Verify events appear in PostHog
7. **Document events**: Maintain event catalog
8. **Respect privacy**: Don't track sensitive data

## Metrics to Track

### Product Metrics

- Sign-up conversion rate
- Onboarding completion rate
- Time to first query
- Queries per user
- Leads per query
- Export rate
- Credit usage rate

### Business Metrics

- Free to paid conversion
- Churn rate
- Customer lifetime value (LTV)
- Average revenue per user (ARPU)
- Monthly recurring revenue (MRR)

### Engagement Metrics

- Daily/weekly/monthly active users
- Session duration
- Feature adoption rate
- Return visit rate
- Time to value

## PostHog Alternatives

If not using PostHog:

- **Mixpanel**: Advanced analytics
- **Amplitude**: Product analytics
- **Google Analytics 4**: General analytics
- **Segment**: Event pipeline
- **Plausible**: Privacy-focused, simple

---

**Last Updated**: 2026-01-22
