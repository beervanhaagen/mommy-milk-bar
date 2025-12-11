-- =====================================================
-- DROP ALL TABLES - Reset Database to Empty State
-- =====================================================
-- Run this in Supabase SQL Editor to remove all tables
-- This allows you to run the comprehensive migration fresh
-- =====================================================

-- Drop tables in reverse dependency order
-- Using CASCADE to handle any remaining dependencies

DROP TABLE IF EXISTS user_tip_interactions CASCADE;
DROP TABLE IF EXISTS analytics_events CASCADE;
DROP TABLE IF EXISTS data_requests CASCADE;
DROP TABLE IF EXISTS audit_log CASCADE;
DROP TABLE IF EXISTS feeding_logs CASCADE;
DROP TABLE IF EXISTS drinks CASCADE;
DROP TABLE IF EXISTS drink_sessions CASCADE;
DROP TABLE IF EXISTS babies CASCADE;
DROP TABLE IF EXISTS content_tips CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop functions if they exist
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS update_session_total_drinks() CASCADE;
DROP FUNCTION IF EXISTS log_audit_event(UUID, TEXT, TEXT, TEXT, TEXT, JSONB) CASCADE;
DROP FUNCTION IF EXISTS log_profile_update() CASCADE;
DROP FUNCTION IF EXISTS log_baby_created() CASCADE;
DROP FUNCTION IF EXISTS log_baby_deleted() CASCADE;
DROP FUNCTION IF EXISTS user_owns_baby(UUID) CASCADE;
DROP FUNCTION IF EXISTS user_owns_session(UUID) CASCADE;
DROP FUNCTION IF EXISTS export_user_data() CASCADE;
DROP FUNCTION IF EXISTS delete_user_data() CASCADE;
DROP FUNCTION IF EXISTS anonymize_old_analytics() CASCADE;
DROP FUNCTION IF EXISTS cleanup_old_audit_logs() CASCADE;

-- Verify everything is dropped
DO $$
DECLARE
  table_count INTEGER;
BEGIN
  SELECT count(*) INTO table_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name IN (
    'profiles', 'babies', 'drink_sessions', 'drinks', 'feeding_logs',
    'content_tips', 'user_tip_interactions', 'analytics_events',
    'data_requests', 'audit_log'
  );

  IF table_count = 0 THEN
    RAISE NOTICE '✓ All tables dropped successfully - Database is now empty';
  ELSE
    RAISE WARNING '⚠ Warning: % tables still exist', table_count;
  END IF;
END $$;
