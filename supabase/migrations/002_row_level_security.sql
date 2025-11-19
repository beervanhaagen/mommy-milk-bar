-- =====================================================
-- MOMMY MILK BAR - Row Level Security (RLS) Policies
-- =====================================================
-- This ensures users can ONLY access their own data.
-- Critical for GDPR compliance and data privacy.
-- =====================================================

-- =====================================================
-- 1. ENABLE RLS ON ALL TABLES
-- =====================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE babies ENABLE ROW LEVEL SECURITY;
ALTER TABLE drink_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE drinks ENABLE ROW LEVEL SECURITY;
ALTER TABLE feeding_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tip_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_requests ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 2. PROFILES - Users can only access their own profile
-- =====================================================

-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can insert their own profile (on signup)
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can delete their own profile
CREATE POLICY "Users can delete own profile"
  ON profiles FOR DELETE
  USING (auth.uid() = id);

-- =====================================================
-- 3. BABIES - Users can only access their own babies
-- =====================================================

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

-- =====================================================
-- 4. DRINK SESSIONS - Users can only access their own
-- =====================================================

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

-- =====================================================
-- 5. DRINKS - Users can only access drinks from their sessions
-- =====================================================

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

-- =====================================================
-- 6. FEEDING LOGS - Users can access logs for their babies
-- =====================================================

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

-- =====================================================
-- 7. CONTENT TIPS - Read-only for all authenticated users
-- =====================================================

CREATE POLICY "Authenticated users can view active tips"
  ON content_tips FOR SELECT
  USING (auth.uid() IS NOT NULL AND is_active = true);

-- Note: Only admins can insert/update/delete tips (handle via service role)

-- =====================================================
-- 8. USER TIP INTERACTIONS - Users can only access their own
-- =====================================================

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

-- =====================================================
-- 9. ANALYTICS EVENTS - Users can insert their own events
-- =====================================================

-- Users can insert events (but not read them - analytics is aggregate only)
CREATE POLICY "Users can insert own analytics events"
  ON analytics_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Note: Reading analytics is admin-only via service role

-- =====================================================
-- 10. DATA REQUESTS - Users can manage their own requests
-- =====================================================

CREATE POLICY "Users can view own data requests"
  ON data_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own data requests"
  ON data_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to check if current user owns a baby
CREATE OR REPLACE FUNCTION user_owns_baby(baby_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM babies
    WHERE id = baby_uuid AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if current user owns a session
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
-- GDPR COMPLIANCE FUNCTIONS
-- =====================================================

-- Function to export all user data (GDPR Right to Access)
CREATE OR REPLACE FUNCTION export_user_data()
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'export_date', NOW(),
    'user_id', auth.uid(),
    'profile', (SELECT row_to_json(p.*) FROM profiles p WHERE p.id = auth.uid()),
    'babies', (SELECT jsonb_agg(row_to_json(b.*)) FROM babies b WHERE b.user_id = auth.uid()),
    'drink_sessions', (SELECT jsonb_agg(row_to_json(ds.*)) FROM drink_sessions ds WHERE ds.user_id = auth.uid()),
    'drinks', (
      SELECT jsonb_agg(row_to_json(d.*))
      FROM drinks d
      INNER JOIN drink_sessions ds ON d.session_id = ds.id
      WHERE ds.user_id = auth.uid()
    ),
    'feeding_logs', (
      SELECT jsonb_agg(row_to_json(fl.*))
      FROM feeding_logs fl
      INNER JOIN babies b ON fl.baby_id = b.id
      WHERE b.user_id = auth.uid()
    )
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to completely delete user data (GDPR Right to Erasure)
CREATE OR REPLACE FUNCTION delete_user_data()
RETURNS BOOLEAN AS $$
BEGIN
  -- Delete all related data (cascades will handle most)
  DELETE FROM user_tip_interactions WHERE user_id = auth.uid();
  DELETE FROM analytics_events WHERE user_id = auth.uid();
  DELETE FROM data_requests WHERE user_id = auth.uid();

  -- Babies deletion will cascade to feeding_logs
  DELETE FROM babies WHERE user_id = auth.uid();

  -- Sessions deletion will cascade to drinks
  DELETE FROM drink_sessions WHERE user_id = auth.uid();

  -- Delete profile
  DELETE FROM profiles WHERE id = auth.uid();

  -- Delete auth user (this will fail if called from client, needs service role)
  -- Handle via Edge Function instead

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- AUTOMATIC DATA ANONYMIZATION (GDPR compliance)
-- =====================================================

-- Anonymize analytics events older than 90 days
CREATE OR REPLACE FUNCTION anonymize_old_analytics()
RETURNS void AS $$
BEGIN
  UPDATE analytics_events
  SET user_id = NULL, anonymized = true
  WHERE occurred_at < NOW() - INTERVAL '90 days'
  AND anonymized = false;
END;
$$ LANGUAGE plpgsql;

-- Schedule this function to run daily (set up in Supabase Dashboard > Database > Cron Jobs)
-- SELECT cron.schedule('anonymize-analytics-daily', '0 2 * * *', 'SELECT anonymize_old_analytics();');

-- RLS policies complete!
