# What's Actually Broken

**Date**: 2026-01-26
**Verified By**: Reality Check Batch 4

## Critical (App Won't Work Without Fix)

### 1. Missing Environment Variables
- **Status**: BLOCKER
- **Description**: App requires Supabase credentials to start. Without `.env.local`, the middleware crashes with "Your project's URL and Key are required to create a Supabase client!"
- **Required Variables**:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
- **Fix**: Copy `.env.example` to `.env.local` and add real Supabase credentials

### 2. Database Types Out of Sync
- **Status**: BLOCKER for production builds
- **Description**: TypeScript errors (1000+) because `src/types/database.types.ts` doesn't include tables from new migrations (20260126*). Supabase query results are typed as `never`.
- **Affected Areas**: All API routes, all pages that fetch data
- **Fix**: Regenerate types with `supabase gen types typescript > src/types/database.types.ts`
- **Note**: Dev mode still works (runtime types are correct), but `pnpm build` will fail

## Major (Feature Won't Work)

### 3. Integration Test Script Has Type Errors
- **Status**: Won't run
- **Description**: `scripts/integration-test.ts` has 40+ type errors because it uses the outdated database types
- **Fix**: Regenerate database types, or use `any` casts for testing

### 4. Campaign Creation Flow - Unknown Status
- **Status**: UNTESTED
- **Description**: Cannot verify if campaign wizard works without:
  - Running database migrations
  - Having Supabase connection
  - Seeding test data
- **Blocked By**: Issues #1, #2

### 5. Inngest Functions - Unknown Status
- **Status**: UNTESTED
- **Description**: Cannot verify background job registration without:
  - `INNGEST_EVENT_KEY` and `INNGEST_SIGNING_KEY` env vars
  - Inngest dev server running
- **Blocked By**: Missing environment variables

## Minor (Cosmetic/Polish)

### 6. Console.log Statements in Production Code
- **Status**: Technical debt
- **Description**: 71 console.log statements across 21 files (mostly in webhook handlers and dev utilities)
- **Impact**: Noisy logs in production
- **Fix**: Replace with proper logger or wrap in debug checks

### 7. Form Error Type Mismatch
- **Status**: Minor type issue
- **File**: `src/app/(dashboard)/settings/security/page.tsx`
- **Description**: `FieldError | undefined` not assignable to `string | undefined`
- **Impact**: TypeScript error only, runtime works
- **Fix**: Convert error to string: `error?.message`

## Unknown (Couldn't Test)

### Database Migrations
- **Why**: No Supabase connection to test against
- **Concern**: 44 migrations may have conflicts or missing dependencies
- **Recommendation**: Test on fresh Supabase project

### API Endpoints
- **Why**: No authenticated session, no database connection
- **Concern**: New API routes from Phases 14-27 untested
- **Recommendation**: Need integration test environment

### Email Sending
- **Why**: No EmailBison credentials
- **Concern**: `sendEmailWithEmailBison` untested
- **Recommendation**: Mock mode exists, but need to verify

### AI Enrichment
- **Why**: No Anthropic API key
- **Concern**: `enrichCampaignLead` untested with real Claude
- **Recommendation**: Mock enrichment exists, but need to verify

### Reply Classification
- **Why**: No Anthropic API key
- **Concern**: `classifyWithClaude` untested
- **Recommendation**: Need integration test

## Summary

| Category | Count |
|----------|-------|
| Critical | 2 |
| Major | 3 |
| Minor | 2 |
| Unknown | 5 |

**Bottom Line**: The app infrastructure is solid, but requires:
1. Environment configuration (5 min)
2. Database type regeneration (5 min)
3. Integration testing with real services (30+ min)

The code compiles and runs in dev mode once env vars are set.
