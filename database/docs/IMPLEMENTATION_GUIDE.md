# 🚀 IMPLEMENTATION GUIDE
## Mommy Milk Bar Database v2.0

**Last Updated:** 2025-12-03
**Status:** Ready for Deployment

---

## 📋 PRE-FLIGHT CHECKLIST

Before you begin, ensure you have:

- [ ] Supabase project created
- [ ] Supabase CLI installed (`npm install -g supabase`)
- [ ] Access to Supabase Dashboard
- [ ] Resend API key (for SMTP)
- [ ] Backup of any existing data (if applicable)

---

## 🗂️ FOLDER STRUCTURE

Your new centralized database structure:

```
/database/
├── migrations/
│   └── 001_initial_schema.sql       ✅ Master migration
├── templates/
│   ├── auth/
│   │   ├── confirm-signup.html      📧 Supabase template
│   │   ├── reset-password.html      📧 Supabase template
│   │   └── change-email.html        📧 Supabase template
│   └── marketing/
│       └── (Edge Function templates)
├── scripts/
│   ├── run-migration.sh             🔧 Migration runner
│   └── test-database.sql            🧪 Test script
└── docs/
    ├── IMPLEMENTATION_GUIDE.md      📖 This file
    └── (architecture docs)
```

---

## 🎬 STEP-BY-STEP IMPLEMENTATION

### Step 1: Backup Current Data (If Applicable)

If you have existing data, export it first:

```bash
# Via Supabase Dashboard
# Settings > Database > Backups > Create Backup

# Or via CLI
supabase db dump > backup_$(date +%Y%m%d).sql
```

---

### Step 2: Run Database Migration

**Option A: Local Development**

```bash
# Start local Supabase
supabase start

# Run migration
chmod +x database/scripts/run-migration.sh
./database/scripts/run-migration.sh
# Select option 1 (Local)
```

**Option B: Production**

```bash
# Get your database URL from Supabase Dashboard:
# Settings > Database > Connection string > URI

export SUPABASE_DB_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres"

# Run migration
./database/scripts/run-migration.sh
# Select option 2 (Production)
# Type "I UNDERSTAND THE RISKS"
```

---

### Step 3: Verify Migration

Run the test script in Supabase SQL Editor:

1. Go to: https://supabase.com/dashboard/project/YOUR_PROJECT/sql
2. Copy contents of `database/scripts/test-database.sql`
3. Paste and run
4. Check for ✓ symbols (all tests should pass)

**Expected output:**
```
✓ All 10 tables exist
✓ RLS enabled on all tables
✓ All triggers exist
✓ All functions exist
✓ Sample content tips loaded (5 tips)
✓ Indexes created (24 indexes)
```

---

### Step 4: Configure Supabase Auth

#### 4.1 Set Redirect URLs

Dashboard > Authentication > URL Configuration:

- **Site URL:** `https://mommymilkbar.nl`
- **Redirect URLs:** Add these:
  - `mommymilkbar://auth-callback`
  - `https://mommymilkbar.nl/auth-callback`
  - `https://mommymilkbar.nl/reset-password`
  - `https://mommymilkbar.nl/verify-email`

#### 4.2 Configure SMTP

Dashboard > Settings > Auth > SMTP Settings:

```
Enable Custom SMTP: ✅ ON

SMTP Host: smtp.resend.com
SMTP Port: 587
SMTP User: resend
SMTP Password: [YOUR_RESEND_API_KEY]

Sender Email: info@mommymilkbar.nl
Sender Name: Mommy Milk Bar

Enable Email Confirmations: ✅ ON
```

Click **Save** and **Test**.

#### 4.3 Upload Email Templates

Dashboard > Authentication > Email Templates:

**For each template type:**

1. **Confirm Signup:**
   - Click "Edit Template"
   - Copy content from `database/templates/auth/confirm-signup.html`
   - Paste in the HTML editor
   - Save

2. **Reset Password:**
   - Click "Edit Template"
   - Copy content from `database/templates/auth/reset-password.html`
   - Paste in the HTML editor
   - Save

3. **Change Email:**
   - Click "Edit Template"
   - Copy content from `database/templates/auth/change-email.html`
   - Paste in the HTML editor
   - Save

---

### Step 5: Remove Custom Auth Edge Functions

These are now handled by Supabase natively:

```bash
# Delete old auth Edge Functions (no longer needed)
rm -rf supabase/functions/send-password-reset-email
rm -rf supabase/functions/verify-email
rm -rf supabase/functions/send-welcome-email  # Move logic to app if needed
```

**Keep only:**
- `supabase/functions/delete-user` (still needed for auth.users deletion)
- Any marketing/non-auth Edge Functions

---

### Step 6: Update TypeScript Types

Copy the new types from the migration:

```bash
# Generate fresh types from your database
npx supabase gen types typescript --local > src/types/database.generated.ts

# Or if using remote:
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.generated.ts
```

Update your `src/types/database.ts` to match the new schema (remove old fields like `email_verification_token`).

---

### Step 7: Test Account Management Flows

#### Test 1: Account Creation

```typescript
// In your app
const { data, error } = await supabase.auth.signUp({
  email: 'test@example.com',
  password: 'SecurePassword123!',
  options: {
    emailRedirectTo: 'mommymilkbar://verify-email'
  }
});
```

**Verify:**
- ✅ Email sent to inbox
- ✅ Email uses branded template
- ✅ From address is `info@mommymilkbar.nl`
- ✅ Click link → email verified
- ✅ Profile created in `profiles` table

#### Test 2: Password Reset

```typescript
const { error } = await supabase.auth.resetPasswordForEmail(
  'test@example.com',
  {
    redirectTo: 'https://mommymilkbar.nl/reset-password'
  }
);
```

**Verify:**
- ✅ Email sent with reset link
- ✅ Branded template used
- ✅ Click link → redirect to reset page
- ✅ Can set new password

#### Test 3: Profile Updates

```typescript
const { error } = await supabase
  .from('profiles')
  .update({ weight_kg: 65, safety_mode: 'normal' })
  .eq('id', user.id);
```

**Verify:**
- ✅ Update succeeds
- ✅ `updated_at` timestamp auto-updates
- ✅ Audit log entry created

#### Test 4: Data Export

```typescript
const { data, error } = await supabase.rpc('export_user_data');
console.log(JSON.stringify(data, null, 2));
```

**Verify:**
- ✅ Returns complete user data
- ✅ Includes profile, babies, drinks, etc.
- ✅ Audit log entry created

#### Test 5: Account Deletion

```typescript
// Via Edge Function
const { data, error } = await supabase.functions.invoke('delete-user');
```

**Verify:**
- ✅ All user data deleted (check tables)
- ✅ No orphaned records
- ✅ Analytics anonymized (user_id = null)
- ✅ Auth user deleted
- ✅ Audit log entry created (before deletion)

---

### Step 8: Set Up Cron Jobs (Optional but Recommended)

Dashboard > Database > Cron Jobs:

**Job 1: Anonymize Old Analytics**
```sql
SELECT cron.schedule(
  'anonymize-analytics-daily',
  '0 2 * * *',  -- Daily at 2 AM
  'SELECT anonymize_old_analytics();'
);
```

**Job 2: Cleanup Old Audit Logs**
```sql
SELECT cron.schedule(
  'cleanup-audit-logs-monthly',
  '0 5 1 * *',  -- Monthly on 1st at 5 AM
  'SELECT cleanup_old_audit_logs();'
);
```

---

### Step 9: Update Environment Variables

Update your `.env` file:

```bash
# Remove (no longer needed)
# RESEND_API_KEY (now in Supabase SMTP settings)

# Keep
SUPABASE_URL=https://lqmnkdqyoxytyyxuglhx.supabase.co
SUPABASE_ANON_KEY=your_anon_key
```

---

### Step 10: Clean Up Old Files

Move old database files to archive:

```bash
# Create archive folder
mkdir -p database/archive

# Move old migration files
mv supabase/migrations/*.sql database/archive/

# Move old manual scripts
mv manual-delete-user.sql database/archive/

# Keep only new structure
# /database/ (new centralized location)
# /supabase/ (keep for functions and config only)
```

---

## ✅ POST-DEPLOYMENT VERIFICATION

Run through this checklist after deployment:

### Database Health
- [ ] All tables visible in Dashboard
- [ ] RLS enabled on all tables
- [ ] Sample content tips loaded
- [ ] Triggers working (update a profile, check `updated_at`)
- [ ] Functions callable (`export_user_data()` works)

### Authentication
- [ ] Sign up sends email
- [ ] Email uses branded template
- [ ] Email verification works
- [ ] Password reset works
- [ ] From address is `info@mommymilkbar.nl`

### Data Privacy
- [ ] Users can only see their own data (test with 2 accounts)
- [ ] CASCADE deletions work (create → delete → verify)
- [ ] Analytics anonymize after 90 days (manual check later)
- [ ] Audit log captures actions

### Performance
- [ ] Queries are fast (<100ms for profile reads)
- [ ] Indexes are used (check query plans)
- [ ] No N+1 queries in app

---

## 🐛 TROUBLESHOOTING

### Issue: "Migration failed: relation already exists"

**Solution:** You're running on a non-empty database.
```sql
-- Drop all tables (CAUTION: DATA LOSS!)
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- Then re-run migration
```

### Issue: "RLS prevents SELECT on profiles"

**Solution:** Check auth context:
```sql
-- Run in SQL Editor
SELECT auth.uid(); -- Should return your user ID

-- If NULL, you're not authenticated
-- Sign in first, then query
```

### Issue: "Email not sending"

**Solution:** Check SMTP settings:
1. Dashboard > Settings > Auth > SMTP Settings
2. Click "Test" button
3. Check error message
4. Verify Resend API key is valid
5. Verify `info@mommymilkbar.nl` domain is verified in Resend

### Issue: "CASCADE deletion not working"

**Solution:** Verify foreign key constraints:
```sql
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
  ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_schema = 'public';

-- All should show delete_rule = 'CASCADE' or 'SET NULL'
```

---

## 📞 SUPPORT

If you encounter issues:

1. **Check Supabase Logs:**
   - Dashboard > Logs > Postgres Logs
   - Look for errors or warnings

2. **Check Auth Logs:**
   - Dashboard > Authentication > Logs
   - Verify email delivery

3. **Test in SQL Editor:**
   - Run `database/scripts/test-database.sql`
   - Check which tests fail

4. **Review Documentation:**
   - `DATABASE_ARCHITECTURE.md` - Full schema details
   - Supabase Docs: https://supabase.com/docs

---

## 🎉 SUCCESS CRITERIA

Your implementation is successful when:

✅ All database tests pass
✅ Test account can sign up and verify email
✅ Password reset flow works end-to-end
✅ Users can create babies and log drinks
✅ Data export returns complete JSON
✅ Account deletion removes all data
✅ No orphaned records after deletion
✅ Emails use branded templates
✅ From address is `info@mommymilkbar.nl`

---

## 🚀 NEXT STEPS

After successful implementation:

1. **Monitor for 48 hours:**
   - Watch for errors in Supabase logs
   - Check email delivery rates
   - Monitor RLS policy performance

2. **Update app code:**
   - Remove references to old email verification system
   - Update TypeScript types
   - Simplify auth flows

3. **User testing:**
   - Test on real devices
   - Verify email links work on mobile
   - Check deep linking works

4. **Documentation:**
   - Update README with new database info
   - Document any custom Edge Functions
   - Create runbook for common operations

---

**You're all set! 🎊**

Your database is now state-of-the-art, GDPR-compliant, and maintainer-friendly.
