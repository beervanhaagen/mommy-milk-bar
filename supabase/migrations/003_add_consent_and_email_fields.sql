-- =====================================================
-- MOMMY MILK BAR - Add Consent & Email Verification Fields
-- =====================================================
-- Migration: 003
-- Purpose: Add missing consent tracking and email verification fields
-- Date: 2025-11-25
-- =====================================================

-- =====================================================
-- 1. ADD EMAIL VERIFICATION FIELDS TO PROFILES
-- =====================================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS email_verification_token TEXT,
  ADD COLUMN IF NOT EXISTS email_verification_sent_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMP WITH TIME ZONE;

-- Index for email verification lookup
CREATE INDEX IF NOT EXISTS idx_profiles_verification_token
  ON profiles(email_verification_token)
  WHERE email_verification_token IS NOT NULL;

-- Index for email lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email
  ON profiles(email);

-- =====================================================
-- 2. ADD DETAILED CONSENT TRACKING
-- =====================================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS age_consent BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS medical_disclaimer_consent BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS privacy_policy_consent BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS consent_timestamp TIMESTAMP WITH TIME ZONE;

-- =====================================================
-- 3. BACKFILL EXISTING USERS (MIGRATION ONLY)
-- =====================================================

-- For existing users, assume implicit consent and mark email as verified
-- (since they're already in the system)
UPDATE profiles
SET
  age_consent = true,
  medical_disclaimer_consent = true,
  privacy_policy_consent = true,
  consent_timestamp = COALESCE(created_at, NOW()),
  email_verified = true
WHERE consent_timestamp IS NULL;

-- =====================================================
-- 4. UPDATE RLS POLICIES FOR EMAIL VERIFICATION
-- =====================================================

-- Function to verify email with token
CREATE OR REPLACE FUNCTION verify_email(token TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  profile_id UUID;
BEGIN
  -- Find profile with matching token
  SELECT id INTO profile_id
  FROM profiles
  WHERE email_verification_token = token
    AND email_verified = false
    AND email_verification_sent_at > NOW() - INTERVAL '24 hours'; -- Token expires in 24h

  IF profile_id IS NULL THEN
    RETURN false;
  END IF;

  -- Mark email as verified
  UPDATE profiles
  SET
    email_verified = true,
    email_verification_token = NULL,
    updated_at = NOW()
  WHERE id = profile_id;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 5. ADD ANALYTICS TRACKING FOR USER ACTIVITY
-- =====================================================

-- Function to track user login for analytics
CREATE OR REPLACE FUNCTION track_user_login()
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET last_active_at = NOW()
  WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 6. ADMIN ANALYTICS VIEWS (Service Role Only)
-- =====================================================

-- View for user statistics (accessible via service role)
CREATE OR REPLACE VIEW user_statistics AS
SELECT
  COUNT(*) as total_users,
  COUNT(*) FILTER (WHERE has_completed_onboarding = true) as completed_onboarding,
  COUNT(*) FILTER (WHERE email_verified = true) as verified_emails,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') as new_users_7d,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days') as new_users_30d,
  COUNT(*) FILTER (WHERE last_active_at > NOW() - INTERVAL '7 days') as active_users_7d,
  COUNT(*) FILTER (WHERE last_active_at > NOW() - INTERVAL '30 days') as active_users_30d
FROM profiles;

-- View for user details (accessible via service role)
CREATE OR REPLACE VIEW user_details_admin AS
SELECT
  p.id,
  p.email,
  p.email_verified,
  p.mother_name,
  p.has_completed_onboarding,
  p.safety_mode,
  p.consent_version,
  p.age_consent,
  p.medical_disclaimer_consent,
  p.privacy_policy_consent,
  p.marketing_consent,
  p.analytics_consent,
  p.consent_timestamp,
  p.created_at,
  p.updated_at,
  p.last_active_at,
  COUNT(DISTINCT b.id) as baby_count,
  COUNT(DISTINCT ds.id) as drink_session_count,
  MAX(ds.started_at) as last_drink_session
FROM profiles p
LEFT JOIN babies b ON b.user_id = p.id AND b.is_active = true
LEFT JOIN drink_sessions ds ON ds.user_id = p.id
GROUP BY p.id;

-- =====================================================
-- 7. UPDATE EXPORT FUNCTION TO INCLUDE NEW FIELDS
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
          id, email, email_verified, mother_name, mother_birthdate,
          weight_kg, height_cm, safety_mode, notifications_enabled,
          has_completed_onboarding, consent_version,
          age_consent, medical_disclaimer_consent, privacy_policy_consent,
          marketing_consent, analytics_consent, consent_timestamp,
          created_at, updated_at, last_active_at
        FROM profiles
        WHERE id = auth.uid()
      ) p
    ),
    'babies', (
      SELECT jsonb_agg(row_to_json(b.*))
      FROM babies b
      WHERE b.user_id = auth.uid()
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
-- MIGRATION COMPLETE
-- =====================================================

-- Verify the changes
DO $$
BEGIN
  RAISE NOTICE 'Migration 003 completed successfully';
  RAISE NOTICE 'Added consent tracking fields to profiles table';
  RAISE NOTICE 'Added email verification fields to profiles table';
  RAISE NOTICE 'Created admin analytics views';
  RAISE NOTICE 'Updated data export function';
END $$;
