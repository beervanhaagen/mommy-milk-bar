-- =====================================================
-- DATABASE TEST SCRIPT
-- =====================================================
-- Run this script to verify your database setup
-- Execute in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- TEST 1: Verify all tables exist
-- =====================================================

DO $$
DECLARE
  expected_tables TEXT[] := ARRAY[
    'profiles',
    'babies',
    'drink_sessions',
    'drinks',
    'feeding_logs',
    'content_tips',
    'user_tip_interactions',
    'analytics_events',
    'data_requests',
    'audit_log'
  ];
  actual_count INTEGER;
BEGIN
  SELECT count(*) INTO actual_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name = ANY(expected_tables);

  IF actual_count = array_length(expected_tables, 1) THEN
    RAISE NOTICE '✓ All % tables exist', actual_count;
  ELSE
    RAISE WARNING '✗ Expected % tables, found %', array_length(expected_tables, 1), actual_count;
  END IF;
END $$;

-- =====================================================
-- TEST 2: Verify RLS is enabled
-- =====================================================

DO $$
DECLARE
  table_name TEXT;
  rls_enabled BOOLEAN;
  all_enabled BOOLEAN := true;
BEGIN
  FOR table_name IN
    SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  LOOP
    SELECT relrowsecurity INTO rls_enabled
    FROM pg_class
    WHERE relname = table_name;

    IF NOT rls_enabled THEN
      RAISE WARNING '✗ RLS not enabled on table: %', table_name;
      all_enabled := false;
    END IF;
  END LOOP;

  IF all_enabled THEN
    RAISE NOTICE '✓ RLS enabled on all tables';
  END IF;
END $$;

-- =====================================================
-- TEST 3: Verify CASCADE deletions work
-- =====================================================

DO $$
DECLARE
  test_user_id UUID;
  test_baby_id UUID;
  test_session_id UUID;
  baby_count INTEGER;
  session_count INTEGER;
BEGIN
  -- Create test user (requires auth.users entry first)
  RAISE NOTICE 'Testing CASCADE deletions...';
  RAISE NOTICE '(Skipping - requires actual auth.users entry)';
  RAISE NOTICE 'Manual test: Create account, add data, delete account, verify cascade';
END $$;

-- =====================================================
-- TEST 4: Verify triggers exist
-- =====================================================

DO $$
DECLARE
  expected_triggers TEXT[] := ARRAY[
    'update_profiles_updated_at',
    'update_babies_updated_at',
    'update_sessions_updated_at',
    'update_session_drinks_insert',
    'update_session_drinks_update',
    'update_session_drinks_delete',
    'profile_update_audit',
    'baby_created_audit',
    'baby_deleted_audit'
  ];
  trigger_name TEXT;
  found BOOLEAN;
  all_found BOOLEAN := true;
BEGIN
  FOREACH trigger_name IN ARRAY expected_triggers
  LOOP
    SELECT EXISTS(
      SELECT 1 FROM pg_trigger
      WHERE tgname = trigger_name
    ) INTO found;

    IF NOT found THEN
      RAISE WARNING '✗ Trigger not found: %', trigger_name;
      all_found := false;
    END IF;
  END LOOP;

  IF all_found THEN
    RAISE NOTICE '✓ All triggers exist';
  END IF;
END $$;

-- =====================================================
-- TEST 5: Verify functions exist
-- =====================================================

DO $$
DECLARE
  expected_functions TEXT[] := ARRAY[
    'export_user_data',
    'delete_user_data',
    'user_owns_baby',
    'user_owns_session',
    'anonymize_old_analytics',
    'cleanup_old_audit_logs',
    'log_audit_event'
  ];
  function_name TEXT;
  found BOOLEAN;
  all_found BOOLEAN := true;
BEGIN
  FOREACH function_name IN ARRAY expected_functions
  LOOP
    SELECT EXISTS(
      SELECT 1 FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'public'
      AND p.proname = function_name
    ) INTO found;

    IF NOT found THEN
      RAISE WARNING '✗ Function not found: %', function_name;
      all_found := false;
    END IF;
  END LOOP;

  IF all_found THEN
    RAISE NOTICE '✓ All functions exist';
  END IF;
END $$;

-- =====================================================
-- TEST 6: Verify sample content tips
-- =====================================================

DO $$
DECLARE
  tip_count INTEGER;
BEGIN
  SELECT count(*) INTO tip_count FROM content_tips;

  IF tip_count >= 5 THEN
    RAISE NOTICE '✓ Sample content tips loaded (% tips)', tip_count;
  ELSE
    RAISE WARNING '✗ Expected at least 5 sample tips, found %', tip_count;
  END IF;
END $$;

-- =====================================================
-- TEST 7: Verify indexes
-- =====================================================

DO $$
DECLARE
  index_count INTEGER;
BEGIN
  SELECT count(*) INTO index_count
  FROM pg_indexes
  WHERE schemaname = 'public';

  IF index_count >= 20 THEN
    RAISE NOTICE '✓ Indexes created (% indexes)', index_count;
  ELSE
    RAISE WARNING '⚠ Found only % indexes, expected at least 20', index_count;
  END IF;
END $$;

-- =====================================================
-- TEST SUMMARY
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '============================================';
  RAISE NOTICE 'DATABASE TEST COMPLETE';
  RAISE NOTICE '============================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Review the output above for any ✗ or ⚠ symbols.';
  RAISE NOTICE 'All tests should show ✓ for a healthy database.';
  RAISE NOTICE '';
  RAISE NOTICE 'Manual tests still required:';
  RAISE NOTICE '1. Create test account';
  RAISE NOTICE '2. Add baby, drinks, feeding logs';
  RAISE NOTICE '3. Export data via export_user_data()';
  RAISE NOTICE '4. Delete account and verify CASCADE';
  RAISE NOTICE '============================================';
END $$;
