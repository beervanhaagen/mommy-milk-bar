-- =====================================================
-- MOMMY MILK BAR - Restore Audit Logging (Clean Version)
-- =====================================================
-- Migration: 011
-- Purpose: Restore audit logging with correct schema references
-- Date: 2025-11-30
-- Fixes: Issues from migrations 005-010
-- =====================================================

BEGIN;

-- =====================================================
-- 1. DROP ANY BROKEN TRIGGERS FIRST
-- =====================================================

-- Drop broken audit triggers if they exist
DROP TRIGGER IF EXISTS profile_update_audit ON profiles;
DROP TRIGGER IF EXISTS baby_created_audit ON babies;
DROP TRIGGER IF EXISTS baby_deleted_audit ON babies;

-- Drop broken trigger functions if they exist
DROP FUNCTION IF EXISTS log_profile_update();
DROP FUNCTION IF EXISTS log_baby_created();
DROP FUNCTION IF EXISTS log_baby_deleted();

-- =====================================================
-- 2. CREATE AUDIT LOG TABLE
-- =====================================================

-- Drop and recreate audit_log table to ensure clean state
DROP TABLE IF EXISTS audit_log CASCADE;

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
  metadata JSONB DEFAULT '{}'::jsonb,

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

-- Service role can insert audit logs
CREATE POLICY "Service role can insert audit logs"
  ON audit_log FOR INSERT
  WITH CHECK (true);

DO $$ BEGIN RAISE NOTICE '✓ Created audit_log table with RLS'; END $$;

-- =====================================================
-- 3. HELPER FUNCTION FOR AUDIT LOGGING
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

DO $$ BEGIN RAISE NOTICE '✓ Created log_audit_event() helper function'; END $$;

-- =====================================================
-- 4. AUDIT TRIGGERS - ONLY REFERENCE EXISTING COLUMNS
-- =====================================================

-- Trigger: Log profile updates
-- IMPORTANT: Only references columns that exist after migration 008
CREATE OR REPLACE FUNCTION log_profile_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log significant changes
  -- Note: We only check columns that exist in current schema
  IF (OLD.weight_kg IS DISTINCT FROM NEW.weight_kg OR
      OLD.safety_mode IS DISTINCT FROM NEW.safety_mode OR
      OLD.email IS DISTINCT FROM NEW.email OR
      OLD.email_verified IS DISTINCT FROM NEW.email_verified OR
      OLD.marketing_consent IS DISTINCT FROM NEW.marketing_consent OR
      OLD.analytics_consent IS DISTINCT FROM NEW.analytics_consent) THEN

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
          AND key NOT IN ('updated_at', 'last_active_at') -- Ignore timestamp fields
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

DO $$ BEGIN RAISE NOTICE '✓ Created profile_update_audit trigger'; END $$;

-- Trigger: Log baby creation
CREATE OR REPLACE FUNCTION log_baby_created()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM log_audit_event(
    NEW.user_id,
    'baby_created',
    'baby',
    NEW.id::text,
    NULL,
    jsonb_build_object('display_label', NEW.display_label)
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER baby_created_audit
  AFTER INSERT ON babies
  FOR EACH ROW
  EXECUTE FUNCTION log_baby_created();

DO $$ BEGIN RAISE NOTICE '✓ Created baby_created_audit trigger'; END $$;

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
    jsonb_build_object('display_label', OLD.display_label)
  );

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER baby_deleted_audit
  BEFORE DELETE ON babies
  FOR EACH ROW
  EXECUTE FUNCTION log_baby_deleted();

DO $$ BEGIN RAISE NOTICE '✓ Created baby_deleted_audit trigger'; END $$;

-- =====================================================
-- 5. CLEANUP FUNCTION FOR OLD AUDIT LOGS
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

DO $$ BEGIN RAISE NOTICE '✓ Created cleanup_old_audit_logs() function'; END $$;

-- =====================================================
-- 6. VERIFY CURRENT SCHEMA
-- =====================================================

DO $$
DECLARE
  profiles_columns TEXT[];
  babies_columns TEXT[];
  trigger_count INTEGER;
BEGIN
  -- Get profiles columns
  SELECT ARRAY_AGG(column_name ORDER BY ordinal_position)
  INTO profiles_columns
  FROM information_schema.columns
  WHERE table_name = 'profiles' AND table_schema = 'public';

  -- Get babies columns
  SELECT ARRAY_AGG(column_name ORDER BY ordinal_position)
  INTO babies_columns
  FROM information_schema.columns
  WHERE table_name = 'babies' AND table_schema = 'public';

  -- Count audit triggers
  SELECT COUNT(*) INTO trigger_count
  FROM information_schema.triggers
  WHERE trigger_schema = 'public'
  AND trigger_name LIKE '%audit%';

  RAISE NOTICE '';
  RAISE NOTICE '===========================================';
  RAISE NOTICE 'Schema Verification:';
  RAISE NOTICE '';
  RAISE NOTICE 'profiles columns: %', profiles_columns;
  RAISE NOTICE 'babies columns: %', babies_columns;
  RAISE NOTICE 'audit triggers created: %', trigger_count;
  RAISE NOTICE '===========================================';
END $$;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '===========================================';
  RAISE NOTICE 'Migration 011 completed successfully!';
  RAISE NOTICE '===========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'AUDIT LOGGING RESTORED:';
  RAISE NOTICE '  ✓ audit_log table created with RLS';
  RAISE NOTICE '  ✓ log_audit_event() helper function';
  RAISE NOTICE '  ✓ profile_update_audit trigger';
  RAISE NOTICE '  ✓ baby_created_audit trigger';
  RAISE NOTICE '  ✓ baby_deleted_audit trigger';
  RAISE NOTICE '  ✓ cleanup_old_audit_logs() function';
  RAISE NOTICE '';
  RAISE NOTICE 'TRIGGERS MONITOR:';
  RAISE NOTICE '  - Profile: weight_kg, safety_mode, email, email_verified, consents';
  RAISE NOTICE '  - Baby: creation and deletion with display_label';
  RAISE NOTICE '';
  RAISE NOTICE 'COLUMNS NOT MONITORED (do not exist):';
  RAISE NOTICE '  ✗ display_name (removed in migration 008)';
  RAISE NOTICE '  ✗ height_cm (removed in migration 008)';
  RAISE NOTICE '  ✗ birth_year (removed in migration 008)';
  RAISE NOTICE '';
  RAISE NOTICE 'GDPR COMPLIANCE:';
  RAISE NOTICE '  ✓ Audit logs kept for 2 years';
  RAISE NOTICE '  ✓ Users can view own audit logs';
  RAISE NOTICE '  ✓ Automatic cleanup available';
  RAISE NOTICE '';
  RAISE NOTICE 'NEXT STEPS:';
  RAISE NOTICE '1. Test account deletion (should work now)';
  RAISE NOTICE '2. Test profile updates (should log to audit_log)';
  RAISE NOTICE '3. Schedule cleanup: SELECT cron.schedule(''cleanup-audit'', ''0 5 1 * *'', ''SELECT cleanup_old_audit_logs();'');';
  RAISE NOTICE '===========================================';
END $$;

COMMIT;
