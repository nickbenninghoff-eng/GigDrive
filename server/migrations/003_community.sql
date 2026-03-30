-- Phase 4: Community repair data, tips, voting, gamification

-- Community repair reports (KEY DIFFERENTIATOR)
CREATE TABLE community_repair_reports (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vehicle_id INTEGER NOT NULL REFERENCES vehicles(id),
  service_type VARCHAR(50) NOT NULL,
  amount_cents INTEGER NOT NULL,
  mileage_at_service INTEGER,
  shop_type VARCHAR(20),
  zip_code VARCHAR(10),
  description TEXT,
  is_verified BOOLEAN DEFAULT false,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_repair_reports_vehicle ON community_repair_reports(vehicle_id);
CREATE INDEX idx_repair_reports_service ON community_repair_reports(service_type);
CREATE INDEX idx_repair_reports_user ON community_repair_reports(user_id);

-- Pre-computed repair cost aggregates
CREATE TABLE community_repair_aggregates (
  id SERIAL PRIMARY KEY,
  vehicle_id INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  service_type VARCHAR(50) NOT NULL,
  avg_cost_cents INTEGER,
  median_cost_cents INTEGER,
  min_cost_cents INTEGER,
  max_cost_cents INTEGER,
  report_count INTEGER,
  confidence_level VARCHAR(10),
  computed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(vehicle_id, service_type)
);

-- Community tips
CREATE TABLE community_tips (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vehicle_make VARCHAR(50),
  vehicle_model VARCHAR(100),
  gig_platform VARCHAR(20),
  title VARCHAR(150) NOT NULL,
  body TEXT NOT NULL,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tips_make ON community_tips(vehicle_make);

-- Voting (prevent double votes)
CREATE TABLE repair_report_votes (
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  report_id INTEGER REFERENCES community_repair_reports(id) ON DELETE CASCADE,
  vote SMALLINT NOT NULL,
  PRIMARY KEY(user_id, report_id)
);

CREATE TABLE tip_votes (
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  tip_id INTEGER REFERENCES community_tips(id) ON DELETE CASCADE,
  vote SMALLINT NOT NULL,
  PRIMARY KEY(user_id, tip_id)
);

-- Gamification
CREATE TABLE user_badges (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_type VARCHAR(30) NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_type)
);

CREATE TABLE user_stats (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  total_repair_reports INTEGER DEFAULT 0,
  total_tips INTEGER DEFAULT 0,
  total_upvotes_received INTEGER DEFAULT 0,
  current_streak_days INTEGER DEFAULT 0,
  longest_streak_days INTEGER DEFAULT 0,
  last_contribution_date DATE,
  reputation_score INTEGER DEFAULT 0
);
