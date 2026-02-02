# SEO Optimization Guide

Comprehensive guide to Cursive's SEO strategy and implementation.

## Overview

The platform implements comprehensive SEO best practices to maximize organic search visibility and drive qualified traffic.

## Key Components

1. **next-seo**: Meta tags and Open Graph
2. **Structured Data**: JSON-LD for rich snippets
3. **Sitemap**: Dynamic XML sitemap
4. **Robots.txt**: Crawler access control
5. **Performance**: Core Web Vitals optimization

## Meta Tags

### Default SEO Configuration

Located in `src/lib/seo/config.ts`:

```typescript
import SEO_CONFIG from '@/lib/seo/config'

// In app/layout.tsx
export const metadata = {
  ...SEO_CONFIG,
}
```

Includes:
- Title template
- Description
- Canonical URLs
- Open Graph tags
- Twitter Card tags
- Keywords
- Viewport settings

### Page-Specific SEO

```typescript
import { generatePageSEO } from '@/lib/seo/config'

export const metadata = generatePageSEO({
  title: 'Pricing Plans',
  description: 'Choose the perfect plan for your lead generation needs',
  path: '/pricing',
  image: 'https://openinfo.com/og-pricing.png',
})
```

## Structured Data (JSON-LD)

### Organization Schema

```tsx
import { OrganizationSchema } from '@/components/seo/structured-data'

<OrganizationSchema />
```

Provides:
- Company information
- Logo
- Social profiles
- Contact information

### Website Schema

```tsx
import { WebsiteSchema } from '@/components/seo/structured-data'

<WebsiteSchema />
```

Provides:
- Site search functionality
- Publisher information

### Software Application Schema

```tsx
import { SoftwareApplicationSchema } from '@/components/seo/structured-data'

<SoftwareApplicationSchema />
```

Provides:
- App information
- Pricing
- Ratings

### FAQ Schema

```tsx
import { FAQSchema } from '@/components/seo/structured-data'

<FAQSchema
  faqs={[
    {
      question: 'What is Cursive?',
      answer: 'Cursive is a B2B intent lead intelligence platform...',
    },
    {
      question: 'How does pricing work?',
      answer: 'We offer a free plan with 3 leads per day...',
    },
  ]}
/>
```

### Breadcrumb Schema

```tsx
import { BreadcrumbSchema } from '@/components/seo/structured-data'

<BreadcrumbSchema
  items={[
    { name: 'Home', url: 'https://openinfo.com' },
    { name: 'Pricing', url: 'https://openinfo.com/pricing' },
  ]}
/>
```

## Sitemap

Dynamic sitemap at `/sitemap.xml` includes:

- Homepage (priority: 1.0)
- Pricing page (priority: 0.8)
- Login/Signup (priority: 0.5-0.7)
- Auto-generated pages

## Robots.txt

Located at `/robots.txt`:

```
User-agent: *
Allow: /
Allow: /pricing
Disallow: /api/
Disallow: /dashboard/
Disallow: /data/

Sitemap: https://openinfo.com/sitemap.xml
```

## Open Graph Tags

For social sharing:

```html
<meta property="og:type" content="website" />
<meta property="og:url" content="https://openinfo.com" />
<meta property="og:title" content="Cursive - B2B Intent Lead Intelligence" />
<meta property="og:description" content="..." />
<meta property="og:image" content="https://openinfo.com/og-image.png" />
```

### OG Image Specifications

- Size: 1200x630px
- Format: PNG or JPG
- File size: < 1MB
- Text: Readable at thumbnail size

## Twitter Cards

```html
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:site" content="@openinfo" />
<meta name="twitter:title" content="Cursive" />
<meta name="twitter:description" content="..." />
<meta name="twitter:image" content="https://openinfo.com/og-image.png" />
```

## Canonical URLs

Every page includes canonical URL:

```html
<link rel="canonical" href="https://openinfo.com/pricing" />
```

Prevents duplicate content issues.

## Keywords Strategy

Target keywords:
- **Primary**: B2B leads, intent data, lead generation
- **Secondary**: sales intelligence, buyer intent, lead enrichment
- **Long-tail**: companies researching [topic], B2B intent signals

Keyword placement:
- Title tags (60 characters)
- Meta descriptions (155 characters)
- H1 headings
- First paragraph
- Image alt text

## Page Speed Optimization

### Core Web Vitals

Target metrics:
- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1

### Optimization Techniques

1. **Image Optimization**
   - Next.js Image component
   - WebP format
   - Lazy loading

2. **Code Splitting**
   - Dynamic imports
   - Route-based splitting

3. **Caching**
   - Redis caching (Vercel KV)
   - Static asset caching

4. **Font Optimization**
   - next/font for automatic font optimization
   - Preload critical fonts

## Content Strategy

### Landing Page SEO

```tsx
// app/page.tsx
export const metadata = {
  title: 'Cursive - Identify Companies Researching Your Topics',
  description: 'Track B2B intent signals and identify companies actively researching specific topics. Get enriched lead data delivered automatically. Free plan includes 3 leads per day.',
}

export default function Home() {
  return (
    <>
      <OrganizationSchema />
      <WebsiteSchema />

      <h1>Identify companies researching your topics</h1>
      <p>
        Cursive tracks B2B intent signals to help you discover companies
        actively researching specific topics...
      </p>
    </>
  )
}
```

### Blog Posts (Future)

For blog content:

```tsx
export const metadata = generatePageSEO({
  title: 'How to Generate B2B Leads with Intent Data',
  description: 'Learn how to use intent signals to identify high-quality B2B leads...',
  path: '/blog/b2b-leads-intent-data',
})

// Add Article schema
const articleSchema = {
  '@type': 'Article',
  headline: 'How to Generate B2B Leads with Intent Data',
  author: {
    '@type': 'Person',
    name: 'Cursive Team',
  },
  datePublished: '2024-01-22',
  image: 'https://openinfo.com/blog/intent-data.png',
}
```

## Technical SEO Checklist

- [x] SSL certificate (HTTPS)
- [x] Mobile responsive design
- [x] Fast page load (< 3s)
- [x] Clean URL structure
- [x] Sitemap.xml
- [x] Robots.txt
- [x] Canonical tags
- [x] Meta descriptions
- [x] Alt text for images
- [x] Structured data
- [x] Open Graph tags
- [x] Twitter Cards
- [ ] 404 error page (TODO)
- [ ] XML schema validation (TODO)

## Local SEO (Future)

For local business listings:

```typescript
const localBusinessSchema = {
  '@type': 'LocalBusiness',
  name: 'Cursive',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '...',
    addressLocality: 'San Francisco',
    addressRegion: 'CA',
    postalCode: '94102',
    addressCountry: 'US',
  },
}
```

## Monitoring & Analytics

### Google Search Console

Monitor:
- Indexing status
- Search queries
- Click-through rates
- Mobile usability
- Core Web Vitals

### Key Metrics

Track:
- Organic traffic
- Keyword rankings
- Bounce rate
- Time on page
- Conversion rate

## SEO Testing Tools

1. **Google PageSpeed Insights**: Performance
2. **Google Search Console**: Indexing & queries
3. **Ahrefs/SEMrush**: Keyword research
4. **Schema Markup Validator**: Structured data
5. **Mobile-Friendly Test**: Mobile UX

## Best Practices

### Do's

✅ Use descriptive URLs (`/pricing` not `/p123`)
✅ Write unique meta descriptions for each page
✅ Include keywords naturally in content
✅ Optimize images (alt text, compression)
✅ Use heading hierarchy (H1 → H2 → H3)
✅ Internal linking between related pages
✅ Fast page load times
✅ Mobile-first design

### Don'ts

❌ Keyword stuffing
❌ Duplicate content
❌ Hidden text/links
❌ Thin content pages
❌ Slow page load (> 5s)
❌ Broken links
❌ Missing alt text
❌ Non-HTTPS pages

## Content Optimization

### Title Tags

Format: `Primary Keyword - Secondary Keyword | Brand`

```
Cursive - B2B Intent Lead Intelligence Platform
Pricing Plans - Find Your Perfect Plan | Cursive
Lead Generation Dashboard - Track Your Leads | Cursive
```

### Meta Descriptions

- Length: 150-160 characters
- Include primary keyword
- Call-to-action
- Unique per page

Example:
```
Identify companies actively researching your topics. Get enriched B2B lead data delivered automatically. Free plan includes 3 leads per day. Start now!
```

### Heading Structure

```html
<h1>Main Page Title (One per page)</h1>

<h2>Section Heading</h2>
<p>Content...</p>

  <h3>Subsection Heading</h3>
  <p>Content...</p>

<h2>Another Section</h2>
<p>Content...</p>
```

### Internal Linking

Link to related pages:
- Use descriptive anchor text
- Link to important pages from homepage
- Create topic clusters
- Use breadcrumbs

## Future Enhancements

1. **Blog**: SEO-optimized content marketing
2. **Video Schema**: Product demos
3. **Review Schema**: Customer testimonials
4. **Event Schema**: Webinars
5. **AMP Pages**: Mobile-first content
6. **Multilingual**: International SEO

## Resources

- [Google Search Central](https://developers.google.com/search)
- [Schema.org](https://schema.org)
- [Web.dev](https://web.dev)
- [Next.js SEO](https://nextjs.org/learn/seo/introduction-to-seo)

---

**Last Updated**: 2026-01-22
