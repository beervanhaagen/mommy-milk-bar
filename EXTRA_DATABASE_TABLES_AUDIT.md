# Extra Database Tables Audit

**Date:** 2025-11-28
**Purpose:** Audit unexpected tables found in Supabase dashboard

---

## Tables Found in Database (Not in Our Migrations)

Looking at the Supabase screenshot, there are several tables marked as "Unrestricted" that are NOT in our migration files:

### 1. audit_log
- **Status:** Not in our migrations
- **Likely source:** Supabase auto-generated or third-party extension
- **Recommendation:** **REMOVE** if not being used

### 2. data_exports
- **Status:** Not in our migrations (we have `data_requests` which is similar)
- **Security:** Marked as "Unrestricted" - SECURITY RISK!
- **Recommendation:** **REMOVE** and use our `data_requests` table instead

### 3. failed_login_attempts
- **Status:** Not in our migrations
- **Likely source:** Security extension or auto-generated
- **Security:** Marked as "Unrestricted" - SECURITY RISK!
- **Use case:** Track brute force attempts
- **Recommendation:**
  - If using for security monitoring → **ADD RLS POLICIES**
  - If not using → **REMOVE**

### 4. rate_limit_attempts
- **Status:** Not in our migrations
- **Security:** Marked as "Unrestricted" - SECURITY RISK!
- **Use case:** API rate limiting
- **Recommendation:**
  - If using for rate limiting → **ADD RLS POLICIES**
  - If not using → **REMOVE**

### 5. recent_deletions
- **Status:** Not in our migrations
- **Security:** Marked as "Unrestricted" - SECURITY RISK!
- **Use case:** Audit trail for deletions
- **Recommendation:** **REMOVE** (we have `audit_log` for this if needed)

### 6. user_details_admin
- **Status:** Not in our migrations
- **Security:** Marked as "Unrestricted" - MAJOR SECURITY RISK!
- **Concern:** Admin table without RLS = anyone can access
- **Recommendation:** **REMOVE IMMEDIATELY** or add strict RLS policies

### 7. user_statistics
- **Status:** Not in our migrations
- **Security:** Marked as "Unrestricted" - SECURITY RISK!
- **Use case:** Aggregate user stats
- **Recommendation:**
  - If using for analytics → **ADD RLS POLICIES**
  - If not using → **REMOVE**

---

## Security Concerns

**CRITICAL:** All these tables are marked as "Unrestricted" which means:
- ❌ No Row Level Security (RLS) policies
- ❌ Anyone with the anon key can read/write
- ❌ Potential data leak vulnerability

**Immediate Actions Needed:**
1. ✅ Check if we're actually using these tables
2. ✅ If yes → Add RLS policies immediately
3. ✅ If no → Drop these tables

---

## Tables We SHOULD Have (From Our Migrations)

From our [migration files](supabase/migrations/):
- ✅ profiles
- ✅ babies
- ✅ drink_sessions
- ✅ drinks
- ✅ feeding_logs
- ✅ content_tips
- ✅ user_tip_interactions
- ✅ analytics_events
- ✅ data_requests

---

## Recommended Actions

### Immediate (Security-Critical):
```sql
-- Check if we're using these tables
SELECT COUNT(*) FROM audit_log;
SELECT COUNT(*) FROM data_exports;
SELECT COUNT(*) FROM failed_login_attempts;
SELECT COUNT(*) FROM rate_limit_attempts;
SELECT COUNT(*) FROM recent_deletions;
SELECT COUNT(*) FROM user_details_admin;
SELECT COUNT(*) FROM user_statistics;
```

### If Empty/Unused:
```sql
-- Drop unused tables
DROP TABLE IF EXISTS audit_log CASCADE;
DROP TABLE IF EXISTS data_exports CASCADE;
DROP TABLE IF EXISTS failed_login_attempts CASCADE;
DROP TABLE IF EXISTS rate_limit_attempts CASCADE;
DROP TABLE IF EXISTS recent_deletions CASCADE;
DROP TABLE IF EXISTS user_details_admin CASCADE;
DROP TABLE IF EXISTS user_statistics CASCADE;
```

### If Being Used:
Add RLS policies for each table (example):
```sql
-- Enable RLS
ALTER TABLE user_statistics ENABLE ROW LEVEL SECURITY;

-- Add policy: users can only see their own stats
CREATE POLICY "Users can view own stats"
  ON user_statistics
  FOR SELECT
  USING (auth.uid() = user_id);
```

---

## Questions

1. **Did you or a team member create these tables manually?**
2. **Are you using any Supabase extensions that might create these?**
3. **Do you have any Edge Functions or triggers that use these tables?**

Once we know the answers, I can help clean them up safely.
