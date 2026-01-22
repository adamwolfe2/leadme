# Database Migrations Guide

This document describes all database migrations for the OpenInfo platform.

## Migration Overview

| Migration | Description | Tables Created |
|-----------|-------------|----------------|
| `20260101000001_init_core_tables.sql` | Core workspace and user tables | `workspaces`, `users` |
| `20260101000002_global_topics.sql` | Topic tracking and trends | `global_topics`, `trends` |
| `20260101000003_query_system.sql` | Query management | `queries`, `saved_searches` |
| `20260101000004_lead_system.sql` | Lead pipeline | `leads`, `credit_usage`, `export_jobs` |
| `20260101000005_people_search.sql` | People search feature | `people_search_results`, `saved_people_searches` |
| `20260101000006_integrations_billing.sql` | Integrations & billing | `integrations`, `billing_events`, `notification_preferences`, `stripe_customers` |

## Running Migrations

### Local Development

```bash
# Push all migrations to local Supabase
pnpm supabase db reset

# Or push to remote
pnpm supabase db push
```

### Production

1. Test migrations locally first
2. Backup production database
3. Run migrations via Supabase dashboard or CLI
4. Verify all tables and policies

## Schema Design Principles

### 1. Multi-Tenant Isolation

Every table (except `global_topics` and `trends`) has a `workspace_id` foreign key:

```sql
workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE
```

RLS policies enforce workspace isolation:

```sql
CREATE POLICY "Workspace isolation" ON {table}
  FOR ALL USING (
    workspace_id IN (
      SELECT workspace_id FROM users
      WHERE auth_user_id = auth.uid()
    )
  );
```

### 2. Audit Trail

All tables have:
- `created_at` - Automatic on insert
- `updated_at` - Automatic on update via trigger
- `created_by` - Optional user reference

### 3. JSONB for Flexibility

Complex data stored as JSONB:
- `workspace.branding` - Theme colors, logos
- `queries.filters` - Query filter configuration
- `leads.company_data` - Company information from DataShopper
- `leads.contact_data` - Contact information from Clay
- `people_search_results.person_data` - Person details

GIN indexes enable fast JSONB queries.

### 4. Status Enums

Typed status fields for clarity:
- `query_status` - active, paused, completed
- `enrichment_status` - pending, enriching, enriched, failed
- `delivery_status` - pending, delivered, failed
- `export_status` - pending, processing, completed, failed

### 5. Soft Constraints

Data validation via CHECK constraints:
- Email format validation
- Positive number checks
- Non-empty string checks

## Table Relationships

```
workspaces
  ├── users (1:N)
  ├── queries (1:N)
  │   └── leads (1:N)
  ├── people_search_results (1:N)
  ├── integrations (1:N)
  ├── billing_events (1:N)
  └── stripe_customers (1:1)

global_topics (shared across workspaces)
  ├── queries (1:N)
  └── trends (1:N)

users
  ├── credit_usage (1:N)
  ├── export_jobs (1:N)
  ├── people_search_results (1:N)
  └── notification_preferences (1:1)
```

## Key Functions

### Helper Functions

| Function | Purpose | Usage |
|----------|---------|-------|
| `get_user_workspace_id()` | Get current user's workspace | Server-side queries |
| `check_query_limit()` | Enforce plan limits | Before creating query |
| `check_credits_available()` | Validate credit balance | Before credit actions |
| `record_credit_usage()` | Log credit consumption | Email reveal, exports |
| `search_topics()` | Full-text topic search | Topic autocomplete |

### Cron Functions

| Function | Schedule | Purpose |
|----------|----------|---------|
| `reset_daily_credits()` | Daily 00:00 | Reset daily_credits_used |
| `update_topic_trends()` | Weekly | Calculate trend changes |
| `reset_weekly_lead_counts()` | Weekly | Reset leads_this_week |
| `cleanup_expired_exports()` | Daily | Delete old export files |

## RLS Policy Testing

Test RLS policies with multiple users:

```sql
-- Create test users in different workspaces
-- Try to access other workspace's data
-- Should return empty results
```

Example test:

```sql
-- As user1 (workspace A)
SELECT * FROM leads; -- Should only see workspace A leads

-- As user2 (workspace B)
SELECT * FROM leads; -- Should only see workspace B leads

-- Cross-workspace check
SELECT COUNT(*) FROM leads WHERE workspace_id != get_user_workspace_id();
-- Should return 0
```

## Indexes

Key indexes for performance:

### Workspace Isolation
- `idx_*_workspace_id` on every table

### Foreign Keys
- All foreign key columns indexed

### JSONB Queries
- GIN indexes on `filters`, `company_data`, `contact_data`, `person_data`

### Full-Text Search
- `idx_global_topics_topic_tsv` (GIN) for topic search

### Temporal Queries
- `created_at DESC` indexes for recent data
- `next_run_at` indexes for cron jobs

## Data Types

### UUIDs
All IDs are UUID v4 for security and distribution.

### Timestamps
All timestamps are `TIMESTAMPTZ` (with timezone).

### JSONB
Complex/flexible data stored as JSONB with GIN indexes.

### Enums
String enums for type safety and constraint.

## Migration Rollback

To rollback a migration:

1. Identify migration to rollback
2. Create reverse migration:
   ```sql
   DROP TABLE IF EXISTS {table} CASCADE;
   DROP TYPE IF EXISTS {enum};
   DROP FUNCTION IF EXISTS {function};
   ```
3. Test rollback locally
4. Apply to production if needed

## Common Issues

### Issue: RLS Policy Blocks Query

**Symptom**: Empty results or "permission denied"

**Solution**:
1. Check if user is authenticated
2. Verify workspace_id in query
3. Test policy with `auth.uid()`
4. Review policy USING clause

### Issue: Foreign Key Violation

**Symptom**: "violates foreign key constraint"

**Solution**:
1. Ensure referenced record exists
2. Check ON DELETE CASCADE settings
3. Verify workspace_id matches

### Issue: JSONB Query Slow

**Symptom**: Slow queries on JSONB columns

**Solution**:
1. Add GIN index: `CREATE INDEX idx_name ON table USING GIN(column);`
2. Use JSONB operators efficiently
3. Consider extracting frequent queries to columns

## Best Practices

1. **Always use workspace_id filter** in queries
2. **Test RLS policies** with multiple users
3. **Use transactions** for multi-table operations
4. **Index foreign keys** and frequently queried columns
5. **Validate JSONB structure** in application layer
6. **Monitor query performance** with `EXPLAIN ANALYZE`
7. **Backup before migrations** in production
8. **Use migration timestamps** for ordering

## Monitoring

Key metrics to monitor:

- Table sizes: `pg_total_relation_size()`
- Index usage: `pg_stat_user_indexes`
- Slow queries: `pg_stat_statements`
- Connection count: `pg_stat_activity`
- RLS policy hits: Query logs

## Security Checklist

- [x] RLS enabled on all tables
- [x] Workspace isolation policies tested
- [x] Service role functions use SECURITY DEFINER
- [x] Sensitive data in JSONB (not exposed)
- [x] Email validation in CHECK constraints
- [x] Foreign keys have ON DELETE CASCADE/RESTRICT
- [x] No public write access
- [x] Auth required for all data access

---

**Last Updated**: 2026-01-22
**Schema Version**: 1.0.0
