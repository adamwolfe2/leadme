# Database Migration Checklist

## Migration Order

Migrations must run in timestamp order. Here's the complete list:

### Core Tables (Original Schema)
1. `20260101000001_init_core_tables.sql` - workspaces, users
2. `20260101000002_global_topics.sql` - global_topics
3. `20260101000003_query_system.sql` - queries
4. `20260101000004_lead_system.sql` - leads core
5. `20260101000005_people_search.sql` - people search
6. `20260101000006_integrations_billing.sql` - integrations
7. `20260101000007_add_intent_and_platform_fields.sql` - intent fields
8. `20260101000008_add_billing_fields.sql` - billing

### Rate Limiting & Optimization
9. `20260122000007_rate_limiting_credits.sql` - credits
10. `20260122000008_database_optimization.sql` - indexes

### Geocoding & Routing
11. `20260123000001_add_lead_routing.sql` - routing rules
12. `20260123100000_add_geocoding_fields.sql` - geocoding

### Admin & Partners
13. `20260124000001_add_website_url.sql` - website URL field
14. `20260124000002_admin_and_partners.sql` - admin tables
15. `20260124000003_stripe_connect.sql` - Stripe integration
16. `20260124000004_webhooks_and_delivery.sql` - webhooks
17. `20260124000005_enrichment.sql` - enrichment queue
18. `20260124000006_email_campaigns.sql` - basic campaigns
19. `20260124000007_engagement_tracking.sql` - engagement
20. `20260124000008_lead_preferences.sql` - preferences
21. `20260124000009_multi_industry.sql` - multi-industry
22. `20260124000010_geo_routing_scoring.sql` - geo scoring
23. `20260124000011_subscription_billing.sql` - subscriptions
24. `20260124000012_security_rls_policies.sql` - RLS policies

### Lead Status & Teams
25. `20260125000001_lead_status_notes.sql` - lead notes
26. `20260125000001_enrichment_queue_system.sql` - enrichment queue
27. `20260125000002_team_invites.sql` - team management
28. `20260125000003_saved_views_tags.sql` - views & tags
29. `20260125000004_email_templates_sequences.sql` - templates
30. `20260125000005_integrations_extended.sql` - extended integrations
31. `20260125000006_rate_limiting_analytics.sql` - analytics

### Phases 14-27 (Sales.co Campaign System)
32. `20260126000001_sales_co_campaigns_templates.sql` - client_profiles, campaign_leads, campaign_reviews
33. `20260126000002_campaign_replies.sql` - email_replies, reply_response_templates
34. `20260126000003_sequence_automation.sql` - sequence fields, send windows
35. `20260126000004_suppression_list.sql` - suppressed_emails
36. `20260126000005_daily_sending_limits.sql` - send limits
37. `20260126000006_timezone_scheduling.sql` - timezone fields
38. `20260126000007_ab_testing.sql` - variants, experiments
39. `20260126000008_conversations.sql` - email_conversations, conversation_messages
40. `20260126000009_notifications.sql` - notifications system
41. `20260126000010_workspace_settings.sql` - settings, onboarding
42. `20260126000011_failed_jobs.sql` - error handling
43. `20260126000012_audit_logs.sql` - audit logging
44. `20260126000013_fix_foreign_keys.sql` - FK constraint fixes

### Reference Only (Do Not Run)
- `complete_schema.sql` - Reference only, contains combined schema

## Pre-Migration Checklist

Before running migrations:

- [ ] Backup database: `pg_dump -Fc database_name > backup.dump`
- [ ] Verify Supabase project is accessible
- [ ] Check current migration state: `supabase migration list`
- [ ] Review migration files for any hardcoded values

## Running Migrations

```bash
# Using Supabase CLI
supabase db push

# Or run individual migrations
supabase migration up
```

## Post-Migration Verification

After running migrations:

- [ ] Verify all tables exist:
  ```sql
  SELECT tablename FROM pg_tables WHERE schemaname = 'public';
  ```

- [ ] Verify RLS is enabled on all tables:
  ```sql
  SELECT tablename, rowsecurity FROM pg_tables
  WHERE schemaname = 'public' AND rowsecurity = false;
  ```

- [ ] Test workspace isolation:
  ```sql
  -- Should return empty if RLS is working
  SET LOCAL role TO 'anon';
  SELECT * FROM leads LIMIT 1;
  ```

- [ ] Verify foreign key constraints:
  ```sql
  SELECT conname, conrelid::regclass, confrelid::regclass, confdeltype
  FROM pg_constraint
  WHERE contype = 'f';
  ```

## Rollback Instructions

If a migration fails:

1. **Identify the failed migration**:
   ```bash
   supabase migration list
   ```

2. **Create a rollback script** for the specific migration:
   - DROP any tables created
   - DROP any functions created
   - REVERT any ALTER TABLE changes

3. **Run the rollback**:
   ```bash
   supabase db execute --file rollback.sql
   ```

## Common Issues

### Issue: RLS policy blocks legitimate access
**Fix**: Check the policy and ensure it matches the expected user/workspace relationship

### Issue: Foreign key constraint violation
**Fix**: Ensure referenced records exist before inserting

### Issue: Duplicate migration timestamp
**Fix**: Rename the migration with a unique timestamp

## Table Dependencies

Key dependencies to be aware of:

```
workspaces
  └── users
  └── leads
  └── email_campaigns
        └── campaign_leads
        └── email_sends
        └── campaign_reviews
  └── email_templates
        └── email_template_variants
  └── client_profiles
  └── notifications
  └── workspace_settings
  └── audit_logs
```

## Fresh Database Setup

To set up a fresh database:

```bash
# 1. Reset local database
supabase db reset

# 2. Run all migrations
supabase db push

# 3. Seed with test data (optional)
supabase db execute --file seed.sql
```

## Environment-Specific Notes

### Development
- Use `supabase start` for local development
- Migrations run automatically on `supabase db reset`

### Staging
- Test migrations on staging before production
- Use `supabase db push --dry-run` to preview changes

### Production
- Always backup before running migrations
- Run during low-traffic periods
- Monitor for errors after migration
