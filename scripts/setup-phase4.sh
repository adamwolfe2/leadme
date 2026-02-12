#!/bin/bash

# Phase 4 Setup Script
# Deploys migrations and configures Inngest functions

set -e

echo "🚀 Setting up Phase 4: Lead Pipeline"
echo ""

# Check for required environment variables
echo "📋 Checking environment variables..."

required_vars=(
  "NEXT_PUBLIC_SUPABASE_URL"
  "SUPABASE_SERVICE_ROLE_KEY"
  "CLAY_API_KEY"
  "RESEND_API_KEY"
  "INNGEST_EVENT_KEY"
)

for var in "${required_vars[@]}"; do
  if [ -z "${!var}" ]; then
    echo "❌ Missing required environment variable: $var"
    echo "Please set it in .env.local"
    exit 1
  else
    echo "✅ $var is set"
  fi
done

echo ""
echo "📦 Installing dependencies..."
pnpm install

echo ""
echo "🗄️  Deploying database migration..."
echo "Please run this manually in your Supabase dashboard:"
echo ""
echo "Migration file: supabase/migrations/20260101000007_add_intent_and_platform_fields.sql"
echo ""
echo "Or use Supabase CLI:"
echo "supabase db push"
echo ""

read -p "Press enter once migration is deployed..."

echo ""
echo "🔄 Regenerating TypeScript types..."
echo "Run this command:"
echo "pnpx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.types.ts"
echo ""

read -p "Press enter once types are regenerated..."

echo ""
echo "🏗️  Building project..."
pnpm build

echo ""
echo "✅ Phase 4 setup complete!"
echo ""
echo "Next steps:"
echo "1. Start the development server: pnpm dev"
echo "2. Visit http://localhost:3000/api/inngest to register functions"
echo "3. Configure Inngest webhook in your Inngest dashboard"
echo "4. Test with admin API: POST /api/admin/trigger-lead-generation"
echo "5. Monitor functions at https://app.inngest.com"
echo ""
echo "📚 Read PHASE_4_LEAD_PIPELINE.md for complete documentation"
