-- =====================================================
-- MOMMY MILK BAR - Minimize PII for App Store Compliance
-- =====================================================
-- Migration: 004
-- Purpose: Reduce personally identifiable information
-- Reason: Easier Apple App Store acceptance, better privacy
-- Date: 2025-11-28
-- =====================================================

-- =====================================================
-- 1. PROFILES - Minimize Personal Information
-- =====================================================

-- Add new minimal columns
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS display_name TEXT, -- First name only, optional
  ADD COLUMN IF NOT EXISTS birth_year INTEGER CHECK (birth_year >= 1900 AND birth_year <= EXTRACT(YEAR FROM CURRENT_DATE));

-- Migrate existing data (if any)
-- Convert full names to first names only
UPDATE profiles
SET display_name = SPLIT_PART(mother_name, ' ', 1)
WHERE mother_name IS NOT NULL
  AND mother_name != 'prefer_not_to_share'
  AND display_name IS NULL;

-- Extract birth year from full birthdate
UPDATE profiles
SET birth_year = EXTRACT(YEAR FROM mother_birthdate)
WHERE mother_birthdate IS NOT NULL
  AND birth_year IS NULL;

-- Drop the old PII columns (after data migration)
-- NOTE: Uncomment these AFTER verifying data migration worked
-- ALTER TABLE profiles DROP COLUMN IF EXISTS mother_name;
-- ALTER TABLE profiles DROP COLUMN IF EXISTS mother_birthdate;

-- For now, just mark them as deprecated (to migrate safely)
COMMENT ON COLUMN profiles.mother_name IS 'DEPRECATED: Use display_name instead. Will be removed in future migration.';
COMMENT ON COLUMN profiles.mother_birthdate IS 'DEPRECATED: Use birth_year instead. Will be removed in future migration.';

-- =====================================================
-- 2. BABIES - Use Generic Labels Instead of Real Names
-- =====================================================

-- Add display label column
ALTER TABLE babies
  ADD COLUMN IF NOT EXISTS display_label TEXT DEFAULT 'Baby 1';

-- Migrate existing babies to numbered labels
DO $$
DECLARE
  baby_record RECORD;
  baby_number INTEGER;
BEGIN
  FOR baby_record IN
    SELECT id, user_id,
           ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at) as baby_num
    FROM babies
    WHERE display_label IS NULL OR display_label = 'Baby 1'
  LOOP
    UPDATE babies
    SET display_label = 'Baby ' || baby_record.baby_num
    WHERE id = baby_record.id;
  END LOOP;
END;
$$;

-- Mark old name column as deprecated
COMMENT ON COLUMN babies.name IS 'DEPRECATED: Use display_label instead. Will be removed in future migration.';

-- =====================================================
-- 3. BIRTHDATE - Keep Exact Date for Babies (Needed for Features)
-- =====================================================

-- Baby birthdate: KEEP exact date (needed for week-by-week tracking)
-- This is functionally necessary and acceptable for App Store
-- Must be disclosed in privacy policy with justification

COMMENT ON COLUMN babies.birthdate IS 'Exact birthdate (needed for weekly development tracking and feeding pattern analysis)';

-- =====================================================
-- 4. HELPER FUNCTIONS - Update for New Schema
-- =====================================================

-- Function to get mother's age (for calculations)
CREATE OR REPLACE FUNCTION get_mother_age_years()
RETURNS INTEGER AS $$
BEGIN
  RETURN EXTRACT(YEAR FROM CURRENT_DATE) - (
    SELECT birth_year FROM profiles WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get baby age in months (for feeding patterns)
CREATE OR REPLACE FUNCTION get_baby_age_months(baby_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN EXTRACT(YEAR FROM AGE(CURRENT_DATE, (
    SELECT birthdate FROM babies WHERE id = baby_uuid
  ))) * 12 +
  EXTRACT(MONTH FROM AGE(CURRENT_DATE, (
    SELECT birthdate FROM babies WHERE id = baby_uuid
  )));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 5. DATA RETENTION - Auto-delete Old Data
-- =====================================================

-- Function to delete old sessions from inactive users
CREATE OR REPLACE FUNCTION cleanup_old_sessions()
RETURNS void AS $$
BEGIN
  -- Delete sessions older than 1 year for users inactive for 6+ months
  DELETE FROM drink_sessions
  WHERE started_at < NOW() - INTERVAL '1 year'
  AND user_id IN (
    SELECT id FROM profiles
    WHERE last_active_at < NOW() - INTERVAL '6 months'
  );

  RAISE NOTICE 'Cleaned up old drink sessions';
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup orphaned data
CREATE OR REPLACE FUNCTION cleanup_orphaned_data()
RETURNS void AS $$
BEGIN
  -- Delete analytics events with no user (already anonymized) older than 2 years
  DELETE FROM analytics_events
  WHERE user_id IS NULL
  AND occurred_at < NOW() - INTERVAL '2 years';

  -- Delete old data requests (completed more than 90 days ago)
  DELETE FROM data_requests
  WHERE status = 'completed'
  AND completed_at < NOW() - INTERVAL '90 days';

  RAISE NOTICE 'Cleaned up orphaned data';
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 6. UPDATE EXPORT FUNCTION for New Schema
-- =====================================================

CREATE OR REPLACE FUNCTION export_user_data()
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'export_date', NOW(),
    'user_id', auth.uid(),
    'profile', (
      SELECT row_to_json(p.*)
      FROM (
        SELECT
          id, display_name, birth_year,
          weight_kg, height_cm, safety_mode, notifications_enabled,
          has_completed_onboarding, consent_version,
          age_consent, medical_disclaimer_consent, privacy_policy_consent,
          marketing_consent, analytics_consent, consent_timestamp,
          email, email_verified, email_verified_at,
          created_at, updated_at, last_active_at
        FROM profiles
        WHERE id = auth.uid()
      ) p
    ),
    'babies', (
      SELECT jsonb_agg(row_to_json(b.*))
      FROM (
        SELECT
          id, display_label, birthdate, weight_kg, length_cm,
          feeding_type, feeds_per_day, typical_amount_ml, pump_preference,
          is_active, created_at, updated_at
        FROM babies
        WHERE user_id = auth.uid()
      ) b
    ),
    'drink_sessions', (
      SELECT jsonb_agg(row_to_json(ds.*))
      FROM drink_sessions ds
      WHERE ds.user_id = auth.uid()
    ),
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

-- =====================================================
-- 7. CRON JOBS (Set up in Supabase Dashboard)
-- =====================================================

-- Schedule anonymization (daily at 2 AM)
-- SELECT cron.schedule('anonymize-analytics-daily', '0 2 * * *', 'SELECT anonymize_old_analytics();');

-- Schedule session cleanup (monthly on 1st at 3 AM)
-- SELECT cron.schedule('cleanup-old-sessions', '0 3 1 * *', 'SELECT cleanup_old_sessions();');

-- Schedule orphaned data cleanup (monthly on 1st at 4 AM)
-- SELECT cron.schedule('cleanup-orphaned-data', '0 4 1 * *', 'SELECT cleanup_orphaned_data();');

-- =====================================================
-- MIGRATION VERIFICATION
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE 'Migration 004 completed successfully';
  RAISE NOTICE 'Minimized PII for App Store compliance';
  RAISE NOTICE 'Updated export function';
  RAISE NOTICE 'Added data retention functions';
  RAISE NOTICE '';
  RAISE NOTICE 'NEXT STEPS:';
  RAISE NOTICE '1. Test export_user_data() function';
  RAISE NOTICE '2. Update app UI to use display_name and display_label';
  RAISE NOTICE '3. Set up cron jobs in Supabase Dashboard';
  RAISE NOTICE '4. After verification, run cleanup migration to drop deprecated columns';
END $$;
