-- =====================================================
-- MOMMY MILK BAR - Fix Audit Log Triggers
-- =====================================================
-- Migration: 010
-- Purpose: Fix audit log triggers that reference non-existent columns
-- Date: 2025-11-30
-- =====================================================

-- =====================================================
-- 1. FIX PROFILE UPDATE TRIGGER
-- =====================================================

-- Drop the existing trigger
DROP TRIGGER IF EXISTS profile_update_audit ON profiles;

-- Recreate the function without referencing display_name
CREATE OR REPLACE FUNCTION log_profile_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log significant changes (not every updated_at bump)
  IF (OLD.weight_kg IS DISTINCT FROM NEW.weight_kg OR
      OLD.height_cm IS DISTINCT FROM NEW.height_cm OR
      OLD.mother_name IS DISTINCT FROM NEW.mother_name OR
      OLD.safety_mode IS DISTINCT FROM NEW.safety_mode OR
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

-- Recreate the trigger
CREATE TRIGGER profile_update_audit
  AFTER UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION log_profile_update();

-- =====================================================
-- 2. FIX BABY DELETION TRIGGER
-- =====================================================

-- Drop the existing trigger
DROP TRIGGER IF EXISTS baby_deleted_audit ON babies;

-- Recreate the function without referencing display_label
CREATE OR REPLACE FUNCTION log_baby_deleted()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM log_audit_event(
    OLD.user_id,
    'baby_deleted',
    'baby',
    OLD.id::text,
    NULL,
    jsonb_build_object('baby_name', OLD.name)
  );

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
CREATE TRIGGER baby_deleted_audit
  BEFORE DELETE ON babies
  FOR EACH ROW
  EXECUTE FUNCTION log_baby_deleted();

-- =====================================================
-- MIGRATION VERIFICATION
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE 'Migration 010 completed successfully';
  RAISE NOTICE 'Fixed profile_update_audit trigger';
  RAISE NOTICE 'Fixed baby_deleted_audit trigger';
  RAISE NOTICE 'Account deletion should now work properly';
END $$;
