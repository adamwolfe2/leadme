# AI Studio Environment Variables

Add these to your Vercel project settings:

## Required API Keys

```bash
# Firecrawl - Website scraping and brand extraction
FIRECRAWL_API_KEY=your_firecrawl_api_key_here

# OpenAI - Knowledge base and customer profile generation
OPENAI_API_KEY=your_openai_api_key_here

# Fal.ai - AI image generation for ad creatives
FAL_KEY=your_fal_api_key_here
```

## Deployment Steps

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add each variable above
3. Redeploy the project

## Database Migration

The migration `20260130000000_create_ai_studio_tables.sql` has been applied to your Supabase database.

To verify:
1. Go to Supabase Dashboard → SQL Editor
2. Run: `SELECT * FROM brand_workspaces LIMIT 1;`
3. Should return empty result (table exists)

## Features Enabled

✅ Brand DNA extraction from URLs
✅ AI knowledge base generation
✅ Customer profile (ICP) generation  
✅ AI ad creative generation
✅ Campaign pricing and management
✅ Multi-tenant workspace isolation

## Access

Only users with `role = 'owner'` can see AI Studio in navigation.
