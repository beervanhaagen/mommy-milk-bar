-- =====================================================
-- MOMMY MILK BAR - Remove Unused Fields
-- =====================================================
-- Migration: 008
-- Purpose: Remove fields that are not used in the app or calculations
-- Date: 2025-11-28
-- Decisions:
--   - height_cm NOT used in alcohol calculation (only uses weight)
--   - birth_year NOT used anywhere
--   - Baby weight/length NOT needed for mother's alcohol breakdown
--   - display_name NOT collected for MVP
-- =====================================================

BEGIN;

-- =====================================================
-- 1. VERIFY CURRENT SCHEMA
-- =====================================================

DO $$
DECLARE
  profiles_count INTEGER;
  babies_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO profiles_count FROM profiles;
  SELECT COUNT(*) INTO babies_count FROM babies;

  RAISE NOTICE '===========================================';
  RAISE NOTICE 'Pre-migration data:';
  RAISE NOTICE 'Total profiles: %', profiles_count;
  RAISE NOTICE 'Total babies: %', babies_count;
  RAISE NOTICE '===========================================';
END $$;

-- =====================================================
-- 2. BACKUP DATA BEFORE REMOVAL (Optional Safety Check)
-- =====================================================

-- Check if any profiles have height_cm set
DO $$
DECLARE
  height_count INTEGER;
  birth_year_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO height_count FROM profiles WHERE height_cm IS NOT NULL;
  SELECT COUNT(*) INTO birth_year_count FROM profiles WHERE birth_year IS NOT NULL;

  RAISE NOTICE '';
  RAISE NOTICE 'Data to be removed:';
  RAISE NOTICE '  Profiles with height_cm: %', height_count;
  RAISE NOTICE '  Profiles with birth_year: %', birth_year_count;
  RAISE NOTICE '';
END $$;

-- Check if any babies have weight/length set
DO $$
DECLARE
  baby_weight_count INTEGER;
  baby_length_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO baby_weight_count FROM babies WHERE weight_kg IS NOT NULL;
  SELECT COUNT(*) INTO baby_length_count FROM babies WHERE length_cm IS NOT NULL;

  RAISE NOTICE '  Babies with weight_kg: %', baby_weight_count;
  RAISE NOTICE '  Babies with length_cm: %', baby_length_count;
  RAISE NOTICE '';
END $$;

-- =====================================================
-- 3. REMOVE UNUSED FIELDS FROM PROFILES
-- =====================================================

-- Remove fields that are not used in the app
ALTER TABLE profiles
  DROP COLUMN IF EXISTS birth_year CASCADE,
  DROP COLUMN IF EXISTS height_cm CASCADE,
  DROP COLUMN IF EXISTS display_name CASCADE;

-- =====================================================
-- 4. REMOVE UNUSED FIELDS FROM BABIES
-- =====================================================

-- Remove baby physical measurements (not needed for mother's alcohol calculation)
ALTER TABLE babies
  DROP COLUMN IF EXISTS weight_kg CASCADE,
  DROP COLUMN IF EXISTS length_cm CASCADE;

-- =====================================================
-- 5. VERIFY REMAINING SCHEMA
-- =====================================================

DO $$
DECLARE
  profiles_columns TEXT[];
  babies_columns TEXT[];
BEGIN
  -- Get remaining columns in profiles
  SELECT ARRAY_AGG(column_name ORDER BY ordinal_position)
  INTO profiles_columns
  FROM information_schema.columns
  WHERE table_name = 'profiles' AND table_schema = 'public';

  -- Get remaining columns in babies
  SELECT ARRAY_AGG(column_name ORDER BY ordinal_position)
  INTO babies_columns
  FROM information_schema.columns
  WHERE table_name = 'babies' AND table_schema = 'public';

  RAISE NOTICE '';
  RAISE NOTICE '===========================================';
  RAISE NOTICE 'Remaining schema:';
  RAISE NOTICE '';
  RAISE NOTICE 'profiles columns:';
  RAISE NOTICE '%', profiles_columns;
  RAISE NOTICE '';
  RAISE NOTICE 'babies columns:';
  RAISE NOTICE '%', babies_columns;
  RAISE NOTICE '===========================================';
END $$;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '===========================================';
  RAISE NOTICE 'Migration 008 completed successfully!';
  RAISE NOTICE '===========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'REMOVED from profiles:';
  RAISE NOTICE '  ❌ birth_year (not used)';
  RAISE NOTICE '  ❌ height_cm (not used in algorithm)';
  RAISE NOTICE '  ❌ display_name (not collecting for MVP)';
  RAISE NOTICE '';
  RAISE NOTICE 'REMOVED from babies:';
  RAISE NOTICE '  ❌ weight_kg (not needed)';
  RAISE NOTICE '  ❌ length_cm (not needed)';
  RAISE NOTICE '';
  RAISE NOTICE 'KEPT in profiles:';
  RAISE NOTICE '  ✓ weight_kg (critical for calculations)';
  RAISE NOTICE '  ✓ All consent fields (GDPR)';
  RAISE NOTICE '  ✓ Email verification fields';
  RAISE NOTICE '';
  RAISE NOTICE 'KEPT tables for future:';
  RAISE NOTICE '  ✓ feeding_logs (potential feature)';
  RAISE NOTICE '  ✓ content_tips (used for tips display)';
  RAISE NOTICE '  ✓ user_tip_interactions (used for tips)';
  RAISE NOTICE '';
  RAISE NOTICE 'NEXT STEPS:';
  RAISE NOTICE '1. Update TypeScript types (src/types/database.ts)';
  RAISE NOTICE '2. Update profile service (remove height/birth_year logic)';
  RAISE NOTICE '3. Update store types (remove from Baby type)';
  RAISE NOTICE '4. Update onboarding screens (skip removed fields)';
  RAISE NOTICE '===========================================';
END $$;

COMMIT;
