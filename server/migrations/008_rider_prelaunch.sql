-- Phase 11: Rider-facing features + pre-launch

-- Rider waitlist
CREATE TABLE rider_waitlist (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  zip_code VARCHAR(10),
  referral_source VARCHAR(50),
  signed_up_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rider_waitlist_zip ON rider_waitlist(zip_code);

-- Driver pre-registration for future platform
CREATE TABLE driver_preregistration (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  email VARCHAR(255) NOT NULL,
  zip_code VARCHAR(10),
  platforms_current TEXT[],
  years_experience NUMERIC(3,1),
  vehicle_year INTEGER,
  vehicle_make VARCHAR(50),
  vehicle_model VARCHAR(100),
  weekly_hours_available INTEGER,
  preferred_schedule TEXT[],
  interested_in TEXT[],
  registered_at TIMESTAMPTZ DEFAULT NOW()
);

-- Driver availability preferences
CREATE TABLE driver_availability (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day_of_week SMALLINT NOT NULL,
  start_hour SMALLINT NOT NULL,
  end_hour SMALLINT NOT NULL,
  preferred_areas TEXT[],
  gig_types TEXT[],
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, day_of_week)
);
