-- =====================================================
-- MOMMY MILK BAR - Cleanup Extra Tables
-- =====================================================
-- Migration: 007
-- Purpose: Remove unused tables that were not created by our migrations
-- Date: 2025-11-28
-- Security: These tables are marked as "Unrestricted" = security risk
-- =====================================================

BEGIN;

-- =====================================================
-- 1. CHECK IF TABLES HAVE DATA
-- =====================================================

DO $$
DECLARE
  audit_log_count INTEGER := 0;
  data_exports_count INTEGER := 0;
  failed_login_count INTEGER := 0;
  rate_limit_count INTEGER := 0;
  recent_deletions_count INTEGER := 0;
  user_details_admin_count INTEGER := 0;
  user_statistics_count INTEGER := 0;
BEGIN
  -- Check if tables exist and count rows
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_log') THEN
    EXECUTE 'SELECT COUNT(*) FROM audit_log' INTO audit_log_count;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'data_exports') THEN
    EXECUTE 'SELECT COUNT(*) FROM data_exports' INTO data_exports_count;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'failed_login_attempts') THEN
    EXECUTE 'SELECT COUNT(*) FROM failed_login_attempts' INTO failed_login_count;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rate_limit_attempts') THEN
    EXECUTE 'SELECT COUNT(*) FROM rate_limit_attempts' INTO rate_limit_count;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'recent_deletions') THEN
    EXECUTE 'SELECT COUNT(*) FROM recent_deletions' INTO recent_deletions_count;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_details_admin') THEN
    EXECUTE 'SELECT COUNT(*) FROM user_details_admin' INTO user_details_admin_count;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_statistics') THEN
    EXECUTE 'SELECT COUNT(*) FROM user_statistics' INTO user_statistics_count;
  END IF;

  RAISE NOTICE '===========================================';
  RAISE NOTICE 'Extra Tables Data Check:';
  RAISE NOTICE '  audit_log: % rows', audit_log_count;
  RAISE NOTICE '  data_exports: % rows', data_exports_count;
  RAISE NOTICE '  failed_login_attempts: % rows', failed_login_count;
  RAISE NOTICE '  rate_limit_attempts: % rows', rate_limit_count;
  RAISE NOTICE '  recent_deletions: % rows', recent_deletions_count;
  RAISE NOTICE '  user_details_admin: % rows', user_details_admin_count;
  RAISE NOTICE '  user_statistics: % rows', user_statistics_count;
  RAISE NOTICE '===========================================';
END $$;

-- =====================================================
-- 2. DROP UNUSED TABLES
-- =====================================================

-- Drop extra tables that are not part of our schema
DROP TABLE IF EXISTS audit_log CASCADE;
DROP TABLE IF EXISTS data_exports CASCADE;
DROP TABLE IF EXISTS failed_login_attempts CASCADE;
DROP TABLE IF EXISTS rate_limit_attempts CASCADE;
DROP TABLE IF EXISTS recent_deletions CASCADE;
DROP VIEW IF EXISTS user_details_admin CASCADE;  -- This is a view, not a table
DROP TABLE IF EXISTS user_statistics CASCADE;

-- =====================================================
-- 3. VERIFY CORRECT TABLES REMAIN
-- =====================================================

DO $$
DECLARE
  table_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE'
    AND table_name IN (
      'profiles',
      'babies',
      'drink_sessions',
      'drinks',
      'feeding_logs',
      'content_tips',
      'user_tip_interactions',
      'analytics_events',
      'data_requests'
    );

  RAISE NOTICE '===========================================';
  RAISE NOTICE 'Verification: % correct tables found', table_count;
  RAISE NOTICE 'Expected: 9 tables';

  IF table_count = 9 THEN
    RAISE NOTICE '✓ All correct tables present';
  ELSE
    RAISE WARNING '⚠ Expected 9 tables but found %', table_count;
  END IF;
  RAISE NOTICE '===========================================';
END $$;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '===========================================';
  RAISE NOTICE 'Migration 007 completed successfully';
  RAISE NOTICE '===========================================';
  RAISE NOTICE 'Removed:';
  RAISE NOTICE '  - audit_log';
  RAISE NOTICE '  - data_exports';
  RAISE NOTICE '  - failed_login_attempts';
  RAISE NOTICE '  - rate_limit_attempts';
  RAISE NOTICE '  - recent_deletions';
  RAISE NOTICE '  - user_details_admin';
  RAISE NOTICE '  - user_statistics';
  RAISE NOTICE '';
  RAISE NOTICE 'Remaining tables:';
  RAISE NOTICE '  - profiles';
  RAISE NOTICE '  - babies';
  RAISE NOTICE '  - drink_sessions';
  RAISE NOTICE '  - drinks';
  RAISE NOTICE '  - feeding_logs';
  RAISE NOTICE '  - content_tips';
  RAISE NOTICE '  - user_tip_interactions';
  RAISE NOTICE '  - analytics_events';
  RAISE NOTICE '  - data_requests';
  RAISE NOTICE '===========================================';
END $$;

COMMIT;
