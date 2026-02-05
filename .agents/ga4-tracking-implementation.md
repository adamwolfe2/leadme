# GA4 Tracking Implementation Guide
## Cursive Marketing Site - Comprehensive Event Tracking & Conversion Goals

**Last Updated**: 2026-02-04
**Version**: 1.0.0
**Status**: Ready for Implementation

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Setup & Installation](#setup--installation)
3. [Event Tracking Implementation](#event-tracking-implementation)
4. [Conversion Goals Configuration](#conversion-goals-configuration)
5. [Code Snippets & Implementation](#code-snippets--implementation)
6. [Testing & Validation](#testing--validation)
7. [Privacy & Compliance](#privacy--compliance)
8. [Dashboard Recommendations](#dashboard-recommendations)
9. [Event Naming Conventions](#event-naming-conventions)
10. [GTM Container Export](#gtm-container-export)

---

## Executive Summary

This document provides a comprehensive GA4 event tracking implementation for the Cursive marketing site. The implementation follows industry best practices, Google's recommended events, and ensures GDPR compliance.

### Key Metrics to Track
- **Primary Goal**: Demo bookings (Calendly clicks)
- **Secondary Goals**: Email signups, pricing page visits, resource engagement
- **Engagement**: Scroll depth, time on page, blog interactions
- **Attribution**: Source/medium tracking, UTM parameters

### Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Analytics**: Google Analytics 4
- **Tag Manager**: Google Tag Manager (recommended)
- **Existing**: PostHog tracking already in place

---

## Setup & Installation

### Step 1: Create GA4 Property

1. **Go to Google Analytics Admin**
   - Navigate to [analytics.google.com](https://analytics.google.com)
   - Click Admin (bottom left)

2. **Create Property**
   - Click "Create Property"
   - Property name: `Cursive Marketing Site`
   - Time zone: Your business timezone
   - Currency: USD

3. **Create Data Stream**
   - Platform: Web
   - Website URL: `https://meetcursive.com`
   - Stream name: `Production Website`
   - Enable Enhanced Measurement (toggle ON)

4. **Copy Measurement ID**
   - Format: `G-XXXXXXXXXX`
   - Save this for implementation

### Step 2: Choose Implementation Method

#### Option A: Direct gtag.js (Simpler, Faster)
Best for: Quick implementation, fewer tracking needs

#### Option B: Google Tag Manager (Recommended)
Best for: Flexibility, non-technical team members, A/B testing

**We recommend Option B (GTM)** for Cursive because:
- Marketing team can add tracking without dev changes
- Easier to test before publishing
- Better for popup and form tracking
- Cleaner codebase

### Step 3: Install Google Tag Manager

1. **Create GTM Account**
   - Go to [tagmanager.google.com](https://tagmanager.google.com)
   - Click "Create Account"
   - Account name: `Cursive`
   - Container name: `meetcursive.com`
   - Target platform: Web

2. **Get GTM Container Code**
   - Copy the two code snippets provided
   - Container ID format: `GTM-XXXXXX`

3. **Add GTM to Next.js**

**File**: `marketing/app/layout.tsx`

```tsx
import Script from 'next/script'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* Google Tag Manager */}
        <Script
          id="gtm-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','GTM-XXXXXX');
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} ${dancingScript.variable} font-sans antialiased`}>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXXX"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>

        <Header />
        <main className="pt-16">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
```

**Replace `GTM-XXXXXX` with your actual container ID.**

### Step 4: Configure GA4 in GTM

1. **Create GA4 Configuration Tag**
   - Tags → New → Google Analytics: GA4 Configuration
   - Measurement ID: `G-XXXXXXXXXX`
   - Trigger: All Pages
   - Name: `GA4 - Config - Base Configuration`

2. **Enable Built-in Variables**
   - Variables → Configure
   - Enable: Click Text, Click URL, Page Path, Page URL, Referrer

---

## Event Tracking Implementation

### Event Naming Convention

**Format**: `{object}_{action}` (lowercase, underscores)

**Examples**:
- `button_clicked`
- `form_submitted`
- `demo_requested`
- `scroll_depth_reached`

**Properties Format**: Lowercase with underscores
- `button_text`
- `cta_location`
- `page_path`

---

## 1. Button Clicks (All CTAs)

### Events to Track

| Button Text | Event Name | Properties | Location |
|-------------|------------|------------|----------|
| "Book Your Free AI Audit" | `cta_clicked` | button_text, cta_location, destination_url | Hero, Footer CTA |
| "Book a Demo" | `cta_clicked` | button_text, cta_location, destination_url | Pricing, Solution pages |
| "Get Started" | `cta_clicked` | button_text, cta_location, destination_url | Various |
| "View All 12 Interactive Demos" | `cta_clicked` | button_text, cta_location, destination_url | Homepage |
| "View Pricing" | `cta_clicked` | button_text, cta_location, page_path | Navigation |

### Implementation: Universal CTA Tracking

**File**: `marketing/lib/analytics/track-cta-click.ts`

```typescript
/**
 * Track CTA Button Clicks
 * Centralized tracking for all call-to-action buttons
 */

export interface CTAClickEvent {
  button_text: string
  cta_location: string
  destination_url?: string
  page_path?: string
}

export function trackCTAClick(event: CTAClickEvent) {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: 'cta_clicked',
      button_text: event.button_text,
      cta_location: event.cta_location,
      destination_url: event.destination_url || '',
      page_path: event.page_path || window.location.pathname,
      event_category: 'engagement',
      event_label: `${event.cta_location}_${event.button_text}`,
    })
  }
}

// TypeScript declaration
declare global {
  interface Window {
    dataLayer: any[]
  }
}
```

**File**: `marketing/components/ui/button.tsx` (Update existing component)

```tsx
'use client'

import { trackCTAClick } from '@/lib/analytics/track-cta-click'

interface ButtonProps {
  children: React.ReactNode
  href?: string
  onClick?: () => void
  className?: string
  size?: 'sm' | 'md' | 'lg'
  target?: string
  // NEW: Analytics tracking props
  trackClick?: boolean
  ctaLocation?: string
}

export function Button({
  children,
  href,
  onClick,
  className,
  size = 'md',
  target,
  trackClick = true,
  ctaLocation = 'unknown',
}: ButtonProps) {
  const handleClick = () => {
    // Track the click if enabled
    if (trackClick) {
      trackCTAClick({
        button_text: typeof children === 'string' ? children : 'Button',
        cta_location: ctaLocation,
        destination_url: href,
        page_path: window.location.pathname,
      })
    }

    // Call original onClick
    if (onClick) {
      onClick()
    }
  }

  if (href) {
    return (
      <a
        href={href}
        target={target}
        onClick={handleClick}
        className={className}
      >
        {children}
      </a>
    )
  }

  return (
    <button onClick={handleClick} className={className}>
      {children}
    </button>
  )
}
```

**Usage Example** (Update existing buttons):

```tsx
// Homepage hero CTA
<Button
  size="lg"
  href="https://cal.com/adamwolfe/cursive-ai-audit"
  target="_blank"
  ctaLocation="hero"
  className="bg-[#007AFF] text-white hover:bg-[#0066DD] text-lg px-8 py-4"
>
  Book Your Free AI Audit
</Button>

// Pricing page CTA
<Button
  className="w-full"
  href="https://cal.com/adamwolfe/cursive-ai-audit"
  target="_blank"
  ctaLocation="pricing_card_pipeline"
>
  Book a Demo
  <ArrowRight className="w-4 h-4" />
</Button>

// Footer CTA
<Button
  size="lg"
  href="https://cal.com/adamwolfe/cursive-ai-audit"
  target="_blank"
  ctaLocation="footer_cta"
>
  Book Your Free AI Audit Now
</Button>
```

---

## 2. Form Submissions

### Events to Track

| Form Type | Event Name | Properties | Location |
|-----------|------------|------------|----------|
| Exit Intent Popup | `form_submitted` | form_type: 'exit_popup', email_provided, company_provided | Site-wide |
| Newsletter Signup | `form_submitted` | form_type: 'newsletter', email_provided | Footer |
| Contact Form | `form_submitted` | form_type: 'contact', fields_submitted | /contact |
| Demo Request | `form_submitted` | form_type: 'demo_request' | Various |

### Implementation: Form Tracking

The exit intent popup already has tracking implemented. Let's ensure it follows our naming conventions.

**File**: `marketing/hooks/use-popup-analytics.ts` (Update existing)

```typescript
/**
 * Popup Analytics Hook
 * Tracks popup interactions and sends to analytics
 * UPDATED: Aligned with GA4 naming conventions
 */

import { useCallback } from 'react'
import { PopupFormData } from '@/lib/popup-types'

interface PopupAnalyticsOptions {
  popupId: string
  variant: string
}

export function usePopupAnalytics({ popupId, variant }: PopupAnalyticsOptions) {
  const trackEvent = useCallback(
    (eventName: string, properties?: Record<string, any>) => {
      // Send to dataLayer for GTM
      if (typeof window !== 'undefined' && window.dataLayer) {
        window.dataLayer.push({
          event: eventName,
          popup_id: popupId,
          popup_variant: variant,
          ...properties,
        })
      }

      // Log in development
      if (process.env.NODE_ENV === 'development') {
        console.log('[Popup Analytics]', eventName, {
          popupId,
          variant,
          ...properties,
        })
      }
    },
    [popupId, variant]
  )

  const trackImpression = useCallback(() => {
    trackEvent('popup_viewed', {
      event_category: 'engagement',
      event_label: popupId,
    })
  }, [trackEvent, popupId])

  const trackInteraction = useCallback(() => {
    trackEvent('popup_interaction', {
      event_category: 'engagement',
      event_label: popupId,
      interaction_type: 'form_focus',
    })
  }, [trackEvent, popupId])

  const trackSubmission = useCallback(
    (data: PopupFormData) => {
      // Main form submission event
      trackEvent('form_submitted', {
        event_category: 'lead_generation',
        event_label: `popup_${popupId}`,
        form_type: 'exit_popup',
        form_location: 'exit_intent',
        email_provided: !!data.email,
        company_provided: !!data.company,
      })

      // Also track as a conversion
      trackEvent('generate_lead', {
        event_category: 'conversion',
        event_label: `popup_${popupId}`,
        value: 1,
        currency: 'USD',
        method: 'exit_popup',
      })
    },
    [trackEvent, popupId]
  )

  const trackDismiss = useCallback(
    (method: 'close-button' | 'outside-click' | 'escape-key') => {
      trackEvent('popup_dismissed', {
        event_category: 'engagement',
        event_label: popupId,
        dismiss_method: method,
      })
    },
    [trackEvent, popupId]
  )

  return {
    trackImpression,
    trackInteraction,
    trackSubmission,
    trackDismiss,
  }
}

// TypeScript declaration
declare global {
  interface Window {
    dataLayer: any[]
  }
}
```

**File**: `marketing/lib/analytics/track-form-submission.ts` (NEW)

```typescript
/**
 * Track Form Submissions
 * Universal form tracking for all forms on the site
 */

export interface FormSubmissionEvent {
  form_type: 'contact' | 'newsletter' | 'demo_request' | 'exit_popup' | 'resource_download'
  form_location: string
  fields_submitted?: string[]
  email_provided?: boolean
  company_provided?: boolean
}

export function trackFormSubmission(event: FormSubmissionEvent) {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: 'form_submitted',
      form_type: event.form_type,
      form_location: event.form_location,
      fields_submitted: event.fields_submitted?.join(',') || '',
      email_provided: event.email_provided || false,
      company_provided: event.company_provided || false,
      event_category: 'lead_generation',
      event_label: `${event.form_type}_${event.form_location}`,
      page_path: window.location.pathname,
    })

    // Also track as conversion
    window.dataLayer.push({
      event: 'generate_lead',
      event_category: 'conversion',
      lead_type: event.form_type,
      value: 1,
    })
  }
}
```

---

## 3. Scroll Depth Tracking

### Events to Track

| Milestone | Event Name | Properties |
|-----------|------------|------------|
| 25% scroll | `scroll_depth_reached` | depth_percentage: 25 |
| 50% scroll | `scroll_depth_reached` | depth_percentage: 50 |
| 75% scroll | `scroll_depth_reached` | depth_percentage: 75 |
| 100% scroll | `scroll_depth_reached` | depth_percentage: 100 |

### Implementation: Scroll Depth Hook

**File**: `marketing/hooks/use-scroll-depth-tracking.ts` (NEW)

```typescript
'use client'

/**
 * Scroll Depth Tracking Hook
 * Tracks user scroll depth at 25%, 50%, 75%, and 100% milestones
 */

import { useEffect, useRef } from 'react'

export function useScrollDepthTracking(enabled = true) {
  const depthsTracked = useRef<Set<number>>(new Set())

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return

    const handleScroll = () => {
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      const scrollPercentage = Math.round(
        ((scrollTop + windowHeight) / documentHeight) * 100
      )

      // Define milestones
      const milestones = [25, 50, 75, 100]

      milestones.forEach((milestone) => {
        if (
          scrollPercentage >= milestone &&
          !depthsTracked.current.has(milestone)
        ) {
          depthsTracked.current.add(milestone)

          // Track to dataLayer
          if (window.dataLayer) {
            window.dataLayer.push({
              event: 'scroll_depth_reached',
              depth_percentage: milestone,
              page_path: window.location.pathname,
              page_title: document.title,
              event_category: 'engagement',
              event_label: `${milestone}%`,
            })
          }
        }
      })
    }

    // Throttle scroll events
    let ticking = false
    const scrollListener = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll()
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', scrollListener, { passive: true })

    return () => {
      window.removeEventListener('scroll', scrollListener)
    }
  }, [enabled])
}
```

**Usage** in layout or page components:

```tsx
'use client'

import { useScrollDepthTracking } from '@/hooks/use-scroll-depth-tracking'

export default function BlogPostPage() {
  // Enable scroll depth tracking
  useScrollDepthTracking(true)

  return (
    <article>
      {/* Blog content */}
    </article>
  )
}
```

**Where to Add**:
- Blog post pages: `marketing/app/blog/[category]/[slug]/page.tsx`
- Long-form pages: Homepage, Platform, Solution pages
- Landing pages: Industry-specific pages

---

## 4. Blog Engagement Tracking

### Events to Track

| Event | Event Name | Properties | Trigger |
|-------|------------|------------|---------|
| Time on page (30s) | `time_milestone_reached` | milestone_seconds: 30 | After 30s |
| Time on page (60s) | `time_milestone_reached` | milestone_seconds: 60 | After 60s |
| Time on page (120s) | `time_milestone_reached` | milestone_seconds: 120 | After 120s |
| Read completion | `article_read_completed` | article_title, category | 100% scroll |
| Category viewed | `article_category_viewed` | category, article_count | Page view |
| Related post click | `related_article_clicked` | article_title, position | Click |

### Implementation: Blog Engagement Tracking

**File**: `marketing/hooks/use-blog-engagement-tracking.ts` (NEW)

```typescript
'use client'

/**
 * Blog Engagement Tracking Hook
 * Tracks time on page, read completion, and related article clicks
 */

import { useEffect, useRef } from 'react'

interface BlogEngagementOptions {
  articleTitle: string
  category: string
  enabled?: boolean
}

export function useBlogEngagementTracking({
  articleTitle,
  category,
  enabled = true,
}: BlogEngagementOptions) {
  const timeTracked = useRef<Set<number>>(new Set())
  const startTime = useRef<number>(Date.now())

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return

    // Track category view
    if (window.dataLayer) {
      window.dataLayer.push({
        event: 'article_category_viewed',
        category,
        article_title: articleTitle,
        page_path: window.location.pathname,
        event_category: 'blog_engagement',
      })
    }

    // Time milestone tracking
    const milestones = [30, 60, 120] // seconds

    const checkTimeMilestones = () => {
      const secondsOnPage = Math.floor((Date.now() - startTime.current) / 1000)

      milestones.forEach((milestone) => {
        if (secondsOnPage >= milestone && !timeTracked.current.has(milestone)) {
          timeTracked.current.add(milestone)

          if (window.dataLayer) {
            window.dataLayer.push({
              event: 'time_milestone_reached',
              milestone_seconds: milestone,
              article_title: articleTitle,
              category,
              page_path: window.location.pathname,
              event_category: 'blog_engagement',
              event_label: `${milestone}s`,
            })
          }
        }
      })
    }

    // Check every 5 seconds
    const interval = setInterval(checkTimeMilestones, 5000)

    return () => {
      clearInterval(interval)
    }
  }, [enabled, articleTitle, category])

  // Track article completion (combine with scroll)
  const trackCompletion = () => {
    if (window.dataLayer) {
      window.dataLayer.push({
        event: 'article_read_completed',
        article_title: articleTitle,
        category,
        time_spent: Math.floor((Date.now() - startTime.current) / 1000),
        page_path: window.location.pathname,
        event_category: 'blog_engagement',
      })
    }
  }

  return { trackCompletion }
}

// Helper function for related article clicks
export function trackRelatedArticleClick(articleTitle: string, position: number) {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: 'related_article_clicked',
      article_title: articleTitle,
      position,
      event_category: 'blog_engagement',
      event_label: `position_${position}`,
    })
  }
}
```

**Usage** in blog posts:

```tsx
'use client'

import { useBlogEngagementTracking, trackRelatedArticleClick } from '@/hooks/use-blog-engagement-tracking'
import { useScrollDepthTracking } from '@/hooks/use-scroll-depth-tracking'

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const articleTitle = "How to Build Audience Segments"
  const category = "audience-targeting"

  // Track blog engagement
  const { trackCompletion } = useBlogEngagementTracking({
    articleTitle,
    category,
  })

  // Track scroll depth
  useScrollDepthTracking(true)

  return (
    <article>
      <h1>{articleTitle}</h1>
      {/* Article content */}

      {/* Related articles */}
      <div className="related-articles">
        <a
          href="/blog/visitor-tracking"
          onClick={() => trackRelatedArticleClick('Visitor Tracking Guide', 1)}
        >
          Visitor Tracking Guide
        </a>
      </div>
    </article>
  )
}
```

---

## 5. Outbound Links Tracking

### Events to Track

| Link Type | Event Name | Properties | Example |
|-----------|------------|------------|---------|
| Calendly booking | `calendly_link_clicked` | cta_location, button_text | Demo booking |
| External resources | `outbound_link_clicked` | destination_domain, link_text | Partner sites |
| Social media | `social_link_clicked` | platform, location | Twitter, LinkedIn |
| Integration links | `integration_link_clicked` | integration_name | Salesforce, HubSpot |

### Implementation: Outbound Link Tracking

**File**: `marketing/lib/analytics/track-outbound-link.ts` (NEW)

```typescript
/**
 * Track Outbound Link Clicks
 * Centralized tracking for external links
 */

export interface OutboundLinkEvent {
  destination_url: string
  link_text: string
  link_type: 'calendly' | 'social' | 'integration' | 'resource' | 'other'
  location: string
}

export function trackOutboundLink(event: OutboundLinkEvent) {
  if (typeof window !== 'undefined' && window.dataLayer) {
    const eventName =
      event.link_type === 'calendly'
        ? 'calendly_link_clicked'
        : event.link_type === 'social'
        ? 'social_link_clicked'
        : event.link_type === 'integration'
        ? 'integration_link_clicked'
        : 'outbound_link_clicked'

    window.dataLayer.push({
      event: eventName,
      destination_url: event.destination_url,
      link_text: event.link_text,
      link_type: event.link_type,
      location: event.location,
      event_category: 'navigation',
      event_label: `${event.link_type}_${event.location}`,
    })

    // Special tracking for Calendly (demo booking intent)
    if (event.link_type === 'calendly') {
      window.dataLayer.push({
        event: 'demo_booking_initiated',
        event_category: 'conversion',
        cta_location: event.location,
        value: 1,
      })
    }
  }
}
```

**Update Button Component** to auto-detect Calendly links:

```tsx
// In marketing/components/ui/button.tsx

const handleClick = () => {
  // Auto-detect Calendly links
  const isCalendlyLink = href?.includes('cal.com') || href?.includes('calendly.com')

  if (isCalendlyLink) {
    trackOutboundLink({
      destination_url: href!,
      link_text: typeof children === 'string' ? children : 'Button',
      link_type: 'calendly',
      location: ctaLocation,
    })
  } else if (trackClick) {
    trackCTAClick({
      button_text: typeof children === 'string' ? children : 'Button',
      cta_location: ctaLocation,
      destination_url: href,
    })
  }

  if (onClick) {
    onClick()
  }
}
```

**Social Media Link Tracking**:

```tsx
// Example in Footer component
<a
  href="https://twitter.com/cursiveai"
  target="_blank"
  rel="noopener noreferrer"
  onClick={() =>
    trackOutboundLink({
      destination_url: 'https://twitter.com/cursiveai',
      link_text: 'Twitter',
      link_type: 'social',
      location: 'footer',
    })
  }
>
  <TwitterIcon />
</a>
```

---

## 6. Video/Media Tracking

### Events to Track

| Event | Event Name | Properties |
|-------|------------|------------|
| Video play | `video_started` | video_id, video_title |
| Video 25% | `video_progress` | video_id, percent: 25 |
| Video 50% | `video_progress` | video_id, percent: 50 |
| Video 75% | `video_progress` | video_id, percent: 75 |
| Video complete | `video_completed` | video_id, duration |

### Implementation

**File**: `marketing/lib/analytics/track-video.ts` (NEW)

```typescript
/**
 * Video Tracking Functions
 * Track video engagement on the site
 */

export function trackVideoStart(videoId: string, videoTitle: string) {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: 'video_started',
      video_id: videoId,
      video_title: videoTitle,
      event_category: 'engagement',
      event_label: videoId,
    })
  }
}

export function trackVideoProgress(
  videoId: string,
  videoTitle: string,
  percent: number
) {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: 'video_progress',
      video_id: videoId,
      video_title: videoTitle,
      percent,
      event_category: 'engagement',
      event_label: `${videoId}_${percent}%`,
    })
  }
}

export function trackVideoComplete(
  videoId: string,
  videoTitle: string,
  duration: number
) {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: 'video_completed',
      video_id: videoId,
      video_title: videoTitle,
      duration,
      event_category: 'engagement',
      event_label: videoId,
    })
  }
}
```

**Usage** (if you add videos):

```tsx
<video
  onPlay={() => trackVideoStart('demo-video-1', 'Product Demo')}
  onEnded={() => trackVideoComplete('demo-video-1', 'Product Demo', 120)}
>
  <source src="/videos/demo.mp4" type="video/mp4" />
</video>
```

---

## 7. Page Interactions

### Events to Track

| Interaction | Event Name | Properties |
|-------------|------------|------------|
| Pricing tier click | `pricing_tier_clicked` | tier_name, billing_cycle |
| FAQ accordion open | `faq_opened` | question, position |
| Tab switch | `tab_switched` | tab_name, previous_tab |
| Popup display | `popup_viewed` | popup_id, popup_type |

### Implementation: Page Interactions

**File**: `marketing/lib/analytics/track-interactions.ts` (NEW)

```typescript
/**
 * Track Page Interactions
 * FAQ, tabs, accordions, etc.
 */

export function trackPricingTierClick(
  tierName: string,
  billingCycle: 'monthly' | 'annual',
  ctaText: string
) {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: 'pricing_tier_clicked',
      tier_name: tierName,
      billing_cycle: billingCycle,
      cta_text: ctaText,
      event_category: 'engagement',
      event_label: `${tierName}_${billingCycle}`,
    })
  }
}

export function trackFAQOpen(question: string, position: number) {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: 'faq_opened',
      question,
      position,
      page_path: window.location.pathname,
      event_category: 'engagement',
      event_label: `position_${position}`,
    })
  }
}

export function trackTabSwitch(tabName: string, previousTab: string) {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: 'tab_switched',
      tab_name: tabName,
      previous_tab: previousTab,
      event_category: 'engagement',
      event_label: tabName,
    })
  }
}

export function trackBillingCycleToggle(cycle: 'monthly' | 'annual') {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: 'billing_cycle_toggled',
      billing_cycle: cycle,
      event_category: 'engagement',
      event_label: cycle,
    })
  }
}
```

**Usage in Pricing Page**:

```tsx
// Update marketing/app/pricing/page.tsx

import { trackPricingTierClick, trackFAQOpen, trackBillingCycleToggle } from '@/lib/analytics/track-interactions'

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual')

  const handleBillingToggle = (cycle: 'monthly' | 'annual') => {
    setBillingCycle(cycle)
    trackBillingCycleToggle(cycle)
  }

  const handleFAQClick = (index: number, question: string) => {
    setOpenFaq(openFaq === index ? null : index)
    if (openFaq !== index) {
      trackFAQOpen(question, index + 1)
    }
  }

  return (
    <main>
      {/* Billing toggle */}
      <button onClick={() => handleBillingToggle('monthly')}>
        Monthly
      </button>
      <button onClick={() => handleBillingToggle('annual')}>
        Annual
      </button>

      {/* Pricing cards */}
      <Button
        onClick={() =>
          trackPricingTierClick('Cursive Pipeline', billingCycle, 'Book a Demo')
        }
        href="https://cal.com/adamwolfe/cursive-ai-audit"
      >
        Book a Demo
      </Button>

      {/* FAQ */}
      {faqs.map((faq, index) => (
        <button onClick={() => handleFAQClick(index, faq.question)}>
          {faq.question}
        </button>
      ))}
    </main>
  )
}
```

---

## Conversion Goals Configuration

### Primary Conversions

| Goal Name | Event Name | Description | Value |
|-----------|------------|-------------|-------|
| Demo Booking | `demo_booking_initiated` | Calendly link clicked | High |
| Lead Generated | `generate_lead` | Any form submission | Medium |
| Email Signup | `form_submitted` (form_type: newsletter) | Newsletter subscription | Medium |
| Pricing Viewed | `page_view` (page_path: /pricing) | User viewed pricing | Low |
| Solution Page Visit | `page_view` (page_path contains /visitor-identification, /audience-builder) | Solution interest | Medium |

### Secondary Conversions

| Goal Name | Event Name | Description | Value |
|-----------|------------|-------------|-------|
| Blog Engaged | `time_milestone_reached` (milestone: 60s) | Read blog for 60s+ | Low |
| Multiple Blogs Read | Custom (3+ blog_post_viewed in session) | High engagement | Medium |
| Resource Downloaded | `form_submitted` (form_type: resource_download) | Gated content | Medium |
| Scroll Depth 75%+ | `scroll_depth_reached` (depth: 75) | High engagement | Low |
| Video Completed | `video_completed` | Watched full video | Medium |

### How to Mark Events as Conversions in GA4

1. **Navigate to Events**
   - Go to GA4 Admin → Data display → Events
   - Wait 24 hours after implementation for events to appear

2. **Mark as Conversion**
   - Find event in list (e.g., `demo_booking_initiated`)
   - Toggle "Mark as conversion" to ON

3. **Set Conversion Value** (Optional)
   - Admin → Conversions → Click event
   - Set default value (e.g., $50 for demo booking)
   - This helps with ROAS calculations

4. **Create Custom Conversions**
   - For "Multiple Blogs Read": Use Audiences → Create condition
   - Condition: `page_view` count ≥ 3 AND page_path contains `/blog/`
   - Mark audience as conversion

### Recommended Conversion Values

Based on typical B2B SaaS metrics:

| Conversion | Suggested Value | Reasoning |
|------------|----------------|-----------|
| Demo Booking | $100 | High intent, qualified lead |
| Email Signup | $10 | Top-of-funnel, nurture potential |
| Pricing View | $5 | Interest signal |
| Form Submission | $25 | Contact info provided |
| Blog Engagement (60s+) | $2 | Content engagement |
| Multiple Blogs (3+) | $15 | High engagement signal |

---

## Testing & Validation

### Step 1: Enable GA4 DebugView

**Method 1**: URL Parameter
```
https://meetcursive.com?debug_mode=true
```

**Method 2**: Browser Extension
- Install "Google Analytics Debugger" Chrome extension
- Enable it when testing

**Method 3**: GTM Preview Mode
- In GTM, click "Preview"
- Enter your site URL
- Debug panel opens at bottom

### Step 2: Test Each Event Type

**Testing Checklist**:

```markdown
## Button Clicks
- [ ] Hero CTA click fires `cta_clicked`
- [ ] Calendly link fires `calendly_link_clicked` AND `demo_booking_initiated`
- [ ] Pricing CTA fires with correct `cta_location`
- [ ] Footer CTA fires with button_text

## Forms
- [ ] Exit popup submission fires `form_submitted` AND `generate_lead`
- [ ] Newsletter signup fires with form_type: 'newsletter'
- [ ] All required properties present

## Scroll Depth
- [ ] 25% scroll fires
- [ ] 50% scroll fires
- [ ] 75% scroll fires
- [ ] 100% scroll fires
- [ ] Only fires once per session per depth

## Blog Engagement
- [ ] 30s time milestone fires
- [ ] 60s time milestone fires
- [ ] 120s time milestone fires
- [ ] Category view fires on page load
- [ ] Related article click fires

## Outbound Links
- [ ] Social media clicks fire `social_link_clicked`
- [ ] External resource clicks fire
- [ ] Integration link clicks fire

## Page Interactions
- [ ] Pricing tier click fires
- [ ] FAQ open fires with position
- [ ] Billing toggle fires
- [ ] Tab switches fire (if applicable)
```

### Step 3: Validate in GA4

**Real-Time Reports** (Events appear within 30 seconds):
1. Open GA4
2. Reports → Realtime
3. Click "Event count by Event name"
4. Perform action on site
5. Verify event appears

**DebugView** (Detailed debugging):
1. Open GA4
2. Admin → DebugView
3. Filter by your device (if needed)
4. See events with full parameter details

### Step 4: Check for Common Issues

| Issue | Check | Fix |
|-------|-------|-----|
| Events not firing | GTM container installed? | Verify GTM snippet in layout.tsx |
| No parameters | dataLayer.push syntax | Check property names match |
| Duplicate events | Multiple GTM containers? | Remove duplicate tags |
| Wrong values | Variable mapping | Check variable configuration |
| Missing conversions | Event not marked | Mark as conversion in Admin |

### Step 5: Cross-Browser Testing

Test in:
- Chrome (desktop)
- Safari (desktop)
- Firefox (desktop)
- Mobile Safari (iOS)
- Mobile Chrome (Android)

### Testing Tools

**Browser Extensions**:
- Google Analytics Debugger
- Tag Assistant (by Google)
- dataLayer Inspector
- GA4 Event Tracker

**Online Tools**:
- Chrome DevTools → Console → Check `window.dataLayer`
- GTM Preview Mode
- GA4 DebugView

---

## Privacy & Compliance

### GDPR Compliance Requirements

1. **Cookie Consent**
   - Required for EU/UK/CA visitors
   - Must get consent before loading GA4/GTM
   - Use consent mode

2. **No PII in Analytics**
   - Never send email addresses to GA4 properties
   - No phone numbers
   - No names
   - Hash user IDs if needed

3. **Data Retention**
   - Set in GA4 Admin
   - Recommended: 14 months
   - Minimum: 2 months

4. **User Deletion**
   - Provide mechanism for users to request data deletion
   - Use GA4 User Deletion API

### Implementation: Consent Mode

**File**: `marketing/lib/analytics/consent-mode.ts` (NEW)

```typescript
/**
 * Google Consent Mode Implementation
 * Ensures GDPR compliance
 */

export function initConsentMode() {
  if (typeof window === 'undefined') return

  // Set default consent state (before user choice)
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({
    event: 'consent_default',
    consent: {
      ad_storage: 'denied',
      analytics_storage: 'denied',
      functionality_storage: 'denied',
      personalization_storage: 'denied',
      security_storage: 'granted',
      wait_for_update: 500,
    },
  })
}

export function grantConsent() {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: 'consent_update',
      consent: {
        ad_storage: 'granted',
        analytics_storage: 'granted',
        functionality_storage: 'granted',
        personalization_storage: 'granted',
      },
    })

    // Store consent in localStorage
    localStorage.setItem('cookie_consent', 'granted')
  }
}

export function denyConsent() {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: 'consent_update',
      consent: {
        ad_storage: 'denied',
        analytics_storage: 'denied',
        functionality_storage: 'denied',
        personalization_storage: 'denied',
      },
    })

    localStorage.setItem('cookie_consent', 'denied')
  }
}

export function checkConsentStatus(): 'granted' | 'denied' | 'unknown' {
  if (typeof window === 'undefined') return 'unknown'

  const consent = localStorage.getItem('cookie_consent')
  return consent === 'granted' ? 'granted' : consent === 'denied' ? 'denied' : 'unknown'
}
```

**File**: `marketing/components/cookie-consent-banner.tsx` (NEW)

```tsx
'use client'

/**
 * Cookie Consent Banner
 * GDPR-compliant consent collection
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  checkConsentStatus,
  grantConsent,
  denyConsent,
  initConsentMode,
} from '@/lib/analytics/consent-mode'

export function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    // Initialize consent mode
    initConsentMode()

    // Check if user has already made a choice
    const consentStatus = checkConsentStatus()
    if (consentStatus === 'unknown') {
      setShowBanner(true)
    } else if (consentStatus === 'granted') {
      grantConsent()
    }
  }, [])

  const handleAccept = () => {
    grantConsent()
    setShowBanner(false)
  }

  const handleDeny = () => {
    denyConsent()
    setShowBanner(false)
  }

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t border-gray-200 shadow-lg"
        >
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-sm text-gray-700">
                We use cookies to enhance your browsing experience and analyze our
                traffic. By clicking "Accept", you consent to our use of cookies.{' '}
                <a
                  href="/privacy"
                  className="text-[#007AFF] hover:underline"
                  target="_blank"
                >
                  Learn more
                </a>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleDeny}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Decline
              </button>
              <Button onClick={handleAccept} size="sm">
                Accept
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

**Add to Layout**:

```tsx
// In marketing/app/layout.tsx

import { CookieConsentBanner } from '@/components/cookie-consent-banner'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      {/* ... GTM script ... */}
      <body>
        <Header />
        <main className="pt-16">{children}</main>
        <Footer />
        <CookieConsentBanner />
      </body>
    </html>
  )
}
```

### Privacy Checklist

```markdown
- [ ] Cookie consent banner implemented
- [ ] Consent mode configured in GTM
- [ ] Privacy policy page updated
- [ ] No PII in event properties
- [ ] User deletion process documented
- [ ] Data retention set to 14 months
- [ ] IP anonymization enabled (default in GA4)
- [ ] Terms of service includes analytics
```

---

## Dashboard Recommendations

### Custom Reports to Create

#### 1. Conversion Funnel Report

**Path**: Explore → Funnel exploration

**Steps**:
1. Page view (any page)
2. CTA clicked (cta_clicked)
3. Demo booking initiated (demo_booking_initiated)

**Insights**: Conversion rate at each step, drop-off points

#### 2. Content Engagement Report

**Path**: Explore → Free form

**Dimensions**:
- Page path
- Page title

**Metrics**:
- Average engagement time
- Event count (scroll_depth_reached)
- Conversions

**Filter**: Page path contains `/blog/`

**Insights**: Which blog posts drive engagement and conversions

#### 3. CTA Performance Report

**Path**: Explore → Free form

**Dimensions**:
- Event name: cta_clicked
- Custom parameter: cta_location
- Custom parameter: button_text

**Metrics**:
- Event count
- Users
- Conversion rate

**Insights**: Which CTAs drive the most clicks and conversions

#### 4. Traffic Source Performance

**Path**: Reports → Acquisition → Traffic acquisition

**Custom columns**:
- Demo bookings (demo_booking_initiated)
- Lead generation (generate_lead)
- Average engagement time

**Insights**: Which channels drive highest quality traffic

#### 5. Pricing Page Analysis

**Path**: Explore → Free form

**Filter**: Page path = `/pricing`

**Dimensions**:
- Event name
- Custom parameter: tier_name
- Custom parameter: billing_cycle

**Metrics**:
- Event count
- Conversions

**Insights**: Which pricing tiers get most clicks, monthly vs annual preference

### Key Metrics to Monitor

**Daily**:
- Demo bookings (demo_booking_initiated count)
- Lead generation (generate_lead count)
- Active users

**Weekly**:
- Conversion rate by traffic source
- Blog post engagement (time milestones)
- CTA performance (click-through rates)
- Scroll depth patterns

**Monthly**:
- Traffic trends
- Conversion funnel analysis
- Content performance review
- Goal completions

### Recommended GA4 Custom Dimensions

Create these in Admin → Data display → Custom definitions:

| Dimension Name | Scope | Parameter | Description |
|----------------|-------|-----------|-------------|
| CTA Location | Event | cta_location | Where CTA was clicked |
| Form Type | Event | form_type | Type of form submitted |
| Blog Category | Event | category | Blog post category |
| Pricing Tier | Event | tier_name | Which pricing tier clicked |
| Billing Cycle | Event | billing_cycle | Monthly or annual |
| Popup ID | Event | popup_id | Which popup shown |

### GA4 Dashboard Layout

**Home Dashboard** (default view):
1. Demo bookings (today vs yesterday)
2. Lead generation (today vs yesterday)
3. Active users (real-time)
4. Top conversion sources
5. Top CTAs clicked
6. Recent conversions (last 30 min)

**Marketing Dashboard**:
1. Traffic by source/medium
2. Conversion rate by channel
3. Cost per acquisition (if running ads)
4. CTA performance
5. Blog engagement metrics
6. Email signup trends

**Content Dashboard**:
1. Top blog posts (by pageviews)
2. Average engagement time by post
3. Scroll depth distribution
4. Time milestone completion rates
5. Related article click-through
6. Blog conversion rate

---

## Event Naming Conventions

### Standard Format

**Event Names**: `{object}_{action}`
- Lowercase
- Underscores between words
- Verb in past tense for completed actions

**Property Names**: `{descriptor}_{attribute}`
- Lowercase
- Underscores between words
- Specific and descriptive

### Event Categories

| Category | Event Prefix | Examples |
|----------|-------------|----------|
| Engagement | N/A | cta_clicked, scroll_depth_reached |
| Forms | form_ | form_submitted, form_started |
| Navigation | N/A | outbound_link_clicked, page_viewed |
| Video | video_ | video_started, video_completed |
| Blog | article_ / time_ | article_read_completed, time_milestone_reached |
| Conversion | N/A | demo_booking_initiated, generate_lead |

### Complete Event Reference

```typescript
// All events tracked on the Cursive marketing site

interface EventCatalog {
  // CTA & Buttons
  cta_clicked: {
    button_text: string
    cta_location: string
    destination_url?: string
    page_path: string
  }

  // Forms
  form_submitted: {
    form_type: 'contact' | 'newsletter' | 'demo_request' | 'exit_popup'
    form_location: string
    email_provided: boolean
    company_provided?: boolean
  }

  // Lead Generation
  generate_lead: {
    event_category: 'conversion'
    lead_type: string
    value: number
  }

  // Demo Booking
  demo_booking_initiated: {
    cta_location: string
    event_category: 'conversion'
    value: number
  }

  // Calendly
  calendly_link_clicked: {
    destination_url: string
    link_text: string
    location: string
  }

  // Outbound Links
  outbound_link_clicked: {
    destination_url: string
    link_text: string
    link_type: string
    location: string
  }

  social_link_clicked: {
    platform: string
    location: string
  }

  integration_link_clicked: {
    integration_name: string
    location: string
  }

  // Scroll Tracking
  scroll_depth_reached: {
    depth_percentage: 25 | 50 | 75 | 100
    page_path: string
    page_title: string
  }

  // Time Tracking
  time_milestone_reached: {
    milestone_seconds: 30 | 60 | 120
    article_title?: string
    category?: string
    page_path: string
  }

  // Blog
  article_category_viewed: {
    category: string
    article_title: string
    page_path: string
  }

  article_read_completed: {
    article_title: string
    category: string
    time_spent: number
    page_path: string
  }

  related_article_clicked: {
    article_title: string
    position: number
  }

  // Page Interactions
  pricing_tier_clicked: {
    tier_name: string
    billing_cycle: 'monthly' | 'annual'
    cta_text: string
  }

  billing_cycle_toggled: {
    billing_cycle: 'monthly' | 'annual'
  }

  faq_opened: {
    question: string
    position: number
    page_path: string
  }

  tab_switched: {
    tab_name: string
    previous_tab: string
  }

  // Popups
  popup_viewed: {
    popup_id: string
    popup_variant: string
  }

  popup_interaction: {
    popup_id: string
    interaction_type: string
  }

  popup_dismissed: {
    popup_id: string
    dismiss_method: 'close-button' | 'outside-click' | 'escape-key'
  }

  // Video
  video_started: {
    video_id: string
    video_title: string
  }

  video_progress: {
    video_id: string
    video_title: string
    percent: 25 | 50 | 75
  }

  video_completed: {
    video_id: string
    video_title: string
    duration: number
  }
}
```

---

## GTM Container Export

### Pre-Built GTM Container Configuration

**Container Name**: Cursive Marketing Site
**Container ID**: GTM-XXXXXX (replace with yours)
**Version**: 1.0

### Tags to Create

#### 1. GA4 Configuration Tag
- **Type**: Google Analytics: GA4 Configuration
- **Measurement ID**: G-XXXXXXXXXX
- **Trigger**: All Pages
- **Name**: `GA4 - Config - Base Configuration`

#### 2. GA4 Event Tags

**CTA Clicks**:
- **Type**: Google Analytics: GA4 Event
- **Configuration Tag**: GA4 - Config
- **Event Name**: `cta_clicked`
- **Parameters**:
  - `button_text`: {{DL - button_text}}
  - `cta_location`: {{DL - cta_location}}
  - `destination_url`: {{DL - destination_url}}
- **Trigger**: Custom Event - cta_clicked

**Form Submissions**:
- **Type**: Google Analytics: GA4 Event
- **Configuration Tag**: GA4 - Config
- **Event Name**: `form_submitted`
- **Parameters**:
  - `form_type`: {{DL - form_type}}
  - `form_location`: {{DL - form_location}}
  - `email_provided`: {{DL - email_provided}}
- **Trigger**: Custom Event - form_submitted

**Scroll Depth**:
- **Type**: Google Analytics: GA4 Event
- **Configuration Tag**: GA4 - Config
- **Event Name**: `scroll_depth_reached`
- **Parameters**:
  - `depth_percentage`: {{DL - depth_percentage}}
  - `page_path`: {{Page Path}}
- **Trigger**: Custom Event - scroll_depth_reached

**Demo Booking**:
- **Type**: Google Analytics: GA4 Event
- **Configuration Tag**: GA4 - Config
- **Event Name**: `demo_booking_initiated`
- **Parameters**:
  - `cta_location`: {{DL - cta_location}}
  - `value`: 1
- **Trigger**: Custom Event - demo_booking_initiated

### Triggers to Create

1. **All Pages**
   - Type: Page View
   - Fires on: All Pages

2. **Custom Event - cta_clicked**
   - Type: Custom Event
   - Event name: `cta_clicked`

3. **Custom Event - form_submitted**
   - Type: Custom Event
   - Event name: `form_submitted`

4. **Custom Event - scroll_depth_reached**
   - Type: Custom Event
   - Event name: `scroll_depth_reached`

5. **Custom Event - demo_booking_initiated**
   - Type: Custom Event
   - Event name: `demo_booking_initiated`

### Variables to Create

**Data Layer Variables**:
- `DL - button_text` → Data Layer Variable → `button_text`
- `DL - cta_location` → Data Layer Variable → `cta_location`
- `DL - destination_url` → Data Layer Variable → `destination_url`
- `DL - form_type` → Data Layer Variable → `form_type`
- `DL - form_location` → Data Layer Variable → `form_location`
- `DL - email_provided` → Data Layer Variable → `email_provided`
- `DL - depth_percentage` → Data Layer Variable → `depth_percentage`
- `DL - event` → Data Layer Variable → `event`

**Built-in Variables** (enable these):
- Page Path
- Page URL
- Page Hostname
- Referrer
- Click Text
- Click URL

### Export Instructions

1. **Export Current Container**:
   - In GTM, go to Admin → Export Container
   - Choose version (latest)
   - Download JSON file

2. **Import to New Container**:
   - Create new container
   - Admin → Import Container
   - Choose file, select workspace
   - Import option: "Merge" (for existing) or "Overwrite" (for new)

3. **Update Measurement ID**:
   - After import, update GA4 Configuration tag
   - Replace placeholder Measurement ID with actual ID

---

## Implementation Roadmap

### Phase 1: Foundation (Week 1)

**Day 1-2**: Setup
- [ ] Create GA4 property
- [ ] Create GTM container
- [ ] Install GTM in layout.tsx
- [ ] Configure GA4 base tag
- [ ] Test basic page views

**Day 3-4**: Core Events
- [ ] Implement CTA tracking (Button component)
- [ ] Implement form tracking (popup, newsletter)
- [ ] Create tracking utility functions
- [ ] Test in DebugView

**Day 5-7**: Testing & QA
- [ ] Test all CTA variants
- [ ] Test form submissions
- [ ] Cross-browser testing
- [ ] Mobile testing
- [ ] Document any issues

### Phase 2: Engagement Tracking (Week 2)

**Day 1-2**: Scroll & Time
- [ ] Implement scroll depth tracking
- [ ] Implement time milestone tracking
- [ ] Add to blog posts
- [ ] Add to long-form pages

**Day 3-4**: Blog Engagement
- [ ] Implement blog engagement hook
- [ ] Add category tracking
- [ ] Add related article tracking
- [ ] Test on live blog posts

**Day 5-7**: Validation
- [ ] Verify all events firing
- [ ] Check event parameters
- [ ] Test on multiple blog posts
- [ ] Monitor for errors

### Phase 3: Advanced Tracking (Week 3)

**Day 1-2**: Page Interactions
- [ ] Implement pricing page tracking
- [ ] Implement FAQ tracking
- [ ] Implement tab/toggle tracking
- [ ] Add interaction tracking to relevant pages

**Day 3-4**: Outbound Links
- [ ] Implement outbound link tracking
- [ ] Add social media tracking
- [ ] Add integration link tracking
- [ ] Auto-detect Calendly links

**Day 5-7**: Video & Media (if applicable)
- [ ] Implement video tracking
- [ ] Add to video components
- [ ] Test video events
- [ ] Validate completion tracking

### Phase 4: Conversions & Privacy (Week 4)

**Day 1-2**: Conversion Setup
- [ ] Mark events as conversions in GA4
- [ ] Set conversion values
- [ ] Create custom conversion audiences
- [ ] Test conversion tracking

**Day 3-4**: Privacy Compliance
- [ ] Implement consent mode
- [ ] Create cookie consent banner
- [ ] Add to layout
- [ ] Test consent flow

**Day 5-7**: Documentation & Training
- [ ] Create team documentation
- [ ] Train marketing team on GTM
- [ ] Set up custom reports
- [ ] Schedule review meeting

### Phase 5: Optimization (Ongoing)

**Week 1**: Monitor & Adjust
- [ ] Review event data
- [ ] Check for anomalies
- [ ] Adjust parameters if needed
- [ ] Fix any issues

**Week 2-4**: Analyze & Report
- [ ] Create conversion funnel report
- [ ] Analyze CTA performance
- [ ] Review blog engagement
- [ ] Present findings to team

---

## Quick Reference: Common Tasks

### Add Tracking to New CTA

```tsx
import { Button } from '@/components/ui/button'

<Button
  href="https://example.com"
  ctaLocation="new_section_name"
  trackClick={true}
>
  Button Text
</Button>
```

### Add Tracking to New Form

```tsx
import { trackFormSubmission } from '@/lib/analytics/track-form-submission'

const handleSubmit = async (e) => {
  e.preventDefault()

  // Submit form data...

  // Track submission
  trackFormSubmission({
    form_type: 'contact',
    form_location: 'footer',
    email_provided: true,
  })
}
```

### Add Scroll Tracking to Page

```tsx
'use client'

import { useScrollDepthTracking } from '@/hooks/use-scroll-depth-tracking'

export default function MyPage() {
  useScrollDepthTracking(true)

  return <div>Page content</div>
}
```

### Add Blog Engagement Tracking

```tsx
'use client'

import { useBlogEngagementTracking } from '@/hooks/use-blog-engagement-tracking'
import { useScrollDepthTracking } from '@/hooks/use-scroll-depth-tracking'

export default function BlogPost() {
  useBlogEngagementTracking({
    articleTitle: 'How to Use Visitor Tracking',
    category: 'visitor-tracking',
  })

  useScrollDepthTracking(true)

  return <article>Blog content</article>
}
```

### Check If Event Fired (Console)

```javascript
// In browser console
window.dataLayer

// Filter for specific event
window.dataLayer.filter(item => item.event === 'cta_clicked')
```

### Manually Fire Test Event

```javascript
// In browser console
window.dataLayer.push({
  event: 'test_event',
  test_property: 'test_value'
})
```

---

## Troubleshooting

### Event Not Appearing in GA4

1. **Check GTM Preview Mode**
   - Is event firing in dataLayer?
   - Is GTM tag triggering?
   - Are parameters correct?

2. **Check GA4 DebugView**
   - Enable debug mode
   - Verify event shows in DebugView
   - Check parameter values

3. **Wait 24-48 Hours**
   - Custom parameters take time to appear in reports
   - Real-time should show events immediately

### Duplicate Events

1. **Check for Multiple Tags**
   - GTM → Tags → Search for duplicate event tags
   - Verify trigger conditions

2. **Check dataLayer.push Calls**
   - Search codebase for duplicate push calls
   - Ensure onClick handlers aren't firing twice

### Parameters Not Showing

1. **Create Custom Dimension**
   - GA4 Admin → Custom definitions
   - Create dimension with exact parameter name

2. **Check Parameter Name**
   - Must match exactly (case-sensitive)
   - Use underscores, not camelCase

### Consent Issues

1. **Check Consent Status**
   - Console: `localStorage.getItem('cookie_consent')`
   - Should be 'granted' or 'denied'

2. **Verify Consent Mode**
   - GTM Preview → Consent tab
   - Check consent state for analytics_storage

---

## Support & Resources

### Google Documentation

- [GA4 Documentation](https://support.google.com/analytics/answer/9306384)
- [GTM Documentation](https://support.google.com/tagmanager)
- [Consent Mode Guide](https://developers.google.com/tag-platform/security/guides/consent)
- [GA4 Events Reference](https://support.google.com/analytics/answer/9267735)

### Tools

- [GA4 Event Builder](https://ga-dev-tools.google/ga4/event-builder/)
- [GTM Community Gallery](https://tagmanager.google.com/gallery/)
- [GA4 Query Explorer](https://ga-dev-tools.google/query-explorer/)

### Community

- [GA4 Reddit](https://www.reddit.com/r/GoogleAnalytics/)
- [Measure Slack](https://www.measure.chat/)
- [GTM Community](https://www.simoahava.com/)

---

## Changelog

### Version 1.0.0 (2026-02-04)
- Initial implementation guide
- All core events documented
- GTM container configuration
- Privacy compliance included
- Testing procedures defined

---

## Next Steps

1. **Review this document** with the marketing and dev teams
2. **Create GA4 property** and GTM container
3. **Start with Phase 1** (Foundation)
4. **Test thoroughly** before moving to next phase
5. **Monitor daily** during first week
6. **Iterate and optimize** based on data

---

**Questions or Issues?**

Contact the analytics implementation team or refer to the troubleshooting section above.

**Last Updated**: 2026-02-04
**Maintained By**: Cursive Marketing Team
