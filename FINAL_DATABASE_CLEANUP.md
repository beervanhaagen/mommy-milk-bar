# Final Database Cleanup Plan

**Date:** 2025-11-28
**Status:** ✅ Ready to Execute

---

## Decisions Made

Based on your input and code analysis:

### ❌ Fields to Remove:
1. **`profiles.birth_year`**
   - Reason: Not used anywhere in the app
   - Impact: None

2. **`profiles.height_cm`**
   - Reason: NOT used in alcohol calculation algorithm
   - Algorithm only uses: `weightKg`, `stdDrinkGrams`, `conservativeFactor`
   - Impact: None

3. **`profiles.display_name`**
   - Reason: Not collecting for MVP
   - You decided: "Mom name not for MVP"
   - Impact: None (field is currently empty anyway)

4. **`babies.weight_kg`**
   - Reason: Not needed for mother's alcohol breakdown
   - Impact: None

5. **`babies.length_cm`**
   - Reason: Not needed for calculations
   - Impact: None

### ✅ Tables/Fields to Keep:
1. **`content_tips` + `user_tip_interactions`**
   - Reason: You confirmed "Tips are used" (showing underneath countdown)
   - Keep: YES

2. **`feeding_logs`**
   - Reason: Potential future feature
   - Strategy: Keep for now, delete later if stays empty
   - Keep: YES (for now)

3. **`profiles.weight_kg`**
   - Reason: CRITICAL for alcohol calculation
   - Keep: YES

---

## Migration Files Created

### 1. [supabase/migrations/007_cleanup_extra_tables.sql](supabase/migrations/007_cleanup_extra_tables.sql)
**Purpose:** Remove security-risk tables not in our schema
- Removes: `audit_log`, `data_exports`, `failed_login_attempts`, etc.
- These were marked "Unrestricted" = major security vulnerability

### 2. [supabase/migrations/008_remove_unused_fields.sql](supabase/migrations/008_remove_unused_fields.sql)
**Purpose:** Remove unused fields based on actual usage
- Removes: `birth_year`, `height_cm`, `display_name` from profiles
- Removes: `weight_kg`, `length_cm` from babies
- Includes safety checks and detailed logging

---

## Execution Plan

### Step 1: Test Locally (RECOMMENDED)
```bash
# Reset local database with all migrations
npx supabase db reset

# This will run migrations 001-008 in order
# Check for any errors in the output
```

### Step 2: Backup Production (CRITICAL!)
```bash
# Export current production data
npx supabase db dump --data-only > backup_before_cleanup.sql

# Store this backup somewhere safe!
```

### Step 3: Run on Production
Option A: Via CLI (safer, can be tested locally first)
```bash
npx supabase db push
```

Option B: Via Supabase Dashboard (more manual)
1. Go to SQL Editor in Supabase Dashboard
2. Copy contents of `007_cleanup_extra_tables.sql`
3. Run it
4. Check output for errors
5. Copy contents of `008_remove_unused_fields.sql`
6. Run it
7. Check output for errors

---

## Code Updates Required After Migration

### 1. Update TypeScript Types
File: [src/types/database.ts](src/types/database.ts)

Remove these fields:
```typescript
// From profiles Row/Insert/Update:
birth_year: number | null;        // ❌ REMOVE
height_cm: number | null;         // ❌ REMOVE
display_name: string | null;      // ❌ REMOVE

// From babies Row/Insert/Update:
weight_kg: number | null;         // ❌ REMOVE
length_cm: number | null;         // ❌ REMOVE
```

### 2. Update Profile Service
File: [src/services/profile.service.ts](src/services/profile.service.ts)

Remove these lines:
```typescript
// In syncProfileToSupabase (lines 32-48):
const firstName = profile.motherName === 'prefer_not_to_share'  // ❌ REMOVE
  ? null
  : profile.motherName?.split(' ')[0] || null;

const birthYear = profile.motherBirthdate                        // ❌ REMOVE
  ? new Date(profile.motherBirthdate).getFullYear()
  : null;

display_name: firstName,          // ❌ REMOVE from profileData
birth_year: birthYear,            // ❌ REMOVE from profileData
height_cm: profile.heightCm || null,  // ❌ REMOVE from profileData

// In syncBabyToSupabase (lines 94-111):
weight_kg: baby.weightKg || null,     // ❌ REMOVE from babyData
length_cm: baby.lengthCm || null,     // ❌ REMOVE from babyData

// In loadProfileFromSupabase (lines 187-209):
motherName: profileData.display_name || undefined,  // ❌ REMOVE
motherBirthdate: profileData.birth_year ? ... : undefined,  // ❌ REMOVE
heightCm: profileData.height_cm || undefined,  // ❌ REMOVE

weightKg: baby.weight_kg || undefined,  // ❌ REMOVE
lengthCm: baby.length_cm || undefined,  // ❌ REMOVE
```

### 3. Update Store Types
File: [src/state/store.ts](src/state/store.ts)

```typescript
// From MotherProfile type (lines 26-57):
export type MotherProfile = {
  id?: string;
  motherName?: string | 'prefer_not_to_share';  // ❌ REMOVE (not collecting)
  motherBirthdate?: string;                      // ❌ REMOVE (not using)
  weightKg?: number;                             // ✓ KEEP
  heightCm?: number;                             // ❌ REMOVE (not in algorithm)
  // ... rest stays
};

// From Baby type (lines 63-85):
export type Baby = {
  id: string;
  name?: string | 'prefer_not_to_share';  // Keep as display_label
  birthdate: string;                      // ✓ KEEP
  weightKg?: number;                      // ❌ REMOVE
  lengthCm?: number;                      // ❌ REMOVE
  // ... rest stays
};
```

### 4. Update Onboarding Screens

File: [app/onboarding/survey-you.tsx](app/onboarding/survey-you.tsx)
- Remove height input (or skip saving it)
- Remove birthdate input (or skip saving it)

File: [app/onboarding/survey-baby.tsx](app/onboarding/survey-baby.tsx)
- Remove baby weight input (or skip saving it)
- Remove baby length input (or skip saving it)

File: [app/onboarding/survey-names.tsx](app/onboarding/survey-names.tsx)
- Already removed? Check if mother name is still collected

---

## Verification Checklist

After running migrations and updating code:

### Database:
- [ ] Migration 007 ran successfully (check Supabase logs)
- [ ] Migration 008 ran successfully (check Supabase logs)
- [ ] Extra tables removed (check table list in dashboard)
- [ ] Unused fields removed (check profiles/babies schema)

### Code:
- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] Profile service builds without errors
- [ ] Store types are correct
- [ ] App builds successfully

### Testing:
- [ ] Create new test account
- [ ] Complete onboarding flow
- [ ] Check Supabase: profile data saved correctly
- [ ] Check Supabase: baby data saved correctly
- [ ] Log a drink session
- [ ] Check countdown works (uses weight for calculation)
- [ ] Verify tips show underneath countdown

---

## Before & After Comparison

### profiles Table

**BEFORE:**
- id, email, email_verified, email_verification_* fields
- ~~display_name~~ ❌
- ~~birth_year~~ ❌
- weight_kg ✅
- ~~height_cm~~ ❌
- safety_mode, notifications_enabled
- onboarding fields
- All consent fields
- Timestamps

**AFTER:**
- id, email, email_verified, email_verification_* fields
- weight_kg ✅ (ONLY physical measurement needed!)
- safety_mode, notifications_enabled
- onboarding fields
- All consent fields
- Timestamps

### babies Table

**BEFORE:**
- id, user_id
- display_label
- birthdate ✅
- ~~weight_kg~~ ❌
- ~~length_cm~~ ❌
- feeding fields
- is_active
- Timestamps

**AFTER:**
- id, user_id
- display_label
- birthdate ✅ (for age-based features)
- feeding fields (type, feeds_per_day, amount, pump preference)
- is_active
- Timestamps

---

## Result

### Data We Now Collect:

**Mother:**
- ✅ Email (required for account)
- ✅ Weight (required for alcohol calculation)
- ✅ Consent preferences (GDPR)

**Baby:**
- ✅ Birthdate (for age-based features)
- ✅ Feeding preferences (type, frequency, amount, pump)

**That's it!** Super lean and privacy-focused. 🎉

### Calculations Still Work:
- ✅ Alcohol breakdown uses: `weightKg` only
- ✅ LactMed nomogram: 54kg→2.5h, 68kg→2.25h, 82kg→2.0h
- ✅ Conservative factor: +15% safety margin
- ✅ Zero-order clearance model

---

## Rollback Plan (Just in Case)

If something goes wrong:

```sql
-- Restore fields (will be NULL for existing records)
ALTER TABLE profiles
  ADD COLUMN birth_year INTEGER,
  ADD COLUMN height_cm INTEGER,
  ADD COLUMN display_name TEXT;

ALTER TABLE babies
  ADD COLUMN weight_kg DECIMAL(5,2),
  ADD COLUMN length_cm INTEGER;
```

Then restore from backup:
```bash
psql -h <your-db-host> -U postgres -d postgres < backup_before_cleanup.sql
```

---

## Summary

You now have a **clean, minimal, privacy-first database** that:
- ✅ Collects only what's needed
- ✅ Removes all unnecessary fields
- ✅ Keeps tips system (you're using it!)
- ✅ Keeps feeding_logs (potential future feature)
- ✅ Removes security-risk tables
- ✅ Still supports all current features

**Next step:** Run the migrations and update the code!

Ready to execute? 🚀
