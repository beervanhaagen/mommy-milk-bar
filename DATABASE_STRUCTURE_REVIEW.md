# Mommy Milk Bar - Database Structure Review

**Date:** 2025-11-25
**Reviewer:** Claude
**Purpose:** Align Supabase database structure with onboarding data collection

---

## Executive Summary

The current database schema is well-designed and privacy-focused, but there are **critical misalignments** between:
1. Data collected in onboarding
2. Data stored in local state (Zustand)
3. Data structure in Supabase

**Key Issues:**
- ❌ Consent data collected but not stored
- ❌ Baby data mixed with mother data (should be separate tables)
- ❌ No data sync between local state and Supabase
- ❌ Unused fields cluttering the data model
- ⚠️ App doesn't leverage multi-baby support from schema

---

## Current Data Collection Flow

### 1. Privacy Consent Screen (`/onboarding/privacy-consent.tsx`)
**Collects:**
- ✅ Age verification (18+)
- ✅ Medical disclaimer acceptance
- ✅ Privacy policy acceptance

**Problem:** ❌ These consents are collected but **NOT STORED ANYWHERE**
- Not saved to Zustand store
- Not passed to signup flow
- Not tracked in database

**GDPR Risk:** This is a compliance issue. You need proof that users consented.

---

### 2. Onboarding Survey Data

#### Survey: Names (`/onboarding/survey-names.tsx`)
```typescript
motherName: string | 'prefer_not_to_share'
babyName: string | 'prefer_not_to_share'
```

#### Survey: About You (`/onboarding/survey-you.tsx`)
```typescript
motherBirthdate: string (ISO date)
weightKg: number
heightCm: number
```

#### Survey: Baby (`/onboarding/survey-baby.tsx`)
```typescript
babyBirthdate: string (ISO date)
babyWeightKg?: number (optional)
babyLengthCm?: number (optional)
```

#### Survey: Feeding (`/onboarding/survey-feeding.tsx`)
```typescript
feedingType: 'breast' | 'formula' | 'mix'
pumpPreference: 'yes' | 'no' | 'later'
feedsPerDay?: number (optional)
typicalAmountMl?: number (optional)
```

---

## Current Supabase Schema

### Table: `profiles` (Mother's Data)
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY,                      -- Links to auth.users

  -- Personal info
  mother_name TEXT,
  mother_birthdate DATE,
  weight_kg DECIMAL(5,2),
  height_cm INTEGER,

  -- Settings
  safety_mode TEXT DEFAULT 'normal',
  notifications_enabled BOOLEAN DEFAULT true,
  has_completed_onboarding BOOLEAN DEFAULT false,

  -- Consent (GDPR)
  consent_version TEXT DEFAULT '1.0.0',
  marketing_consent BOOLEAN DEFAULT false,
  analytics_consent BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  last_active_at TIMESTAMP
);
```

### Table: `babies` (Baby's Data)
```sql
CREATE TABLE babies (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),     -- Links to mother

  -- Baby info
  name TEXT,
  birthdate DATE NOT NULL,
  weight_kg DECIMAL(5,2),
  length_cm INTEGER,

  -- Feeding preferences
  feeding_type TEXT,                        -- 'breast', 'formula', 'mix'
  feeds_per_day INTEGER,
  typical_amount_ml INTEGER,
  pump_preference TEXT,                     -- 'yes', 'no', 'later'

  -- Status
  is_active BOOLEAN DEFAULT true,           -- Support multiple babies

  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

---

## Critical Misalignments

### ❌ Issue 1: Data Organization Mismatch

**Current Zustand Store (`src/state/store.ts`):**
```typescript
export type Settings = {
  // Mother data
  weightKg?: number;
  heightCm?: number;
  motherBirthdate?: string;
  motherName?: string | 'prefer_not_to_share';

  // Baby data (mixed in!)
  babyBirthdate?: string;
  babyWeightKg?: number;
  babyLengthCm?: number;
  babyName?: string | 'prefer_not_to_share';

  // Feeding data (should be in babies table!)
  feedingType?: 'breast' | 'formula' | 'mix';
  feedsPerDay?: number;
  typicalAmountMl?: number;
  pumpPreference?: 'yes' | 'no' | 'later';

  // App settings
  safetyMode: 'normal' | 'cautious';
  notificationsEnabled: boolean;
  hasCompletedOnboarding: boolean;

  // Unused fields
  breastfeedingWeeks?: number;              // ❌ Not collected anywhere
  givesFormula?: boolean;                   // ❌ Superseded by feedingType
  milkProductionStable?: 'stable' | 'variable' | 'uncertain';  // ❌ Not collected
};
```

**Problem:** Everything is flat and mixed together. Baby data should be separate.

---

### ❌ Issue 2: Consent Data Not Tracked

**Privacy Consent Screen** collects these acceptances:
- Age verification (18+)
- Medical disclaimer
- Privacy policy

**But:** These are NOT stored anywhere!

**Supabase has fields for this:**
```sql
consent_version TEXT DEFAULT '1.0.0',
marketing_consent BOOLEAN,
analytics_consent BOOLEAN
```

**Missing:**
- Age consent
- Medical disclaimer consent
- Privacy policy consent timestamp

**Recommendation:** Add these fields to `profiles` table:
```sql
age_consent BOOLEAN DEFAULT false,
medical_disclaimer_consent BOOLEAN DEFAULT false,
privacy_policy_consent BOOLEAN DEFAULT false,
consent_timestamp TIMESTAMP
```

---

### ❌ Issue 3: No Data Sync Logic

**Current State:**
- Onboarding collects data → Saves to Zustand → Saves to AsyncStorage (local only)
- Auth service creates empty profile in Supabase
- **No sync between local and remote**

**Missing:**
1. Function to sync onboarding data to Supabase after completion
2. Function to load profile data from Supabase on app start
3. Real-time sync for profile updates
4. Conflict resolution strategy

---

### ❌ Issue 4: Baby Data Structure

**Current:** Baby data mixed in flat Settings object
**Schema Design:** Separate `babies` table with one-to-many relationship

**Why this matters:**
- A mother could have multiple babies (twins, or using app for multiple children)
- Schema supports this, app doesn't
- Feeding preferences are per-baby, not per-mother

**Current Profile Page Issue:**
You have a single "Over je baby" card, but schema allows multiple babies.

---

## Recommended Data Structure

### Zustand Store (Revised)

```typescript
// Mother's profile
export type MotherProfile = {
  id?: string;  // UUID from auth
  motherName?: string | 'prefer_not_to_share';
  motherBirthdate?: string;
  weightKg?: number;
  heightCm?: number;

  // App settings
  safetyMode: 'normal' | 'cautious';
  notificationsEnabled: boolean;
  hasCompletedOnboarding: boolean;

  // Consent tracking
  consentVersion: string;
  ageConsent?: boolean;
  medicalDisclaimerConsent?: boolean;
  privacyPolicyConsent?: boolean;
  marketingConsent?: boolean;
  analyticsConsent?: boolean;
  consentTimestamp?: string;
};

// Baby data (separate!)
export type Baby = {
  id?: string;  // UUID
  name?: string | 'prefer_not_to_share';
  birthdate: string;
  weightKg?: number;
  lengthCm?: number;

  // Feeding (per baby, not per mother!)
  feedingType?: 'breast' | 'formula' | 'mix';
  feedsPerDay?: number;
  typicalAmountMl?: number;
  pumpPreference?: 'yes' | 'no' | 'later';

  isActive: boolean;
};

// Updated store
type Store = {
  profile: MotherProfile;
  babies: Baby[];  // Support multiple babies
  activeBabyId?: string;  // Which baby is currently selected

  // Actions
  updateProfile: (data: Partial<MotherProfile>) => void;
  addBaby: (baby: Baby) => void;
  updateBaby: (id: string, data: Partial<Baby>) => void;
  setActiveBaby: (id: string) => void;

  // Sync
  syncToSupabase: () => Promise<void>;
  loadFromSupabase: () => Promise<void>;
};
```

---

## Data Flow Recommendations

### 1. On Signup (After Privacy Consent)

```typescript
// In privacy-consent.tsx, save consents to store
updateProfile({
  consentVersion: '1.0.0',
  ageConsent: acceptedAge,
  medicalDisclaimerConsent: acceptedDisclaimer,
  privacyPolicyConsent: acceptedPrivacy,
  consentTimestamp: new Date().toISOString(),
});
```

### 2. During Onboarding

```typescript
// survey-names.tsx
updateProfile({ motherName });
updateBaby(activeBabyId, { name: babyName });

// survey-you.tsx
updateProfile({ motherBirthdate, weightKg, heightCm });

// survey-baby.tsx
updateBaby(activeBabyId, { birthdate, weightKg, lengthCm });

// survey-feeding.tsx
updateBaby(activeBabyId, { feedingType, pumpPreference, feedsPerDay, typicalAmountMl });
```

### 3. After Onboarding Completion

```typescript
// In completion screen
async function completeOnboarding() {
  // 1. Mark onboarding complete
  updateProfile({ hasCompletedOnboarding: true });

  // 2. Sync all data to Supabase
  await syncToSupabase();

  // 3. Navigate to main app
  router.replace('/(tabs)');
}
```

### 4. On App Start

```typescript
// In app initialization
async function initializeApp() {
  // 1. Check if user is authenticated
  const session = await getSession();

  if (session) {
    // 2. Load profile and babies from Supabase
    await loadFromSupabase();

    // 3. Navigate based on onboarding status
    if (profile.hasCompletedOnboarding) {
      router.replace('/(tabs)');
    } else {
      router.replace('/onboarding');
    }
  } else {
    router.replace('/landing');
  }
}
```

---

## Migration Plan

### Phase 1: Add Consent Tracking (Critical)

**Database Migration:**
```sql
-- Add consent fields to profiles table
ALTER TABLE profiles ADD COLUMN age_consent BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN medical_disclaimer_consent BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN privacy_policy_consent BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN consent_timestamp TIMESTAMP WITH TIME ZONE;
```

**Update Privacy Consent Screen:**
- Save consent choices to Zustand store
- Pass to signup/profile creation

---

### Phase 2: Restructure Data Model

**Update Zustand Store:**
1. Split Settings into MotherProfile and Baby types
2. Change from single settings object to profile + babies array
3. Update all references throughout the app

**Estimated Impact:**
- 15-20 files need updates
- profile.tsx needs refactoring (support multiple babies UI)
- All onboarding screens need updated store calls

---

### Phase 3: Implement Data Sync

**Create Sync Service (`src/services/profile.service.ts`):**
```typescript
export const syncProfileToSupabase = async (profile: MotherProfile) => {
  const { error } = await supabase
    .from('profiles')
    .upsert({
      id: profile.id,
      mother_name: profile.motherName,
      mother_birthdate: profile.motherBirthdate,
      weight_kg: profile.weightKg,
      height_cm: profile.heightCm,
      safety_mode: profile.safetyMode,
      notifications_enabled: profile.notificationsEnabled,
      has_completed_onboarding: profile.hasCompletedOnboarding,
      consent_version: profile.consentVersion,
      age_consent: profile.ageConsent,
      medical_disclaimer_consent: profile.medicalDisclaimerConsent,
      privacy_policy_consent: profile.privacyPolicyConsent,
      marketing_consent: profile.marketingConsent,
      analytics_consent: profile.analyticsConsent,
      consent_timestamp: profile.consentTimestamp,
    });

  if (error) throw error;
};

export const syncBabyToSupabase = async (baby: Baby, userId: string) => {
  const { error } = await supabase
    .from('babies')
    .upsert({
      id: baby.id,
      user_id: userId,
      name: baby.name,
      birthdate: baby.birthdate,
      weight_kg: baby.weightKg,
      length_cm: baby.lengthCm,
      feeding_type: baby.feedingType,
      feeds_per_day: baby.feedsPerDay,
      typical_amount_ml: baby.typicalAmountMl,
      pump_preference: baby.pumpPreference,
      is_active: baby.isActive,
    });

  if (error) throw error;
};
```

---

### Phase 4: Clean Up Unused Fields

**Remove from Store:**
- ❌ `breastfeedingWeeks` - not collected or used
- ❌ `givesFormula` - superseded by `feedingType`
- ❌ `milkProductionStable` - not collected or used

**Search and remove all references** to these fields.

---

## Database Schema Updates Needed

### Update: Add Consent Fields

```sql
-- Migration: 003_add_consent_fields.sql

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS age_consent BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS medical_disclaimer_consent BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS privacy_policy_consent BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS consent_timestamp TIMESTAMP WITH TIME ZONE;

-- Update existing users to have implicit consent (migration only)
UPDATE profiles
SET
  age_consent = true,
  medical_disclaimer_consent = true,
  privacy_policy_consent = true,
  consent_timestamp = created_at
WHERE consent_timestamp IS NULL;
```

---

## Profile Page Multi-Baby Support

**Current:** Single "Over je baby" card
**Recommendation:**

### Option A: Keep Single Baby (Simple)
If you don't plan to support multiple babies in v1:
- Keep current UI
- Still separate baby data in store/DB (future-proof)
- Use `activeBabyId` to track the one baby

### Option B: Full Multi-Baby Support
Add ability to:
- Switch between multiple babies
- Add new baby
- Archive/deactivate babies

**UI Mockup:**
```
Profile
└─ Mama & [Baby Selector ▼]
   ├─ Emma (active)
   ├─ Lucas
   └─ + Voeg baby toe

[Over jou] card
[Over Emma] card  ← Changes based on selection
[Voeding] card     ← Per-baby feeding info
```

---

## Priority Recommendations

### 🔴 Critical (Do First)

1. **Add Consent Tracking**
   - Add database fields
   - Update privacy consent screen to save consents
   - Update signup to include consent data
   - **Why:** GDPR compliance requirement

2. **Separate Baby Data in Store**
   - Refactor Settings type into MotherProfile + Baby
   - Update all onboarding screens
   - **Why:** Prevents future technical debt

### 🟡 High Priority (Do Soon)

3. **Implement Data Sync**
   - Create profile/baby sync service
   - Sync after onboarding completion
   - Load from Supabase on app start
   - **Why:** Currently all data is local-only

4. **Update Profile Page**
   - Decide on single vs multi-baby approach
   - Update UI to reflect data model
   - **Why:** User experience consistency

### 🟢 Medium Priority (Can Wait)

5. **Clean Up Unused Fields**
   - Remove `breastfeedingWeeks`, `givesFormula`, `milkProductionStable`
   - **Why:** Code cleanliness

6. **Add Real-time Sync**
   - Listen to profile changes from other devices
   - Handle conflicts
   - **Why:** Better UX, but not critical for v1

---

## Summary

Your Supabase schema is **well-designed and privacy-focused** ✅
Your onboarding flow **collects the right data** ✅

**But:**
- Data is stored in the wrong structure (flat instead of relational)
- Consent tracking is missing (GDPR risk!)
- No sync between local and remote data
- App doesn't leverage schema's multi-baby support

**Recommendation:** Follow the 3-phase migration plan above to align everything properly.

---

## Questions for You

1. **Multi-baby support:** Do you want to support multiple babies in v1, or keep it simple with one baby per account?

2. **Data sync strategy:** Should profile updates sync immediately, or only when user manually saves?

3. **Existing users:** Do you have any existing users with data, or can we do a clean migration?

4. **Consent granularity:** The privacy screen has 3 separate consents. Should we track each separately, or as one "privacy_policy_consent"?

5. **Names preference:** When user selects "prefer not to share", should we store this as NULL or as the string 'prefer_not_to_share'? (Affects how we display "Mama" vs actual name)

Let me know your thoughts and I can help implement the migration!
