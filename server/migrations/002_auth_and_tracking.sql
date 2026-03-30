-- Phase 3: Auth, expense tracking, mileage, earnings

-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(50),
  gig_platforms TEXT[],
  zip_code VARCHAR(10),
  tier VARCHAR(10) DEFAULT 'free',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ
);

CREATE INDEX idx_users_email ON users(email);

-- User vehicles (links user to vehicles they own)
CREATE TABLE user_vehicles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vehicle_id INTEGER NOT NULL REFERENCES vehicles(id),
  nickname VARCHAR(50),
  purchase_price INTEGER,
  purchase_date DATE,
  purchase_mileage INTEGER,
  current_mileage INTEGER,
  monthly_insurance_cents INTEGER,
  monthly_payment_cents INTEGER,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_vehicles_user ON user_vehicles(user_id);

-- Expense logs
CREATE TABLE expense_logs (
  id SERIAL PRIMARY KEY,
  user_vehicle_id INTEGER NOT NULL REFERENCES user_vehicles(id) ON DELETE CASCADE,
  category VARCHAR(20) NOT NULL,
  subcategory VARCHAR(50),
  amount_cents INTEGER NOT NULL,
  odometer_reading INTEGER,
  date DATE NOT NULL,
  notes TEXT,
  gallons NUMERIC(6,3),
  price_per_gallon_cents INTEGER,
  station_name VARCHAR(100),
  is_business_expense BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_expense_logs_user_vehicle ON expense_logs(user_vehicle_id);
CREATE INDEX idx_expense_logs_date ON expense_logs(date);
CREATE INDEX idx_expense_logs_category ON expense_logs(category);

-- Mileage logs (for IRS tracking)
CREATE TABLE mileage_logs (
  id SERIAL PRIMARY KEY,
  user_vehicle_id INTEGER NOT NULL REFERENCES user_vehicles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_odometer INTEGER,
  end_odometer INTEGER,
  miles NUMERIC(7,1) NOT NULL,
  purpose VARCHAR(20) NOT NULL,
  gig_platform VARCHAR(20),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_mileage_logs_user_vehicle ON mileage_logs(user_vehicle_id);
CREATE INDEX idx_mileage_logs_date ON mileage_logs(date);

-- Earnings imports
CREATE TABLE earnings_imports (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  platform VARCHAR(20) NOT NULL,
  import_method VARCHAR(10) NOT NULL,
  period_start DATE,
  period_end DATE,
  gross_earnings_cents INTEGER NOT NULL,
  tips_cents INTEGER DEFAULT 0,
  bonuses_cents INTEGER DEFAULT 0,
  trips_count INTEGER,
  online_hours NUMERIC(6,2),
  imported_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_earnings_user ON earnings_imports(user_id);
CREATE INDEX idx_earnings_date ON earnings_imports(period_start);
