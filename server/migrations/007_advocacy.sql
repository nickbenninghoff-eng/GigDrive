-- Phase 10: Driver advocacy, portable ratings, satisfaction surveys

-- Driver portable profile/ratings
CREATE TABLE driver_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total_trips INTEGER DEFAULT 0,
  total_miles NUMERIC(10,1) DEFAULT 0,
  years_driving NUMERIC(3,1) DEFAULT 0,
  platforms_active TEXT[],
  avg_rating NUMERIC(3,2),
  specialties TEXT[],
  bio TEXT,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Driver satisfaction surveys
CREATE TABLE satisfaction_surveys (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  platform VARCHAR(20) NOT NULL,
  survey_month DATE NOT NULL,
  overall_satisfaction SMALLINT NOT NULL CHECK (overall_satisfaction BETWEEN 1 AND 5),
  pay_fairness SMALLINT CHECK (pay_fairness BETWEEN 1 AND 5),
  app_quality SMALLINT CHECK (app_quality BETWEEN 1 AND 5),
  support_quality SMALLINT CHECK (support_quality BETWEEN 1 AND 5),
  safety_feeling SMALLINT CHECK (safety_feeling BETWEEN 1 AND 5),
  deactivation_fear SMALLINT CHECK (deactivation_fear BETWEEN 1 AND 5),
  would_recommend BOOLEAN,
  comments TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, platform, survey_month)
);

CREATE INDEX idx_surveys_platform ON satisfaction_surveys(platform, survey_month);

-- Aggregated satisfaction index
CREATE TABLE satisfaction_index (
  id SERIAL PRIMARY KEY,
  platform VARCHAR(20) NOT NULL,
  survey_month DATE NOT NULL,
  avg_overall NUMERIC(3,2),
  avg_pay_fairness NUMERIC(3,2),
  avg_app_quality NUMERIC(3,2),
  avg_support_quality NUMERIC(3,2),
  avg_safety NUMERIC(3,2),
  avg_deactivation_fear NUMERIC(3,2),
  recommend_pct NUMERIC(4,1),
  response_count INTEGER DEFAULT 0,
  computed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(platform, survey_month)
);

-- Know Your Rights content
CREATE TABLE rights_guides (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(200) NOT NULL,
  category VARCHAR(50) NOT NULL,
  body TEXT NOT NULL,
  state VARCHAR(2),
  platform VARCHAR(20),
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed some guides
INSERT INTO rights_guides (slug, title, category, body, platform) VALUES
  ('deactivation-appeal', 'How to Appeal a Deactivation', 'deactivation', 'If you''ve been deactivated, you have the right to appeal. Here''s a step-by-step guide...', NULL),
  ('uber-deactivation-process', 'Uber Deactivation: What You Need to Know', 'deactivation', 'Uber''s deactivation policy allows for appeals within 30 days...', 'uber'),
  ('lyft-deactivation-process', 'Lyft Deactivation Appeal Process', 'deactivation', 'Lyft provides a deactivation review form accessible from your driver dashboard...', 'lyft'),
  ('tax-standard-mileage', 'IRS Standard Mileage Deduction Guide', 'tax', 'For 2026, the IRS standard mileage rate is estimated at $0.70 per mile for business use...', NULL),
  ('tax-actual-expenses', 'Actual Expense Method for Gig Drivers', 'tax', 'If your actual vehicle expenses exceed the standard mileage deduction, you may benefit from itemizing...', NULL),
  ('independent-contractor-rights', 'Your Rights as an Independent Contractor', 'rights', 'As a gig worker, you are classified as an independent contractor. Here are your key rights...', NULL),
  ('insurance-coverage-gaps', 'Insurance Coverage Gaps for Rideshare', 'insurance', 'Most personal auto insurance policies do not cover accidents while driving for a rideshare company...', NULL),
  ('safety-tips-rideshare', 'Safety Tips for Rideshare Drivers', 'safety', 'Your personal safety should always be priority number one. Here are essential tips...', NULL);

-- Deactivation reports (community tracking)
CREATE TABLE deactivation_reports (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  platform VARCHAR(20) NOT NULL,
  reason VARCHAR(100),
  was_appealed BOOLEAN DEFAULT false,
  appeal_result VARCHAR(20),
  description TEXT,
  reported_at TIMESTAMPTZ DEFAULT NOW()
);
