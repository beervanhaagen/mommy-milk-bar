# Privacy Testing Checklist - App Store Submission

## Test 1: Create New Account & Verify Privacy Fields

### Step 1: Create Test Account in App
1. **Delete app** from your device (if installed)
2. **Reinstall** and open the app
3. **Complete onboarding** with test data:
   ```
   Mother Name: "Emma Johnson"
   Mother Birthdate: "1990-05-15"
   Baby Name: "Oliver"
   Baby Birthdate: [today's date - 3 months]
   ```
4. **Create account**:
   ```
   Email: test-privacy@example.com
   Password: TestPass123!
   ```
5. Complete the account creation flow

### Step 2: Check Supabase Database
1. Go to **Supabase Dashboard** → https://supabase.com/dashboard
2. Select your Mommy Milk Bar project
3. Navigate to **Database** → **Table Editor**

#### Check PROFILES Table:
1. Click on **profiles** table
2. Find the row with email `test-privacy@example.com`
3. **Verify these exact fields:**

| Field Name | Expected Value | ✅/❌ |
|------------|----------------|-------|
| `display_name` | `"Emma"` (first name only!) | ⬜ |
| `birth_year` | `1990` (year only!) | ⬜ |
| `mother_name` | `NULL` or old value | ⬜ |
| `mother_birthdate` | `NULL` or old value | ⬜ |
| `email` | `"test-privacy@example.com"` | ⬜ |
| `email_verified` | `false` | ⬜ |
| `age_consent` | `true` | ⬜ |
| `medical_disclaimer_consent` | `true` | ⬜ |
| `privacy_policy_consent` | `true` | ⬜ |
| `consent_version` | `"1.0.0"` | ⬜ |
| `consent_timestamp` | [ISO date] | ⬜ |
| `has_completed_onboarding` | `true` | ⬜ |

**✅ PASS CRITERIA**:
- `display_name` contains ONLY first name ("Emma"), NOT full name
- `birth_year` contains ONLY year (1990), NOT full date
- Old fields (`mother_name`, `mother_birthdate`) should be NULL or deprecated

---

#### Check BABIES Table:
1. Click on **babies** table
2. Find the row for the test user (match `user_id` to profile `id`)
3. **Verify these exact fields:**

| Field Name | Expected Value | ✅/❌ |
|------------|----------------|-------|
| `display_label` | `"Oliver"` or `"Baby 1"` | ⬜ |
| `name` | `NULL` or old value | ⬜ |
| `birthdate` | [exact date entered] | ⬜ |
| `is_active` | `true` | ⬜ |

**✅ PASS CRITERIA**:
- `display_label` contains the baby's label (not in "name" field)
- Old `name` field should be NULL or deprecated

---

## Test 2: Export User Data

### Step 1: Export from App
1. In the app, go to **Profile** tab
2. Scroll down to find **"Data exporteren"** button
3. Tap it and save/share the JSON file
4. Open the JSON file in a text editor

### Step 2: Verify Export Contents
Check the exported JSON contains these fields:

```json
{
  "export_date": "[ISO timestamp]",
  "user_id": "[UUID]",
  "profile": {
    "id": "[UUID]",
    "display_name": "Emma",          ← First name only! ✅
    "birth_year": 1990,               ← Year only! ✅
    "email": "test-privacy@example.com",
    "weight_kg": [value],
    "height_cm": [value],
    "consent_version": "1.0.0",
    "age_consent": true,
    "medical_disclaimer_consent": true,
    "privacy_policy_consent": true
  },
  "babies": [
    {
      "id": "[UUID]",
      "display_label": "Oliver",      ← Label, not real name! ✅
      "birthdate": "[date]",
      "is_active": true
    }
  ],
  "drink_sessions": [...],
  "drinks": [...],
  "feeding_logs": [...]
}
```

**✅ PASS CRITERIA**:
- `display_name` shows "Emma" (NOT "Emma Johnson")
- `birth_year` shows `1990` (NOT "1990-05-15")
- `display_label` shows baby label (NOT in deprecated `name` field)
- NO full name or full birthdate in the export

---

## Test 3: Verify Audit Logging

### Step 1: Check Audit Log
1. Go to **Supabase Dashboard** → **Database** → **Table Editor**
2. Click on **audit_log** table
3. Find entries for your test user

### Step 2: Verify Logged Events
You should see entries like:

| Action | Resource Type | Notes | ✅/❌ |
|--------|---------------|-------|-------|
| `account_created` | `auth` | Account creation logged | ⬜ |
| `profile_updated` | `profile` | Profile changes logged | ⬜ |
| `baby_created` | `baby` | Baby creation logged | ⬜ |

**✅ PASS CRITERIA**:
- Events are being logged automatically
- User can view their own logs (check in app if exposed)

---

## Test 4: Delete Account

### Step 1: Delete from App
1. In the app, go to **Profile** tab
2. Scroll to bottom and find **"Account verwijderen"** button
3. Tap it and **confirm deletion**
4. You should be redirected to the landing page

### Step 2: Verify Complete Deletion in Supabase
1. Go to **Supabase Dashboard** → **Database** → **Table Editor**

#### Check PROFILES Table:
- Search for `test-privacy@example.com`
- **Expected**: Row should be DELETED ⬜

#### Check BABIES Table:
- Search for the baby with that user_id
- **Expected**: Row should be DELETED ⬜

#### Check AUTH.USERS (if accessible):
- Go to **Authentication** → **Users**
- Search for `test-privacy@example.com`
- **Expected**: User should be DELETED ⬜

#### Check AUDIT_LOG:
- The audit log should have an entry:
  - `action`: `account_deleted`
  - `user_id`: [the deleted user's ID]
  - **Expected**: Deletion was logged ⬜

**✅ PASS CRITERIA**:
- User completely removed from all tables
- Deletion event logged in audit_log
- App returns to landing/login screen

---

## Test 5: Privacy Compliance Summary

After completing all tests, verify:

| Privacy Feature | Status | ✅/❌ |
|----------------|--------|-------|
| Only first names stored (not full names) | | ⬜ |
| Only birth year stored (not full DOB for mother) | | ⬜ |
| Baby uses generic labels (display_label) | | ⬜ |
| Full baby birthdate kept (needed for app features) | | ⬜ |
| Export function works and shows minimal PII | | ⬜ |
| Delete function removes ALL user data | | ⬜ |
| Audit logging tracks all actions | | ⬜ |
| Cron jobs scheduled for auto-cleanup | | ⬜ |

---

## 🚨 If Any Test Fails

**Check these common issues:**

1. **Old data still showing?**
   - The migrations only affect NEW data
   - Old users will have deprecated fields populated
   - This is OK! The new fields will be used going forward

2. **Export showing old fields?**
   - Check that migration 004 `export_user_data()` function ran
   - Verify the function definition in Supabase SQL Editor

3. **Delete not working?**
   - Check that `delete_user_data()` function exists
   - Check RLS policies allow deletion
   - Check Edge Function `delete-user` is deployed

4. **Audit log empty?**
   - Check that migration 005 triggers are created
   - Try updating profile and check again

---

## ✅ When All Tests Pass

You're ready for App Store submission! The app now:
- ✅ Minimizes PII collection
- ✅ Provides data export (GDPR Article 20)
- ✅ Provides data deletion (GDPR Article 17)
- ✅ Logs all data operations for compliance
- ✅ Auto-deletes old data (90-day retention)

Document these privacy features in your App Store submission notes!
