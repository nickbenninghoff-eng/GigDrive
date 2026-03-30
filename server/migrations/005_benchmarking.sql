-- Phase 8: Earnings benchmarking + fee transparency

-- Aggregated earnings benchmarks by market (zip prefix) and platform
CREATE TABLE earnings_benchmarks (
  id SERIAL PRIMARY KEY,
  zip_prefix VARCHAR(3) NOT NULL,
  platform VARCHAR(20) NOT NULL,
  period_type VARCHAR(10) NOT NULL DEFAULT 'weekly',
  avg_gross_hourly_cents INTEGER,
  median_gross_hourly_cents INTEGER,
  p25_gross_hourly_cents INTEGER,
  p75_gross_hourly_cents INTEGER,
  avg_tips_pct NUMERIC(4,1),
  avg_platform_fee_pct NUMERIC(4,1),
  avg_trips_per_hour NUMERIC(3,1),
  sample_size INTEGER NOT NULL DEFAULT 0,
  computed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(zip_prefix, platform, period_type)
);

CREATE INDEX idx_benchmarks_zip ON earnings_benchmarks(zip_prefix);
CREATE INDEX idx_benchmarks_platform ON earnings_benchmarks(platform);

-- Platform fee tracking (per-trip level detail for transparency)
CREATE TABLE platform_fee_reports (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  platform VARCHAR(20) NOT NULL,
  trip_date DATE NOT NULL,
  rider_paid_cents INTEGER NOT NULL,
  driver_received_cents INTEGER NOT NULL,
  tip_cents INTEGER DEFAULT 0,
  surge_multiplier NUMERIC(3,1) DEFAULT 1.0,
  trip_distance_miles NUMERIC(6,1),
  trip_duration_minutes INTEGER,
  zip_code VARCHAR(10),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_fee_reports_user ON platform_fee_reports(user_id);
CREATE INDEX idx_fee_reports_platform ON platform_fee_reports(platform, trip_date);

-- Market comparison cache (which platform pays best in each market)
CREATE TABLE market_comparisons (
  id SERIAL PRIMARY KEY,
  zip_prefix VARCHAR(3) NOT NULL,
  best_platform VARCHAR(20),
  best_hourly_cents INTEGER,
  worst_platform VARCHAR(20),
  worst_hourly_cents INTEGER,
  platforms_compared INTEGER DEFAULT 0,
  computed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(zip_prefix)
);
