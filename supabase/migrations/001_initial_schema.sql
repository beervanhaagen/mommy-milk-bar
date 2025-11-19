-- =====================================================
-- MOMMY MILK BAR - Initial Database Schema
-- =====================================================
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/lqmnkdqyoxytyyxuglhx/sql
--
-- This creates:
-- 1. Core tables (users, profiles, babies, drinks, etc.)
-- 2. Indexes for performance
-- 3. Functions & triggers
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 1. USER PROFILES
-- =====================================================

CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,

  -- Personal info (sensitive - will encrypt client-side for extra security)
  mother_name TEXT,
  mother_birthdate DATE,
  weight_kg DECIMAL(5,2),
  height_cm INTEGER,

  -- Preferences
  safety_mode TEXT DEFAULT 'normal' CHECK (safety_mode IN ('normal', 'cautious')),
  notifications_enabled BOOLEAN DEFAULT true,

  -- Onboarding
  has_completed_onboarding BOOLEAN DEFAULT false,
  onboarding_completed_at TIMESTAMP WITH TIME ZONE,

  -- Consent & Privacy
  consent_version TEXT DEFAULT '1.0.0',
  marketing_consent BOOLEAN DEFAULT false,
  analytics_consent BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for performance
CREATE INDEX idx_profiles_last_active ON profiles(last_active_at);

-- =====================================================
-- 2. BABIES
-- =====================================================

CREATE TABLE babies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  -- Baby info (sensitive)
  name TEXT,
  birthdate DATE NOT NULL,
  weight_kg DECIMAL(5,2),
  length_cm INTEGER,

  -- Feeding preferences
  feeding_type TEXT CHECK (feeding_type IN ('breast', 'formula', 'mix')),
  feeds_per_day INTEGER CHECK (feeds_per_day >= 0 AND feeds_per_day <= 20),
  typical_amount_ml INTEGER,
  pump_preference TEXT CHECK (pump_preference IN ('yes', 'no', 'later')),

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_babies_user_id ON babies(user_id);
CREATE INDEX idx_babies_active ON babies(user_id, is_active) WHERE is_active = true;

-- =====================================================
-- 3. DRINK SESSIONS
-- =====================================================

CREATE TABLE drink_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  baby_id UUID REFERENCES babies(id) ON DELETE SET NULL,

  -- Session details
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  mode TEXT DEFAULT 'now' CHECK (mode IN ('now', 'backfill', 'plan_ahead')),

  -- Calculations
  total_standard_drinks DECIMAL(5,2) DEFAULT 0,
  predicted_safe_at TIMESTAMP WITH TIME ZONE,
  weight_kg_at_session DECIMAL(5,2), -- Snapshot for historical accuracy

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_sessions_user_started ON drink_sessions(user_id, started_at DESC);
CREATE INDEX idx_sessions_active ON drink_sessions(user_id, completed_at) WHERE completed_at IS NULL;
CREATE INDEX idx_sessions_baby ON drink_sessions(baby_id, started_at DESC);

-- =====================================================
-- 4. DRINKS (Individual drinks within sessions)
-- =====================================================

CREATE TABLE drinks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id UUID REFERENCES drink_sessions(id) ON DELETE CASCADE NOT NULL,

  -- Drink details
  type TEXT NOT NULL, -- 'wine', 'beer', 'cocktail', etc.
  name TEXT NOT NULL,
  quantity DECIMAL(6,2) NOT NULL, -- in ml
  alcohol_content DECIMAL(4,2) NOT NULL, -- percentage (e.g., 12.5)
  standard_drinks DECIMAL(5,2) NOT NULL, -- calculated

  -- Timing
  consumed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_drinks_session ON drinks(session_id, consumed_at);
CREATE INDEX idx_drinks_type ON drinks(type); -- For analytics

-- =====================================================
-- 5. FEEDING LOGS (For pattern analysis & ML)
-- =====================================================

CREATE TABLE feeding_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  baby_id UUID REFERENCES babies(id) ON DELETE CASCADE NOT NULL,

  -- Feeding details
  type TEXT CHECK (type IN ('breast', 'bottle', 'pump')),
  fed_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER,
  amount_ml INTEGER,
  notes TEXT,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for pattern analysis
CREATE INDEX idx_feeding_baby_time ON feeding_logs(baby_id, fed_at DESC);
-- Note: Removed partial index with NOW() - not supported in index predicate
-- The idx_feeding_baby_time index above is sufficient for query performance

-- =====================================================
-- 6. CONTENT & TIPS (CMS)
-- =====================================================

CREATE TABLE content_tips (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

  -- Content
  category TEXT NOT NULL CHECK (category IN ('safety', 'planning', 'health', 'general', 'milestone')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,

  -- Targeting (for personalization)
  target_baby_age_min_days INTEGER, -- null = no minimum
  target_baby_age_max_days INTEGER, -- null = no maximum
  target_feeding_types TEXT[], -- ['breast', 'mix'] or null for all

  -- Display
  priority INTEGER DEFAULT 0, -- Higher = shown first
  is_active BOOLEAN DEFAULT true,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for tip selection
CREATE INDEX idx_tips_active ON content_tips(is_active, priority DESC) WHERE is_active = true;
CREATE INDEX idx_tips_baby_age ON content_tips(target_baby_age_min_days, target_baby_age_max_days);

-- =====================================================
-- 7. USER TIP INTERACTIONS (For personalization)
-- =====================================================

CREATE TABLE user_tip_interactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  tip_id UUID REFERENCES content_tips(id) ON DELETE CASCADE NOT NULL,

  -- Interaction
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  helpful BOOLEAN, -- null = not rated, true = helpful, false = not helpful
  dismissed BOOLEAN DEFAULT false,

  -- Constraint: one interaction per user per tip
  UNIQUE(user_id, tip_id)
);

-- Indexes
CREATE INDEX idx_interactions_user ON user_tip_interactions(user_id, viewed_at DESC);
CREATE INDEX idx_interactions_tip ON user_tip_interactions(tip_id);

-- =====================================================
-- 8. ANALYTICS EVENTS (Privacy-first, anonymized)
-- =====================================================

CREATE TABLE analytics_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- Nullable for anonymization

  -- Event data
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}'::jsonb,

  -- Timing
  occurred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Auto-anonymization flag
  anonymized BOOLEAN DEFAULT false
);

-- Indexes
CREATE INDEX idx_events_type_time ON analytics_events(event_type, occurred_at DESC);
CREATE INDEX idx_events_user ON analytics_events(user_id, occurred_at DESC) WHERE user_id IS NOT NULL;
CREATE INDEX idx_events_anonymize ON analytics_events(occurred_at) WHERE anonymized = false;

-- =====================================================
-- 9. DATA REQUESTS (GDPR Compliance)
-- =====================================================

CREATE TABLE data_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  -- Request details
  request_type TEXT NOT NULL CHECK (request_type IN ('export', 'delete')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),

  -- Result
  export_url TEXT, -- For export requests
  error_message TEXT, -- If failed

  -- Timing
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_requests_user_status ON data_requests(user_id, status, requested_at DESC);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Auto-update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_babies_updated_at BEFORE UPDATE ON babies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON drink_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tips_updated_at BEFORE UPDATE ON content_tips
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-update total_standard_drinks on drink insert/update/delete
CREATE OR REPLACE FUNCTION update_session_total_drinks()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE drink_sessions
  SET total_standard_drinks = (
    SELECT COALESCE(SUM(standard_drinks), 0)
    FROM drinks
    WHERE session_id = COALESCE(NEW.session_id, OLD.session_id)
  )
  WHERE id = COALESCE(NEW.session_id, OLD.session_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_session_drinks_insert AFTER INSERT ON drinks
  FOR EACH ROW EXECUTE FUNCTION update_session_total_drinks();

CREATE TRIGGER update_session_drinks_update AFTER UPDATE ON drinks
  FOR EACH ROW EXECUTE FUNCTION update_session_total_drinks();

CREATE TRIGGER update_session_drinks_delete AFTER DELETE ON drinks
  FOR EACH ROW EXECUTE FUNCTION update_session_total_drinks();

-- =====================================================
-- INITIAL SEED DATA (Sample tips)
-- =====================================================

INSERT INTO content_tips (category, title, content, target_baby_age_min_days, target_baby_age_max_days, priority) VALUES
('safety', 'Veilige tijd berekenen', 'De vuistregel: 2-3 uur per standaard drankje. Maar Mimi berekent dit nauwkeuriger op basis van jouw gewicht!', 0, NULL, 100),
('planning', 'Plan vooruit met de Smart Planner', 'Heb je binnenkort een feestje? Gebruik de planner om van tevoren te zien wanneer je weer veilig kunt voeden.', 0, NULL, 90),
('health', 'Hydratie is belangrijk', 'Drink veel water, zeker na alcoholgebruik. Dit helpt je lichaam sneller te herstellen.', 0, NULL, 80),
('milestone', 'Baby is 3 maanden!', 'Je baby is nu 3 maanden oud. Het voedingsritme wordt vaak regelmatiger rond deze tijd.', 75, 105, 70),
('general', 'Alcohol en borstvoeding', 'Alcohol passeert direct in je melk. Het hoogste niveau is 30-60 minuten na consumptie.', 0, NULL, 60);

-- Done! Schema created successfully.
