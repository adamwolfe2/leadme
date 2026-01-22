-- OpenInfo Platform - Seed Data
-- Development and testing data

-- ============================================================================
-- SEED WORKSPACES
-- ============================================================================
INSERT INTO workspaces (id, slug, name, industry_vertical, subdomain, branding) VALUES
  (
    '00000000-0000-0000-0000-000000000001',
    'demo-workspace',
    'Demo Workspace',
    'Technology',
    'demo',
    '{"logo_url": null, "primary_color": "#3b82f6", "secondary_color": "#1e40af"}'::jsonb
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    'acme-corp',
    'Acme Corporation',
    'Marketing',
    'acme',
    '{"logo_url": null, "primary_color": "#10b981", "secondary_color": "#059669"}'::jsonb
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SEED GLOBAL TOPICS
-- ============================================================================
INSERT INTO global_topics (topic, category, current_volume, trend_direction, change_percent) VALUES
  -- Technology topics
  ('Artificial Intelligence', 'technology', 15420, 'up', 23.5),
  ('Machine Learning', 'technology', 12350, 'up', 18.2),
  ('Cloud Computing', 'technology', 9840, 'stable', 2.1),
  ('Cybersecurity', 'technology', 8750, 'up', 15.8),
  ('Blockchain', 'technology', 6420, 'down', -8.3),
  ('DevOps', 'technology', 5680, 'stable', 3.2),
  ('Kubernetes', 'technology', 4920, 'up', 12.4),
  ('React Development', 'technology', 4150, 'stable', 1.8),

  -- Marketing topics
  ('Content Marketing', 'marketing', 11200, 'up', 9.7),
  ('SEO Optimization', 'marketing', 8900, 'stable', -1.2),
  ('Social Media Marketing', 'marketing', 10500, 'up', 14.3),
  ('Email Marketing', 'marketing', 7300, 'down', -5.6),
  ('Marketing Automation', 'marketing', 6800, 'up', 11.2),
  ('Influencer Marketing', 'marketing', 5200, 'up', 19.8),

  -- Sales topics
  ('Sales Enablement', 'sales', 4800, 'up', 16.4),
  ('CRM Software', 'sales', 7200, 'stable', 2.8),
  ('Lead Generation', 'sales', 9100, 'up', 13.9),
  ('Sales Training', 'sales', 3900, 'stable', -0.5),

  -- Finance topics
  ('Financial Planning', 'finance', 6500, 'up', 8.1),
  ('Investment Strategy', 'finance', 5400, 'stable', 1.9),
  ('Risk Management', 'finance', 4700, 'up', 10.3),

  -- Operations topics
  ('Supply Chain Management', 'operations', 5800, 'up', 12.7),
  ('Project Management', 'operations', 8300, 'stable', 3.5),
  ('Lean Manufacturing', 'operations', 3200, 'down', -6.8),

  -- HR topics
  ('Remote Work', 'hr', 12800, 'up', 28.4),
  ('Employee Engagement', 'hr', 7600, 'up', 11.8),
  ('Diversity and Inclusion', 'hr', 6900, 'up', 15.2),
  ('Talent Acquisition', 'hr', 5500, 'stable', 2.3),

  -- Product topics
  ('Product Management', 'product', 8400, 'up', 14.6),
  ('User Experience Design', 'product', 7100, 'up', 9.4),
  ('Product Analytics', 'product', 5300, 'stable', 4.1)
ON CONFLICT (topic) DO NOTHING;

-- ============================================================================
-- SEED TRENDS (Last 8 weeks for AI topic)
-- ============================================================================
DO $$
DECLARE
  ai_topic_id UUID;
  week_date DATE;
BEGIN
  -- Get AI topic ID
  SELECT id INTO ai_topic_id FROM global_topics WHERE topic = 'Artificial Intelligence';

  -- Insert last 8 weeks of trend data
  FOR i IN 0..7 LOOP
    week_date := CURRENT_DATE - (i * 7);

    INSERT INTO trends (topic_id, week_start, week_end, volume, change_percent)
    VALUES (
      ai_topic_id,
      week_date,
      week_date + 6,
      15420 - (i * 200) + (random() * 400)::INTEGER,
      (random() * 30 - 15)::NUMERIC(5,2)
    )
    ON CONFLICT (topic_id, week_start) DO NOTHING;
  END LOOP;
END $$;

-- ============================================================================
-- NOTE: USER SEEDING
-- ============================================================================
-- Users cannot be seeded directly as they require auth.users records
-- To create test users:
-- 1. Sign up via the app UI
-- 2. Or use Supabase auth API
-- 3. Or manually insert into auth.users then users table

-- Example SQL for creating test user (run manually):
-- INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
-- VALUES (
--   '10000000-0000-0000-0000-000000000001',
--   'demo@example.com',
--   crypt('password123', gen_salt('bf')),
--   NOW(),
--   '{"provider":"email","providers":["email"]}'::jsonb,
--   '{}'::jsonb,
--   NOW(),
--   NOW()
-- );

-- INSERT INTO users (auth_user_id, workspace_id, email, full_name, role, plan)
-- VALUES (
--   '10000000-0000-0000-0000-000000000001',
--   '00000000-0000-0000-0000-000000000001',
--   'demo@example.com',
--   'Demo User',
--   'owner',
--   'pro'
-- );

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
