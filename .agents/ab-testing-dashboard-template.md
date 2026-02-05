# A/B Testing Dashboard & Tracker

**Last Updated**: 2026-02-04
**Owner**: Marketing Team

Use this template to track all A/B tests across the marketing site. Copy to Google Sheets or Notion for team collaboration.

---

## Active Tests

Track currently running tests:

| Test ID | Test Name | Page/Location | Status | Start Date | End Date | Sample Progress | Target Sample | Primary Metric | Current Lift | Est. Completion |
|---------|-----------|---------------|--------|------------|----------|-----------------|---------------|----------------|--------------|-----------------|
| homepage-hero-cta | Hero CTA Copy | Homepage | Running | 2026-02-10 | 2026-02-24 | 45% (1,350/3,000) | 3,000 | Demo booking rate | +12% (preliminary) | 2026-02-24 |
| pricing-page-structure | Pricing Tiers | Pricing Page | Planning | - | - | - | 1,500 | Contact rate | - | - |
| blog-cta-placement | Blog CTA Position | All blog posts | Queued | - | - | - | 6,000 | Blog→Demo rate | - | - |

**Legend**:
- **Status**: Planning | Queued | Running | Analyzing | Complete
- **Sample Progress**: Current visitors / Target visitors
- **Current Lift**: Preliminary results (don't make decisions until complete!)

---

## Test Queue (Prioritized Backlog)

Tests planned but not yet started:

| Priority | Test Name | Hypothesis | Page/Feature | Est. Impact | Est. Effort | Score | Assigned To | Target Launch |
|----------|-----------|------------|--------------|-------------|-------------|-------|-------------|---------------|
| 1 | Homepage Hero CTA | Specific CTA copy increases bookings by 20% | Homepage | High | Low | 9.5 | Marketing | 2026-02-10 |
| 2 | Pricing Page Structure | Simpler pricing reduces paralysis by 15% | Pricing | High | Medium | 8.5 | Marketing + Eng | 2026-03-01 |
| 3 | Blog CTA Placement | Multiple CTAs increase conversions by 25% | Blog | Medium | Low | 7.5 | Content | 2026-03-15 |
| 4 | Exit Intent Offer | Specific lead magnet converts 30% better | Site-wide | Medium | Medium | 7.0 | Marketing | 2026-04-01 |

**Scoring Formula**: `(Impact × 3) + (Confidence × 2) + (5 - Effort)`

**Impact**: 1-5 (revenue/conversion impact)
**Confidence**: 1-5 (based on data/research)
**Effort**: 1-5 (implementation complexity)

---

## Completed Tests

Results from past tests (keep for institutional knowledge):

| Test ID | Test Name | Dates | Variants | Winner | Lift | Significance | Sample Size | Decision | Key Learnings | Next Steps |
|---------|-----------|-------|----------|--------|------|--------------|-------------|----------|---------------|------------|
| exit-intent-v1 | Exit Popup Offer | 2026-01-15 to 2026-01-29 | A: Free trial<br>B: Free report<br>C: Case study | B | +22% | p=0.03 (sig) | 4,500 total | Implemented B | Specific offer (visitor report) beats generic trial | Test report content |
| nav-cta-color | Navigation CTA | 2026-01-05 to 2026-01-19 | A: Blue<br>B: Orange | A | +3% | p=0.45 (not sig) | 8,000 total | Keep control | Color change too small to detect | Test CTA copy instead |

---

## Test Results Template

Copy this template for each completed test:

### Test: [Test Name]

**Test ID**: [test-id]
**Dates**: [Start] - [End]
**Duration**: [X days]
**Result**: ✅ Winner / ❌ Loser / ⚠️ Inconclusive

#### Hypothesis

[Copy from test plan]

#### Variants

| Variant | Description | Sample | Conversions | Rate | vs. Control |
|---------|-------------|--------|-------------|------|-------------|
| Control | [Description] | 1,000 | 50 | 5.0% | - |
| Variant B | [Description] | 1,000 | 70 | 7.0% | +40% |
| Variant C | [Description] | 1,000 | 45 | 4.5% | -10% |

#### Statistical Analysis

- **Winner**: Variant B
- **Lift**: +40% (5.0% → 7.0%)
- **Significance**: p=0.02 (< 0.05, statistically significant)
- **Confidence Interval**: [5.8%, 8.2%]
- **Conclusion**: Variant B is a clear winner with 95% confidence

#### Secondary Metrics

| Metric | Control | Variant B | Change | Supports Winner? |
|--------|---------|-----------|--------|------------------|
| Time on page | 45s | 52s | +16% | ✅ Yes |
| Scroll depth | 60% | 68% | +13% | ✅ Yes |
| Bounce rate | 40% | 38% | -5% | ✅ Yes |

#### Guardrail Metrics

| Metric | Control | Variant B | Change | Concern? |
|--------|---------|-----------|--------|----------|
| Support tickets | 2/week | 2/week | 0% | ✅ No |
| Refund rate | 1% | 1% | 0% | ✅ No |

#### Segment Analysis

**Mobile vs. Desktop**:
- Mobile: +25% lift (p=0.04, significant)
- Desktop: +15% lift (p=0.08, not significant)
- Decision: Winner on mobile, neutral on desktop

**New vs. Returning**:
- New visitors: +30% lift (significant)
- Returning: +5% lift (not significant)
- Decision: Consider segmented rollout

**Traffic Source**:
- Organic: +20% lift
- Paid: +35% lift
- Direct: +10% lift

#### Decision

**Action**: ✅ Implement Variant B for all users

**Implementation Plan**:
1. Update homepage hero CTA copy to "See Cursive in Action"
2. Deploy to production by 2026-02-28
3. Remove test code after 1 week of monitoring
4. Update brand guidelines with new CTA language

**Timeline**: Deployed 2026-02-28

#### Key Learnings

1. **Specific CTAs outperform generic**: "See Cursive in Action" is more compelling than "Book a Demo"
2. **Mobile users more responsive**: Lift was strongest on mobile (25% vs 15%)
3. **New visitors need clarity**: New visitors converted better with specific CTA
4. **No negative impact**: No guardrail metrics worsened

#### What to Test Next

1. Test similar specific CTAs on pricing page
2. A/B test CTA button size (current may be too small on mobile)
3. Test adding urgency/scarcity to CTA ("See Demo - 5 Spots Left")

---

## Sample Size Calculator

Use this quick reference when planning tests:

### Baseline: 5% Conversion Rate

| Desired Lift | Sample/Variant | Total Sample | Days @ 500/day | Days @ 1,000/day |
|--------------|----------------|--------------|----------------|------------------|
| 10% (5% → 5.5%) | 7,200 | 14,400 | 29 days | 15 days |
| 20% (5% → 6%) | 1,800 | 3,600 | 8 days | 4 days |
| 30% (5% → 6.5%) | 800 | 1,600 | 4 days | 2 days |
| 50% (5% → 7.5%) | 310 | 620 | 2 days | 1 day |

### Baseline: 10% Conversion Rate

| Desired Lift | Sample/Variant | Total Sample | Days @ 500/day | Days @ 1,000/day |
|--------------|----------------|--------------|----------------|------------------|
| 10% (10% → 11%) | 3,400 | 6,800 | 14 days | 7 days |
| 20% (10% → 12%) | 870 | 1,740 | 4 days | 2 days |
| 30% (10% → 13%) | 390 | 780 | 2 days | 1 day |
| 50% (10% → 15%) | 150 | 300 | 1 day | <1 day |

**Calculator**: https://www.evanmiller.org/ab-testing/sample-size.html

---

## Hypothesis Bank

Ideas for future tests (not yet prioritized):

| ID | Page/Area | Observation | Hypothesis | Potential Impact | Data Source | Status |
|----|-----------|-------------|------------|------------------|-------------|--------|
| H1 | Homepage | Low scroll depth (avg 55%) | Shorter hero section will increase scroll depth by 20% | Medium | GA4 Analytics | Backlog |
| H2 | Pricing | High comparison clicks (40%) | Side-by-side plan comparison will reduce bounce rate by 15% | High | Hotjar Heatmaps | Backlog |
| H3 | Demo Form | 30% drop-off at email field | Social login option will increase form completion by 25% | High | Form Analytics | Backlog |
| H4 | Blog | 70% exit at conclusion | Related content links will increase pages/session by 30% | Medium | GA4 Behavior Flow | Backlog |
| H5 | Case Studies | Low engagement with text | Video case studies will increase demo booking rate by 20% | Medium | User Testing | Backlog |

**Data Sources**: GA4 Analytics, Hotjar, User Testing, Customer Feedback, Support Tickets, Sales Team Input

---

## Test Performance Metrics

Track overall testing program health:

### Monthly Stats

| Month | Tests Launched | Tests Completed | Win Rate | Avg Lift | Total Impact | Velocity |
|-------|----------------|-----------------|----------|----------|--------------|----------|
| Jan 2026 | 2 | 1 | 100% | +22% | +500 demos | Good |
| Feb 2026 | 3 | 2 | 50% | +15% | +300 demos | Good |
| Mar 2026 | - | - | - | - | - | - |

**Metrics Defined**:
- **Win Rate**: % of tests with statistically significant winner
- **Avg Lift**: Average improvement from winning tests
- **Total Impact**: Estimated business impact (demos, revenue, etc.)
- **Velocity**: # of tests completed per month

### Learnings by Category

| Category | # Tests | Win Rate | Avg Lift | Top Insight |
|----------|---------|----------|----------|-------------|
| CTA Copy | 2 | 100% | +20% | Specific beats generic |
| Pricing | 1 | 0% | - | Simplification unclear |
| Forms | 0 | - | - | - |
| Content | 1 | 100% | +25% | Multiple CTAs work |

---

## Pre-Launch Checklist

Copy this for every new test:

### Test: [Test Name]

- [ ] **Hypothesis documented** in test plan
- [ ] **Primary metric defined** and measurable in analytics
- [ ] **Sample size calculated** using calculator
- [ ] **Test duration estimated** (min 1 week, max 8 weeks)
- [ ] **Variants implemented** in code
- [ ] **QA completed** on all variants (mobile + desktop)
- [ ] **Analytics tracking verified** (test views and conversions)
- [ ] **Edge Config updated** with test configuration
- [ ] **Start/end dates set** in configuration
- [ ] **Stakeholders informed** of test launch
- [ ] **Calendar reminder** set for analysis date
- [ ] **Screenshots captured** of all variants
- [ ] **Control variant confirmed** working

---

## Post-Test Review Checklist

After test completes:

- [ ] **Sample size reached** (≥100% of target)
- [ ] **Statistical significance calculated** (p-value)
- [ ] **Confidence intervals checked** (no overlap = clear winner)
- [ ] **Secondary metrics reviewed** (support primary?)
- [ ] **Guardrail metrics checked** (nothing got worse?)
- [ ] **Segment analysis completed** (mobile, new vs returning, etc.)
- [ ] **Decision documented** (winner, loser, or inconclusive)
- [ ] **Learnings captured** (why did it work/not work?)
- [ ] **Next steps defined** (implement, retest, or move on)
- [ ] **Team informed** of results and decision
- [ ] **Test archived** in completed tests table

---

## Contacts & Resources

**Test Owners**:
- Marketing Team: marketing@cursive.com
- Engineering: eng@cursive.com
- Analytics: analytics@cursive.com

**Tools**:
- Vercel Edge Config: https://vercel.com/dashboard
- Google Analytics: https://analytics.google.com
- Test Tracker: [Link to Google Sheet]

**Documentation**:
- Full Framework: `/.agents/ab-testing-framework.md`
- Setup Guide: `/marketing/SETUP_AB_TESTING.md`
- Code Examples: `/marketing/app/examples/`

**External Resources**:
- Sample Size Calculator: https://www.evanmiller.org/ab-testing/sample-size.html
- A/B Test Guide: https://www.abtestguide.com/
- Statistical Significance: https://www.optimizely.com/optimization-glossary/statistical-significance/

---

## Notes & Best Practices

### Running Tests

1. **One test per page** - Don't run multiple tests on same page (creates interaction effects)
2. **Full weeks minimum** - Run at least 1 week to capture day-of-week variation
3. **Don't peek early** - Wait for sample size before analyzing (peeking problem)
4. **Document everything** - Capture screenshots, dates, external factors
5. **Share learnings** - Even losing tests teach us something valuable

### Common Mistakes to Avoid

- ❌ Stopping test early when you see significance
- ❌ Testing too small a change (undetectable)
- ❌ Changing variants mid-test
- ❌ Not checking guardrail metrics
- ❌ Ignoring segment differences
- ❌ Running tests longer than 8 weeks

### When to Stop a Test Early

**Only if**:
- Technical issue detected (tracking broken)
- Severe negative business impact
- External event invalidates test (major product change)

**Otherwise**: Let it run to completion!

---

**Last Updated**: 2026-02-04
**Next Review**: Quarterly (2026-05-01)
**Version**: 1.0
