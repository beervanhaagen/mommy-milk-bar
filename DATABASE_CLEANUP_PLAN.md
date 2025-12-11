# Database Cleanup Plan - Get Organized!

## 🚨 Current Problems

1. **Babies table is empty** - Baby data saved to settings, not babies table
2. **Redundant fields** - Old name fields still exist
3. **Unclear structure** - Data scattered between settings and separate tables
4. **Missing data** - Some onboarding questions don't save to database

## 📊 What Data is ACTUALLY Collected in Onboarding?

### Mother Data (from survey-you.tsx):
- ✅ Mother birthdate → Saved as `motherBirthdate` in settings
- ✅ Mother weight → Saved as `weightKg`
- ✅ Mother height → Saved as `heightCm`
- ❌ Mother name → REMOVED (privacy-first)

### Baby Data (from survey-baby.tsx):
- ✅ Baby birthdate → Saved as `babyBirthdate` in settings (NOT in babies table!)
- ✅ Baby weight → Saved as `babyWeightKg` in settings
- ✅ Baby length → Saved as `babyLengthCm` in settings
- ❌ Baby name → REMOVED (privacy-first)

### Feeding Data (from survey-feeding.tsx):
- ✅ Feeding type (breast/formula/mix) → `feedingType`
- ✅ Feeds per day → `feedsPerDay`
- ✅ Pump preference → `pumpPreference`
- ✅ Typical amount → `typicalAmountMl`
- ❓ "Hoe lang geef je al borstvoeding?" → Need to find where this is stored

### Account Data:
- ✅ Email → Required for account
- ✅ Password → Required for account
- ✅ Consent checkboxes → Required for GDPR

---

## 🎯 What Data is NEEDED for App Features?

### For Alcohol Breakdown Calculation:
| Field | Needed? | Why? | Table |
|-------|---------|------|-------|
| Mother weight | ✅ YES | Critical for alcohol metabolism calculation | profiles |
| Mother height | ❓ MAYBE | Often used in BAC formulas with weight | profiles |
| Mother age/birth_year | ❌ NO | Not used in alcohol calculations | profiles |
| Baby birthdate | ✅ YES | Determines feeding frequency patterns | babies |
| Baby weight | ❌ NO | Not needed for mother's alcohol breakdown | babies |
| Baby length | ❌ NO | Not needed for calculations | babies |

### For Personalization:
| Field | Needed? | Why? | Table |
|-------|---------|------|-------|
| Display name | ✅ YES | Personalized emails & UI | profiles |
| Baby label | ✅ YES | UI display ("Baby 1") | babies |

---

## ✅ Recommended Clean Database Structure

### **profiles** table (Mother data):
```sql
CREATE TABLE profiles (
  -- Identity
  id UUID PRIMARY KEY REFERENCES auth.users,
  email TEXT,
  email_verified BOOLEAN DEFAULT false,

  -- Optional personalization (can be added in profile later)
  display_name TEXT,  -- First name only

  -- Required for calculations
  weight_kg DECIMAL(4,1),  -- NEEDED: Alcohol breakdown
  height_cm INTEGER,       -- MAYBE NEEDED: BAC calculation

  -- App preferences
  safety_mode TEXT DEFAULT 'normal',
  notifications_enabled BOOLEAN DEFAULT true,

  -- Onboarding
  has_completed_onboarding BOOLEAN DEFAULT false,
  onboarding_completed_at TIMESTAMP WITH TIME ZONE,

  -- GDPR Consent
  consent_version TEXT DEFAULT '1.0.0',
  age_consent BOOLEAN DEFAULT false,
  medical_disclaimer_consent BOOLEAN DEFAULT false,
  privacy_policy_consent BOOLEAN DEFAULT false,
  marketing_consent BOOLEAN DEFAULT false,
  analytics_consent BOOLEAN DEFAULT false,
  consent_timestamp TIMESTAMP WITH TIME ZONE,

  -- Verification
  email_verification_token TEXT,
  email_verification_sent_at TIMESTAMP WITH TIME ZONE,
  email_verified_at TIMESTAMP WITH TIME ZONE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**REMOVED FIELDS:**
- ❌ `birth_year` - Not needed for calculations
- ❌ `mother_name` - Deprecated (use display_name)
- ❌ `mother_birthdate` - Deprecated (use birth_year if needed)

### **babies** table (Baby data):
```sql
CREATE TABLE babies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,

  -- Label (not real name)
  display_label TEXT NOT NULL DEFAULT 'Baby 1',

  -- Required for feeding patterns
  birthdate DATE NOT NULL,  -- NEEDED: Determines feeding frequency

  -- Feeding preferences
  feeding_type TEXT CHECK (feeding_type IN ('breast', 'formula', 'mix')),
  feeds_per_day INTEGER,
  typical_amount_ml INTEGER,
  pump_preference TEXT CHECK (pump_preference IN ('yes', 'no', 'later')),

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**REMOVED FIELDS:**
- ❌ `weight_kg` - Not needed for mother's alcohol breakdown
- ❌ `length_cm` - Not needed for calculations
- ❌ `name` - Deprecated (use display_label)

---

## 🔧 Fix: Baby Data Not Saving

### Problem:
Baby data is saved to `settings` object but never synced to `babies` table!

**Current flow:**
```
survey-baby.tsx
  → updateSettings({ babyBirthdate, babyWeightKg, babyLengthCm })
  → Saved to Redux store
  → AccountDone calls syncAllDataToSupabase(profile, babies)
  → BUT babies array is empty! 😱
```

### Solution:
Update the store to create a baby object when onboarding completes.

**Files to fix:**
1. `src/state/store.ts` - Create baby from settings
2. `app/onboarding/AccountDone.tsx` - Ensure baby is created

---

## 📝 Action Plan

### Phase 1: Fix Baby Data Saving (URGENT)
- [ ] Update store to create baby object from settings
- [ ] Test that baby is saved to Supabase after onboarding
- [ ] Verify baby appears in babies table

### Phase 2: Remove Unnecessary Fields
- [ ] Run migration to remove:
  - `birth_year` from profiles (not needed)
  - `weight_kg`, `length_cm` from babies (not needed)
- [ ] Update TypeScript types
- [ ] Update UI to not show removed fields

### Phase 3: Verify Calculations Work
- [ ] Confirm alcohol breakdown only needs:
  - Mother weight ✅
  - Mother height ❓ (verify if needed)
  - Baby birthdate ✅ (for feeding patterns)
- [ ] Remove height if not needed

### Phase 4: Clean Up Store Structure
- [ ] Simplify settings object
- [ ] Remove redundant fields
- [ ] Clear documentation

---

## ❓ Questions to Answer

1. **Is mother's height needed for alcohol calculations?**
   - If NO → Remove from profiles table
   - If YES → Keep it

2. **What is "hoe lang geef je al borstvoeding?" used for?**
   - Find where it's stored
   - Determine if it's needed
   - Add to database if missing

3. **Do we need baby weight/length at all?**
   - Currently NOT used in calculations
   - Could be useful for milestone tracking?
   - Decide: keep or remove

---

## 🎯 Final Clean Database (Proposal)

### profiles (Mother):
- ✅ email
- ✅ display_name (optional, for personalization)
- ✅ weight_kg (NEEDED for alcohol calculation)
- ❓ height_cm (verify if needed)
- ✅ safety_mode, notifications
- ✅ consent fields
- ❌ birth_year (remove - not needed)

### babies:
- ✅ display_label ("Baby 1")
- ✅ birthdate (NEEDED for feeding patterns)
- ✅ feeding_type, feeds_per_day, etc.
- ❌ weight_kg (remove - not needed)
- ❌ length_cm (remove - not needed)

This gives you a **clean, minimal, purpose-driven database** with only what's actually needed!
