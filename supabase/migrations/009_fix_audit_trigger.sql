-- =====================================================
-- MOMMY MILK BAR - Fix Audit Trigger
-- =====================================================
-- Migration: 009
-- Purpose: Update audit trigger to remove references to deleted fields
-- Date: 2025-11-30
-- Fix: Remove height_cm and display_name from log_profile_update trigger
-- =====================================================

BEGIN;

-- =====================================================
-- Update the audit trigger function
-- =====================================================

CREATE OR REPLACE FUNCTION log_profile_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log significant changes (not every updated_at bump)
  -- REMOVED: height_cm, display_name (deleted in migration 008)
  IF (OLD.weight_kg IS DISTINCT FROM NEW.weight_kg OR
      OLD.safety_mode IS DISTINCT FROM NEW.safety_mode OR
      OLD.email IS DISTINCT FROM NEW.email OR
      OLD.email_verified IS DISTINCT FROM NEW.email_verified) THEN

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
        )
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '===========================================';
  RAISE NOTICE 'Migration 009 completed successfully!';
  RAISE NOTICE '===========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'FIXED:';
  RAISE NOTICE '  ✓ Updated log_profile_update() trigger';
  RAISE NOTICE '  ✓ Removed references to deleted fields:';
  RAISE NOTICE '    - height_cm (deleted in migration 008)';
  RAISE NOTICE '    - display_name (deleted in migration 008)';
  RAISE NOTICE '';
  RAISE NOTICE 'TRIGGER NOW LOGS:';
  RAISE NOTICE '  ✓ weight_kg changes';
  RAISE NOTICE '  ✓ safety_mode changes';
  RAISE NOTICE '  ✓ email changes';
  RAISE NOTICE '  ✓ email_verified changes';
  RAISE NOTICE '===========================================';
END $$;

COMMIT;
