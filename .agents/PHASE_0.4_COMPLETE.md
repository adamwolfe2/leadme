# Phase 0.4 Complete: Internal Linking Architecture

**Task**: Design internal linking architecture
**Status**: ✅ Complete
**Completed**: 2026-02-04
**Next Phase**: Phase 1 - Blog Infrastructure

---

## Deliverables Created

### 1. Internal Linking Matrix
**File**: `/Users/adamwolfe/.gemini/antigravity/playground/charged-pinwheel/lead-me-temp/.agents/internal-linking-matrix.md`

**Contents**:
- Complete hub & spoke architecture (3-tier model)
- Tier 1: 5 solution hub pages with outbound/inbound link specifications
- Tier 2: 7 blog category pages with linking rules
- Tier 3: 52 individual blog posts with specific link requirements
- Detailed linking matrix for all 52 blog posts (from/to pages, anchor text, context, priority)
- SEO impact analysis and expected results
- Tracking and measurement framework
- Implementation checklist

**Key Sections**:
- Architecture Overview (hub & spoke model)
- Solution Hub Internal Links (12-15 links per hub)
- Blog-to-Blog Lateral Links (category-specific clusters)
- Bottom-Funnel Conversion Links (rotation strategy)
- Internal Linking Rules & Guidelines
- Implementation Checklist
- Tracking & Measurement Plan

---

### 2. Internal Linking Guidelines
**File**: `/Users/adamwolfe/.gemini/antigravity/playground/charged-pinwheel/lead-me-temp/.agents/internal-linking-guidelines.md`

**Contents**:
- Strategic principles (contextual relevance, value-add, link equity, user journey)
- Hub & spoke architecture detailed explanation
- Anchor text guidelines (formulas, best practices, examples)
- Link placement rules (by content section, density guidelines)
- Content type guidelines (blogs, solution pages, homepage)
- Technical implementation (HTML/React, URL structure, tracking)
- Quality standards (checklists, audit process)
- Common mistakes to avoid (with examples)
- Templates for blog posts and solution pages

**Key Sections**:
- Overview & Philosophy
- Strategic Principles (5 core principles)
- Hub & Spoke Architecture (3-tier breakdown)
- Anchor Text Guidelines (formulas and best practices)
- Link Placement Rules (intro, body, conclusion)
- Content Type Guidelines (templates for each type)
- Technical Implementation (code examples)
- Quality Standards (pre-publish checklist)
- Common Mistakes (8 mistakes with fixes)
- Examples & Templates (ready-to-use)

---

### 3. Anchor Text Recommendations
**File**: `/Users/adamwolfe/.gemini/antigravity/playground/charged-pinwheel/lead-me-temp/.agents/anchor-text-recommendations.md`

**Contents**:
- Pre-approved anchor text variations for all internal links
- Solution hub anchors (20 variations per hub)
- Blog category anchors (15 variations per category)
- Bottom-funnel anchors (20 variations per destination)
- Product feature anchors (10 variations per feature)
- Topic-specific anchors (organized by theme)
- Contextual variations (by content placement)
- Usage guidelines (selection process, diversity formula)
- Anchor text audit checklist
- Quick reference: Top 20 anchors by destination

**Key Sections**:
- Anchor Text Principles (the 3 C's: Clear, Contextual, Concise)
- Solution Hub Anchors (5 hubs × 20 variations each)
- Blog Category Anchors (7 categories × 15 variations)
- Bottom-Funnel Anchors (platform, pricing, demo)
- Product Feature Anchors (5 features × 10 variations)
- Topic-Specific Anchors (lead gen, B2B, retargeting, data)
- Contextual Variations (introducing Cursive, comparisons, benefits)
- Usage Guidelines (selection process, diversity, brand inclusion)
- Anchor Text Audit Checklist (pre-publish and monthly)
- Quick Reference (top 20 per destination)

---

## Architecture Summary

### Hub & Spoke Model (3 Tiers)

**Tier 1: Solution Hubs (5 pages)**

1. **`/visitor-identification`**
   - Links to: 12 visitor-tracking blogs
   - Receives links from: All 12 visitor-tracking blogs
   - Purpose: Primary hub for visitor ID content cluster

2. **`/audience-builder`**
   - Links to: 10 audience-targeting blogs
   - Receives links from: All 10 audience-targeting blogs
   - Purpose: Primary hub for audience building content cluster

3. **`/direct-mail`**
   - Links to: 5 direct-mail blogs
   - Receives links from: All 5 direct-mail blogs
   - Purpose: Primary hub for direct mail content cluster

4. **`/intent-audiences`**
   - Links to: 4 intent-data blogs
   - Receives links from: All 4 intent-data blogs
   - Purpose: Primary hub for intent data content cluster

5. **`/integrations`**
   - Special hub: Linked FROM all 52 blogs (not TO blogs)
   - Purpose: Universal visibility across all content

**Tier 2: Blog Categories (7 categories)**

1. `/blog/visitor-tracking/` (12 posts)
2. `/blog/audience-targeting/` (10 posts)
3. `/blog/lead-generation/` (8 posts)
4. `/blog/data-platforms/` (9 posts)
5. `/blog/direct-mail/` (5 posts)
6. `/blog/retargeting/` (4 posts)
7. `/blog/analytics/` (4 posts)

**Tier 3: Individual Blog Posts (52 posts)**

Each blog post includes:
- **1 solution hub link** (primary, in first 500 words)
- **2-3 related blog links** (lateral, throughout post)
- **1 bottom-funnel link** (CTA, in conclusion)
- **1 integrations link** (feature mention, mid-post)
- **Total: 5-7 internal links per post**

---

## Linking Rules Summary

### Required Links Per Blog Post

**Minimum**: 5 internal links
**Recommended**: 6-8 internal links
**Maximum**: 10 internal links

**Breakdown**:
1. **1 Solution Hub Link** (required)
   - Placement: First 500 words
   - Anchor: Keyword-rich with brand (40% of time)
   - Example: "Cursive's [visitor identification platform]"

2. **2-3 Related Blog Links** (required)
   - Placement: Throughout body (mid-section)
   - Anchor: Topic-specific, natural
   - Example: "[behavioral audience segmentation]"

3. **1 Bottom-Funnel Link** (required)
   - Placement: Conclusion
   - Anchor: Action-oriented CTA
   - Example: "[Explore Cursive's platform](/platform)"
   - Rotation: Posts 1-17 → /platform, 18-34 → /pricing, 35-52 → demo

4. **1 Integrations Link** (required)
   - Placement: Mid-post (when discussing features)
   - Anchor: "200+ integrations" or variations
   - Example: "Cursive [integrates with 200+ tools](/integrations)"

5. **1-2 Additional Contextual Links** (optional)
   - Placement: Where natural
   - Purpose: Support claims, provide resources

---

## Anchor Text Strategy

### The 3 C's of Great Anchor Text

**1. Clear**: Describes what user will find
**2. Contextual**: Fits naturally in sentence flow
**3. Concise**: 2-6 words (ideal: 3-5)

### Formula by Link Type

**Solution Hub Links**:
```
[Brand/Descriptor] + [Product/Feature] + [Benefit/Type]

Examples:
- "Cursive's visitor identification platform"
- "audience builder for B2B marketers"
- "direct mail automation solution"
```

**Blog-to-Blog Links**:
```
[Action/Question] + [Topic]

Examples:
- "converting anonymous visitors"
- "behavioral segmentation strategies"
- "improving CRM workflows"
```

**Bottom-Funnel CTAs**:
```
[Action Verb] + [Destination]

Examples:
- "explore Cursive's platform"
- "view pricing plans"
- "book a demo"
```

### Diversity Requirements

**Never repeat the same anchor text for the same destination.**

**Target Diversity Score**: 0.7+ (70% unique anchors)
- For 10 links to /visitor-identification, use at least 7 different anchor texts

**Example Rotation**:
- Post 1: "visitor identification platform"
- Post 2: "Cursive's visitor tracking solution"
- Post 3: "identify anonymous website visitors"
- Post 4: "how visitor identification works"
- Post 5: "70% visitor identification rate"

---

## SEO Impact & Benefits

### Link Equity Distribution

**Solution Hubs** receive maximum authority:
- `/visitor-identification`: 12+ inbound links (strongest)
- `/audience-builder`: 10+ inbound links
- `/direct-mail`: 5+ inbound links
- `/intent-audiences`: 4+ inbound links
- `/integrations`: 52 inbound links (universal visibility)

**Blog Posts** benefit from lateral linking:
- Content clusters signal topical authority
- Related posts boost each other's rankings
- Fresh content links to evergreen content

**Bottom-Funnel Pages** receive consistent traffic:
- `/platform`: ~17 links from blogs
- `/pricing`: ~17 links from blogs
- Demo booking: ~18 links from blogs

### Crawlability & Indexation

**Benefits**:
- Every page reachable within 3 clicks of homepage
- Clear content hierarchy (hub → spoke → leaf)
- Reduced orphan page risk (all pages linked)
- Improved crawl efficiency (logical structure)

**Expected Results**:
- 100% of pages indexed
- Faster discovery of new content
- Better distribution of crawl budget
- Stronger topical clustering signals

### User Experience

**Navigation Benefits**:
- Visitors discover related content naturally
- Clear path from educational to conversion content
- Multiple touchpoints before conversion
- Logical buyer journey progression

**Engagement Metrics** (expected improvement):
- Pages per session: +30-50%
- Average session duration: +25-40%
- Bounce rate: -15-25%
- Return visitor rate: +20-30%

### Keyword Clustering

**Topical Authority Signals**:
- Internal links reinforce content relationships
- Keyword-rich anchors strengthen relevance
- Clear hierarchy establishes pillar content
- Semantic clustering improves rankings

**Expected Rankings Boost**:
- Solution hub pages: Target top 3 for primary keywords
- Blog posts: Target top 10 for long-tail keywords
- Category pages: Target top 5 for category keywords

---

## Implementation Plan

### Phase 1: Solution Hub Linking (Week 4, Days 1-2)

**Tasks**:
- [ ] Add outbound links to all 5 solution hub pages
- [ ] Link to 4-12 related blogs per hub (as specified in matrix)
- [ ] Ensure varied, descriptive anchor text
- [ ] Test all links (no 404s)

**Files to Update**:
- `/marketing/app/visitor-identification/page.tsx`
- `/marketing/app/audience-builder/page.tsx`
- `/marketing/app/direct-mail/page.tsx`
- `/marketing/app/intent-audiences/page.tsx`
- `/marketing/app/integrations/page.tsx`

**Timeline**: 2 days

---

### Phase 2: Blog Post Linking (Week 4, Days 3-5)

**Tasks**:
- [ ] Add required 5-7 internal links to each of 52 blog posts
- [ ] Ensure each has: 1 hub, 2-3 blogs, 1 CTA, 1 integrations
- [ ] Use varied anchor text (refer to anchor-text-recommendations.md)
- [ ] Place links in correct sections (intro, body, conclusion)
- [ ] Test all links

**Files to Update**:
- All 52 blog markdown files in `/marketing/app/blog/`

**Batch Approach**:
- Batch 1: Visitor tracking blogs (12 posts) - Day 3
- Batch 2: Audience targeting blogs (10 posts) - Day 4
- Batch 3: Lead gen + data platform blogs (17 posts) - Day 5
- Batch 4: Direct mail + retargeting + analytics (13 posts) - Day 5

**Timeline**: 3 days

---

### Phase 3: Category Page Linking (Week 5, Day 1)

**Tasks**:
- [ ] Create blog category pages (if not exist)
- [ ] Link to primary solution hub
- [ ] Link to 3-5 featured posts in category
- [ ] Link to related categories
- [ ] Add CTA to solution hub or platform

**Files to Create/Update**:
- `/marketing/app/blog/visitor-tracking/page.tsx`
- `/marketing/app/blog/audience-targeting/page.tsx`
- `/marketing/app/blog/lead-generation/page.tsx`
- `/marketing/app/blog/data-platforms/page.tsx`
- `/marketing/app/blog/direct-mail/page.tsx`
- `/marketing/app/blog/retargeting/page.tsx`
- `/marketing/app/blog/analytics/page.tsx`

**Timeline**: 1 day

---

### Phase 4: Quality Assurance (Week 5, Day 2)

**Tasks**:
- [ ] Crawl entire site for broken links (Screaming Frog)
- [ ] Fix any 404s or redirect chains
- [ ] Verify all required links present in blogs
- [ ] Check anchor text diversity (no over-optimization)
- [ ] Confirm link density (5-10 per post)
- [ ] Test navigation flow (homepage → hub → blog → CTA)
- [ ] Document any orphan pages

**Tools**:
- Screaming Frog SEO Spider
- Manual spot-checks
- Internal linking matrix (checklist)

**Timeline**: 1 day

---

## Tracking & Measurement

### GA4 Events to Track

**Internal Link Clicks**:
```javascript
gtag('event', 'internal_link_click', {
  'link_text': 'visitor identification platform',
  'link_url': '/visitor-identification',
  'source_page': '/blog/visitor-tracking/...',
  'link_position': 'intro|mid|conclusion'
})
```

**Metrics to Monitor**:
- Internal link CTR (by position, by anchor text)
- Pages per session (should increase)
- Average session duration (should increase)
- Bounce rate (should decrease)
- Conversion rate from blogs (should increase)

### SEO Metrics to Track

**Weekly**:
- Pages indexed (target: 100% of 52 blogs + hubs)
- Crawl errors (target: 0)

**Monthly**:
- Keyword rankings for hub pages (target: top 3)
- Keyword rankings for blog posts (target: top 10)
- Organic traffic to linked pages
- Internal link performance (which anchors/positions perform best)

**Quarterly**:
- Overall organic traffic growth
- Keyword rankings improvements
- Content cluster performance
- Link equity distribution analysis

---

## Maintenance Schedule

### Weekly
- [ ] Monitor new blog posts for proper linking
- [ ] Check for broken links (automated tool)
- [ ] Update matrix with new content

### Monthly
- [ ] Full internal link audit
- [ ] Anchor text diversity review
- [ ] Identify underlinked pages
- [ ] Update hub pages with latest blogs

### Quarterly
- [ ] Comprehensive site crawl
- [ ] Link equity analysis
- [ ] User flow analysis (GA4)
- [ ] Strategy refinement based on performance

---

## Key Files & References

### Primary Documentation

1. **Internal Linking Matrix**: `.agents/internal-linking-matrix.md`
   - Complete link specifications for all pages
   - From/to tables with anchor text, context, priority
   - Hub outbound/inbound link details

2. **Linking Guidelines**: `.agents/internal-linking-guidelines.md`
   - Strategic principles
   - Content type templates
   - Technical implementation
   - Quality checklists

3. **Anchor Text Recommendations**: `.agents/anchor-text-recommendations.md`
   - 100+ pre-approved anchor text variations
   - Usage guidelines
   - Diversity formulas
   - Tracking templates

### Reference Documents

- **Marketing Master Plan**: `.agents/MARKETING_MASTER_PLAN.md`
  - Phase 0.4 context
  - Overall marketing strategy

- **Product Marketing Context**: `.agents/product-marketing-context.md`
  - Brand voice guidelines
  - Messaging framework
  - Product positioning

- **SEO Audit Skill**: `.agents/skills/seo-audit/SKILL.md`
  - Internal linking best practices
  - SEO audit framework

- **Programmatic SEO Skill**: `.agents/skills/programmatic-seo/SKILL.md`
  - Hub & spoke model reference
  - Internal linking architecture

---

## Success Criteria

### Phase 0.4 Completion Checklist

- [x] Hub & spoke architecture designed (3-tier model)
- [x] Internal linking matrix created (52 blogs mapped)
- [x] Linking guidelines documented (templates + rules)
- [x] Anchor text recommendations compiled (100+ variations)
- [x] Implementation plan defined (4-phase approach)
- [x] Tracking framework established (GA4 + SEO metrics)
- [x] Maintenance schedule outlined (weekly/monthly/quarterly)

### Implementation Success Criteria (Next Phase)

- [ ] All 5 solution hubs link to specified blogs (4-12 each)
- [ ] All 52 blogs contain 5-7 internal links (as specified)
- [ ] All 7 category pages created with proper linking
- [ ] 0 broken links (404s)
- [ ] 0 orphan pages (all pages linked from somewhere)
- [ ] 100% of blogs indexed within 2 weeks
- [ ] Anchor text diversity score 0.7+ for all hubs
- [ ] Internal link CTR >1% (baseline)

---

## Next Steps

### Immediate (This Week)

1. **Review & Approve**
   - Review all 3 deliverables
   - Provide feedback or approve for implementation
   - Assign implementation to team members

2. **Prepare for Implementation**
   - Set up GA4 event tracking (if not already)
   - Install Screaming Frog or link checker tool
   - Create anchor text tracking spreadsheet (optional)

### Week 4 (Implementation)

1. **Days 1-2**: Implement solution hub linking
2. **Days 3-5**: Implement blog post linking (batched)
3. **Week 5, Day 1**: Create category pages with linking
4. **Week 5, Day 2**: QA and testing

### Week 5+ (Monitoring)

1. **Week 5-6**: Monitor indexation and rankings
2. **Week 6-8**: Analyze internal link performance
3. **Week 8**: First monthly audit
4. **Week 12**: First quarterly review and optimization

---

## Questions or Issues?

**Primary Contact**: Marketing Team / SEO Lead
**Documentation Owner**: Adam Wolfe
**Last Updated**: 2026-02-04
**Next Review**: 2026-05-01 (Quarterly)

For questions about:
- **Architecture**: Refer to `internal-linking-matrix.md`
- **Guidelines**: Refer to `internal-linking-guidelines.md`
- **Anchor Text**: Refer to `anchor-text-recommendations.md`
- **Implementation**: Contact project lead

---

## Summary

**Phase 0.4 - Internal Linking Architecture: COMPLETE ✅**

**Deliverables**:
1. Comprehensive internal linking matrix (52 blog posts mapped)
2. Detailed linking guidelines (templates, rules, examples)
3. Pre-approved anchor text library (100+ variations)

**Architecture**:
- 3-tier hub & spoke model
- 5 solution hubs with 4-12 blog links each
- 52 blog posts with 5-7 internal links each
- Clear topical clustering and content hierarchy

**Expected Impact**:
- Improved SEO rankings (hub pages → top 3, blogs → top 10)
- Better user engagement (+30-50% pages/session)
- Higher conversion rates (clear path to CTAs)
- Stronger topical authority (content clusters)

**Next Phase**: Phase 1 - Blog Infrastructure (Week 1, Days 3-5)

Ready for implementation. 🚀
