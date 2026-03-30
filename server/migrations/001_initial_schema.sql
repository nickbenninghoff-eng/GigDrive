-- Initial schema for GigDrive
-- Core tables for Phase 1: Calculator MVP

-- Vehicles table (seeded from FuelEconomy.gov + NHTSA)
CREATE TABLE vehicles (
  id SERIAL PRIMARY KEY,
  year SMALLINT NOT NULL,
  make VARCHAR(50) NOT NULL,
  model VARCHAR(100) NOT NULL,
  trim VARCHAR(100),
  fuel_type VARCHAR(20) NOT NULL DEFAULT 'gas',
  mpg_city NUMERIC(5,1),
  mpg_highway NUMERIC(5,1),
  mpg_combined NUMERIC(5,1),
  kwh_per_100mi NUMERIC(5,1),
  epa_vehicle_id VARCHAR(20),
  nhtsa_vehicle_id VARCHAR(20),
  body_style VARCHAR(30),
  cargo_volume_cuft NUMERIC(5,1),
  passenger_capacity SMALLINT,
  msrp_original INTEGER,
  nhtsa_overall_safety_rating SMALLINT,
  nhtsa_complaint_count INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vehicles_make_model ON vehicles(make, model);
CREATE INDEX idx_vehicles_year ON vehicles(year);
CREATE INDEX idx_vehicles_fuel_type ON vehicles(fuel_type);
CREATE INDEX idx_vehicles_make_lower ON vehicles(LOWER(make));
CREATE INDEX idx_vehicles_model_lower ON vehicles(LOWER(model));
CREATE UNIQUE INDEX idx_vehicles_unique ON vehicles(year, make, model, COALESCE(trim, ''));

-- Pre-computed gig suitability scores
CREATE TABLE gig_vehicle_scores (
  id SERIAL PRIMARY KEY,
  vehicle_id INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  gig_category VARCHAR(20) NOT NULL,
  overall_score NUMERIC(4,2),
  cost_score NUMERIC(4,2),
  comfort_score NUMERIC(4,2),
  cargo_score NUMERIC(4,2),
  reliability_score NUMERIC(4,2),
  computed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(vehicle_id, gig_category)
);

CREATE INDEX idx_gig_scores_category ON gig_vehicle_scores(gig_category, overall_score DESC);

-- Manufacturer-recommended maintenance schedules
CREATE TABLE maintenance_schedules (
  id SERIAL PRIMARY KEY,
  vehicle_id INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  service_type VARCHAR(50) NOT NULL,
  interval_miles INTEGER,
  interval_months INTEGER,
  estimated_cost_low INTEGER,
  estimated_cost_high INTEGER,
  source VARCHAR(20) DEFAULT 'manufacturer'
);

CREATE INDEX idx_maintenance_vehicle ON maintenance_schedules(vehicle_id);
