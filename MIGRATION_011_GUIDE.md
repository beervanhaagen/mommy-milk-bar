# Migration 011: Restore Audit Logging - Implementation Guide

## What This Migration Does

Migration 011 fixes all the issues from migrations 005-010 by:

1. ✅ **Drops broken triggers** from previous migrations
2. ✅ **Creates clean audit_log table** with proper RLS policies
3. ✅ **Creates audit triggers** that only reference existing columns
4. ✅ **Adds cleanup function** for GDPR compliance (2-year retention)
5. ✅ **Verifies schema** to ensure compatibility

## What Gets Monitored

### Profile Updates
The audit log will track changes to:
- `weight_kg` - Important for alcohol calculations
- `safety_mode` - Security setting changes
- `email` - Email address changes
- `email_verified` - Email verification status
- `marketing_consent` - Marketing preference changes
- `analytics_consent` - Analytics preference changes

### Baby Events
- **Creation:** When a baby is added (with display_label)
- **Deletion:** When a baby is removed (with display_label)

## What's NOT Monitored

These columns were deleted in migration 008, so they're not tracked:
- ❌ `display_name` (removed)
- ❌ `height_cm` (removed)
- ❌ `birth_year` (removed)

## How to Run This Migration

### Option 1: Via Supabase Dashboard (Recommended)

1. Go to [Supabase SQL Editor](https://supabase.com/dashboard/project/lqmnkdqyoxytyyxuglhx/sql)
2. Copy the entire contents of `supabase/migrations/011_restore_audit_logging_clean.sql`
3. Paste into the SQL Editor
4. Click "Run"
5. Check the output for success messages

### Option 2: Via Supabase CLI

```bash
# From project root
npx supabase db push
```

This will apply migration 011 automatically.

## Expected Output

When the migration runs successfully, you'll see:

```
✓ Created audit_log table with RLS
✓ Created log_audit_event() helper function
✓ Created profile_update_audit trigger
✓ Created baby_created_audit trigger
✓ Created baby_deleted_audit trigger
✓ Created cleanup_old_audit_logs() function

Migration 011 completed successfully!
```

## After Running Migration

### 1. Test Account Deletion

The account deletion should now work properly:

```typescript
// In the app
await deleteAccount();
```

Or test manually in Supabase SQL Editor:

```sql
-- This should now work without errors
SELECT delete_user_data();
```

### 2. Test Profile Updates

Update your profile and check the audit log:

```sql
-- View your audit logs
SELECT * FROM audit_log
WHERE user_id = auth.uid()
ORDER BY occurred_at DESC;
```

### 3. Schedule Automatic Cleanup (Optional)

Set up a cron job to cleanup old audit logs (keeps 2 years of data):

```sql
-- Run this in Supabase SQL Editor
SELECT cron.schedule(
  'cleanup-audit-logs',
  '0 5 1 * *', -- Monthly on 1st at 5 AM
  'SELECT cleanup_old_audit_logs();'
);
```

## GDPR Compliance Features

### User Rights
- ✅ **Right to Access:** Users can view their own audit logs via RLS policy
- ✅ **Right to Erasure:** `delete_user_data()` deletes audit logs with user data
- ✅ **Data Retention:** Automatic cleanup after 2 years

### Query Your Audit Logs

```sql
-- As a user (via app)
SELECT
  action,
  resource_type,
  occurred_at,
  metadata
FROM audit_log
WHERE user_id = auth.uid()
ORDER BY occurred_at DESC
LIMIT 50;
```

### Admin Queries (Service Role Only)

```sql
-- Recent account deletions
SELECT
  user_id,
  occurred_at,
  metadata
FROM audit_log
WHERE action = 'account_deleted'
AND occurred_at > NOW() - INTERVAL '30 days'
ORDER BY occurred_at DESC;

-- Profile update activity
SELECT
  user_id,
  COUNT(*) as update_count,
  MAX(occurred_at) as last_update
FROM audit_log
WHERE action = 'profile_updated'
AND occurred_at > NOW() - INTERVAL '7 days'
GROUP BY user_id
ORDER BY update_count DESC;
```

## Troubleshooting

### Migration Fails with "trigger already exists"

This is okay! The migration uses `DROP TRIGGER IF EXISTS` so it should handle this. If it still fails:

```sql
-- Manually drop broken triggers first
DROP TRIGGER IF EXISTS profile_update_audit ON profiles;
DROP TRIGGER IF EXISTS baby_created_audit ON babies;
DROP TRIGGER IF EXISTS baby_deleted_audit ON babies;
DROP FUNCTION IF EXISTS log_profile_update();
DROP FUNCTION IF EXISTS log_baby_created();
DROP FUNCTION IF EXISTS log_baby_deleted();

-- Then run migration 011
```

### Migration Fails with "column does not exist"

Check which columns actually exist in your profiles table:

```sql
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;
```

If you see columns that shouldn't be there (like `display_name`, `height_cm`), you may need to run migrations 006-008 first.

### Account Deletion Still Fails

Check if the audit triggers are working:

```sql
-- List all triggers
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- Test the delete function
SELECT delete_user_data(); -- This should work now
```

## Rollback Plan

If you need to rollback this migration:

```sql
-- Drop audit log completely
DROP TABLE IF EXISTS audit_log CASCADE;
DROP TRIGGER IF EXISTS profile_update_audit ON profiles;
DROP TRIGGER IF EXISTS baby_created_audit ON babies;
DROP TRIGGER IF EXISTS baby_deleted_audit ON babies;
DROP FUNCTION IF EXISTS log_audit_event(UUID, TEXT, TEXT, TEXT, TEXT, JSONB);
DROP FUNCTION IF EXISTS log_profile_update();
DROP FUNCTION IF EXISTS log_baby_created();
DROP FUNCTION IF EXISTS log_baby_deleted();
DROP FUNCTION IF EXISTS cleanup_old_audit_logs();
```

## Impact on App

✅ **No app code changes needed!**

The audit logging happens automatically via database triggers. Your existing app code will work without modifications.

However, you may want to:
1. Add a "View Activity Log" feature for users
2. Add admin dashboard to monitor audit logs
3. Set up alerts for suspicious activity

## Next Steps After Migration

1. ✅ Run migration 011
2. ✅ Test account deletion
3. ✅ Test profile updates
4. ✅ Schedule cleanup cron job
5. 📊 Consider adding activity log UI in app
6. 📊 Consider adding admin monitoring dashboard

## Questions?

- Check [DATABASE_HOLISTIC_AUDIT.md](DATABASE_HOLISTIC_AUDIT.md) for full context
- Check [ACCOUNT_DELETION_FIX.md](ACCOUNT_DELETION_FIX.md) for account deletion details
- Check Supabase logs for any errors during migration
