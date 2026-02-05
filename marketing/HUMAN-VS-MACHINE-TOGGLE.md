# Human vs Machine Toggle Implementation Guide

## Overview

The Human vs Machine toggle is now implemented across the marketing site, optimizing for both SEO (human visitors) and AEO (AI engines). This follows the Searchable.com approach.

## What Was Implemented

### 1. Core Infrastructure

**Files Created:**
- `lib/view-context.tsx` - React Context for managing view state globally
- `components/view-toggle.tsx` - Toggle button component (in footer)
- `components/view-wrapper.tsx` - Wrapper components for conditional rendering
- `components/client-layout.tsx` - Client wrapper for ViewProvider
- `components/human-home-page.tsx` - Human view of homepage

**Files Modified:**
- `app/layout.tsx` - Added ViewProvider and Google Analytics
- `app/page.tsx` - Updated to support both views
- `components/footer.tsx` - Added ViewToggle button

### 2. Features

✅ **View Switching** - Toggle between Human and Machine views
✅ **URL Persistence** - View saved in URL params (`?view=machine` or `?view=human`)
✅ **LocalStorage** - Preference persists across sessions
✅ **Server-Side Rendering** - Both views render server-side for SEO/AEO
✅ **Google Analytics** - GTM tracking on all pages (G-JZ9C4QKCX4)
✅ **Smooth Animations** - Framer Motion on toggle transitions

### 3. Toggle Location

The toggle button is in the **footer** (bottom-left, under brand section), just like Searchable's implementation:

```tsx
<ViewToggle />
```

Styled as a dark pill with HUMAN/MACHINE options.

## How to Use

### Basic Page Structure

```tsx
import { HumanView, MachineView, MachineContent, MachineSection, MachineLink, MachineList } from '@/components/view-wrapper'

export default function MyPage() {
  return (
    <>
      {/* Human View - Beautiful Design */}
      <HumanView>
        <section className="pt-24 pb-20 bg-white">
          <h1>Beautiful Heading</h1>
          <p>Rich visual design with animations...</p>
          <Button>Call to Action</Button>
        </section>
      </HumanView>

      {/* Machine View - Clean Markdown */}
      <MachineView>
        <MachineContent>
          <h1 className="text-2xl text-white mb-8"># PAGE TITLE</h1>

          <MachineSection title="Overview">
            <p className="mb-4">
              Brief description of what this page covers.
            </p>

            <MachineList items={[
              'Key point 1',
              'Key point 2',
              'Key point 3',
            ]} />
          </MachineSection>

          <MachineSection title="Products">
            <MachineList items={[
              {
                label: 'Product Name',
                href: '/product-url',
                description: 'What this product does'
              },
            ]} />
          </MachineSection>

          <div className="border-t border-gray-800 pt-8 mt-8">
            <p>
              <MachineLink href="/contact">Contact Us</MachineLink>
            </p>
          </div>
        </MachineContent>
      </MachineView>
    </>
  )
}
```

### Helper Components

#### `<HumanView>`
Renders children only when view is 'human'. Use for your beautiful design.

#### `<MachineView>`
Renders children only when view is 'machine'. Applies dark background and monospace font.

#### `<MachineContent>`
Container for machine view content (max-width, padding).

#### `<MachineSection title="...">`
Creates a section with `## Title` heading and spacing.

#### `<MachineLink href="...">`
Formats links as `[Text](url)` style.

#### `<MachineList items={[...]}`
Renders bullet point lists. Can be:
- Simple strings: `['Item 1', 'Item 2']`
- Objects with links: `[{ label: 'Text', href: '/url', description: 'Info' }]`

## Machine View Design Guidelines

### Structure
- Use `##` for section headers
- Use `###` for subsections
- Use bullet points (`•`) for lists
- Show all URLs in `[text](url)` format
- Keep paragraphs short (2-3 sentences max)

### Typography
- Monospace font (automatically applied)
- Black background (#000)
- Gray text (#9CA3AF)
- White headings
- No decorative elements

### Content Strategy
1. **Front-load key information** - Most important content first
2. **Clear hierarchy** - Use heading levels consistently
3. **Descriptive links** - "Book a Demo" not "Click here"
4. **Structured data** - Use lists and sections liberally
5. **Mirror llms.txt** - Machine view should match your llms.txt content

## SEO & AEO Best Practices

### ✅ DO:
- Same content in both views (just different presentation)
- Server-side render both views
- Use semantic HTML in machine view
- Include all important links in machine view
- Keep machine view text-focused
- Use descriptive anchor text
- Add breadcrumbs and navigation
- Include FAQ sections

### ❌ DON'T:
- Hide machine view from bots (cloaking = penalty)
- Use different content between views
- Keyword stuff machine view
- Forget mobile responsiveness
- Skip internal linking
- Use generic link text ("click here")
- Over-complicate machine view

## Google Analytics Setup

The site now has Google Analytics 4 tracking on all pages:

**Measurement ID:** `G-JZ9C4QKCX4`

Tracking is loaded with `afterInteractive` strategy for optimal performance.

## Pages Status

### ✅ Implemented:
- Homepage (`/`)

### 🔄 To Implement:
- `/pricing`
- `/platform`
- `/services`
- `/visitor-identification`
- `/audience-builder`
- `/direct-mail`
- `/intent-audiences`
- `/clean-room`
- `/data-access`
- `/integrations`
- All industry pages (`/industries/*`)
- All blog posts (`/blog/*`)
- `/about`
- `/resources`
- `/contact`
- `/faq`

## Implementation Checklist for New Pages

- [ ] Wrap existing design in `<HumanView>`
- [ ] Create `<MachineView>` section
- [ ] Add page title with `#` heading
- [ ] Add overview section
- [ ] List products/features with links
- [ ] Add key sections with `<MachineSection>`
- [ ] Include contact/CTA links at bottom
- [ ] Test view toggle works
- [ ] Verify both views render server-side
- [ ] Check URLs appear in `[text](url)` format
- [ ] Validate content matches llms.txt structure

## Testing

### Manual Testing:
1. Visit any page with toggle implemented
2. Scroll to footer
3. Click "MACHINE" button
4. Verify content changes to markdown style
5. Check URL has `?view=machine` param
6. Refresh page - view should persist
7. Click "HUMAN" - should return to normal design
8. Check localStorage has preference saved

### SEO Testing:
- Both views appear in page source (View Source in browser)
- No cloaking (same content, different styling)
- Links are crawlable in both views
- Semantic HTML in both views

## Performance

- **No client-side overhead** - Both views render server-side
- **Fast switching** - View toggle uses local state
- **Optimized bundles** - Code splitting per view
- **Lazy loading** - Heavy components load only when needed

## Next Steps

1. **Implement on all pages** - Roll out to remaining pages systematically
2. **Monitor in Search Console** - Track how Google indexes both views
3. **A/B test** - Compare SEO performance before/after
4. **Update llms.txt** - Keep synchronized with machine views
5. **Track in Searchable** - Use their analytics to optimize AEO
6. **Schema markup** - Add structured data to complement machine view
7. **Internal linking** - Ensure machine view has comprehensive links

## Resources

- Next.js Docs: https://nextjs.org/docs
- Google Search Console: https://search.google.com/search-console
- Searchable Analytics: https://searchable.com
- llms.txt Spec: https://llmstxt.org

---

**Last Updated:** 2026-02-04
**Status:** Phase 1 Complete (Homepage implemented)
**Next:** Roll out to all pages systematically
