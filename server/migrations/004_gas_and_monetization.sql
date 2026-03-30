-- Phase 6: Gas prices, affiliates, subscriptions

-- Community-reported gas prices
CREATE TABLE community_gas_prices (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  station_name VARCHAR(100) NOT NULL,
  brand VARCHAR(50),
  address VARCHAR(200),
  zip_code VARCHAR(10) NOT NULL,
  latitude NUMERIC(9,6),
  longitude NUMERIC(9,6),
  regular_cents INTEGER,
  midgrade_cents INTEGER,
  premium_cents INTEGER,
  diesel_cents INTEGER,
  reported_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_gas_prices_zip ON community_gas_prices(zip_code);
CREATE INDEX idx_gas_prices_reported ON community_gas_prices(reported_at DESC);

-- Affiliate links
CREATE TABLE affiliate_links (
  id SERIAL PRIMARY KEY,
  category VARCHAR(30) NOT NULL,
  provider VARCHAR(50) NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  base_url TEXT NOT NULL,
  affiliate_code VARCHAR(100),
  description TEXT,
  vehicle_make VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Affiliate click tracking
CREATE TABLE affiliate_clicks (
  id SERIAL PRIMARY KEY,
  affiliate_link_id INTEGER REFERENCES affiliate_links(id),
  user_id INTEGER REFERENCES users(id),
  context_vehicle_id INTEGER,
  clicked_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_affiliate_clicks_link ON affiliate_clicks(affiliate_link_id);

-- Subscriptions (Pro tier)
CREATE TABLE subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tier VARCHAR(10) NOT NULL DEFAULT 'pro',
  stripe_customer_id VARCHAR(100),
  stripe_subscription_id VARCHAR(100),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true
);

CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);

-- Seed some affiliate links
INSERT INTO affiliate_links (category, provider, display_name, base_url, description) VALUES
  ('parts', 'autozone', 'AutoZone', 'https://www.autozone.com', 'Auto parts and accessories'),
  ('parts', 'rockauto', 'RockAuto', 'https://www.rockauto.com', 'Discount auto parts online'),
  ('tires', 'tirerack', 'Tire Rack', 'https://www.tirerack.com', 'Tires with free shipping'),
  ('tires', 'discounttire', 'Discount Tire', 'https://www.discounttire.com', 'Americas largest tire retailer'),
  ('oil', 'amazon', 'Amazon Motor Oil', 'https://www.amazon.com/motor-oil', 'Synthetic and conventional oils'),
  ('vehicle', 'carvana', 'Carvana', 'https://www.carvana.com', 'Buy used cars online with delivery'),
  ('vehicle', 'cargurus', 'CarGurus', 'https://www.cargurus.com', 'Compare car prices and deals'),
  ('insurance', 'thezebra', 'The Zebra', 'https://www.thezebra.com', 'Compare car insurance rates');
