-- =====================================================
-- MANUAL USER DELETION SCRIPT
-- =====================================================
-- Use this script in Supabase SQL Editor when you need to manually
-- delete a user account that's stuck due to database errors
--
-- INSTRUCTIONS:
-- 1. Replace 'YOUR_EMAIL_HERE' with the actual email address
-- 2. Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/lqmnkdqyoxytyyxuglhx/sql
-- =====================================================

-- First, let's find the user ID
DO $$
DECLARE
  v_user_id UUID;
  v_email TEXT := 'beervhaagen@icloud.com'; -- REPLACE THIS WITH YOUR EMAIL
BEGIN
  -- Find the user
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = v_email;

  IF v_user_id IS NULL THEN
    RAISE NOTICE 'User not found with email: %', v_email;
    RETURN;
  END IF;

  RAISE NOTICE 'Found user with ID: %', v_user_id;

  -- Temporarily disable the audit triggers if they exist
  BEGIN
    ALTER TABLE profiles DISABLE TRIGGER profile_update_audit;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Profile trigger not found or already disabled (this is okay)';
  END;

  BEGIN
    ALTER TABLE babies DISABLE TRIGGER baby_deleted_audit;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Baby trigger not found or already disabled (this is okay)';
  END;

  -- Delete all related data (skip if table doesn't exist)
  BEGIN
    RAISE NOTICE 'Deleting user_tip_interactions...';
    DELETE FROM user_tip_interactions WHERE user_id = v_user_id;
  EXCEPTION WHEN undefined_table THEN
    RAISE NOTICE 'Table user_tip_interactions does not exist, skipping';
  END;

  BEGIN
    RAISE NOTICE 'Deleting analytics_events...';
    DELETE FROM analytics_events WHERE user_id = v_user_id;
  EXCEPTION WHEN undefined_table THEN
    RAISE NOTICE 'Table analytics_events does not exist, skipping';
  END;

  BEGIN
    RAISE NOTICE 'Deleting data_requests...';
    DELETE FROM data_requests WHERE user_id = v_user_id;
  EXCEPTION WHEN undefined_table THEN
    RAISE NOTICE 'Table data_requests does not exist, skipping';
  END;

  BEGIN
    RAISE NOTICE 'Deleting audit_log entries...';
    DELETE FROM audit_log WHERE user_id = v_user_id;
  EXCEPTION WHEN undefined_table THEN
    RAISE NOTICE 'Table audit_log does not exist, skipping';
  END;

  RAISE NOTICE 'Deleting feeding_logs (via babies cascade)...';
  -- Babies deletion will cascade to feeding_logs

  RAISE NOTICE 'Deleting drinks (via sessions cascade)...';
  -- Sessions deletion will cascade to drinks

  RAISE NOTICE 'Deleting babies...';
  DELETE FROM babies WHERE user_id = v_user_id;

  RAISE NOTICE 'Deleting drink_sessions...';
  DELETE FROM drink_sessions WHERE user_id = v_user_id;

  RAISE NOTICE 'Deleting profile...';
  DELETE FROM profiles WHERE id = v_user_id;

  RAISE NOTICE 'Deleting auth user...';
  -- Delete from auth.users (this is the critical part)
  DELETE FROM auth.users WHERE id = v_user_id;

  -- Re-enable the triggers if they exist
  BEGIN
    ALTER TABLE profiles ENABLE TRIGGER profile_update_audit;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Profile trigger not found (this is okay)';
  END;

  BEGIN
    ALTER TABLE babies ENABLE TRIGGER baby_deleted_audit;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Baby trigger not found (this is okay)';
  END;

  RAISE NOTICE 'User % successfully deleted!', v_email;
END $$;
