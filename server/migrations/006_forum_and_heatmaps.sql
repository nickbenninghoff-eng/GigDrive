-- Phase 9: Community forum + demand heatmaps

-- Forum channels
CREATE TABLE forum_channels (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  channel_type VARCHAR(20) NOT NULL DEFAULT 'general',
  icon VARCHAR(10),
  post_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default channels
INSERT INTO forum_channels (slug, name, description, channel_type, icon) VALUES
  ('general', 'General Discussion', 'Anything gig driving related', 'general', '💬'),
  ('uber', 'Uber Drivers', 'Tips, issues, and strategies for Uber', 'platform', '🚗'),
  ('lyft', 'Lyft Drivers', 'All things Lyft', 'platform', '🚗'),
  ('doordash', 'DoorDash Dashers', 'Food delivery discussion', 'platform', '🍔'),
  ('instacart', 'Instacart Shoppers', 'Grocery delivery talk', 'platform', '🛒'),
  ('amazon-flex', 'Amazon Flex', 'Package delivery discussion', 'platform', '📦'),
  ('vehicle-maintenance', 'Vehicle Maintenance', 'Repair tips and DIY guides', 'topic', '🔧'),
  ('tax-deductions', 'Tax & Deductions', 'Maximize your deductions', 'topic', '💰'),
  ('new-drivers', 'New Driver Advice', 'Getting started with gig driving', 'topic', '🆕'),
  ('market-talk', 'Market Talk', 'Best times, areas, and strategies by city', 'market', '📍');

-- Forum posts
CREATE TABLE forum_posts (
  id SERIAL PRIMARY KEY,
  channel_id INTEGER NOT NULL REFERENCES forum_channels(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  body TEXT NOT NULL,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT false,
  vehicle_make VARCHAR(50),
  vehicle_model VARCHAR(100),
  gig_platform VARCHAR(20),
  city VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_forum_posts_channel ON forum_posts(channel_id, created_at DESC);
CREATE INDEX idx_forum_posts_user ON forum_posts(user_id);
CREATE INDEX idx_forum_posts_platform ON forum_posts(gig_platform);

-- Forum replies
CREATE TABLE forum_replies (
  id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_reply_id INTEGER REFERENCES forum_replies(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_forum_replies_post ON forum_replies(post_id, created_at);

-- Forum post votes
CREATE TABLE forum_post_votes (
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  post_id INTEGER REFERENCES forum_posts(id) ON DELETE CASCADE,
  vote SMALLINT NOT NULL,
  PRIMARY KEY(user_id, post_id)
);

-- Forum reply votes
CREATE TABLE forum_reply_votes (
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  reply_id INTEGER REFERENCES forum_replies(id) ON DELETE CASCADE,
  vote SMALLINT NOT NULL,
  PRIMARY KEY(user_id, reply_id)
);

-- Demand heatmap data (anonymized driver activity)
CREATE TABLE demand_heatmap_data (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  zip_code VARCHAR(10) NOT NULL,
  day_of_week SMALLINT NOT NULL,
  hour_of_day SMALLINT NOT NULL,
  platform VARCHAR(20),
  trips_completed INTEGER DEFAULT 1,
  avg_earnings_cents INTEGER,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_heatmap_zip ON demand_heatmap_data(zip_code);
CREATE INDEX idx_heatmap_time ON demand_heatmap_data(day_of_week, hour_of_day);

-- Aggregated demand by zip/time (precomputed)
CREATE TABLE demand_heatmap_aggregates (
  id SERIAL PRIMARY KEY,
  zip_code VARCHAR(10) NOT NULL,
  day_of_week SMALLINT NOT NULL,
  hour_of_day SMALLINT NOT NULL,
  platform VARCHAR(20),
  avg_trips NUMERIC(5,1),
  avg_earnings_cents INTEGER,
  demand_level VARCHAR(10),
  sample_size INTEGER DEFAULT 0,
  computed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(zip_code, day_of_week, hour_of_day, platform)
);
