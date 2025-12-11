# Account Deletion Issue - Fix Guide

## Problem Summary

Your account deletion failed due to audit log triggers that reference non-existent database columns (`display_name` and `display_label`). This prevents the deletion from completing and leaves the account in a "zombie" state.

## Immediate Solution: Manual Account Deletion

### Step 1: Run the Fix Migration First

This will fix the broken audit triggers so future deletions work properly:

1. Go to your Supabase SQL Editor: https://supabase.com/dashboard/project/lqmnkdqyoxytyyxuglhx/sql
2. Open the file: `supabase/migrations/010_fix_audit_triggers.sql`
3. Copy the entire contents
4. Paste into Supabase SQL Editor and click "Run"
5. You should see success messages about the triggers being fixed

### Step 2: Delete Your Account Manually

1. Open the file: `manual-delete-user.sql`
2. Find this line near the top:
   ```sql
   v_email TEXT := 'YOUR_EMAIL_HERE'; -- REPLACE THIS WITH YOUR EMAIL
   ```
3. Replace `'YOUR_EMAIL_HERE'` with your actual email address (keep the quotes!)
4. Copy the entire script
5. Go to Supabase SQL Editor: https://supabase.com/dashboard/project/lqmnkdqyoxytyyxuglhx/sql
6. Paste the script and click "Run"
7. You should see success messages confirming the deletion

### Step 3: Deploy the Fix to Production

To ensure this doesn't happen again, deploy the fix migration:

```bash
npx supabase db push
```

Or if you need to deploy just this migration:

```bash
npx supabase migration up
```

## About the "Forgot Password" Flow

Good news! You already have a working forgot password flow:

### For Users:
1. Go to the login screen
2. Below the password field, click "Wachtwoord vergeten?" (Forgot Password?)
3. Enter your email address
4. You'll receive a password reset email
5. Click the link in the email to reset your password

### Where it is in the code:
- Screen: [app/auth/forgot-password.tsx](app/auth/forgot-password.tsx)
- Link on login: [app/auth/login.tsx:117-124](app/auth/login.tsx#L117-L124)
- Service function: [src/services/auth.service.ts:169-187](src/services/auth.service.ts#L169-L187)

## What Caused This?

The issue was in migration `005_audit_logging_and_security.sql`:

1. The `log_profile_update()` function referenced `OLD.display_name` and `NEW.display_name`
2. The `log_baby_deleted()` function referenced `OLD.display_label`
3. These columns don't exist in your current schema
4. When you tried to delete your account, the triggers tried to execute these functions
5. The functions failed because of the missing columns
6. This prevented the cascade deletion from completing

## Testing the Fix

After running the migrations, test that account deletion works:

1. Create a test account in the app
2. Log in with the test account
3. Go to Settings
4. Click "Account verwijderen" (Delete Account)
5. Confirm the deletion
6. Verify the account is completely removed from Supabase Authentication

## Prevention

The migration `010_fix_audit_triggers.sql` fixes the audit triggers to:
- Use `IS DISTINCT FROM` instead of `!=` (handles NULL values properly)
- Reference only columns that actually exist in the schema
- Skip logging timestamp-only updates (`updated_at`, `last_active_at`)

## Need Help?

If you encounter any issues:
1. Check Supabase logs for detailed error messages
2. Verify the migrations ran successfully
3. Test with a new test account before using your real account
