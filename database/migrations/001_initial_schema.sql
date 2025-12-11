-- =====================================================
-- MOMMY MILK BAR - Master Database Schema
-- =====================================================
-- Version: 2.0
-- Date: 2025-12-03
-- Description: Complete database schema with privacy-first design,
--              GDPR compliance, and Supabase-native auth integration
--
-- Run this migration in a fresh database.
-- This replaces all previous fragmented migrations.
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- PART 1: CORE TABLES
-- =====================================================

-- -----------------------------------------------------
-- 1. USER PROFILES
-- -----------------------------------------------------
-- Stores mother's profile data and app settings
-- Links to auth.users via ON DELETE CASCADE
-- No email stored here (use auth.users.email)

CREATE TABLE profiles (
  -- Identity (must match auth.users.id)
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,

  -- Physical data (for alcohol metabolism calculations)
  weight_kg DECIMAL(5,2) CHECK (weight_kg > 0 AND weight_kg < 300),

  -- App preferences
  safety_mode TEXT DEFAULT 'cautious' CHECK (safety_mode IN ('normal', 'cautious')) NOT NULL,
  notifications_enabled BOOLEAN DEFAULT true NOT NULL,

  -- Onboarding status
  has_completed_onboarding BOOLEAN DEFAULT false NOT NULL,
  onboarding_completed_at TIMESTAMP WITH TIME ZONE,

  -- GDPR Consent (all required for app use)
  consent_version TEXT DEFAULT '1.0.0' NOT NULL,
  age_consent BOOLEAN DEFAULT false NOT NULL,
  medical_disclaimer_consent BOOLEAN DEFAULT false NOT NULL,
  privacy_policy_consent BOOLEAN DEFAULT false NOT NULL,
  marketing_consent BOOLEAN DEFAULT false NOT NULL,
  analytics_consent BOOLEAN DEFAULT false NOT NULL,
  consent_given_at TIMESTAMP WITH TIME ZONE, -- When user accepted consent

  -- GDPR Compliance fields
  processing_basis TEXT DEFAULT 'consent' CHECK (processing_basis IN ('consent', 'contract', 'legal_obligation')) NOT NULL,
  data_retention_years INTEGER DEFAULT 2 CHECK (data_retention_years >= 1 AND data_retention_years <= 7) NOT NULL,

  -- Optional features
  timezone TEXT, -- e.g., 'Europe/Amsterdam' for accurate time predictions

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Index for finding active users
CREATE INDEX idx_profiles_last_active ON profiles(last_active_at);

-- Index for GDPR compliance queries
CREATE INDEX idx_profiles_retention ON profiles(created_at, data_retention_years);

COMMENT ON TABLE profiles IS 'Mother profile data and app settings';
COMMENT ON COLUMN profiles.weight_kg IS 'Used for alcohol metabolism calculations';
COMMENT ON COLUMN profiles.safety_mode IS 'Cautious adds 10% safety buffer';
COMMENT ON COLUMN profiles.consent_given_at IS 'GDPR: When user accepted terms';
COMMENT ON COLUMN profiles.processing_basis IS 'GDPR: Legal basis for data processing';
COMMENT ON COLUMN profiles.data_retention_years IS 'GDPR: How long to keep user data';

-- -----------------------------------------------------
-- 2. BABIES
-- -----------------------------------------------------
-- Stores baby data for feeding calculations
-- One mother can have multiple babies

CREATE TABLE babies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  -- Display info (privacy-first: use labels, not real names)
  display_label TEXT NOT NULL DEFAULT 'Baby',
  birthdate DATE NOT NULL,

  -- Feeding preferences
  feeding_type TEXT CHECK (feeding_type IN ('breast', 'formula', 'mix')),
  feeds_per_day INTEGER CHECK (feeds_per_day >= 0 AND feeds_per_day <= 20),
  typical_amount_ml INTEGER CHECK (typical_amount_ml > 0 AND typical_amount_ml < 500),
  pump_preference TEXT CHECK (pump_preference IN ('yes', 'no', 'later')),

  -- Status
  is_active BOOLEAN DEFAULT true NOT NULL,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

  -- Constraint: birthdate cannot be in the future
  CONSTRAINT birthdate_not_future CHECK (birthdate <= CURRENT_DATE)
);

-- Indexes for common queries
CREATE INDEX idx_babies_user_id ON babies(user_id);
CREATE INDEX idx_babies_active ON babies(user_id, is_active) WHERE is_active = true;
CREATE INDEX idx_babies_birthdate ON babies(birthdate); -- For age-based content

COMMENT ON TABLE babies IS 'Baby data for feeding calculations and content personalization';
COMMENT ON COLUMN babies.display_label IS 'Privacy-first: use "Baby 1" not real names';
COMMENT ON COLUMN babies.birthdate IS 'Used for age-appropriate content, not precise tracking';

-- -----------------------------------------------------
-- 3. DRINK SESSIONS
-- -----------------------------------------------------
-- Tracks alcohol consumption sessions

CREATE TABLE drink_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  baby_id UUID REFERENCES babies(id) ON DELETE SET NULL,

  -- Session details
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  mode TEXT DEFAULT 'now' CHECK (mode IN ('now', 'backfill', 'plan_ahead')) NOT NULL,

  -- Calculations
  total_standard_drinks DECIMAL(5,2) DEFAULT 0 NOT NULL CHECK (total_standard_drinks >= 0),
  predicted_safe_at TIMESTAMP WITH TIME ZONE,
  weight_kg_at_session DECIMAL(5,2), -- Snapshot for historical accuracy

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

  -- Constraint: completed_at must be after started_at
  CONSTRAINT session_time_order CHECK (completed_at IS NULL OR completed_at >= started_at)
);

-- Indexes for common queries
CREATE INDEX idx_sessions_user_started ON drink_sessions(user_id, started_at DESC);
CREATE INDEX idx_sessions_active ON drink_sessions(user_id, completed_at) WHERE completed_at IS NULL;
CREATE INDEX idx_sessions_baby ON drink_sessions(baby_id, started_at DESC);
CREATE INDEX idx_sessions_safe_time ON drink_sessions(user_id, predicted_safe_at);

COMMENT ON TABLE drink_sessions IS 'Alcohol consumption sessions for safety calculations';
COMMENT ON COLUMN drink_sessions.mode IS 'now=real-time, backfill=past entry, plan_ahead=future planning';
COMMENT ON COLUMN drink_sessions.weight_kg_at_session IS 'Snapshot of weight for accurate historical recalculation';

-- -----------------------------------------------------
-- 4. DRINKS
-- -----------------------------------------------------
-- Individual drinks within sessions

CREATE TABLE drinks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES drink_sessions(id) ON DELETE CASCADE NOT NULL,

  -- Drink details
  type TEXT NOT NULL, -- 'wine', 'beer', 'cocktail', 'spirits'
  name TEXT NOT NULL,
  quantity DECIMAL(6,2) NOT NULL CHECK (quantity > 0), -- in ml
  alcohol_content DECIMAL(4,2) NOT NULL CHECK (alcohol_content >= 0 AND alcohol_content <= 100), -- percentage
  standard_drinks DECIMAL(5,2) NOT NULL CHECK (standard_drinks >= 0),

  -- Timing
  consumed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_drinks_session ON drinks(session_id, consumed_at);
CREATE INDEX idx_drinks_type ON drinks(type); -- For analytics on popular drinks

COMMENT ON TABLE drinks IS 'Individual drinks within drinking sessions';
COMMENT ON COLUMN drinks.standard_drinks IS 'Calculated: (quantity * alcohol_content * 0.789) / 10g';

-- -----------------------------------------------------
-- 5. FEEDING LOGS
-- -----------------------------------------------------
-- Tracks feeding patterns for baby rhythm analysis

CREATE TABLE feeding_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  baby_id UUID REFERENCES babies(id) ON DELETE CASCADE NOT NULL,

  -- Feeding details
  type TEXT CHECK (type IN ('breast', 'bottle', 'pump')),
  fed_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER CHECK (duration_minutes >= 0 AND duration_minutes <= 180),
  amount_ml INTEGER CHECK (amount_ml >= 0 AND amount_ml <= 500),
  notes TEXT,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Indexes for pattern analysis
CREATE INDEX idx_feeding_baby_time ON feeding_logs(baby_id, fed_at DESC);

COMMENT ON TABLE feeding_logs IS 'Feeding logs for pattern analysis and rhythm predictions';

-- -----------------------------------------------------
-- 6. CONTENT TIPS (CMS)
-- -----------------------------------------------------
-- Educational content and tips

CREATE TABLE content_tips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Content
  category TEXT NOT NULL CHECK (category IN ('safety', 'planning', 'health', 'general', 'milestone')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,

  -- Targeting (for personalization)
  target_baby_age_min_days INTEGER CHECK (target_baby_age_min_days >= 0),
  target_baby_age_max_days INTEGER CHECK (target_baby_age_max_days >= 0),
  target_feeding_types TEXT[], -- ['breast', 'mix'] or NULL for all

  -- Display
  priority INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true NOT NULL,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

  -- Constraint: age range must be valid
  CONSTRAINT age_range_valid CHECK (
    target_baby_age_max_days IS NULL OR
    target_baby_age_min_days IS NULL OR
    target_baby_age_max_days >= target_baby_age_min_days
  )
);

-- Indexes for tip selection
CREATE INDEX idx_tips_active ON content_tips(is_active, priority DESC) WHERE is_active = true;
CREATE INDEX idx_tips_baby_age ON content_tips(target_baby_age_min_days, target_baby_age_max_days);
CREATE INDEX idx_tips_category ON content_tips(category, is_active) WHERE is_active = true;

COMMENT ON TABLE content_tips IS 'Educational content and tips (CMS)';

-- -----------------------------------------------------
-- 7. USER TIP INTERACTIONS
-- -----------------------------------------------------
-- Tracks user engagement with tips for personalization

CREATE TABLE user_tip_interactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  tip_id UUID REFERENCES content_tips(id) ON DELETE CASCADE NOT NULL,

  -- Interaction
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  helpful BOOLEAN, -- NULL = not rated, true/false = rated
  dismissed BOOLEAN DEFAULT false NOT NULL,

  -- Constraint: one interaction per user per tip
  UNIQUE(user_id, tip_id)
);

-- Indexes
CREATE INDEX idx_interactions_user ON user_tip_interactions(user_id, viewed_at DESC);
CREATE INDEX idx_interactions_tip ON user_tip_interactions(tip_id);

COMMENT ON TABLE user_tip_interactions IS 'User engagement with tips for personalization';

-- -----------------------------------------------------
-- 8. ANALYTICS EVENTS (Privacy-First)
-- -----------------------------------------------------
-- Usage analytics with auto-anonymization

CREATE TABLE analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- Nullable for anonymization

  -- Event data
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}'::jsonb,

  -- Timing
  occurred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

  -- Privacy flag
  anonymized BOOLEAN DEFAULT false NOT NULL
);

-- Indexes
CREATE INDEX idx_events_type_time ON analytics_events(event_type, occurred_at DESC);
CREATE INDEX idx_events_user ON analytics_events(user_id, occurred_at DESC) WHERE user_id IS NOT NULL;
CREATE INDEX idx_events_anonymize ON analytics_events(occurred_at) WHERE anonymized = false;

COMMENT ON TABLE analytics_events IS 'Privacy-first analytics with auto-anonymization after 90 days';
COMMENT ON COLUMN analytics_events.anonymized IS 'True when user_id has been removed for privacy';

-- -----------------------------------------------------
-- 9. DATA REQUESTS (GDPR Compliance)
-- -----------------------------------------------------
-- Handles GDPR data export and deletion requests

CREATE TABLE data_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  -- Request details
  request_type TEXT NOT NULL CHECK (request_type IN ('export', 'delete')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')) NOT NULL,

  -- Result
  export_url TEXT,
  error_message TEXT,

  -- Timing
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_requests_user_status ON data_requests(user_id, status, requested_at DESC);
CREATE INDEX idx_requests_pending ON data_requests(status, requested_at) WHERE status = 'pending';

COMMENT ON TABLE data_requests IS 'GDPR data export and deletion requests';

-- -----------------------------------------------------
-- 10. AUDIT LOG (Security & Compliance)
-- -----------------------------------------------------
-- Security monitoring and compliance audit trail

CREATE TABLE audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- User info (nullable for system actions)
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- Action details
  action TEXT NOT NULL CHECK (action IN (
    'account_created',
    'account_deleted',
    'data_exported',
    'profile_updated',
    'baby_created',
    'baby_updated',
    'baby_deleted',
    'password_changed',
    'email_verified',
    'consent_updated'
  )),

  -- Resource info
  resource_type TEXT CHECK (resource_type IN ('profile', 'baby', 'drink_session', 'auth', 'data')),
  resource_id TEXT,

  -- Security context (hashed for privacy)
  ip_address_hash TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamp
  occurred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Indexes for querying
CREATE INDEX idx_audit_user_time ON audit_log(user_id, occurred_at DESC) WHERE user_id IS NOT NULL;
CREATE INDEX idx_audit_action_time ON audit_log(action, occurred_at DESC);
CREATE INDEX idx_audit_ip_hash ON audit_log(ip_address_hash, occurred_at DESC) WHERE ip_address_hash IS NOT NULL;
CREATE INDEX idx_audit_cleanup ON audit_log(occurred_at); -- For retention cleanup

COMMENT ON TABLE audit_log IS 'Security monitoring and compliance audit trail';
COMMENT ON COLUMN audit_log.ip_address_hash IS 'SHA256 hash of IP for security, not raw IP';

-- =====================================================
-- PART 2: TRIGGERS
-- =====================================================

-- -----------------------------------------------------
-- Auto-update updated_at timestamps
-- -----------------------------------------------------

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_babies_updated_at
  BEFORE UPDATE ON babies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at
  BEFORE UPDATE ON drink_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tips_updated_at
  BEFORE UPDATE ON content_tips
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- -----------------------------------------------------
-- Auto-update total_standard_drinks on drink changes
-- -----------------------------------------------------

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

CREATE TRIGGER update_session_drinks_insert
  AFTER INSERT ON drinks
  FOR EACH ROW EXECUTE FUNCTION update_session_total_drinks();

CREATE TRIGGER update_session_drinks_update
  AFTER UPDATE ON drinks
  FOR EACH ROW EXECUTE FUNCTION update_session_total_drinks();

CREATE TRIGGER update_session_drinks_delete
  AFTER DELETE ON drinks
  FOR EACH ROW EXECUTE FUNCTION update_session_total_drinks();

-- -----------------------------------------------------
-- Audit logging triggers
-- -----------------------------------------------------

-- Helper function to log audit events
CREATE OR REPLACE FUNCTION log_audit_event(
  p_user_id UUID,
  p_action TEXT,
  p_resource_type TEXT DEFAULT NULL,
  p_resource_id TEXT DEFAULT NULL,
  p_ip_hash TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO audit_log (user_id, action, resource_type, resource_id, ip_address_hash, metadata)
  VALUES (p_user_id, p_action, p_resource_type, p_resource_id, p_ip_hash, p_metadata)
  RETURNING id INTO log_id;

  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Log profile updates
CREATE OR REPLACE FUNCTION log_profile_update()
RETURNS TRIGGER AS $$
DECLARE
  changed_fields TEXT[];
BEGIN
  -- Collect changed fields
  changed_fields := ARRAY[]::TEXT[];

  IF OLD.weight_kg IS DISTINCT FROM NEW.weight_kg THEN
    changed_fields := array_append(changed_fields, 'weight_kg');
  END IF;

  IF OLD.safety_mode IS DISTINCT FROM NEW.safety_mode THEN
    changed_fields := array_append(changed_fields, 'safety_mode');
  END IF;

  IF OLD.marketing_consent IS DISTINCT FROM NEW.marketing_consent OR
     OLD.analytics_consent IS DISTINCT FROM NEW.analytics_consent THEN
    changed_fields := array_append(changed_fields, 'consent');
  END IF;

  -- Only log if significant changes occurred
  IF array_length(changed_fields, 1) > 0 THEN
    PERFORM log_audit_event(
      NEW.id,
      'profile_updated',
      'profile',
      NEW.id::text,
      NULL,
      jsonb_build_object('fields_changed', changed_fields)
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profile_update_audit
  AFTER UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION log_profile_update();

-- Trigger: Log baby creation
CREATE OR REPLACE FUNCTION log_baby_created()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM log_audit_event(
    NEW.user_id,
    'baby_created',
    'baby',
    NEW.id::text
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER baby_created_audit
  AFTER INSERT ON babies
  FOR EACH ROW
  EXECUTE FUNCTION log_baby_created();

-- Trigger: Log baby deletion
CREATE OR REPLACE FUNCTION log_baby_deleted()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM log_audit_event(
    OLD.user_id,
    'baby_deleted',
    'baby',
    OLD.id::text,
    NULL,
    jsonb_build_object('label', OLD.display_label)
  );

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER baby_deleted_audit
  BEFORE DELETE ON babies
  FOR EACH ROW
  EXECUTE FUNCTION log_baby_deleted();

-- =====================================================
-- PART 3: ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE babies ENABLE ROW LEVEL SECURITY;
ALTER TABLE drink_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE drinks ENABLE ROW LEVEL SECURITY;
ALTER TABLE feeding_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tip_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------
-- PROFILES: Users can only access their own profile
-- -----------------------------------------------------

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete own profile"
  ON profiles FOR DELETE
  USING (auth.uid() = id);

-- -----------------------------------------------------
-- BABIES: Users can only access their own babies
-- -----------------------------------------------------

CREATE POLICY "Users can view own babies"
  ON babies FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own babies"
  ON babies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own babies"
  ON babies FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own babies"
  ON babies FOR DELETE
  USING (auth.uid() = user_id);

-- -----------------------------------------------------
-- DRINK SESSIONS: Users can only access their own
-- -----------------------------------------------------

CREATE POLICY "Users can view own drink sessions"
  ON drink_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own drink sessions"
  ON drink_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own drink sessions"
  ON drink_sessions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own drink sessions"
  ON drink_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- -----------------------------------------------------
-- DRINKS: Users can only access drinks from their sessions
-- -----------------------------------------------------

CREATE POLICY "Users can view own drinks"
  ON drinks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM drink_sessions
      WHERE drink_sessions.id = drinks.session_id
      AND drink_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own drinks"
  ON drinks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM drink_sessions
      WHERE drink_sessions.id = drinks.session_id
      AND drink_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own drinks"
  ON drinks FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM drink_sessions
      WHERE drink_sessions.id = drinks.session_id
      AND drink_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own drinks"
  ON drinks FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM drink_sessions
      WHERE drink_sessions.id = drinks.session_id
      AND drink_sessions.user_id = auth.uid()
    )
  );

-- -----------------------------------------------------
-- FEEDING LOGS: Users can access logs for their babies
-- -----------------------------------------------------

CREATE POLICY "Users can view own feeding logs"
  ON feeding_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM babies
      WHERE babies.id = feeding_logs.baby_id
      AND babies.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own feeding logs"
  ON feeding_logs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM babies
      WHERE babies.id = feeding_logs.baby_id
      AND babies.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own feeding logs"
  ON feeding_logs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM babies
      WHERE babies.id = feeding_logs.baby_id
      AND babies.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own feeding logs"
  ON feeding_logs FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM babies
      WHERE babies.id = feeding_logs.baby_id
      AND babies.user_id = auth.uid()
    )
  );

-- -----------------------------------------------------
-- CONTENT TIPS: Read-only for all authenticated users
-- -----------------------------------------------------

CREATE POLICY "Authenticated users can view active tips"
  ON content_tips FOR SELECT
  USING (auth.uid() IS NOT NULL AND is_active = true);

-- Note: Only admins can insert/update/delete tips (via service role)

-- -----------------------------------------------------
-- USER TIP INTERACTIONS: Users can only access their own
-- -----------------------------------------------------

CREATE POLICY "Users can view own tip interactions"
  ON user_tip_interactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tip interactions"
  ON user_tip_interactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tip interactions"
  ON user_tip_interactions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- -----------------------------------------------------
-- ANALYTICS EVENTS: Users can insert their own events
-- -----------------------------------------------------

CREATE POLICY "Users can insert own analytics events"
  ON analytics_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Note: Reading analytics is admin-only via service role

-- -----------------------------------------------------
-- DATA REQUESTS: Users can manage their own requests
-- -----------------------------------------------------

CREATE POLICY "Users can view own data requests"
  ON data_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own data requests"
  ON data_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- -----------------------------------------------------
-- AUDIT LOG: Users can view their own audit entries
-- -----------------------------------------------------

CREATE POLICY "Users can view own audit logs"
  ON audit_log FOR SELECT
  USING (auth.uid() = user_id);

-- Note: Only system (service role) can insert audit logs
CREATE POLICY "Service role can insert audit logs"
  ON audit_log FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- PART 4: HELPER FUNCTIONS
-- =====================================================

-- -----------------------------------------------------
-- Check if user owns a baby
-- -----------------------------------------------------

CREATE OR REPLACE FUNCTION user_owns_baby(baby_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM babies
    WHERE id = baby_uuid AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- -----------------------------------------------------
-- Check if user owns a session
-- -----------------------------------------------------

CREATE OR REPLACE FUNCTION user_owns_session(session_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM drink_sessions
    WHERE id = session_uuid AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- PART 5: GDPR COMPLIANCE FUNCTIONS
-- =====================================================

-- -----------------------------------------------------
-- Export all user data (GDPR Right to Access)
-- -----------------------------------------------------

CREATE OR REPLACE FUNCTION export_user_data()
RETURNS JSONB AS $$
DECLARE
  result JSONB;
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT jsonb_build_object(
    'export_date', NOW(),
    'user_id', v_user_id,
    'profile', (
      SELECT row_to_json(p.*)
      FROM profiles p
      WHERE p.id = v_user_id
    ),
    'babies', (
      SELECT COALESCE(jsonb_agg(row_to_json(b.*)), '[]'::jsonb)
      FROM babies b
      WHERE b.user_id = v_user_id
    ),
    'drink_sessions', (
      SELECT COALESCE(jsonb_agg(row_to_json(ds.*)), '[]'::jsonb)
      FROM drink_sessions ds
      WHERE ds.user_id = v_user_id
    ),
    'drinks', (
      SELECT COALESCE(jsonb_agg(row_to_json(d.*)), '[]'::jsonb)
      FROM drinks d
      INNER JOIN drink_sessions ds ON d.session_id = ds.id
      WHERE ds.user_id = v_user_id
    ),
    'feeding_logs', (
      SELECT COALESCE(jsonb_agg(row_to_json(fl.*)), '[]'::jsonb)
      FROM feeding_logs fl
      INNER JOIN babies b ON fl.baby_id = b.id
      WHERE b.user_id = v_user_id
    ),
    'tip_interactions', (
      SELECT COALESCE(jsonb_agg(row_to_json(ti.*)), '[]'::jsonb)
      FROM user_tip_interactions ti
      WHERE ti.user_id = v_user_id
    )
  ) INTO result;

  -- Log the export request
  PERFORM log_audit_event(
    v_user_id,
    'data_exported',
    'data',
    v_user_id::text
  );

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- -----------------------------------------------------
-- Delete user data (GDPR Right to Erasure)
-- Called from Edge Function which also deletes auth.users
-- -----------------------------------------------------

CREATE OR REPLACE FUNCTION delete_user_data()
RETURNS BOOLEAN AS $$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Log deletion before removing data
  PERFORM log_audit_event(
    v_user_id,
    'account_deleted',
    'profile',
    v_user_id::text
  );

  -- Delete profile (CASCADE will handle rest)
  DELETE FROM profiles WHERE id = v_user_id;

  -- Anonymize related analytics (preserve for aggregate stats)
  UPDATE analytics_events
  SET user_id = NULL, anonymized = true
  WHERE user_id = v_user_id;

  -- Note: auth.users deletion must be done by Edge Function with service role

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- -----------------------------------------------------
-- Auto-anonymize old analytics events
-- -----------------------------------------------------

CREATE OR REPLACE FUNCTION anonymize_old_analytics()
RETURNS void AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  WITH updated AS (
    UPDATE analytics_events
    SET user_id = NULL, anonymized = true
    WHERE occurred_at < NOW() - INTERVAL '90 days'
    AND anonymized = false
    RETURNING id
  )
  SELECT count(*) INTO updated_count FROM updated;

  RAISE NOTICE 'Anonymized % analytics events older than 90 days', updated_count;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------
-- Cleanup old audit logs (keep 2 years)
-- -----------------------------------------------------

CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS void AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  WITH deleted AS (
    DELETE FROM audit_log
    WHERE occurred_at < NOW() - INTERVAL '2 years'
    RETURNING id
  )
  SELECT count(*) INTO deleted_count FROM deleted;

  RAISE NOTICE 'Deleted % audit log entries older than 2 years', deleted_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- PART 6: SEED DATA
-- =====================================================

-- Insert sample content tips
INSERT INTO content_tips (category, title, content, target_baby_age_min_days, target_baby_age_max_days, priority) VALUES
('safety', 'Veilige tijd berekenen', 'De vuistregel: 2-3 uur per standaard drankje. Maar Mimi berekent dit nauwkeuriger op basis van jouw gewicht!', 0, NULL, 100),
('planning', 'Plan vooruit met de Smart Planner', 'Heb je binnenkort een feestje? Gebruik de planner om van tevoren te zien wanneer je weer veilig kunt voeden.', 0, NULL, 90),
('health', 'Hydratie is belangrijk', 'Drink veel water, zeker na alcoholgebruik. Dit helpt je lichaam sneller te herstellen.', 0, NULL, 80),
('milestone', 'Baby is 3 maanden!', 'Je baby is nu 3 maanden oud. Het voedingsritme wordt vaak regelmatiger rond deze tijd.', 75, 105, 70),
('general', 'Alcohol en borstvoeding', 'Alcohol passeert direct in je melk. Het hoogste niveau is 30-60 minuten na consumptie.', 0, NULL, 60);

-- =====================================================
-- PART 7: VERIFICATION
-- =====================================================

DO $$
DECLARE
  table_count INTEGER;
  index_count INTEGER;
  trigger_count INTEGER;
  function_count INTEGER;
BEGIN
  -- Count created objects
  SELECT count(*) INTO table_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name IN ('profiles', 'babies', 'drink_sessions', 'drinks', 'feeding_logs',
                     'content_tips', 'user_tip_interactions', 'analytics_events',
                     'data_requests', 'audit_log');

  SELECT count(*) INTO index_count
  FROM pg_indexes
  WHERE schemaname = 'public';

  SELECT count(*) INTO trigger_count
  FROM pg_trigger t
  JOIN pg_class c ON t.tgrelid = c.oid
  JOIN pg_namespace n ON c.relnamespace = n.oid
  WHERE n.nspname = 'public'
  AND NOT t.tgisinternal;

  SELECT count(*) INTO function_count
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public'
  AND p.proname IN ('export_user_data', 'delete_user_data', 'user_owns_baby',
                    'user_owns_session', 'anonymize_old_analytics', 'cleanup_old_audit_logs');

  RAISE NOTICE '==============================================';
  RAISE NOTICE 'MIGRATION COMPLETED SUCCESSFULLY';
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'Tables created: %', table_count;
  RAISE NOTICE 'Indexes created: %', index_count;
  RAISE NOTICE 'Triggers created: %', trigger_count;
  RAISE NOTICE 'Functions created: %', function_count;
  RAISE NOTICE '';
  RAISE NOTICE 'NEXT STEPS:';
  RAISE NOTICE '1. Verify RLS is DISABLED on auth.users (Supabase managed)';
  RAISE NOTICE '2. Configure Supabase SMTP settings in Dashboard';
  RAISE NOTICE '3. Upload email templates to Supabase Auth';
  RAISE NOTICE '4. Test account creation flow';
  RAISE NOTICE '5. Test password reset flow';
  RAISE NOTICE '6. Test data export function';
  RAISE NOTICE '7. Test account deletion with CASCADE';
  RAISE NOTICE '==============================================';
END $$;

-- =====================================================
-- END OF MIGRATION
-- =====================================================
