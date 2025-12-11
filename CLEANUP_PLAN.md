# Database & Onboarding Cleanup Plan

## Goal
Remove unnecessary PII collection and clean up database schema to match privacy-first approach.

## Phase 1: Remove Names from Onboarding (Immediate)

### 1. Remove survey-names.tsx from onboarding flow

**Files to update:**
- [ ] Remove screen from onboarding navigation
- [ ] Update progress bar calculations
- [ ] Test onboarding flow without names screen

**Onboarding will collect:**
- ✅ Email (required for account)
- ✅ Password (required for account)
- ✅ Baby birthdate (required for features)
- ✅ Feeding preferences (required for features)
- ✅ Weight/height (required for calculations)
- ✅ Consent checkboxes (required for compliance)
- ❌ Mother name (removed - can add later in profile)
- ❌ Baby name (removed - auto-labeled as "Baby 1")

### 2. Update default behavior

**Baby labels:**
```typescript
// When creating baby during onboarding
display_label: "Baby 1"  // Auto-generated, not user-provided
```

**Mother display name:**
```typescript
display_name: null  // Can be added later in profile
birth_year: null     // Can be added later in profile
```

---

## Phase 2: Database Schema Cleanup (After Testing)

### Current Schema (Messy):
```sql
-- profiles table
display_name TEXT,          -- NEW: Privacy-friendly ✅
birth_year INTEGER,         -- NEW: Privacy-friendly ✅
mother_name TEXT,           -- OLD: Deprecated ❌
mother_birthdate TEXT,      -- OLD: Deprecated ❌

-- babies table
display_label TEXT,         -- NEW: Privacy-friendly ✅
name TEXT,                  -- OLD: Deprecated ❌
```

### Clean Schema (Goal):
```sql
-- profiles table
display_name TEXT,          -- Optional first name
birth_year INTEGER,         -- Optional birth year
-- mother_name REMOVED
-- mother_birthdate REMOVED

-- babies table
display_label TEXT NOT NULL DEFAULT 'Baby 1',  -- Generic label
-- name REMOVED
```

### Migration to Clean Up:

**File:** `supabase/migrations/006_remove_deprecated_pii_fields.sql`

```sql
-- =====================================================
-- MOMMY MILK BAR - Remove Deprecated PII Fields
-- =====================================================
-- Migration: 006
-- Purpose: Clean up deprecated mother_name and baby name fields
-- Date: 2025-11-28
-- =====================================================

-- =====================================================
-- 1. VERIFY DATA MIGRATION COMPLETED
-- =====================================================

-- Check if new fields are being used
DO $$
DECLARE
  profiles_migrated INTEGER;
  babies_migrated INTEGER;
BEGIN
  -- Count profiles using new fields
  SELECT COUNT(*) INTO profiles_migrated
  FROM profiles
  WHERE display_name IS NOT NULL OR birth_year IS NOT NULL;

  -- Count babies using new fields
  SELECT COUNT(*) INTO babies_migrated
  FROM babies
  WHERE display_label IS NOT NULL;

  RAISE NOTICE 'Profiles using new fields: %', profiles_migrated;
  RAISE NOTICE 'Babies using new fields: %', babies_migrated;

  IF profiles_migrated = 0 AND babies_migrated = 0 THEN
    RAISE WARNING 'No data migrated yet. Review before dropping columns.';
  END IF;
END $$;

-- =====================================================
-- 2. DROP DEPRECATED COLUMNS
-- =====================================================

-- Remove old PII columns from profiles
ALTER TABLE profiles
  DROP COLUMN IF EXISTS mother_name,
  DROP COLUMN IF EXISTS mother_birthdate;

-- Remove old name column from babies
ALTER TABLE babies
  DROP COLUMN IF EXISTS name;

-- =====================================================
-- 3. ADD NOT NULL CONSTRAINT TO display_label
-- =====================================================

-- Set default for any NULL display_labels
UPDATE babies
SET display_label = 'Baby ' || ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at)
WHERE display_label IS NULL;

-- Make display_label required (with default)
ALTER TABLE babies
  ALTER COLUMN display_label SET NOT NULL,
  ALTER COLUMN display_label SET DEFAULT 'Baby 1';

-- =====================================================
-- VERIFICATION
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE 'Migration 006 completed successfully';
  RAISE NOTICE 'Removed deprecated PII fields';
  RAISE NOTICE 'Database schema is now clean and privacy-focused';
  RAISE NOTICE '';
  RAISE NOTICE 'NEXT STEPS:';
  RAISE NOTICE '1. Update app code to remove references to old fields';
  RAISE NOTICE '2. Test onboarding without names screen';
  RAISE NOTICE '3. Verify profile editing still works';
END $$;
```

---

## Phase 3: Update App Code

### Files to update:

1. **Remove from onboarding:**
   - [ ] `app/onboarding/survey-names.tsx` (delete or skip)
   - [ ] Update onboarding router navigation

2. **Update state/store:**
   - [ ] Remove `motherName`, `babyName` from Settings type
   - [ ] Keep only `display_name` (optional, added via profile)

3. **Update profile service:**
   - [ ] Remove references to deprecated `mother_name`, `mother_birthdate`, `name`
   - [ ] Only use `display_name`, `birth_year`, `display_label`

4. **Update database types:**
   - [ ] Remove deprecated fields from `database.ts`

---

## Timeline

### Week 1: Remove Names from Onboarding
1. Add "Skip" button to survey-names.tsx (temporary)
2. Test that onboarding works without collecting names
3. Update default baby label generation

### Week 2: Database Cleanup
1. Verify all new users use new fields
2. Run migration 006 to drop old columns
3. Update TypeScript types
4. Remove survey-names.tsx entirely

### Week 3: Testing
1. Test full onboarding flow
2. Test profile editing (adding names optionally)
3. Test data export (should only show display_name/birth_year)
4. Test account deletion

---

## Benefits After Cleanup

✅ **Privacy-first approach:** Only collect what's absolutely needed
✅ **Cleaner database:** No deprecated fields
✅ **Simpler onboarding:** Faster, less friction
✅ **App Store friendly:** Minimal PII collection
✅ **Easier to maintain:** Clear data model

---

## Questions to Answer

1. **Do you want to remove survey-names.tsx entirely?**
   - Recommended: YES (better privacy, simpler onboarding)

2. **Do you want to keep optional name fields in profile page?**
   - Recommended: YES (user choice, privacy-friendly)

3. **When should we run migration 006?**
   - Recommended: After onboarding changes are tested and deployed
