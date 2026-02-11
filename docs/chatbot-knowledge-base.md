# Cursive Chatbot Knowledge Base

> This document is the source of truth for the Cursive website chatbot (Crisp). It covers product features, pricing, technical setup, and common questions. Keep answers friendly, concise, and helpful.

---

## Company Overview

**Cursive** turns anonymous website visitors into booked meetings. We identify up to 70% of your B2B website traffic, enrich visitor profiles with verified contact data, and help you reach out with AI-powered campaigns — all from one platform.

- **Website**: meetcursive.com
- **Platform**: leads.meetcursive.com
- **Support Email**: hello@meetcursive.com
- **Book a Demo**: https://cal.com/adamwolfe/cursive-ai-audit

---

## How It Works

### Step 1: Install Your Tracking Pixel
Add a small JavaScript snippet to your website (before the `</head>` tag). This identifies anonymous visitors in real-time using first-party data — no cookies required.

### Step 2: Set Your Targeting Preferences
Tell us what kind of leads you want: choose your target industries, geographic areas (state, city, or ZIP), and set daily/weekly/monthly lead caps.

### Step 3: Leads Appear Automatically
When a visitor matches your targeting criteria, they show up in your My Leads dashboard with verified contact information, company details, job title, and more.

### Step 4: Reach Out
Export leads to your CRM, get Slack notifications, trigger Zapier automations, or use our AI-powered email campaigns to book meetings.

---

## Pricing

### Free Plan — $0/month
- 100 free credits on signup
- 3 credits per day
- 1 active query
- Email delivery only
- Basic lead filters
- Community support

### Pro Plan — $50/month (or $40/month billed annually)
- 1,000 credits per day
- 5 active queries
- Multi-channel delivery (Email, Slack, Webhooks)
- CRM integrations
- Advanced filtering and AI lead scoring
- Campaign builder with AI copywriting
- API access
- Priority support
- 30-day money-back guarantee

### Credit Packages (one-time, never expire)

| Package | Credits | Price | Per Credit |
|---------|---------|-------|------------|
| Starter | 100 | $99 | $0.99 |
| Growth | 500 | $399 | $0.80 |
| Scale | 1,000 | $699 | $0.70 |
| Enterprise | 5,000 | $2,999 | $0.60 |

All payments processed securely through Stripe. 30-day money-back guarantee on all plans.

---

## Done-For-You Services

For teams that want hands-off lead generation, we offer managed service tiers:

### Cursive Data — $1,000/month
We deliver 500+ fresh, targeted leads every month.
- Custom lead lists built to your ICP
- Industry-specific targeting
- Verified contact data (email + phone)
- Weekly delivery

### Cursive Outbound — $2,500/month
Done-for-you email campaigns that book meetings.
- Everything in Cursive Data
- Campaign strategy and content creation
- AI-written personalized sequences
- Meeting booking on your calendar

### Cursive Pipeline — $5,000/month
Full-stack AI SDR automation.
- Everything in Cursive Outbound
- AI SDR agents running 24/7
- Multi-channel campaigns (email, LinkedIn, SMS)
- Dedicated success manager

### Venture Studio — $25k+/month
White-glove partnership. By application only.
- Dedicated team
- Custom integrations
- Revenue share options

To discuss services: https://cal.com/adamwolfe/cursive-ai-audit

---

## Features

### Visitor Identification
- Identifies up to 70% of anonymous B2B website visitors
- Real-time identification (not batch)
- No cookies or consent banners needed
- Matches against 220M+ consumer and 140M+ business profiles

### Lead Data
Every identified lead includes:
- Full name, email, phone number
- Job title and seniority
- Company name, industry, and size
- City, state, and ZIP code
- Intent score (Hot / Warm / Cold)
- Deliverability score
- Email verification status

### Targeting Preferences
Filter leads by:
- **Industry**: HVAC, Plumbing, Electrical, Roofing, Solar, Landscaping, Pest Control, Home Security, Insurance, Real Estate, Financial Services, Legal, Healthcare, Home Improvement, Auto Services, and more
- **Geography**: All 50 US states, city-level, ZIP code
- **Lead caps**: Daily, weekly, and monthly limits

### AI Studio
Brand-powered content and campaign generation:
- **Brand Extraction**: Enter any website URL and AI extracts colors, fonts, messaging, logos, and screenshots in under 90 seconds
- **Creative Generation**: AI generates on-brand ad creatives in multiple formats (Square, Story, Landscape)
- **Campaign Builder**: Launch Meta ad campaigns with guaranteed lead delivery (starting at $300 for 20 leads)

### Email Campaigns
- AI-generated email sequences trained on your brand voice
- Personalized outreach at scale
- Reply tracking and analytics
- Template library with proven sequences

### People Search
- Search our database of 220M+ profiles
- Filter by company, job title, seniority, department, location
- Reveal verified emails and phone numbers (costs credits)

### Queries
- Set up automated lead discovery queries
- Define your ideal customer profile (industry, keywords, company size, seniority)
- Queries run continuously and surface matching leads
- Free plan: 1 query | Pro plan: 5 queries

---

## Integrations

### Available Now (Pro Plan)

**Slack**
Get real-time lead notifications directly in your Slack channels. Set up in Settings > Integrations.

**Zapier**
Connect Cursive to 5,000+ apps. Trigger workflows when new leads arrive. Export to Google Sheets, CRMs, email tools, and more.

**Custom Webhooks**
Send lead data to any endpoint via HTTP POST.
- Events: lead.created, lead.updated, lead.exported, lead.scored
- HMAC-SHA256 signature verification
- Test endpoint before going live

**API Access**
REST API for programmatic access. Generate API keys in Settings > Integrations.

### Coming Soon
- Salesforce
- HubSpot
- Pipedrive
- Google Sheets (native)
- Microsoft Teams
- Discord

---

## Pixel Installation

### How to Install
1. Go to **Settings > Pixel** in your dashboard
2. Enter your website URL and click "Create Pixel"
3. You'll receive a JavaScript snippet or install guide link
4. Add the snippet before the `</head>` tag on every page of your website
5. Leads start appearing within minutes

### Where to Add the Pixel
- **WordPress**: Use a plugin like "Insert Headers and Footers" or add to your theme's header.php
- **Shopify**: Go to Online Store > Themes > Edit Code > theme.liquid, paste before `</head>`
- **Squarespace**: Go to Settings > Advanced > Code Injection > Header
- **Wix**: Go to Settings > Custom Code > Head
- **Next.js / React**: Add to your root layout or `_document.tsx` head
- **HTML**: Paste directly in your `<head>` section

### Troubleshooting
- **Pixel not tracking**: Make sure the snippet is on every page, not just the homepage
- **No leads appearing**: Check that your targeting preferences are set (Settings > Preferences)
- **Events count shows 0**: It may take a few minutes for the first events to register. Verify the snippet is loading by checking your browser's Network tab for requests to audiencelab

---

## Account & Billing

### Signing Up
1. Visit leads.meetcursive.com/welcome
2. Choose Business or Partner
3. Answer 3 quick questions about your needs
4. Create an account with email/password or Google sign-in
5. You'll get 100 free credits immediately

### Managing Your Subscription
Go to **Settings > Billing** to:
- View your current plan
- See credit balance
- Purchase credit packages
- Upgrade to Pro

### Refund Policy
All plans come with a 30-day money-back guarantee. Contact hello@meetcursive.com for refund requests.

### Cancellation
You can cancel your Pro subscription at any time from Settings > Billing. Your access continues until the end of your billing period. Unused credits never expire.

---

## My Leads

### Viewing Leads
Go to **My Leads** from the sidebar. You'll see all leads assigned to you based on your targeting preferences.

### Lead Statuses
- **New**: Just assigned, not yet contacted
- **Contacted**: You've reached out
- **Qualified**: Confirmed as a good fit
- **Converted**: Became a customer
- **Lost**: Not a fit or unresponsive

### Lead Details
Click any lead to see the full profile:
- Contact information (name, email, phone)
- Company details (name, industry, size, location)
- Intent score and verification status
- Timeline of website visits

### Exporting Leads
Use the Export button to download leads as CSV. Available on the My Leads and Data pages.

---

## Common Questions

### General

**Q: What does Cursive do?**
A: Cursive identifies anonymous visitors on your website and turns them into actionable leads with verified contact information. We show you who's visiting your site, what they're interested in, and give you the tools to reach out.

**Q: How is this different from Google Analytics?**
A: Google Analytics shows you aggregate traffic data (page views, sessions). Cursive shows you the actual people and companies visiting — with names, emails, phone numbers, and company details.

**Q: Is this legal / GDPR compliant?**
A: Yes. Cursive uses first-party data collection and complies with applicable privacy regulations. We identify visitors using publicly available business data matched against browsing patterns — no personal cookies or tracking across sites.

**Q: What kind of businesses benefit most from Cursive?**
A: Any B2B company with website traffic. Our most successful customers are SaaS companies, agencies, professional services firms, and home services companies (HVAC, roofing, solar, etc.).

### Pricing & Credits

**Q: How do credits work?**
A: Credits are used when leads are delivered to you or when you reveal contact information in People Search. One credit = one lead or one contact reveal. Free plan gets 3 credits/day, Pro gets 1,000/day. You can also buy credit packages that never expire.

**Q: Do credits expire?**
A: Purchased credit packages never expire. Daily credits (from your plan) reset each day.

**Q: Can I try Cursive for free?**
A: Yes! Sign up and get 100 free credits immediately. The Free plan gives you 3 credits per day to keep testing.

**Q: What's the difference between Free and Pro?**
A: Free gives you basic access with 3 credits/day and 1 query. Pro unlocks 1,000 credits/day, 5 queries, Slack/Zapier/webhook integrations, API access, campaign builder, and priority support — for $50/month (or $40/month annually).

### Technical

**Q: How do I install the tracking pixel?**
A: Go to Settings > Pixel in your dashboard. Enter your website URL, and we'll generate a JavaScript snippet. Add it before `</head>` on your site. Works with WordPress, Shopify, Squarespace, Wix, and any custom site.

**Q: How long until I see leads?**
A: Leads start appearing within minutes of installing the pixel, as long as you have website traffic and targeting preferences configured.

**Q: Can I integrate with my CRM?**
A: Today, you can push leads to any system via Zapier or custom webhooks (Pro plan). Native Salesforce, HubSpot, and Pipedrive integrations are coming soon.

**Q: Do you have an API?**
A: Yes! Pro plan includes REST API access. Generate your API key in Settings > Integrations.

### Services

**Q: What's the difference between self-serve and done-for-you?**
A: Self-serve means you use the platform directly — install your pixel, set preferences, and manage leads yourself. Done-for-you means our team handles everything: we build your lead lists, write your campaigns, and book meetings on your calendar.

**Q: How do I get started with done-for-you services?**
A: Visit the Services page in your dashboard or book a call at https://cal.com/adamwolfe/cursive-ai-audit. We'll discuss your goals and recommend the right tier.

**Q: Can I upgrade from self-serve to done-for-you?**
A: Absolutely. Many customers start with self-serve to see results, then upgrade to done-for-you for scale. You can request services from any page in the dashboard.

### Support

**Q: How do I get help?**
A: You can chat with us right here! You can also email hello@meetcursive.com or book a call at https://cal.com/adamwolfe/cursive-ai-audit.

**Q: What are your support hours?**
A: We typically respond within a few hours during business hours (US Eastern). Pro plan customers get priority support.

**Q: I found a bug / something isn't working.**
A: Please describe the issue in this chat or email hello@meetcursive.com with details. Include screenshots if possible — we'll get it fixed ASAP.

---

## Chatbot Behavior Guidelines

### Tone
- Friendly, helpful, and professional
- Confident but not pushy
- Use simple language, avoid jargon
- Be concise — short answers first, offer to elaborate

### When to Escalate
- Billing disputes or refund requests → hello@meetcursive.com
- Technical issues beyond basic troubleshooting → hello@meetcursive.com
- Enterprise or custom pricing → https://cal.com/adamwolfe/cursive-ai-audit
- Partnership inquiries → hello@meetcursive.com

### Key CTAs (use when appropriate)
- **New visitor**: "Want to see who's visiting your website? Sign up free at leads.meetcursive.com/welcome"
- **Interested in services**: "Book a free strategy call: https://cal.com/adamwolfe/cursive-ai-audit"
- **Ready to buy**: "Get started with 100 free credits: leads.meetcursive.com/welcome"
- **Needs help**: "Email us at hello@meetcursive.com and we'll get back to you within a few hours"

### Topics to Avoid
- Internal architecture or technical stack details
- Specific database schema or API implementation
- Competitor bashing (focus on Cursive's strengths)
- Making promises about features marked "Coming Soon" — say "we're working on it" instead
- Sharing internal pricing margins or costs
