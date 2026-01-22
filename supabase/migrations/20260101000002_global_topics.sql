-- OpenInfo Platform - Global Topics & Trends Migration
-- Creates global topics and weekly trends tracking

-- ============================================================================
-- GLOBAL TOPICS TABLE
-- ============================================================================
CREATE TYPE topic_category AS ENUM (
  'technology',
  'marketing',
  'sales',
  'finance',
  'operations',
  'hr',
  'legal',
  'product',
  'other'
);

CREATE TYPE trend_direction AS ENUM ('up', 'down', 'stable');

CREATE TABLE global_topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic TEXT NOT NULL,
  category topic_category NOT NULL DEFAULT 'other',

  -- Search optimization
  topic_tsv TSVECTOR,

  -- Current metrics
  current_volume INTEGER NOT NULL DEFAULT 0,
  trend_direction trend_direction NOT NULL DEFAULT 'stable',
  change_percent NUMERIC(5,2) DEFAULT 0.00,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT unique_topic UNIQUE(topic),
  CONSTRAINT topic_not_empty CHECK (length(trim(topic)) > 0)
);

-- Create GIN index for full-text search
CREATE INDEX idx_global_topics_topic_tsv ON global_topics USING GIN(topic_tsv);
CREATE INDEX idx_global_topics_category ON global_topics(category);
CREATE INDEX idx_global_topics_trend ON global_topics(trend_direction);
CREATE INDEX idx_global_topics_volume ON global_topics(current_volume DESC);

-- Trigger to maintain tsvector
CREATE OR REPLACE FUNCTION global_topics_tsvector_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.topic_tsv := to_tsvector('english', NEW.topic);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER global_topics_tsvector_trigger
  BEFORE INSERT OR UPDATE OF topic ON global_topics
  FOR EACH ROW
  EXECUTE FUNCTION global_topics_tsvector_update();

-- Updated_at trigger
CREATE TRIGGER global_topics_updated_at
  BEFORE UPDATE ON global_topics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TRENDS TABLE (Weekly snapshots)
-- ============================================================================
CREATE TABLE trends (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id UUID NOT NULL REFERENCES global_topics(id) ON DELETE CASCADE,

  -- Time period
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,

  -- Metrics
  volume INTEGER NOT NULL DEFAULT 0,
  change_percent NUMERIC(5,2) DEFAULT 0.00,

  -- Rankings
  rank_overall INTEGER,
  rank_category INTEGER,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT unique_topic_week UNIQUE(topic_id, week_start),
  CONSTRAINT valid_week CHECK (week_end > week_start),
  CONSTRAINT positive_volume CHECK (volume >= 0)
);

-- Indexes for trends
CREATE INDEX idx_trends_topic_id ON trends(topic_id);
CREATE INDEX idx_trends_week_start ON trends(week_start DESC);
CREATE INDEX idx_trends_volume ON trends(volume DESC);
CREATE INDEX idx_trends_change ON trends(change_percent DESC);

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Global topics are publicly readable
ALTER TABLE global_topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Global topics are viewable by authenticated users" ON global_topics
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Only system can insert/update global topics
CREATE POLICY "Only service role can modify global topics" ON global_topics
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Trends are publicly readable
ALTER TABLE trends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trends are viewable by authenticated users" ON trends
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Only system can insert/update trends
CREATE POLICY "Only service role can modify trends" ON trends
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to search topics by text
CREATE OR REPLACE FUNCTION search_topics(search_query TEXT, result_limit INTEGER DEFAULT 20)
RETURNS TABLE (
  id UUID,
  topic TEXT,
  category topic_category,
  current_volume INTEGER,
  trend_direction trend_direction,
  relevance REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    gt.id,
    gt.topic,
    gt.category,
    gt.current_volume,
    gt.trend_direction,
    ts_rank(gt.topic_tsv, websearch_to_tsquery('english', search_query)) AS relevance
  FROM global_topics gt
  WHERE gt.topic_tsv @@ websearch_to_tsquery('english', search_query)
  ORDER BY relevance DESC, gt.current_volume DESC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get trending topics (gainers)
CREATE OR REPLACE FUNCTION get_trending_gainers(result_limit INTEGER DEFAULT 20)
RETURNS TABLE (
  id UUID,
  topic TEXT,
  category topic_category,
  current_volume INTEGER,
  change_percent NUMERIC(5,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    gt.id,
    gt.topic,
    gt.category,
    gt.current_volume,
    gt.change_percent
  FROM global_topics gt
  WHERE gt.trend_direction = 'up'
  ORDER BY gt.change_percent DESC, gt.current_volume DESC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get trending topics (losers)
CREATE OR REPLACE FUNCTION get_trending_losers(result_limit INTEGER DEFAULT 20)
RETURNS TABLE (
  id UUID,
  topic TEXT,
  category topic_category,
  current_volume INTEGER,
  change_percent NUMERIC(5,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    gt.id,
    gt.topic,
    gt.category,
    gt.current_volume,
    gt.change_percent
  FROM global_topics gt
  WHERE gt.trend_direction = 'down'
  ORDER BY gt.change_percent ASC, gt.current_volume DESC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to update topic trends (to be called weekly by Inngest)
CREATE OR REPLACE FUNCTION update_topic_trends()
RETURNS void AS $$
DECLARE
  rec RECORD;
  prev_volume INTEGER;
  change NUMERIC(5,2);
BEGIN
  FOR rec IN SELECT id, current_volume FROM global_topics LOOP
    -- Get previous week's volume
    SELECT volume INTO prev_volume
    FROM trends
    WHERE topic_id = rec.id
    ORDER BY week_start DESC
    LIMIT 1;

    IF prev_volume IS NOT NULL AND prev_volume > 0 THEN
      -- Calculate change percentage
      change := ((rec.current_volume - prev_volume)::NUMERIC / prev_volume) * 100;

      -- Update topic
      UPDATE global_topics
      SET
        change_percent = change,
        trend_direction = CASE
          WHEN change > 10 THEN 'up'::trend_direction
          WHEN change < -10 THEN 'down'::trend_direction
          ELSE 'stable'::trend_direction
        END
      WHERE id = rec.id;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE global_topics IS 'Global list of trackable topics with search and trend data';
COMMENT ON TABLE trends IS 'Weekly snapshots of topic volumes for trend analysis';
COMMENT ON COLUMN global_topics.topic_tsv IS 'Full-text search vector for topic search';
COMMENT ON FUNCTION search_topics IS 'Full-text search for topics with relevance ranking';
COMMENT ON FUNCTION update_topic_trends IS 'Weekly cron job to calculate trend changes';
