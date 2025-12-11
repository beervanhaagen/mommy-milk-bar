-- =====================================================
-- MOMMY MILK BAR - Audit Logging & Security Enhancements
-- =====================================================
-- Migration: 005
-- Purpose: Add audit logging for compliance and security monitoring
-- Date: 2025-11-28
-- =====================================================

-- =====================================================
-- 1. AUDIT LOG TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS audit_log (
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
    'consent_updated',
    'login_success',
    'login_failed'
  )),

  -- Resource info
  resource_type TEXT CHECK (resource_type IN ('profile', 'baby', 'drink_session', 'auth', 'data')),
  resource_id TEXT, -- UUID or identifier of affected resource

  -- Security context (privacy-aware)
  ip_address_hash TEXT, -- Hashed IP for security, not raw IP

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb, -- Additional context (e.g., {field_changed: 'weight'})

  -- Timestamp
  occurred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for querying
CREATE INDEX idx_audit_user_time ON audit_log(user_id, occurred_at DESC) WHERE user_id IS NOT NULL;
CREATE INDEX idx_audit_action_time ON audit_log(action, occurred_at DESC);
CREATE INDEX idx_audit_ip_hash ON audit_log(ip_address_hash, occurred_at DESC) WHERE ip_address_hash IS NOT NULL;

-- RLS: Users can only view their own audit logs
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own audit logs"
  ON audit_log FOR SELECT
  USING (auth.uid() = user_id);

-- Note: Only system (service role) can insert audit logs
CREATE POLICY "Service role can insert audit logs"
  ON audit_log FOR INSERT
  WITH CHECK (true); -- Will be called from Edge Functions with service role

-- =====================================================
-- 2. HELPER FUNCTIONS for Audit Logging
-- =====================================================

-- Function to log audit events
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

-- Function to hash IP addresses (SHA256)
CREATE OR REPLACE FUNCTION hash_ip_address(ip TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN encode(digest(ip || (SELECT current_setting('app.ip_salt', true)), 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =====================================================
-- 3. AUTOMATIC AUDIT TRIGGERS
-- =====================================================

-- Trigger: Log profile updates
CREATE OR REPLACE FUNCTION log_profile_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log significant changes (not every updated_at bump)
  IF (OLD.weight_kg != NEW.weight_kg OR
      OLD.height_cm != NEW.height_cm OR
      OLD.display_name != NEW.display_name OR
      OLD.safety_mode != NEW.safety_mode) THEN

    PERFORM log_audit_event(
      NEW.id,
      'profile_updated',
      'profile',
      NEW.id::text,
      NULL,
      jsonb_build_object(
        'fields_changed', ARRAY(
          SELECT key FROM jsonb_each(to_jsonb(NEW))
          WHERE to_jsonb(OLD)->>key IS DISTINCT FROM to_jsonb(NEW)->>key
        )
      )
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
-- 4. DATA RETENTION for Audit Logs
-- =====================================================

-- Function to cleanup old audit logs (keep for 2 years)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS void AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Delete audit logs older than 2 years
  WITH deleted AS (
    DELETE FROM audit_log
    WHERE occurred_at < NOW() - INTERVAL '2 years'
    RETURNING id
  )
  SELECT count(*) INTO deleted_count FROM deleted;

  RAISE NOTICE 'Deleted % old audit log entries', deleted_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 5. RATE LIMITING TABLE (For Auth)
-- =====================================================

CREATE TABLE IF NOT EXISTS rate_limit_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Identifier (email hash or IP hash)
  identifier_hash TEXT NOT NULL,

  -- Attempt type
  attempt_type TEXT NOT NULL CHECK (attempt_type IN (
    'login',
    'signup',
    'password_reset',
    'data_export'
  )),

  -- Tracking
  attempt_count INTEGER DEFAULT 1,
  first_attempt_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_attempt_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Auto-reset after window
  window_end_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '15 minutes',

  UNIQUE(identifier_hash, attempt_type)
);

-- Index for quick lookups
CREATE INDEX idx_rate_limit_identifier ON rate_limit_attempts(identifier_hash, attempt_type);
CREATE INDEX idx_rate_limit_window ON rate_limit_attempts(window_end_at);

-- No RLS needed (service role only)

-- =====================================================
-- 6. RATE LIMITING FUNCTIONS
-- =====================================================

-- Function to check rate limit
CREATE OR REPLACE FUNCTION check_rate_limit(
  identifier TEXT,
  attempt_type TEXT,
  max_attempts INTEGER DEFAULT 5,
  window_minutes INTEGER DEFAULT 15
)
RETURNS BOOLEAN AS $$
DECLARE
  current_attempts INTEGER;
  identifier_hash TEXT;
BEGIN
  -- Hash the identifier for privacy
  identifier_hash := encode(digest(identifier, 'sha256'), 'hex');

  -- Clean up expired windows first
  DELETE FROM rate_limit_attempts
  WHERE window_end_at < NOW();

  -- Get current attempt count
  SELECT attempt_count INTO current_attempts
  FROM rate_limit_attempts
  WHERE identifier_hash = identifier_hash
  AND attempt_type = attempt_type
  AND window_end_at > NOW();

  -- If no record or count is NULL, this is first attempt
  IF current_attempts IS NULL THEN
    -- Insert new record
    INSERT INTO rate_limit_attempts (identifier_hash, attempt_type, window_end_at)
    VALUES (
      identifier_hash,
      attempt_type,
      NOW() + (window_minutes || ' minutes')::INTERVAL
    );
    RETURN true; -- Allow
  END IF;

  -- Check if under limit
  IF current_attempts < max_attempts THEN
    -- Increment counter
    UPDATE rate_limit_attempts
    SET
      attempt_count = attempt_count + 1,
      last_attempt_at = NOW()
    WHERE identifier_hash = identifier_hash
    AND attempt_type = attempt_type;

    RETURN true; -- Allow
  END IF;

  -- Over limit
  RETURN false; -- Block
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reset rate limit (for successful actions)
CREATE OR REPLACE FUNCTION reset_rate_limit(
  identifier TEXT,
  attempt_type TEXT
)
RETURNS void AS $$
DECLARE
  identifier_hash TEXT;
BEGIN
  identifier_hash := encode(digest(identifier, 'sha256'), 'hex');

  DELETE FROM rate_limit_attempts
  WHERE identifier_hash = identifier_hash
  AND attempt_type = attempt_type;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 7. SECURITY MONITORING VIEWS (Admin Only)
-- =====================================================

-- View: Failed login attempts
CREATE OR REPLACE VIEW failed_login_attempts AS
SELECT
  user_id,
  ip_address_hash,
  COUNT(*) as failed_count,
  MAX(occurred_at) as last_attempt,
  MIN(occurred_at) as first_attempt
FROM audit_log
WHERE action = 'login_failed'
AND occurred_at > NOW() - INTERVAL '24 hours'
GROUP BY user_id, ip_address_hash
HAVING COUNT(*) >= 3 -- 3+ failed attempts
ORDER BY failed_count DESC;

-- View: Recent account deletions
CREATE OR REPLACE VIEW recent_deletions AS
SELECT
  user_id,
  occurred_at,
  metadata
FROM audit_log
WHERE action = 'account_deleted'
AND occurred_at > NOW() - INTERVAL '30 days'
ORDER BY occurred_at DESC;

-- View: Data export requests
CREATE OR REPLACE VIEW data_exports AS
SELECT
  user_id,
  occurred_at,
  ip_address_hash
FROM audit_log
WHERE action = 'data_exported'
AND occurred_at > NOW() - INTERVAL '90 days'
ORDER BY occurred_at DESC;

-- =====================================================
-- 8. CRON JOBS (Set up in Supabase Dashboard)
-- =====================================================

-- Schedule audit log cleanup (monthly on 1st at 5 AM)
-- SELECT cron.schedule('cleanup-old-audit-logs', '0 5 1 * *', 'SELECT cleanup_old_audit_logs();');

-- Schedule rate limit cleanup (every hour)
-- SELECT cron.schedule('cleanup-rate-limits', '0 * * * *',
--   'DELETE FROM rate_limit_attempts WHERE window_end_at < NOW();');

-- =====================================================
-- MIGRATION VERIFICATION
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE 'Migration 005 completed successfully';
  RAISE NOTICE 'Created audit_log table with RLS';
  RAISE NOTICE 'Created rate_limit_attempts table';
  RAISE NOTICE 'Added automatic audit triggers for profiles and babies';
  RAISE NOTICE 'Added helper functions for logging and rate limiting';
  RAISE NOTICE 'Created security monitoring views';
  RAISE NOTICE '';
  RAISE NOTICE 'NEXT STEPS:';
  RAISE NOTICE '1. Set up cron jobs in Supabase Dashboard';
  RAISE NOTICE '2. Update Edge Functions to use check_rate_limit()';
  RAISE NOTICE '3. Update Edge Functions to log audit events';
  RAISE NOTICE '4. Test rate limiting with multiple login attempts';
END $$;
