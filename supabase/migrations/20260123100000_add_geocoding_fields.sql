-- Migration: Add geocoding and normalized location fields to leads
-- This enables distance calculations and location-based filtering

-- ============================================
-- ADD GEOCODING COLUMNS TO LEADS
-- ============================================

-- Add latitude and longitude for precise distance calculations
ALTER TABLE leads ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

-- Add normalized/standardized location fields
ALTER TABLE leads ADD COLUMN IF NOT EXISTS city_normalized VARCHAR(255);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS state_abbrev VARCHAR(2);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS state_full VARCHAR(100);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS region VARCHAR(50);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS postal_code VARCHAR(20);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS country_code VARCHAR(2) DEFAULT 'US';

-- Add geocoding metadata
ALTER TABLE leads ADD COLUMN IF NOT EXISTS geocoded_at TIMESTAMPTZ;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS geocode_accuracy VARCHAR(50); -- 'address', 'city', 'postal_code', 'state', 'country'
ALTER TABLE leads ADD COLUMN IF NOT EXISTS geocode_source VARCHAR(50); -- 'google', 'mapbox', 'census', 'manual'

-- Add address normalization flag
ALTER TABLE leads ADD COLUMN IF NOT EXISTS address_normalized BOOLEAN DEFAULT FALSE;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS normalization_corrections JSONB;

-- ============================================
-- CREATE INDEXES FOR LOCATION QUERIES
-- ============================================

-- Index for geographic queries
CREATE INDEX IF NOT EXISTS idx_leads_location ON leads (latitude, longitude) WHERE latitude IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_state_abbrev ON leads (state_abbrev) WHERE state_abbrev IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_region ON leads (region) WHERE region IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_city_normalized ON leads (city_normalized) WHERE city_normalized IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_postal_code ON leads (postal_code) WHERE postal_code IS NOT NULL;

-- Composite index for common location filters
CREATE INDEX IF NOT EXISTS idx_leads_state_city ON leads (state_abbrev, city_normalized)
  WHERE state_abbrev IS NOT NULL AND city_normalized IS NOT NULL;

-- ============================================
-- CREATE GEOCODE CACHE TABLE
-- ============================================

-- Cache geocoded locations to avoid repeated API calls
CREATE TABLE IF NOT EXISTS geocode_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Location input (what we're geocoding)
  address TEXT,
  city VARCHAR(255),
  state VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100),

  -- Geocoded result
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  formatted_address TEXT,
  accuracy VARCHAR(50),

  -- Normalized components (from geocoding response)
  normalized_city VARCHAR(255),
  normalized_state VARCHAR(100),
  normalized_state_abbrev VARCHAR(10),
  normalized_postal_code VARCHAR(20),
  normalized_country VARCHAR(100),
  normalized_country_code VARCHAR(2),

  -- Metadata
  source VARCHAR(50) NOT NULL, -- 'google', 'mapbox', 'census', etc.
  raw_response JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ, -- For cache invalidation

  -- Create unique constraint on location combination
  CONSTRAINT geocode_cache_location_key UNIQUE (
    COALESCE(address, ''),
    COALESCE(city, ''),
    COALESCE(state, ''),
    COALESCE(postal_code, ''),
    COALESCE(country, 'US')
  )
);

-- Index for cache lookups
CREATE INDEX IF NOT EXISTS idx_geocode_cache_lookup ON geocode_cache (city, state, postal_code, country);
CREATE INDEX IF NOT EXISTS idx_geocode_cache_created ON geocode_cache (created_at);

-- ============================================
-- CREATE CITY COORDINATES REFERENCE TABLE
-- ============================================

-- Pre-populated US city coordinates for fast lookups without API calls
CREATE TABLE IF NOT EXISTS us_city_coordinates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city VARCHAR(255) NOT NULL,
  state_abbrev VARCHAR(2) NOT NULL,
  state_full VARCHAR(100) NOT NULL,
  county VARCHAR(255),
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  population INTEGER,
  timezone VARCHAR(100),
  region VARCHAR(50),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT us_city_coordinates_city_state_key UNIQUE (city, state_abbrev)
);

-- Indexes for city lookups
CREATE INDEX IF NOT EXISTS idx_us_city_coords_state ON us_city_coordinates (state_abbrev);
CREATE INDEX IF NOT EXISTS idx_us_city_coords_region ON us_city_coordinates (region);
CREATE INDEX IF NOT EXISTS idx_us_city_coords_lookup ON us_city_coordinates (LOWER(city), state_abbrev);

-- ============================================
-- DISTANCE CALCULATION FUNCTION
-- ============================================

-- Haversine distance calculation in miles
CREATE OR REPLACE FUNCTION calculate_distance_miles(
  lat1 DECIMAL,
  lon1 DECIMAL,
  lat2 DECIMAL,
  lon2 DECIMAL
) RETURNS DECIMAL AS $$
DECLARE
  r DECIMAL := 3959; -- Earth's radius in miles
  dlat DECIMAL;
  dlon DECIMAL;
  a DECIMAL;
  c DECIMAL;
BEGIN
  IF lat1 IS NULL OR lon1 IS NULL OR lat2 IS NULL OR lon2 IS NULL THEN
    RETURN NULL;
  END IF;

  dlat := RADIANS(lat2 - lat1);
  dlon := RADIANS(lon2 - lon1);

  a := SIN(dlat / 2) * SIN(dlat / 2) +
       COS(RADIANS(lat1)) * COS(RADIANS(lat2)) *
       SIN(dlon / 2) * SIN(dlon / 2);

  c := 2 * ATAN2(SQRT(a), SQRT(1 - a));

  RETURN r * c;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- LEADS WITHIN RADIUS FUNCTION
-- ============================================

-- Find leads within a radius (miles) of a point
CREATE OR REPLACE FUNCTION leads_within_radius(
  p_workspace_id UUID,
  p_lat DECIMAL,
  p_lon DECIMAL,
  p_radius_miles DECIMAL
) RETURNS TABLE (
  lead_id UUID,
  company_name TEXT,
  city VARCHAR,
  state VARCHAR,
  distance_miles DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    l.id AS lead_id,
    (l.company_data->>'name')::TEXT AS company_name,
    l.city_normalized AS city,
    l.state_abbrev AS state,
    calculate_distance_miles(p_lat, p_lon, l.latitude, l.longitude) AS distance_miles
  FROM leads l
  WHERE l.workspace_id = p_workspace_id
    AND l.latitude IS NOT NULL
    AND l.longitude IS NOT NULL
    AND calculate_distance_miles(p_lat, p_lon, l.latitude, l.longitude) <= p_radius_miles
  ORDER BY distance_miles ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- UPDATE EXISTING LEADS LOCATION DATA
-- ============================================

-- Function to extract and normalize location from company_data
CREATE OR REPLACE FUNCTION normalize_lead_location()
RETURNS TRIGGER AS $$
BEGIN
  -- Extract city from company_data if not already set
  IF NEW.city_normalized IS NULL AND NEW.company_data ? 'location' THEN
    NEW.city_normalized := COALESCE(
      NEW.company_data->'location'->>'city',
      (NEW.company_data->>'city')
    );
  END IF;

  -- Mark as needing geocoding if lat/lng not set but we have location data
  IF NEW.latitude IS NULL AND (
    NEW.city_normalized IS NOT NULL OR
    NEW.state_abbrev IS NOT NULL OR
    NEW.postal_code IS NOT NULL
  ) THEN
    NEW.address_normalized := FALSE;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for location normalization on insert/update
DROP TRIGGER IF EXISTS trigger_normalize_lead_location ON leads;
CREATE TRIGGER trigger_normalize_lead_location
  BEFORE INSERT OR UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION normalize_lead_location();

-- ============================================
-- ADD RLS POLICIES FOR NEW TABLES
-- ============================================

-- Geocode cache is shared (no workspace isolation needed)
ALTER TABLE geocode_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access to geocode cache" ON geocode_cache
  FOR SELECT USING (TRUE);

CREATE POLICY "Allow insert to geocode cache" ON geocode_cache
  FOR INSERT WITH CHECK (TRUE);

-- US city coordinates is reference data (read-only)
ALTER TABLE us_city_coordinates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access to city coordinates" ON us_city_coordinates
  FOR SELECT USING (TRUE);

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON COLUMN leads.latitude IS 'GPS latitude coordinate for the lead location';
COMMENT ON COLUMN leads.longitude IS 'GPS longitude coordinate for the lead location';
COMMENT ON COLUMN leads.city_normalized IS 'Standardized city name';
COMMENT ON COLUMN leads.state_abbrev IS 'Two-letter US state abbreviation';
COMMENT ON COLUMN leads.region IS 'US region: Northeast, Southeast, Midwest, Southwest, West';
COMMENT ON COLUMN leads.geocode_accuracy IS 'Precision level of geocoding: address, city, postal_code, state, country';
COMMENT ON TABLE geocode_cache IS 'Cache for geocoding API responses to reduce costs';
COMMENT ON TABLE us_city_coordinates IS 'Reference table with US city coordinates for fast lookups';
COMMENT ON FUNCTION calculate_distance_miles IS 'Calculate distance in miles between two lat/lng points using Haversine formula';
COMMENT ON FUNCTION leads_within_radius IS 'Find all leads within a specified radius (miles) of a point';
