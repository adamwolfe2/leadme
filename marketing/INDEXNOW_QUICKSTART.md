# IndexNow Quick Start Guide

## What is IndexNow?

IndexNow accelerates search engine indexing by instantly notifying Google, Bing, and other search engines when you publish or update content.

**Result**: Your new pages get indexed in hours instead of days or weeks.

## How It Works

1. After each `npm run build`, the postbuild script automatically runs
2. The script submits all 93 unique URLs from your sitemap to IndexNow API
3. Search engines receive the notification and prioritize crawling those pages
4. Your content appears in search results faster

## Files Created

```
marketing/
├── lib/
│   └── indexnow.ts              # Core IndexNow library
├── scripts/
│   ├── notify-indexnow.js       # Post-build notification script
│   └── test-indexnow.js         # Test script (no API calls)
├── public/
│   └── 7c33bde0a15b132aa38f5bea1dd15077.txt  # Verification key
├── package.json                  # Updated with postbuild script
├── INDEXNOW_IMPLEMENTATION.md   # Full documentation
└── INDEXNOW_QUICKSTART.md       # This file
```

## Usage

### Automatic (Default)

```bash
# Just build as normal
npm run build

# Or in production
pnpm build

# IndexNow notification happens automatically after build
```

### Manual Testing

```bash
# Test without making API calls
node scripts/test-indexnow.js

# Manually trigger notification
node scripts/notify-indexnow.js
```

### From Code

```typescript
import { notifyIndexNow, notifyAllPages } from '@/lib/indexnow'

// Notify all pages
await notifyAllPages()

// Notify specific page
await notifyIndexNow('https://www.meetcursive.com/blog/new-post')

// Notify multiple pages
await notifyIndexNow([
  'https://www.meetcursive.com/blog/post-1',
  'https://www.meetcursive.com/blog/post-2',
])
```

## What Gets Notified

All 93 unique URLs from the sitemap:

- 3 core pages (homepage, platform, pricing)
- 7 solution pages
- 9 industry pages
- 5 secondary pages
- 3 resource pages
- 12 blog category pages
- 52 blog posts
- 2 legal pages

## Verification

### 1. Check that the key file is accessible

```bash
curl https://www.meetcursive.com/7c33bde0a15b132aa38f5bea1dd15077.txt
# Should return: 7c33bde0a15b132aa38f5bea1dd15077
```

### 2. Check build logs

Look for these messages after running `npm run build`:

```
[IndexNow] Preparing to notify all 93 pages from sitemap
[IndexNow] Submitting 1 batch(es)
[IndexNow] Batch 1/1: 93 URLs
[IndexNow] Successfully notified search engines
[IndexNow] All batches submitted successfully
```

### 3. Monitor search engine tools

- **Google Search Console**: Check Coverage reports for indexing status
- **Bing Webmaster Tools**: View IndexNow submission logs

## Troubleshooting

### Build fails with IndexNow error

**Don't worry!** The script is designed to never break builds. If you see an error, the build will still succeed. Check:

1. Is the key file deployed? Visit: https://www.meetcursive.com/7c33bde0a15b132aa38f5bea1dd15077.txt
2. Are you seeing network errors? (Non-critical, just retry on next build)
3. Rate limiting? (Handled automatically with delays)

### Want to disable IndexNow temporarily?

```bash
# Remove postbuild script from package.json
# Or set environment variable
SKIP_INDEXNOW=true npm run build
```

## Configuration

### Environment Variable (Optional)

Set a custom IndexNow key:

```bash
# .env.local
INDEXNOW_KEY=your-custom-32-char-key
```

**Important**: If you change the key, you must:
1. Update `lib/indexnow.ts`
2. Update `scripts/notify-indexnow.js`
3. Rename the public key file

## Best Practices

### DO:
- Let it run automatically after each deployment
- Submit new blog posts immediately after publishing
- Use it for significant page updates

### DON'T:
- Submit the same URL multiple times per day
- Submit unchanged pages manually
- Submit test/staging URLs

## Next Steps

1. **Deploy**: Push to production and the integration works automatically
2. **Monitor**: Check Google Search Console after a few hours
3. **Verify**: New content should appear in search within 24 hours
4. **Optimize**: Focus on creating quality content (IndexNow just speeds up indexing)

## Support

- Full docs: `INDEXNOW_IMPLEMENTATION.md`
- Test script: `node scripts/test-indexnow.js`
- Official docs: https://www.indexnow.org/

---

**Status**: Production-ready and enabled by default
**Last Updated**: February 4, 2026
