# Internal Linking Guidelines - Cursive Marketing Site

**Last Updated**: 2026-02-04
**Purpose**: Standards and best practices for internal linking across all marketing content
**Audience**: Content writers, SEO specialists, marketing team

---

## Table of Contents

1. [Overview](#overview)
2. [Strategic Principles](#strategic-principles)
3. [Hub & Spoke Architecture](#hub--spoke-architecture)
4. [Anchor Text Guidelines](#anchor-text-guidelines)
5. [Link Placement Rules](#link-placement-rules)
6. [Content Type Guidelines](#content-type-guidelines)
7. [Technical Implementation](#technical-implementation)
8. [Quality Standards](#quality-standards)
9. [Common Mistakes to Avoid](#common-mistakes-to-avoid)
10. [Examples & Templates](#examples--templates)

---

## Overview

### Purpose of Internal Linking

Internal links serve multiple critical functions:

1. **SEO Benefits**
   - Distribute page authority across the site
   - Help search engines discover and index content
   - Establish topical relevance and content hierarchy
   - Improve keyword rankings through contextual linking

2. **User Experience**
   - Guide visitors through logical content paths
   - Provide related resources and deeper learning
   - Reduce bounce rate by offering relevant next steps
   - Support various stages of the buyer journey

3. **Conversion Optimization**
   - Direct traffic from educational to conversion pages
   - Create multiple touchpoints before conversion
   - Warm up prospects with progressive content
   - Provide clear paths to demos, pricing, and platform pages

### Core Philosophy

**Quality Over Quantity**: Every internal link should provide genuine value to the reader. Links exist to help users discover relevant content, not just to manipulate search rankings.

**Natural Integration**: Links should feel like a natural part of the content flow, not forced or disruptive.

**Strategic Intent**: Every link serves a strategic purpose—whether that's SEO, user guidance, or conversion optimization.

---

## Strategic Principles

### Principle 1: Contextual Relevance

**Links must be contextually relevant to both the source and destination page.**

✅ **Good Example**:
In a blog about visitor tracking, linking to "converting anonymous visitors" makes perfect sense—it's the logical next step.

❌ **Bad Example**:
In a blog about visitor tracking, linking to "email marketing compliance" is off-topic and confusing.

### Principle 2: Value-Add Linking

**Every link should add value to the reader's experience.**

Ask yourself: "Would I genuinely recommend this resource to someone reading this section?"

✅ **Good**: Linking to a detailed guide that expands on a concept mentioned briefly
❌ **Bad**: Linking to loosely related content just to hit a link quota

### Principle 3: Strategic Link Equity

**Link from high-authority pages to pages you want to rank.**

- Homepage should link to all solution hubs (Tier 1)
- Popular blog posts should link to newer or underperforming content
- Evergreen content should link to time-sensitive campaigns
- High-traffic pages should link to conversion pages

### Principle 4: User Journey Alignment

**Links should guide users through logical buyer journey stages.**

**Awareness Stage**: Link between educational blog posts
**Consideration Stage**: Link from blogs to solution pages
**Decision Stage**: Link from solution pages to pricing, demos, platform

### Principle 5: Topical Clustering

**Create clear content clusters around core topics.**

Example cluster for Visitor Identification:
- Hub: `/visitor-identification` (solution page)
- Spokes: 12 blog posts about visitor tracking, identity resolution, analytics
- All spokes link back to hub; hub links to all spokes

---

## Hub & Spoke Architecture

### Three-Tier Model

```
TIER 1: Solution Hubs (5 pages)
    ↓
TIER 2: Blog Categories (7 categories)
    ↓
TIER 3: Individual Blog Posts (52 posts)
```

### Tier 1: Solution Hubs

**Pages**:
- `/visitor-identification`
- `/audience-builder`
- `/direct-mail`
- `/intent-audiences`
- `/integrations` (special hub)

**Linking Rules**:
- Each hub links to 4-12 related blog posts
- Each hub receives links from all its related blogs
- Hubs link to each other where relevant
- Hubs link to `/platform` and `/pricing` in CTAs

**Example Structure for /visitor-identification**:

```
[Hero Section]
  → "Learn more about [website visitor tracking]" → Blog Post 22

[How It Works Section]
  → "Read our guide to [visitor identity resolution]" → Blog Post 01

[Benefits Section]
  → "Discover strategies for [converting anonymous visitors]" → Blog Post 25

[Features Section]
  → "Explore [visitor engagement scoring methods]" → Related Blog
  → "See how [real-time data enrichment] works" → Related Blog

[Use Cases Section]
  → "Learn about [B2B lead generation strategies]" → Related Blog

[CTA Section]
  → "Explore Cursive's Platform" → /platform
  → "View Pricing" → /pricing
```

### Tier 2: Blog Categories

**Categories**:
- `/blog/visitor-tracking/`
- `/blog/audience-targeting/`
- `/blog/lead-generation/`
- `/blog/data-platforms/`
- `/blog/direct-mail/`
- `/blog/retargeting/`
- `/blog/analytics/`

**Category Page Linking Rules**:
- Link to primary solution hub (e.g., visitor-tracking → visitor-identification)
- Link to 3-5 featured posts in category
- Link to related categories
- Include CTA to solution hub or platform

### Tier 3: Individual Blog Posts

**Required Links in Every Blog Post**:
1. **1 Solution Hub Link** (in first 500 words)
2. **2-3 Related Blog Links** (throughout post)
3. **1 Bottom-Funnel Link** (in conclusion)
4. **1 Integrations Link** (mid-post)

**Optional Additional Links**:
- Related category page
- Related solution pages (if relevant to multiple)
- Glossary or resource pages
- Case studies (when available)

---

## Anchor Text Guidelines

### Anchor Text Principles

**1. Descriptive & Keyword-Rich**

Use anchor text that describes what the linked page is about.

✅ **Good**:
- "website visitor tracking for lead generation"
- "behavioral audience segmentation strategies"
- "direct mail automation platform"

❌ **Bad**:
- "click here"
- "read more"
- "this article"

**2. Natural & Contextual**

Anchor text should fit naturally into the sentence.

✅ **Good**:
"Cursive's [visitor identification platform] reveals up to 70% of anonymous traffic."

❌ **Bad**:
"Cursive has a visitor identification platform that you can [click here to learn more about]."

**3. Varied & Diverse**

Don't use the same anchor text for every link to a page.

**For /visitor-identification**, vary between:
- "visitor identification platform"
- "Cursive's visitor tracking solution"
- "how visitor identification works"
- "visitor ID technology"
- "anonymous visitor identification"

**4. Appropriate Length**

**Ideal**: 2-5 words
**Maximum**: 8 words
**Minimum**: 2 words

✅ **Good**: "behavioral audience segmentation" (3 words)
❌ **Too Long**: "comprehensive guide to behavioral audience segmentation strategies for B2B marketers" (11 words)
❌ **Too Short**: "here" (1 word)

### Anchor Text Formula by Link Type

**Solution Hub Links**:
```
[Product/Feature Name] + [Primary Benefit/Function]

Examples:
- "visitor identification platform"
- "audience builder for B2B marketers"
- "direct mail automation solution"
```

**Blog-to-Blog Links**:
```
[Action/Question] + [Topic]

Examples:
- "converting anonymous visitors"
- "behavioral segmentation strategies"
- "improving CRM integration workflows"
```

**Bottom-Funnel Links**:
```
[Action Verb] + [Destination]

Examples:
- "explore Cursive's platform"
- "view pricing plans"
- "book a demo"
- "schedule a walkthrough"
```

**Integrations Links**:
```
[Number/Scope] + "integrations"

Examples:
- "200+ native integrations"
- "integrates with your existing tools"
- "CRM and marketing integrations"
```

### Anchor Text Best Practices

**DO**:
- Include primary target keyword when natural
- Use variations to avoid over-optimization
- Match anchor text to linked page's H1 or title (loosely)
- Use action-oriented language for CTAs
- Include brand name (Cursive) when appropriate

**DON'T**:
- Keyword stuff anchor text
- Use exact-match keywords for every link to a page
- Use generic "click here" or "read more"
- Make anchor text all caps or overly promotional
- Use misleading anchor text (promise one thing, link to another)

### Anchor Text Examples by Category

**Visitor Tracking Content**:
- "website visitor identification"
- "anonymous visitor tracking"
- "visitor behavior analysis"
- "real-time visitor data"
- "tracking return visitors"

**Audience Building Content**:
- "audience building platform"
- "behavioral audience segmentation"
- "firmographic targeting strategies"
- "creating lookalike audiences"
- "intent-based audience targeting"

**Lead Generation Content**:
- "B2B lead generation software"
- "sales prospecting automation"
- "lead qualification strategies"
- "outbound lead generation tactics"
- "account-based marketing lists"

**Data Platform Content**:
- "customer data platform"
- "B2B data platform comparison"
- "real-time data enrichment"
- "marketing data platforms"
- "business contact databases"

**Direct Mail Content**:
- "direct mail automation"
- "postcard retargeting campaigns"
- "offline marketing integration"
- "automated direct mail triggers"
- "direct mail ROI tracking"

---

## Link Placement Rules

### Placement by Content Section

**1. Introduction (First 500 Words)**

**Required**: 1 solution hub link

**Best Practices**:
- Place after introducing the problem or topic (paragraphs 2-4)
- Use natural transition: "Tools like Cursive's [visitor identification platform]..."
- Don't link in the very first sentence (let readers settle in)

**Example**:
```
Most website visitors leave without a trace. Without tracking, you
have no idea who was interested or when to follow up. This is where
Cursive's [visitor identification platform] becomes invaluable—it
reveals up to 70% of anonymous traffic, giving you actionable data
to guide your outreach.
```

**2. Body/Mid-Section (500-1500 Words)**

**Required**: 2-3 related blog links + 1 integrations link

**Best Practices**:
- Place blog links where you reference related concepts
- Space links out (minimum 200 words between links)
- Use integrations link when discussing features or technical capabilities
- Don't cluster all links in one paragraph

**Example**:
```
When you can see which companies viewed your pricing page, you can
prioritize outreach to warm leads. This is especially powerful when
combined with [behavioral audience segmentation], allowing you to
create custom follow-up sequences based on visitor actions.

Cursive integrates with [200+ marketing and sales tools](/integrations),
ensuring your visitor data flows seamlessly into your existing CRM,
email platform, and advertising accounts.

For teams looking to automate their outreach, combining visitor
identification with [sales prospecting automation] creates a
hands-free lead generation engine that works 24/7.
```

**3. Conclusion (Last 200 Words)**

**Required**: 1 bottom-funnel link (CTA)

**Best Practices**:
- Make it a clear call-to-action
- Use action-oriented anchor text
- Provide compelling reason to click
- Don't dilute with multiple competing CTAs

**Example**:
```
Ready to identify 70% of your anonymous website visitors?
[Explore Cursive's platform](/platform) to see how visitor
identification, audience building, and multi-channel activation
work together to turn quiet visits into qualified leads.
```

### Link Density Guidelines

**Optimal Link Density**: 1-2% of total word count

For a 1,500-word blog post:
- **Ideal**: 6-8 internal links (0.4-0.5%)
- **Minimum**: 5 internal links
- **Maximum**: 10 internal links

**Too Few Links**: Missed opportunity for SEO and user navigation
**Too Many Links**: Overwhelming, dilutes link equity, looks spammy

### Visual Placement Best Practices

**DO**:
- Place links where readers naturally seek more information
- Link from specific details to comprehensive guides
- Place CTA links after building value/urgency
- Use links to support claims (link to data/proof)

**DON'T**:
- Place all links in first paragraph
- Cluster multiple links in one sentence
- Link in headers/titles (link in body below instead)
- Place links in middle of key takeaways (before or after)

---

## Content Type Guidelines

### Blog Post Internal Linking

**Standard Blog Post Structure**:

```markdown
# [Blog Title]

[Introduction - 200 words]
  → No links (let readers settle in)

[Problem/Context Section - 300 words]
  → 1 solution hub link (paragraph 3-4)
  → Example: "This is where [visitor identification platforms] help..."

[Strategy/How-To Section - 500 words]
  → 2 related blog links
  → Example: "Combined with [behavioral segmentation]..."
  → Example: "Learn more about [prospecting automation]..."

[Implementation Section - 300 words]
  → 1 integrations link
  → Example: "Cursive [integrates with 200+ tools](/integrations)..."

[Conclusion - 200 words]
  → 1 bottom-funnel CTA link
  → Example: "[Explore Cursive's platform](/platform) today."

[FAQ Section]
  → Optional: 1-2 additional contextual links in answers
```

**Total Links**: 5-7 (optimal for 1,500-word post)

### Solution Page Internal Linking

**Standard Solution Page Structure**:

```markdown
# [Solution Name] (e.g., Visitor Identification)

[Hero Section]
  → 1 featured blog link (most popular/relevant)

[How It Works Section]
  → 1-2 technical deep-dive blog links

[Benefits Section]
  → 2-3 benefit/strategy blog links

[Features Section]
  → 2-3 feature-specific blog links

[Use Cases Section]
  → 2-3 industry/use-case blog links

[Integrations Section]
  → 1 link to /integrations page

[FAQ Section]
  → 1-2 contextual blog links in answers

[CTA Section]
  → Links to /platform, /pricing, demo booking
```

**Total Links**: 12-15 (optimal for comprehensive solution page)

### Homepage Internal Linking

**Strategic Priorities**:
1. Link to all 5 solution hubs (primary navigation)
2. Link to /platform and /pricing (main CTAs)
3. Link to 3-5 featured blog posts
4. Link to /integrations
5. Link to /about, /case-studies (trust builders)

**Maximum**: 20-25 internal links (excluding footer)

### Footer Internal Linking

**Standard Footer Structure**:

**Product**:
- Platform
- Visitor Identification
- Audience Builder
- Direct Mail
- Intent Audiences
- Integrations
- Pricing

**Company**:
- About
- Case Studies
- Blog
- Resources

**Legal**:
- Privacy Policy
- Terms of Service

**Note**: Footer links carry less SEO weight but are essential for navigation.

---

## Technical Implementation

### HTML/React Implementation

**Proper Link Syntax**:

```tsx
// ✅ Good (Next.js)
import Link from 'next/link'

<Link href="/visitor-identification">
  visitor identification platform
</Link>

// ✅ Good (Standard HTML)
<a href="/visitor-identification">
  visitor identification platform
</a>

// ❌ Bad (External link treatment)
<a href="/visitor-identification" target="_blank">
  visitor identification platform
</a>

// ❌ Bad (Nofollow for internal links)
<a href="/visitor-identification" rel="nofollow">
  visitor identification platform
</a>
```

### Link Attributes

**For Internal Links**:
- `href`: Relative URL (e.g., `/blog/visitor-tracking/...`)
- `target`: Not specified (open in same tab)
- `rel`: Not specified (dofollow by default)

**For External Links**:
- `href`: Full URL with HTTPS
- `target="_blank"` (open in new tab)
- `rel="noopener noreferrer"` (security)

### URL Structure

**Use Relative URLs**:
✅ `/visitor-identification`
✅ `/blog/visitor-tracking/website-visitor-identification`

**Don't Use Absolute URLs**:
❌ `https://meetcursive.com/visitor-identification`

**Benefits of Relative URLs**:
- Works in development and production
- Easier to maintain
- Faster page load (no DNS lookup)
- Better for site migrations

### Link Tracking

**GA4 Event Tracking** (Optional but Recommended):

```javascript
// Track internal link clicks
<Link
  href="/visitor-identification"
  onClick={() => {
    gtag('event', 'internal_link_click', {
      'link_text': 'visitor identification platform',
      'link_url': '/visitor-identification',
      'source_page': window.location.pathname,
      'link_position': 'intro_section'
    })
  }}
>
  visitor identification platform
</Link>
```

**Track**:
- Link text (anchor text)
- Link destination
- Source page
- Link position (intro, mid, conclusion)

### Accessibility

**Best Practices**:
- Use descriptive anchor text (benefits screen readers)
- Don't use "click here" (meaningless out of context)
- Ensure sufficient color contrast for links
- Underline or clearly distinguish links from body text

**Example**:
```tsx
// ✅ Good (descriptive)
<Link href="/visitor-identification">
  learn how visitor identification works
</Link>

// ❌ Bad (not descriptive)
<Link href="/visitor-identification">
  click here
</Link>
```

---

## Quality Standards

### Link Quality Checklist

Before adding any internal link, verify:

- [ ] **Relevance**: Is this link genuinely relevant to the current content?
- [ ] **Value**: Does this link provide value to the reader?
- [ ] **Accuracy**: Does the anchor text accurately describe the destination?
- [ ] **Functionality**: Does the link work (no 404s)?
- [ ] **Placement**: Is the link in a logical, natural position?
- [ ] **Anchor Text**: Is the anchor text descriptive and keyword-appropriate?
- [ ] **Diversity**: Am I varying anchor text for links to the same page?
- [ ] **Density**: Am I within the 5-10 links per post range?

### Pre-Publish Checklist

Before publishing any content with internal links:

- [ ] All required links included (hub, blogs, CTA, integrations)
- [ ] Links tested (click each one to verify)
- [ ] Anchor text reviewed for clarity and keywords
- [ ] Link density appropriate (not too few, not too many)
- [ ] Links distributed throughout content (not clustered)
- [ ] CTA link placed in conclusion with strong copy
- [ ] No broken links (404s)
- [ ] No external links treated as internal (or vice versa)

### Monthly Audit Process

**Week 1**:
- [ ] Crawl site for broken internal links (use Screaming Frog)
- [ ] Fix any 404s or redirects
- [ ] Document orphan pages (pages with 0 internal links)

**Week 2**:
- [ ] Review anchor text diversity (no over-optimization)
- [ ] Check link distribution (ensure equity spreading)
- [ ] Identify underlinked high-value pages

**Week 3**:
- [ ] Review new content for proper internal linking
- [ ] Update older content with links to new posts
- [ ] Refresh solution hub links with latest blogs

**Week 4**:
- [ ] Analyze internal link performance in GA4
- [ ] Identify top-performing links
- [ ] Adjust strategy based on data

---

## Common Mistakes to Avoid

### Mistake #1: Generic Anchor Text

❌ **Bad**:
"For more information, [click here](/)."

✅ **Good**:
"Learn more about [website visitor identification](/visitor-identification) and how it reveals anonymous traffic."

### Mistake #2: Over-Optimization

❌ **Bad** (same anchor text 5 times):
- "visitor identification platform"
- "visitor identification platform"
- "visitor identification platform"

✅ **Good** (varied):
- "visitor identification platform"
- "Cursive's visitor tracking solution"
- "how visitor identification works"

### Mistake #3: Too Many Links in One Paragraph

❌ **Bad**:
```
Cursive offers [visitor identification], [audience building],
[direct mail automation], and [intent data]—all integrated
with [200+ tools](/integrations) including [Salesforce],
[HubSpot], and [Google Ads].
```

✅ **Good**:
```
Cursive's [visitor identification platform] reveals anonymous
traffic, helping you identify prospects before they fill out
a form.

Once identified, use Cursive's audience builder to segment
and activate campaigns across email, ads, and direct mail.
The platform [integrates with 200+ tools](/integrations),
ensuring your data flows into your existing CRM and marketing stack.
```

### Mistake #4: Linking Too Early

❌ **Bad** (first sentence):
```
# Website Visitor Tracking Guide

[Website visitor tracking](/visitor-identification) helps
you identify anonymous traffic.
```

✅ **Good** (paragraph 3):
```
# Website Visitor Tracking Guide

Most people who visit your website leave without a trace.
They browse a few pages, check your pricing, then disappear.

Without tracking, you have no idea who was interested or
when to follow up. That's where [website visitor tracking]
(/visitor-identification) becomes invaluable—it reveals up
to 70% of anonymous visitors.
```

### Mistake #5: Broken Link Chains

❌ **Bad**:
- Blog A links to Blog B
- Blog B links to Blog C
- Blog C doesn't link anywhere

✅ **Good**:
- Blog A links to Blog B + Solution Hub
- Blog B links to Blog C + Solution Hub
- Blog C links to Blog A + Solution Hub + CTA page

**Every page should link deeper into the site.**

### Mistake #6: No Bottom-Funnel Links

❌ **Bad** (conclusion without CTA):
```
Website visitor tracking is essential for modern marketing.
Implement these strategies to improve your lead generation.
```

✅ **Good**:
```
Website visitor tracking is essential for modern marketing.
Ready to identify 70% of your anonymous visitors? [Explore
Cursive's platform](/platform) to see how visitor identification,
audience building, and automation work together.
```

### Mistake #7: Orphan Pages

**Orphan Page**: A page with zero internal links pointing to it.

**Problem**: Search engines may not discover it; users can't navigate to it.

**Solution**: Ensure every page has at least 3-5 internal links from other pages.

**Check for Orphans**:
```bash
# Use Screaming Frog or run:
# "Crawl" → "Internal" → Filter by "Inlinks = 0"
```

### Mistake #8: Ignoring Link Context

❌ **Bad** (irrelevant link):
```
Article about visitor tracking:
"Many companies struggle with lead generation. Check out our
[email compliance guide](/blog/email-compliance) for tips."
```

✅ **Good**:
```
Article about visitor tracking:
"Once you identify visitors, the next step is qualifying them.
Learn more about [lead qualification strategies](/blog/lead-qualification)."
```

---

## Examples & Templates

### Blog Post Internal Linking Template

```markdown
# [Blog Title: Question-Based or How-To]

**Meta Description**: [150-160 chars with primary keyword + CTA]

---

## Introduction (200 words)

[Introduce problem/topic. No links yet—let readers settle in.]

[Paragraph 2: Expand on problem]

[Paragraph 3: Introduce solution concept]

**First Internal Link** → Solution Hub Link:
"This is where tools like [solution name](solution-hub-url)
become invaluable—[specific benefit]."

---

## [Main Section 1: Strategy/How-To] (400 words)

[Explain core concept or strategy]

**Second Internal Link** → Related Blog #1:
"This approach works best when combined with [related strategy]
(blog-url-1), which allows you to..."

[Continue explanation]

**Third Internal Link** → Related Blog #2:
"For teams looking to [related goal], [related tactic](blog-url-2)
provides a complementary framework."

---

## [Main Section 2: Implementation] (400 words)

[Explain how to implement or technical details]

**Fourth Internal Link** → Integrations:
"Cursive [integrates with 200+ marketing and sales tools]
(/integrations), ensuring your data flows seamlessly into
your existing CRM, email platform, and advertising accounts."

[Continue with examples or case studies]

---

## [Main Section 3: Best Practices] (300 words)

[Share tips, common mistakes, optimization strategies]

**Fifth Internal Link (Optional)** → Related Blog #3:
"To avoid [specific pitfall], consider [related approach]
(blog-url-3) which addresses..."

---

## Conclusion (200 words)

[Summarize key takeaways]

[Build urgency or value for next step]

**Bottom-Funnel CTA Link**:
"Ready to [specific outcome]? [Action-oriented CTA](conversion-page-url)
to see how [product name] helps you [achieve result]."

---

## FAQ Section

### Question 1?
[Answer with optional contextual link if highly relevant]

### Question 2?
[Answer]

[Repeat for 5-8 questions]

---

**Total Internal Links**: 5-7
- 1 Solution Hub
- 2-3 Related Blogs
- 1 Integrations
- 1 Bottom-Funnel CTA
```

### Solution Hub Linking Template

```markdown
# [Solution Name] - [Primary Benefit]

**Hero Section**:
"[Value proposition in <20 words]"

**Featured Link**:
Learn more about [topic](featured-blog-url)

---

## How It Works

[3-4 step visual explanation]

**Step 1**: [Description]
**Step 2**: [Description]
  → Read our guide to [detailed topic](technical-blog-url)
**Step 3**: [Description]
**Step 4**: [Description]
  → Discover [related strategy](strategy-blog-url)

---

## Benefits

### Benefit 1: [Outcome]
[Explanation]
→ Learn how [related tactic](benefit-blog-1-url) amplifies this.

### Benefit 2: [Outcome]
[Explanation]
→ See examples of [use case](benefit-blog-2-url).

### Benefit 3: [Outcome]
[Explanation]

[Continue for 6-8 benefits]

---

## Features

### Feature 1: [Name]
[Description with screenshot/visual]

### Feature 2: [Name]
[Description]
→ Deep dive: [feature guide](feature-blog-url)

[Continue for all major features]

---

## Use Cases

### Use Case 1: [Industry/Scenario]
[Description]
→ Related reading: [industry blog](use-case-blog-1-url)

### Use Case 2: [Industry/Scenario]
[Description]
→ Learn more: [tactic blog](use-case-blog-2-url)

[Continue for 3-5 use cases]

---

## Integrations

[Description of integration capabilities]

→ View all [200+ integrations](/integrations)

---

## FAQ

[5-10 questions with optional contextual links in answers]

---

## CTA Section

**Ready to get started?**

[Explore Platform](/platform) | [View Pricing](/pricing) | [Book Demo](demo-url)

---

**Total Links**: 12-15
- 8-12 Blog Links (distributed across sections)
- 1 Integrations Link
- 3 Bottom-Funnel Links (platform, pricing, demo)
```

### Quick-Start Checklist for New Content

**When creating any new blog post or page**:

1. **Before Writing**:
   - [ ] Identify primary solution hub to link to
   - [ ] Find 2-3 related blogs for lateral links
   - [ ] Choose bottom-funnel destination (platform, pricing, or demo)
   - [ ] Review related content for anchor text ideas

2. **During Writing**:
   - [ ] Place solution hub link in first 500 words
   - [ ] Add related blog links throughout (2-3 total)
   - [ ] Include integrations link when discussing features
   - [ ] Add bottom-funnel CTA in conclusion

3. **After Writing**:
   - [ ] Test all links (click to verify)
   - [ ] Review anchor text for clarity and keywords
   - [ ] Count total links (5-10 range)
   - [ ] Check link distribution (not clustered)

4. **Before Publishing**:
   - [ ] Final link functionality check
   - [ ] Verify no broken links (404s)
   - [ ] Confirm anchor text varies (no over-optimization)
   - [ ] Update internal linking matrix spreadsheet

---

## Appendix: Anchor Text Library

### Solution Hub Pages

**For /visitor-identification**:
- visitor identification platform
- Cursive's visitor tracking solution
- how visitor identification works
- anonymous visitor identification
- website visitor tracking technology
- visitor ID platform
- real-time visitor identification

**For /audience-builder**:
- audience builder platform
- Cursive Audience Builder
- build targeted audiences
- audience building solution
- audience segmentation platform
- create custom audiences

**For /direct-mail**:
- direct mail automation platform
- Cursive's direct mail solution
- automated postcard campaigns
- direct mail retargeting
- offline marketing automation

**For /intent-audiences**:
- intent audiences platform
- Cursive's intent data
- pre-built intent segments
- buyer intent data
- purchase intent signals

**For /integrations**:
- 200+ native integrations
- integrates with your existing tools
- CRM and marketing integrations
- native tool integrations
- platform integrations

### Bottom-Funnel Pages

**For /platform**:
- explore Cursive's platform
- see Cursive in action
- discover how Cursive works
- view the platform
- see all features

**For /pricing**:
- view pricing plans
- see pricing options
- compare plans
- explore pricing
- check pricing details

**For demo booking**:
- book a demo
- schedule a walkthrough
- book a strategy call
- get a personalized demo
- schedule your demo

---

## Version History

**v1.0** - 2026-02-04: Initial guidelines created
**Status**: Active, reference for all internal linking work

---

## Questions or Feedback?

**Document Owner**: Marketing Team
**Review Cadence**: Quarterly
**Next Review**: 2026-05-01

For questions about these guidelines, contact the marketing team or SEO lead.
