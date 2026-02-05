# 🚀 CURSIVE MARKETING OPTIMIZATION MASTER PLAN

**Mission**: Transform Cursive's marketing site into an SEO/AEO powerhouse that outranks Retarget IQ and dominates the B2B lead generation space.

**Timeline**: 3-4 weeks (automated + systematic execution)
**Scope**: 52 blog posts + 15 marketing pages + site-wide optimization

---

## 📊 PHASE 0: FOUNDATION & AUDIT (Week 1, Days 1-2)

### 0.1 Product Marketing Context
**Skill**: `product-marketing-context`

Create `.agents/product-marketing-context.md` with:

**Brand Identity:**
- **Company**: Cursive
- **Domain**: meetcursive.com
- **Tagline**: "We know who's searching for what"
- **Mission**: AI intent systems that never sleep

**Product Positioning:**
- **Category**: AI-powered B2B lead generation & outbound automation platform
- **Core Value Props**:
  1. Visitor Identification (70% of anonymous traffic revealed)
  2. Real-time Audience Builder (220M+ consumer, 140M+ business profiles)
  3. Multi-channel Activation (email, ads, direct mail)
  4. Intent-based Targeting (450B+ monthly intent signals)
  5. Compliance-first Data (GDPR, CCPA ready)

**Differentiation vs Retarget IQ:**
- AI-powered intent systems (vs manual workflows)
- Real-time data enrichment (vs batch processing)
- 70% visitor identification rate (industry-leading)
- Unified B2B + B2C data platform
- Native CRM integrations (200+)

**Target Audiences:**
1. **Primary**: B2B SaaS companies (Series A-C, $5M-$50M ARR)
2. **Secondary**: Digital marketing agencies (10-50 person teams)
3. **Tertiary**: Enterprise sales teams, growth marketers

**Voice & Tone:**
- **Style**: Professional yet approachable, data-driven but human
- **Perspective**: Expert consultant (not aggressive vendor)
- **Language**: Clear, technical but accessible
- **Emotion**: Confident, helpful, trustworthy
- **Format**: Question-answering, conversational explainers

**Key Stats to Sprinkle:**
- 220M+ consumer profiles
- 140M+ business profiles
- 70% visitor identification rate
- 450B+ monthly intent signals
- 200+ integrations
- 30,000+ intent categories

**CTAs:**
- Primary: "Book a Demo" → https://cal.com/adamwolfe/cursive-ai-audit
- Secondary: "Get Started for Free"
- Tertiary: "See How It Works", "View Platform"

**Product Names/Features:**
- Cursive (never "Retarget IQ")
- Visitor Identification
- Audience Builder
- AI Studio
- Direct Mail Automation
- Intent Audiences
- Data Clean Room

---

### 0.2 Content Audit
**Skills**: `seo-audit`, `page-cro`, `content-strategy`

**Audit All Existing Pages:**
1. Homepage (`/`)
2. Platform (`/platform`)
3. Services (`/services`)
4. Pricing (`/pricing`)
5. About (`/about`)
6. Resources (`/resources`)
7. Blog Index (`/blog`)
8. Case Studies (`/case-studies`)
9. FAQ (`/faq`)
10. Contact (`/contact`)
11. Visitor Identification (`/visitor-identification`)
12. Audience Builder (`/audience-builder`)
13. Direct Mail (`/direct-mail`)
14. Intent Audiences (`/intent-audiences`)
15. Integrations (`/integrations`)

**For Each Page, Document:**
- Current title & meta description
- H1/H2 structure
- Primary keyword target
- Current conversions/CTAs
- Schema markup status
- Internal linking opportunities
- Page speed / Core Web Vitals
- AEO readiness (Q&A format, natural language)

---

### 0.3 Keyword Research & Mapping
**Skill**: `seo-audit`, `programmatic-seo`

**Target Keyword Clusters:**

1. **Visitor Identification** (12 posts)
   - website visitor identification
   - anonymous visitor tracking
   - visitor tracking pixel
   - identify website visitors
   - website visitor analytics

2. **Audience Building** (10 posts)
   - audience targeting platform
   - B2B audience builder
   - customer segmentation software
   - behavioral audience segments
   - intent-based targeting

3. **Data Platforms** (9 posts)
   - consumer data platform
   - B2B data platform
   - customer data platform
   - marketing data platform
   - business intelligence data

4. **Lead Generation** (8 posts)
   - B2B lead generation
   - lead generation software
   - sales lead generation
   - outbound lead generation
   - lead generation platform

5. **Direct Mail** (5 posts)
   - direct mail marketing
   - direct mail automation
   - postcard retargeting
   - offline marketing campaigns

6. **Intent Data** (4 posts)
   - buyer intent data
   - purchase intent signals
   - intent-based marketing
   - B2B intent data

7. **Retargeting** (4 posts)
   - multi-channel retargeting
   - cross-platform retargeting
   - visitor retargeting

**Keyword Assignment:** Map each of 52 blogs to primary + 3-5 secondary keywords.

---

### 0.4 Internal Linking Architecture
**Skill**: `seo-audit`, `programmatic-seo`

**Hub & Spoke Model:**

**Tier 1 Hubs (Solution Pages):**
- `/visitor-identification` (links to 12 related blogs)
- `/audience-builder` (links to 10 related blogs)
- `/direct-mail` (links to 5 related blogs)
- `/intent-audiences` (links to 4 related blogs)
- `/integrations` (links from all blogs)

**Tier 2 Spokes (Blog Categories):**
- `/blog/visitor-tracking/` (visitor identification posts)
- `/blog/audience-targeting/` (audience building posts)
- `/blog/data-platforms/` (data platform posts)
- `/blog/lead-generation/` (lead gen posts)

**Tier 3 Leaves (Individual Posts):**
- Each blog links to:
  - 1 solution page (primary hub)
  - 2-3 related blogs (lateral)
  - 1 bottom-funnel page (pricing, platform, demo)

**Internal Link Guidelines:**
- **Minimum per blog**: 5 internal links
- **Maximum per blog**: 10 internal links
- **Anchor text**: Natural, keyword-rich (not "click here")
- **Link placement**: Within first 500 words (1 link), throughout body (3-4 links), in conclusion (1-2 links)

---

## 📝 PHASE 1: BLOG INFRASTRUCTURE (Week 1, Days 3-5)

### 1.1 Blog Template System
**Skills**: `copywriting`, `seo-audit`, `schema-markup`

**Create Optimal Blog Structure:**

```typescript
// marketing/components/blog/blog-post-layout.tsx

interface BlogPost {
  title: string
  slug: string
  excerpt: string
  content: string
  author: string
  publishDate: string
  updatedDate?: string
  keywords: string[]
  category: string
  readTime: number
  coverImage: string
  relatedPosts: string[]
  cta: {
    heading: string
    description: string
    buttonText: string
    buttonUrl: string
  }
}

export function BlogPostLayout({ post }: { post: BlogPost }) {
  return (
    <>
      {/* Schema Markup */}
      <StructuredData data={generateBlogPostSchema(post)} />
      <StructuredData data={generateBreadcrumbSchema([
        { name: 'Home', url: 'https://meetcursive.com' },
        { name: 'Blog', url: 'https://meetcursive.com/blog' },
        { name: post.category, url: `https://meetcursive.com/blog/${post.category}` },
        { name: post.title, url: `https://meetcursive.com/blog/${post.slug}` },
      ])} />

      <article className="max-w-4xl mx-auto">
        {/* Breadcrumbs */}
        <Breadcrumbs category={post.category} />

        {/* Hero */}
        <header className="mb-12">
          <h1 className="text-5xl font-light text-gray-900 mb-4">{post.title}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <time dateTime={post.publishDate}>{formatDate(post.publishDate)}</time>
            <span>·</span>
            <span>{post.readTime} min read</span>
            <span>·</span>
            <span>{post.category}</span>
          </div>
        </header>

        {/* Table of Contents (AEO!) */}
        <TableOfContents headings={extractHeadings(post.content)} />

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <MDXContent content={post.content} />
        </div>

        {/* Author Box */}
        <AuthorBox author={post.author} />

        {/* CTA Section */}
        <CTABox {...post.cta} />

        {/* Related Posts */}
        <RelatedPosts posts={post.relatedPosts} />

        {/* FAQ Schema (AEO!) */}
        {post.faqs && <FAQSection faqs={post.faqs} />}
      </article>
    </>
  )
}
```

### 1.2 AEO (Answer Engine Optimization) Setup

**Create `llms.txt` for AI discovery:**

```
# Cursive - AI Intent Systems That Never Sleep

## Platform Overview
Cursive is an AI-powered B2B lead generation and outbound automation platform that identifies anonymous website visitors, builds targeted audiences, and activates multi-channel campaigns.

## Core Products
- Visitor Identification: Reveal up to 70% of anonymous website traffic
- Audience Builder: Access 220M+ consumer and 140M+ business profiles
- Intent Audiences: 450B+ monthly intent signals across 30,000+ categories
- Direct Mail Automation: Postcard retargeting and offline campaigns
- AI Studio: Train AI on your brand voice for automated outreach

## Key Capabilities
- Real-time visitor identification and enrichment
- Multi-channel activation (email, ads, direct mail, SMS)
- 200+ native CRM and marketing tool integrations
- Compliance-first data handling (GDPR, CCPA ready)
- Intent-based audience targeting

## Ideal For
- B2B SaaS companies seeking to generate qualified leads
- Digital marketing agencies managing client campaigns
- Enterprise sales teams looking to identify in-market prospects
- Growth marketers optimizing conversion funnels

## Documentation
- Homepage: https://meetcursive.com
- Platform: https://meetcursive.com/platform
- Blog: https://meetcursive.com/blog
- Demo: https://cal.com/adamwolfe/cursive-ai-audit

## Contact
- Website: https://meetcursive.com
- Demo Booking: https://cal.com/adamwolfe/cursive-ai-audit
```

**AEO Blog Format (Q&A Style):**

Each blog post should:
1. Start with a question-based title (e.g., "How Does Website Visitor Tracking Work for Lead Generation?")
2. Include FAQ section at bottom with 5-8 common questions
3. Use natural, conversational language (not keyword-stuffed)
4. Answer "why," "how," "what," and "when" questions directly
5. Include specific numbers and examples
6. Add "People Also Ask" section

---

### 1.3 Blog Categories & Taxonomy

**Create Category Pages:**
- `/blog/visitor-tracking/`
- `/blog/audience-targeting/`
- `/blog/data-platforms/`
- `/blog/lead-generation/`
- `/blog/direct-mail/`
- `/blog/retargeting/`
- `/blog/analytics/`
- `/blog/crm-integration/`

**Each category page includes:**
- Category description (150-200 words)
- All posts in that category
- Schema markup for category
- Links to related solution pages

---

## ✍️ PHASE 2: BLOG REPURPOSING (Week 2-3)

### 2.1 Automated Rebranding Pass
**Skill**: `copywriting`

**Batch Processing (All 52 Posts):**

Run automated find/replace:
```bash
# Remove all Retarget IQ mentions
sed -i '' 's/Retarget IQ/Cursive/g' *.md
sed -i '' 's/RetargetIQ/Cursive/g' *.md
sed -i '' 's/retargetiq.com/meetcursive.com/g' *.md

# Remove competitor CTAs
sed -i '' '/Retarget IQ connects/d' *.md
sed -i '' '/Using Retarget IQ/d' *.md
sed -i '' '/## How Retarget IQ Drives Results/,$d' *.md

# Remove footer sections
sed -i '' '/### \*\*RECENT POSTS\*\*/,$d' *.md
sed -i '' '/## How Retarget IQ/,$d' *.md
```

---

### 2.2 Content Repurposing Framework
**Skills**: `copywriting`, `copy-editing`, `content-strategy`

**For EACH of 52 Blog Posts:**

#### **Step 1: Seven Sweeps Copy Editing**

1. **Clarity Sweep**
   - Remove jargon: "facilitate" → "help", "leverage" → "use"
   - Simplify complex sentences
   - Add concrete examples with Cursive features
   - Break paragraphs into scannable bullets

2. **Voice & Tone Sweep**
   - Match Cursive's professional-yet-human voice
   - Remove overly casual "we all" language
   - Add technical authority (mention specific tech: APIs, webhooks, real-time syncs)
   - Strengthen confidence: remove "might," "almost," "fairly"

3. **"So What" Sweep**
   - Convert features to outcomes:
     - ❌ "Cursive tracks visitor behavior"
     - ✅ "Cursive reveals which companies are browsing your pricing page right now—so you can reach out while they're still interested"
   - Add "which means" bridges
   - Quantify everything possible (percentages, time saved, revenue impact)

4. **Proof Sweep**
   - Add Cursive-specific stats:
     - "With 220M+ consumer profiles and 140M+ business profiles..."
     - "Cursive's 70% visitor identification rate means..."
     - "Using Cursive's 450B+ monthly intent signals..."
   - Include customer success snippets (even if hypothetical initially)
   - Reference integrations: "Cursive syncs directly with Salesforce, HubSpot, and 200+ tools"

5. **Scan Sweep**
   - Add H2 every 300-400 words
   - Add H3 for sub-points
   - Convert long paragraphs to bullets
   - Bold key takeaways
   - Add pull quotes for visual interest

6. **CTA Sweep**
   - Replace generic CTAs with specific ones:
     - "Book a demo" → "See how Cursive identifies your website visitors"
     - "Get started" → "Reveal 70% of your anonymous traffic today"
     - "Learn more" → "Explore Cursive's Audience Builder"
   - Vary CTAs throughout (not just at bottom)
   - Link to specific solution pages (not just homepage)

7. **One More Time Sweep**
   - Final flow check
   - Verify all internal links work
   - Check for leftover competitor mentions
   - Ensure brand voice consistency

#### **Step 2: SEO Optimization**

**Title Optimization:**
- Format: "[How to/Guide to/Tips for] [Primary Keyword] [Year] | Cursive"
- Length: 50-60 characters
- Include power words: "complete," "ultimate," "proven," "essential"
- Example: "The Complete Guide to Website Visitor Tracking for Lead Generation (2026)"

**Meta Description:**
- Length: 150-160 characters
- Include primary keyword + CTA
- Front-load value proposition
- Example: "Learn how website visitor tracking turns anonymous traffic into qualified leads. Cursive's platform reveals up to 70% of visitors. Book a demo today."

**URL Slug:**
- Format: `/blog/[category]/[keyword-rich-slug]/`
- Example: `/blog/visitor-tracking/website-visitor-identification-lead-generation/`
- Keep under 60 characters
- Use hyphens, not underscores

**Keyword Integration:**
- Primary keyword in:
  - Title (beginning if possible)
  - First paragraph (first 100 words)
  - At least 2 H2 headings
  - Conclusion
  - Meta description
  - URL slug
  - Image alt text
- Secondary keywords in:
  - H2/H3 headings (natural variations)
  - Throughout body (1-2% density)
  - Internal link anchor text

#### **Step 3: AEO Optimization**

**Add FAQ Section to Every Post:**

```markdown
## Frequently Asked Questions

### What is [primary topic]?
[150-word answer with Cursive mention]

### How does [primary topic] work?
[150-word answer with technical details]

### Why is [primary topic] important for B2B companies?
[150-word answer with stats and benefits]

### What are the best tools for [primary topic]?
[150-word answer mentioning Cursive + 2-3 alternatives]

### How much does [primary topic] cost?
[150-word answer with pricing context, link to Cursive pricing]

### How do I get started with [primary topic]?
[150-word answer with step-by-step, CTA to demo]
```

**Add FAQ Schema:**
```typescript
<StructuredData data={generateFAQSchema(post.faqs)} />
```

**Natural Language Optimization:**
- Use conversational questions as H2s: "Why Does Visitor Tracking Matter?"
- Answer questions directly in next paragraph
- Use "you" language (not "one" or "users")
- Include specific examples: "For instance, if you're a SaaS company selling project management software..."

#### **Step 4: Internal Linking**

**Every Blog Post Must Include:**

1. **1 Solution Page Link** (top 500 words)
   - Link to primary hub (visitor-identification, audience-builder, etc.)
   - Anchor text: natural, keyword-rich
   - Example: "Cursive's [visitor identification platform](https://meetcursive.com/visitor-identification) reveals up to 70% of anonymous traffic"

2. **2-3 Related Blog Links** (throughout)
   - Link to complementary posts
   - Anchor text: question-based or keyword-rich
   - Example: "Learn more about [building targeted audience segments](/blog/audience-targeting/behavioral-audience-segmentation)"

3. **1 Bottom-Funnel Link** (conclusion)
   - Link to pricing, platform overview, or demo
   - Stronger CTA
   - Example: "Ready to identify your website visitors? [Explore Cursive's platform](https://meetcursive.com/platform) or [book a demo](https://cal.com/adamwolfe/cursive-ai-audit)."

4. **1 Integration/Feature Link** (mid-post)
   - Link to integrations page or specific feature
   - Example: "Cursive integrates with [200+ marketing tools](/integrations) including Salesforce, HubSpot, and Google Ads"

**Internal Linking Best Practices:**
- Open in same tab (not new tab for internal links)
- Use descriptive anchor text (not "click here")
- Don't over-optimize (vary anchor text)
- Link from high-authority pages to new pages

#### **Step 5: Product Mentions (Subtle to Medium Aggressive)**

**Per Blog Post (3-5 Cursive Mentions):**

**Subtle (2-3 per post):**
- "With tools like Cursive, you can..."
- "Platforms such as Cursive make it easy to..."
- "Using Cursive's visitor identification, companies can..."

**Medium Aggressive (1-2 per post):**
- "Cursive's AI-powered platform automatically identifies up to 70% of anonymous website visitors—without requiring any form fills or opt-ins."
- "Unlike traditional tools, Cursive combines visitor identification with real-time data enrichment, giving you complete profiles of your prospects in seconds."
- "Cursive's audience builder gives you instant access to 220M+ consumer profiles and 140M+ business profiles, all enriched with intent signals and behavioral data."

**Placement:**
- 1st mention: After introducing the problem (around paragraph 3-4)
- 2nd mention: When explaining a solution or best practice
- 3rd mention: In a "how-to" section or example
- 4th mention: Before CTA section
- 5th mention: In FAQ or conclusion

---

### 2.3 Batch Processing Strategy

**Batch 1: Visitor Identification & Lead Gen (20 posts) - Week 2, Days 1-3**
Posts: 22, 25, 1, 2, 11, 16, 9, 14, 20, 23, 31, 42, 3, 8, 13, 26, 51, 52, 48, 38

**Batch 2: Audience Building & Intent Data (16 posts) - Week 2, Days 4-5**
Posts: 32, 34, 29, 41, 49, 4, 6, 7, 12, 36, 40, 43, 47, 50, 15, 44

**Batch 3: Direct Mail, Retargeting & Multi-Channel (10 posts) - Week 3, Days 1-2**
Posts: 10, 37, 45, 5, 17, 18, 21, 39, 35, 28

**Batch 4: CRM, Analytics, Compliance (6 posts) - Week 3, Day 3**
Posts: 19, 30, 33, 24, 27, 46

**For Each Batch:**
1. Automated rebranding pass (30 min)
2. Manual Seven Sweeps editing (1 hour per post)
3. SEO optimization + meta tags (30 min per post)
4. Internal linking (20 min per post)
5. AEO + FAQ section (30 min per post)
6. QA validation (15 min per post)

**Total time per post**: ~3.5 hours
**Total time per batch**: Varies by size

---

## 🎯 PHASE 3: EXISTING PAGE OPTIMIZATION (Week 3, Days 4-5)

### 3.1 Homepage CRO
**Skills**: `page-cro`, `copywriting`, `marketing-psychology`

**Apply Page CRO Framework:**

1. **Clarity Test**
   - Can visitor understand what Cursive does in 5 seconds?
   - Is value prop above the fold?
   - Are CTAs crystal clear?

2. **Relevance Test**
   - Does copy speak to visitor's pain points?
   - Are benefits visitor-focused (not company-focused)?
   - Is proof presented early (stats, logos, testimonials)?

3. **Friction Audit**
   - How many clicks to book demo? (should be 1)
   - Are forms too long?
   - Is navigation overwhelming?
   - Are there broken links?

4. **Urgency/Scarcity**
   - Is there a reason to act now?
   - Limited time offer? Free trial? Risk-free demo?

**Homepage Optimization Checklist:**
- [ ] Hero: Clear value prop in <10 words
- [ ] Hero: Subhead explains how it works in <20 words
- [ ] Hero: Primary CTA stands out (size, color, placement)
- [ ] Stats: Key numbers above fold (70%, 220M+, 140M+)
- [ ] Social Proof: Customer logos or testimonials in top 2 sections
- [ ] Features: Benefit-led (not feature-led)
- [ ] Demo: Interactive dashboard preview
- [ ] Final CTA: Strong, urgent, clear

---

### 3.2 Pricing Page Optimization
**Skill**: `pricing-strategy`, `page-cro`

**Pricing Psychology Tactics:**

1. **Anchoring**: Show highest tier first
2. **Decoy Effect**: Make middle tier most attractive
3. **Value Visualization**: Show ROI calculation
4. **Social Proof**: "Most popular" badge on recommended tier
5. **Risk Reversal**: "Money-back guarantee" or "Cancel anytime"

**Pricing Page Checklist:**
- [ ] 3 tiers maximum (too many = decision paralysis)
- [ ] Clear tier names (not "Basic/Pro/Enterprise")
- [ ] Feature comparison table
- [ ] Annual billing discount (save 20%+)
- [ ] FAQ section addressing objections
- [ ] Multiple CTAs (each tier + "Contact Sales")
- [ ] Calculator or ROI estimator
- [ ] Testimonials specific to each tier

---

### 3.3 Solution Pages CRO
**Skills**: `page-cro`, `copywriting`, `schema-markup`

**For each solution page** (visitor-identification, audience-builder, direct-mail, intent-audiences):

**Structure:**
1. **Hero**: Problem statement + Cursive solution (150 words)
2. **How It Works**: 3-4 step visual explanation
3. **Benefits Grid**: 6-8 benefits with icons
4. **Use Cases**: 3-4 specific examples for different industries
5. **Features Deep Dive**: Detailed feature explanations with screenshots
6. **Integrations**: Show relevant integrations for this solution
7. **Social Proof**: Testimonials or case study excerpt
8. **FAQ**: 8-10 questions specific to this solution
9. **CTA**: Strong, benefit-focused call to demo

**SEO for Solution Pages:**
- Title: "[Solution] for B2B Lead Generation | Cursive"
- Meta: 160 chars with primary keyword + value prop
- Schema: Add Product schema + FAQPage schema
- Internal links: Link from 8-12 related blogs

---

### 3.4 About Page Optimization
**Skills**: `copywriting`, `marketing-psychology`

**About Page Framework:**

Not "about us"—it's about **why we built this for you**.

1. **The Problem**: What pain point did we experience?
2. **The Revelation**: What did we realize was broken?
3. **The Mission**: What are we building to fix it?
4. **The Team**: Who's behind this? (expertise, not bios)
5. **The Proof**: What have we achieved so far?
6. **The Invite**: How can you join us?

**About Page Checklist:**
- [ ] Customer-focused (not company-focused)
- [ ] Story-driven (not just facts)
- [ ] Specific milestones and metrics
- [ ] Team photos (builds trust)
- [ ] CTA to demo or careers
- [ ] Link to press, blog, or resources

---

### 3.5 Contact Page Optimization
**Skill**: `form-cro`

**Form CRO Best Practices:**

1. **Minimize Fields**: Only ask for what's needed
2. **Clear Labels**: "Work email" not just "Email"
3. **Inline Validation**: Real-time error messages
4. **Social Proof**: "Join 1,000+ companies" above form
5. **Privacy Assurance**: "We'll never spam you" below button
6. **Multi-Channel**: Offer email, calendar, phone, chat

**Contact Page Checklist:**
- [ ] Max 5 form fields for demo request
- [ ] Calendly embed for instant booking
- [ ] Alternative contact methods (email, LinkedIn)
- [ ] Expected response time ("We'll respond within 24 hours")
- [ ] FAQ or "What to expect" section

---

## 🔗 PHASE 4: INTERNAL LINKING & SITE STRUCTURE (Week 4, Days 1-2)

### 4.1 Internal Linking Matrix

**Create Link Spreadsheet:**

| From Page | To Page | Anchor Text | Context | Priority |
|-----------|---------|-------------|---------|----------|
| Homepage | Visitor ID | "identify website visitors" | Hero section | High |
| Homepage | Audience Builder | "build targeted audiences" | Features section | High |
| Blog Post 22 | Visitor ID | "visitor identification platform" | Paragraph 3 | High |
| Blog Post 22 | Blog Post 25 | "boost sales through visitor conversion" | Conclusion | Medium |
| ... | ... | ... | ... | ... |

**Link All:**
- Homepage → All solution pages
- Solution pages → Related blogs (minimum 8 each)
- Blogs → Other blogs (2-3 per post)
- Blogs → Solution pages (1 per post)
- Blogs → Bottom-funnel pages (1 per post)
- Footer → All main pages

---

### 4.2 Sitemap Optimization

**Update `marketing/app/sitemap.ts`:**

```typescript
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://meetcursive.com'

  // Static pages
  const staticPages = [
    { url: '', priority: 1.0, changeFrequency: 'weekly' },
    { url: '/platform', priority: 0.9, changeFrequency: 'weekly' },
    { url: '/pricing', priority: 0.9, changeFrequency: 'weekly' },
    { url: '/visitor-identification', priority: 0.8, changeFrequency: 'weekly' },
    { url: '/audience-builder', priority: 0.8, changeFrequency: 'weekly' },
    { url: '/direct-mail', priority: 0.8, changeFrequency: 'weekly' },
    { url: '/intent-audiences', priority: 0.8, changeFrequency: 'weekly' },
    { url: '/integrations', priority: 0.7, changeFrequency: 'monthly' },
    // ... all pages
  ]

  // Blog posts (all 52)
  const blogPosts = [
    { slug: 'website-visitor-tracking-lead-generation', category: 'visitor-tracking', date: '2026-02-10' },
    { slug: 'audience-targeting-platform-guide', category: 'audience-targeting', date: '2026-02-09' },
    // ... all 52 posts
  ].map(post => ({
    url: `/blog/${post.category}/${post.slug}`,
    lastModified: post.date,
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  // Blog categories
  const blogCategories = [
    'visitor-tracking',
    'audience-targeting',
    'lead-generation',
    'data-platforms',
    'direct-mail',
    'retargeting',
  ].map(cat => ({
    url: `/blog/${cat}`,
    priority: 0.7,
    changeFrequency: 'weekly',
  }))

  return [...staticPages, ...blogCategories, ...blogPosts].map(item => ({
    url: `${baseUrl}${item.url}`,
    lastModified: item.lastModified || new Date(),
    changeFrequency: item.changeFrequency,
    priority: item.priority,
  }))
}
```

---

### 4.3 Schema Markup Across Site

**Add Schema to ALL Pages:**

**Homepage:**
- Organization schema (already exists)
- WebSite schema (for sitelinks search box)

**Solution Pages:**
- Product schema
- FAQPage schema

**Blog Posts:**
- BlogPosting schema (already planned)
- FAQPage schema (for FAQ sections)
- BreadcrumbList schema

**Pricing Page:**
- Product schema for each tier
- AggregateOffer schema

---

## 🤖 PHASE 5: AEO (ANSWER ENGINE OPTIMIZATION) (Week 4, Days 3-4)

### 5.1 llms.txt Implementation

**Create `marketing/public/llms.txt`:**

```
# Cursive - AI Intent Systems for B2B Lead Generation

> Cursive is an AI-powered platform that identifies anonymous website visitors, builds intent-based audiences, and automates multi-channel outreach campaigns.

## What is Cursive?

Cursive is a B2B lead generation and outbound automation platform that helps companies:
- Identify up to 70% of anonymous website visitors
- Access 220M+ consumer profiles and 140M+ business profiles
- Build audiences using 450B+ monthly intent signals across 30,000+ categories
- Activate campaigns across email, ads, direct mail, and SMS
- Integrate with 200+ CRMs and marketing tools

## Core Products

### Visitor Identification
Reveal anonymous website visitors without forms or cookies. Track which companies and individuals browse your site, what pages they view, and when they're most engaged.

### Audience Builder
Create unlimited audience segments using firmographic, demographic, behavioral, and intent data. No size limits, no restrictive licensing.

### Intent Audiences
Access pre-built syndicated audiences across 8 verticals with Hot (7D), Warm (14D), and Scale (30D) intent levels. Updated weekly with fresh users.

### Direct Mail Automation
Launch postcard retargeting campaigns triggered by website behavior, email engagement, or offline events.

### AI Studio
Train AI agents on your brand voice to write personalized outreach, respond to leads, and book meetings autonomously.

## Who Uses Cursive?

**Ideal Customer Profile:**
- B2B SaaS companies ($5M-$50M ARR)
- Digital marketing agencies (10-50 person teams)
- Enterprise sales teams with long sales cycles
- Growth marketers optimizing conversion funnels

**Use Cases:**
- ABM campaigns targeting specific accounts
- Event retargeting (webinar attendees, conference visitors)
- Free trial conversion optimization
- Sales prospecting automation
- Lead scoring and qualification

## Key Differentiators

Cursive vs. Competitors:
- **70% visitor identification rate** (industry-leading)
- **Real-time data enrichment** (not batch processing)
- **Unified B2B + B2C data** (one platform for all audiences)
- **Native integrations** (200+ tools, not just Zapier)
- **Compliance-first** (GDPR, CCPA, opt-out handling)

## Pricing

- **Data**: Monthly lead lists starting at $1,000/mo
- **Platform**: Self-serve access starting at $2,500/mo
- **Managed**: White-glove campaign management at $5,000+/mo

[View pricing details](https://meetcursive.com/pricing)

## Integration Examples

Cursive integrates with:
- **CRMs**: Salesforce, HubSpot, Pipedrive, Zoho
- **Email**: Mailchimp, SendGrid, Customer.io, Klaviyo
- **Ads**: Google Ads, Meta, LinkedIn, TikTok
- **Analytics**: Google Analytics, Segment, Mixpanel
- **Automation**: Zapier, Make, webhooks

[View all 200+ integrations](https://meetcursive.com/integrations)

## Common Questions

### How does visitor identification work?
Cursive uses a combination of IP matching, reverse IP lookup, and proprietary identity graphs to match website visitors to known profiles in our database of 220M+ consumer and 140M+ business contacts.

### Is Cursive GDPR compliant?
Yes. Cursive honors all opt-outs, uses hashed identifiers where required, and provides data processing agreements for EU customers.

### What's the minimum contract?
No long-term contracts required. Monthly billing available on all plans.

### Do I need to install tracking code?
Yes, you'll add a lightweight JavaScript pixel to your site (similar to Google Analytics). Installation takes ~5 minutes.

### How accurate is the visitor identification?
Cursive identifies up to 70% of B2B traffic and 40-50% of B2C traffic, depending on your site's audience profile.

## Getting Started

1. **Book a demo**: [Schedule 30-minute walkthrough](https://cal.com/adamwolfe/cursive-ai-audit)
2. **Install pixel**: Add tracking code to your site
3. **Build audiences**: Create segments based on behavior + intent
4. **Activate campaigns**: Launch outreach across channels
5. **Measure results**: Track attribution and ROI

## Resources

- [Platform Overview](https://meetcursive.com/platform)
- [Blog](https://meetcursive.com/blog)
- [Case Studies](https://meetcursive.com/case-studies)
- [Help Center](https://meetcursive.com/resources)

## Contact

- **Website**: https://meetcursive.com
- **Demo**: https://cal.com/adamwolfe/cursive-ai-audit
- **Email**: hello@meetcursive.com

---

Last updated: 2026-02-04
```

**Place llms.txt at:**
- `/public/llms.txt`
- `/robots.txt` → Add: `Sitemap: https://meetcursive.com/llms.txt`

---

### 5.2 Q&A Optimization (All Pages)

**Every page should answer questions directly:**

**Homepage:**
- "What is Cursive?" (first paragraph)
- "How does it work?" (3-step visual)
- "Who is it for?" (use case section)
- "How much does it cost?" (link to pricing)

**Solution Pages:**
- "What is [solution]?"
- "How does [solution] work?"
- "What are the benefits of [solution]?"
- "How is [solution] different from competitors?"
- "How much does [solution] cost?"

**Blog Posts:**
- Title as question: "How Does Website Visitor Tracking Work?"
- FAQ section with 5-8 questions
- Natural Q&A format throughout

---

### 5.3 Featured Snippets Optimization

**Target Featured Snippet Opportunities:**

1. **Definition Boxes**:
   - "What is visitor identification?"
   - "What is intent data?"
   - Format: Short paragraph (40-60 words) with bold key terms

2. **How-To Snippets**:
   - "How to identify website visitors"
   - "How to build targeted audiences"
   - Format: Numbered lists (5-8 steps)

3. **Table Snippets**:
   - "Visitor identification tools comparison"
   - "B2B data platform pricing"
   - Format: HTML tables with clear headers

4. **List Snippets**:
   - "Best practices for visitor tracking"
   - "Top direct mail automation platforms"
   - Format: Bulleted lists (5-10 items)

**Featured Snippet Strategy:**
- Place snippet-worthy content in first 100-200 words
- Use proper HTML tags (h2, ul, ol, table)
- Keep answers concise and direct
- Include primary keyword in answer

---

## 📈 PHASE 6: CONVERSION OPTIMIZATION (Week 4, Day 5)

### 6.1 Signup Flow CRO
**Skill**: `signup-flow-cro`

**Optimize Demo Request Flow:**

**Current Flow:**
1. Click "Book a Demo" CTA
2. Redirect to Calendly
3. Fill out form + select time

**Optimized Flow:**
1. Click "Book a Demo" CTA
2. Inline calendar embed (no redirect)
3. Minimal form (name, email, company)
4. Instant confirmation + calendar invite

**A/B Test Ideas:**
- Test 1: Calendly embed vs. custom form
- Test 2: "Book a Demo" vs. "See Cursive in Action"
- Test 3: Form before calendar vs. calendar before form

---

### 6.2 Popup CRO
**Skill**: `popup-cro`

**Exit Intent Popup:**

**Trigger**: User moves mouse to close tab
**Headline**: "Wait! See How Cursive Identifies 70% of Your Website Visitors"
**Offer**: Free website visitor report (shows 20 companies that visited in last 7 days)
**Form**: Email only
**CTA**: "Get My Free Report"

**Scroll-Based Popup (Blog Posts):**

**Trigger**: 50% scroll depth
**Headline**: "Want More Insights Like This?"
**Offer**: Subscribe to weekly B2B growth newsletter
**Form**: Email only
**CTA**: "Subscribe"

---

### 6.3 Email Sequence Setup
**Skill**: `email-sequence`

**Demo Request Follow-Up Sequence:**

**Email 1** (Immediately after demo booking):
- Subject: "Your Cursive demo is confirmed ✓"
- Content: Confirmation + what to expect + prep questions

**Email 2** (1 day before demo):
- Subject: "Tomorrow: Your Cursive demo with [Name]"
- Content: Reminder + link to add to calendar + prep tips

**Email 3** (Same day, 2 hours before):
- Subject: "Starting in 2 hours: Cursive demo"
- Content: Quick reminder + demo link

**Email 4** (1 day after demo):
- Subject: "Thanks for demoing Cursive—next steps"
- Content: Recap + trial offer + case study

**Email 5** (3 days after demo, if no response):
- Subject: "Quick question about Cursive"
- Content: Check in + address common objections

**Email 6** (7 days after demo, if no response):
- Subject: "Should we close your file?"
- Content: Breakup email with last-chance offer

---

## 🚀 PHASE 7: TECHNICAL SEO & PERFORMANCE (Ongoing)

### 7.1 Technical SEO Audit
**Skill**: `seo-audit`

**Run Full Site Audit:**

**Crawlability:**
- [ ] Robots.txt allows Googlebot
- [ ] XML sitemap submitted to Search Console
- [ ] No orphan pages (all pages linked from somewhere)
- [ ] All important pages within 3 clicks of homepage

**Indexation:**
- [ ] All 52 blogs indexed in Google
- [ ] No duplicate content issues
- [ ] Canonical tags on all pages
- [ ] No noindex tags on important pages

**Site Speed:**
- [ ] Lighthouse score 90+ (Performance)
- [ ] LCP < 2.5s
- [ ] FID < 100ms
- [ ] CLS < 0.1
- [ ] Images optimized (WebP format)
- [ ] CSS/JS minified

**Mobile Optimization:**
- [ ] Mobile-friendly test passed
- [ ] Responsive design on all pages
- [ ] Touch targets >48px
- [ ] Font sizes >16px

**Security:**
- [ ] HTTPS everywhere
- [ ] No mixed content warnings
- [ ] SSL certificate valid

---

### 7.2 Analytics Tracking Setup
**Skill**: `analytics-tracking`

**Implement Comprehensive Tracking:**

**GA4 Events:**
```typescript
// Button clicks
gtag('event', 'cta_click', {
  cta_text: 'Book a Demo',
  page_location: window.location.href,
})

// Scroll depth
gtag('event', 'scroll', {
  percent_scrolled: 50,
})

// Form submissions
gtag('event', 'form_submit', {
  form_type: 'demo_request',
})

// Blog engagement
gtag('event', 'blog_read', {
  post_title: document.title,
  time_on_page: 120, // seconds
})

// Outbound link clicks
gtag('event', 'click', {
  event_category: 'outbound',
  event_label: 'calendly_booking',
})
```

**Conversion Goals:**
1. Demo booking (Calendly)
2. Email signup (newsletter)
3. Resource download
4. Pricing page visit
5. Multiple blog posts read (3+)

---

### 7.3 A/B Testing Framework
**Skill**: `ab-test-setup`

**Priority Tests:**

**Test 1: Homepage Hero CTA**
- A: "Book a Demo"
- B: "See Cursive in Action"
- C: "Identify Your Website Visitors"

**Test 2: Pricing Page**
- A: 3 tiers (Data, Platform, Managed)
- B: 2 tiers (Platform, Enterprise) + "Contact Sales"
- C: Single plan + "Contact for Pricing"

**Test 3: Blog CTA Placement**
- A: CTA at bottom only
- B: CTA mid-post + bottom
- C: Inline CTAs throughout

**Test 4: Exit Intent Popup**
- A: Free visitor report offer
- B: Free trial offer
- C: Case study download

**Testing Tools:**
- Google Optimize (free)
- Vercel Edge Config (feature flags)
- Split.io (advanced)

---

## 📊 SUCCESS METRICS & KPIs

### Launch Metrics (Week 4)

**Content:**
- [ ] 52 blog posts live
- [ ] 0 "Retarget IQ" mentions
- [ ] All internal links functional
- [ ] All images optimized

**SEO:**
- [ ] Lighthouse SEO score 95+ on all pages
- [ ] All pages indexed in Google
- [ ] All schema markup validated
- [ ] llms.txt published

**Performance:**
- [ ] Lighthouse Performance score 90+
- [ ] LCP < 2.5s on all pages
- [ ] Mobile-friendly on all pages

### 30-Day Metrics

**Organic Traffic:**
- Target: 10,000+ monthly organic sessions
- Blogs driving 60%+ of organic traffic
- 5+ blog posts ranking in top 10 for primary keywords

**Engagement:**
- Average time on blog: 3+ minutes
- Bounce rate: <60%
- Pages per session: 2.5+

**Conversions:**
- Demo bookings: 20+ per month from organic
- Newsletter signups: 100+ per month
- Email capture rate: 5%+ of blog visitors

### 90-Day Metrics

**Rankings:**
- 20+ keywords in top 10
- 50+ keywords in top 20
- Outranking Retarget IQ for 10+ target keywords

**Traffic Growth:**
- Month-over-month growth: 25%+
- Direct traffic increase (brand searches)
- Referral traffic from backlinks

**Business Impact:**
- Pipeline from organic: $100K+
- Cost per lead: <$50
- Blog-to-demo conversion: 2%+

---

## 🛠️ TOOLS & RESOURCES

### Required Tools
- Google Search Console
- Google Analytics 4
- Lighthouse CI
- Schema Markup Validator
- Screaming Frog (technical SEO)

### Recommended Tools
- Ahrefs/SEMrush (keyword tracking)
- Grammarly (copy editing)
- Hemingway Editor (readability)
- Canva (blog images)

### Documentation
- `.agents/skills/` → All 25 marketing skill frameworks
- `.agents/product-marketing-context.md` → Brand voice guide
- `.agents/MARKETING_MASTER_PLAN.md` → This document

---

## ✅ NEXT STEPS

1. ✅ Install all 25 marketing skills (DONE)
2. Create product-marketing-context.md
3. Audit all existing pages
4. Create blog infrastructure (templates, categories)
5. Start batch processing blogs (Batch 1: 20 posts)
6. Continue through all phases systematically

**Let's begin execution. Ready to proceed with Phase 0?**
