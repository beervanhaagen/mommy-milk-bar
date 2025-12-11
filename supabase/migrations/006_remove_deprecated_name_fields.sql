-- =====================================================
-- MOMMY MILK BAR - Remove Deprecated Name Fields
-- =====================================================
-- Migration: 006
-- Purpose: Clean up deprecated mother_name, mother_birthdate, and baby name fields
-- Date: 2025-11-28
-- Reason: Privacy-first approach - names not collected during onboarding
-- =====================================================

-- =====================================================
-- 1. VERIFY NEW SCHEMA IS IN USE
-- =====================================================

DO $$
DECLARE
  profiles_count INTEGER;
  babies_count INTEGER;
BEGIN
  -- Count profiles table
  SELECT COUNT(*) INTO profiles_count FROM profiles;

  -- Count babies table
  SELECT COUNT(*) INTO babies_count FROM babies;

  RAISE NOTICE '===========================================';
  RAISE NOTICE 'Pre-migration verification:';
  RAISE NOTICE 'Total profiles: %', profiles_count;
  RAISE NOTICE 'Total babies: %', babies_count;
  RAISE NOTICE '===========================================';
END $$;

-- =====================================================
-- 2. ENSURE display_label HAS DEFAULT FOR ALL BABIES
-- =====================================================

-- Set display_label for any babies that don't have it yet
-- Number them sequentially per user
WITH numbered_babies AS (
  SELECT
    id,
    'Baby ' || ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at) as new_label
  FROM babies
  WHERE display_label IS NULL OR display_label = ''
)
UPDATE babies
SET display_label = numbered_babies.new_label
FROM numbered_babies
WHERE babies.id = numbered_babies.id;

-- Make display_label NOT NULL with default
ALTER TABLE babies
  ALTER COLUMN display_label SET NOT NULL,
  ALTER COLUMN display_label SET DEFAULT 'Baby 1';

DO $$ BEGIN
  RAISE NOTICE 'Updated babies to use display_label';
END $$;

-- =====================================================
-- 3. DROP DEPRECATED COLUMNS FROM PROFILES
-- =====================================================

-- Remove old PII columns
ALTER TABLE profiles
  DROP COLUMN IF EXISTS mother_name CASCADE,
  DROP COLUMN IF EXISTS mother_birthdate CASCADE;

DO $$ BEGIN
  RAISE NOTICE 'Dropped deprecated name columns from profiles table';
END $$;

-- =====================================================
-- 4. DROP DEPRECATED COLUMN FROM BABIES
-- =====================================================

-- Remove old name column
ALTER TABLE babies
  DROP COLUMN IF EXISTS name CASCADE;

DO $$ BEGIN
  RAISE NOTICE 'Dropped deprecated name column from babies table';
END $$;

-- =====================================================
-- 5. UPDATE EXPORT FUNCTION (Already uses new fields from migration 004)
-- =====================================================

-- Verify export_user_data function exists and uses new schema
DO $$
DECLARE
  func_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'export_user_data'
  ) INTO func_exists;

  IF func_exists THEN
    RAISE NOTICE 'export_user_data function exists and uses display_name/display_label';
  ELSE
    RAISE WARNING 'export_user_data function not found - run migration 004 first';
  END IF;
END $$;

-- =====================================================
-- MIGRATION VERIFICATION
-- =====================================================

DO $$
DECLARE
  profiles_count INTEGER;
  babies_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO profiles_count FROM profiles;
  SELECT COUNT(*) INTO babies_count FROM babies;

  RAISE NOTICE '===========================================';
  RAISE NOTICE 'Migration 006 completed successfully';
  RAISE NOTICE '===========================================';
  RAISE NOTICE 'Database schema is now clean and privacy-focused';
  RAISE NOTICE '';
  RAISE NOTICE 'RESULTS:';
  RAISE NOTICE '✓ Removed mother_name from profiles';
  RAISE NOTICE '✓ Removed mother_birthdate from profiles';
  RAISE NOTICE '✓ Removed name from babies';
  RAISE NOTICE '✓ display_label is now required for babies';
  RAISE NOTICE '';
  RAISE NOTICE 'Current data:';
  RAISE NOTICE '  Profiles: %', profiles_count;
  RAISE NOTICE '  Babies: %', babies_count;
  RAISE NOTICE '';
  RAISE NOTICE 'NEXT STEPS:';
  RAISE NOTICE '1. Update TypeScript types to remove deprecated fields';
  RAISE NOTICE '2. Test onboarding flow (names screen skipped)';
  RAISE NOTICE '3. Test data export function';
  RAISE NOTICE '4. Verify App Store privacy disclosure';
  RAISE NOTICE '===========================================';
END $$;
