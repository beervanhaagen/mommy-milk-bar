# Security Enhancements for App Store Submission

## Priority 1: Critical (Implement Before App Store)

### 1. Rate Limiting on Auth Endpoints ⚡

**Risk:** Brute force attacks on login
**Solution:** Add rate limiting to Supabase Edge Functions

```typescript
// In supabase/functions/_shared/rateLimit.ts
export async function checkRateLimit(
  identifier: string,
  maxAttempts: number = 5,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): Promise<boolean> {
  // Implement using Supabase or Upstash Redis
  // Return true if under limit, false if exceeded
}
```

**Action:** Use Supabase's built-in rate limiting or add Upstash Redis

---

### 2. Audit Logging for Sensitive Operations 📝

**What to log:**
- Account deletion requests
- Data export requests
- Profile changes (weight, baby info)
- Failed login attempts

**Implementation:**
```sql
CREATE TABLE audit_log (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  ip_address INET,
  user_agent TEXT,
  occurred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for querying
CREATE INDEX idx_audit_user_time ON audit_log(user_id, occurred_at DESC);
CREATE INDEX idx_audit_action ON audit_log(action, occurred_at DESC);
```

---

### 3. IP Address Logging (Optional but Recommended) 🌐

**For security monitoring:**
- Detect suspicious login patterns
- Track data exports by IP
- Help with fraud detection

**Privacy-first approach:**
- Hash IP addresses
- Auto-delete after 90 days
- Only store for security purposes

```typescript
// Hash IP for privacy
import { createHash } from 'crypto';

function hashIP(ip: string): string {
  return createHash('sha256').update(ip).digest('hex');
}
```

---

### 4. API Key Rotation Schedule 🔑

**Current:** Supabase anon key is static
**Recommendation:** Plan for rotation every 90 days

**To implement:**
1. Create new key in Supabase Dashboard
2. Deploy app update with new key
3. Wait 30 days for old app versions to update
4. Revoke old key

**Note:** Not critical for MVP, but document the process

---

## Priority 2: Nice to Have (Post-MVP)

### 5. Content Security Policy (CSP) 🛡️

For the web version (if you add one):
```typescript
// In expo config
{
  "web": {
    "meta": {
      "Content-Security-Policy": "default-src 'self'; script-src 'self'; ..."
    }
  }
}
```

---

### 6. Encrypted Sensitive Fields (Client-Side) 🔐

**What to encrypt:**
- Mother name
- Baby names
- Notes in feeding logs

**Why:** Extra layer of protection even if database is breached

**Implementation:**
```typescript
// Use expo-crypto
import * as Crypto from 'expo-crypto';

async function encryptSensitiveData(data: string): Promise<string> {
  // Encrypt with user's key derived from password
  // Store encrypted value in Supabase
}
```

**Trade-off:** Adds complexity, may not be necessary for MVP

---

### 7. Two-Factor Authentication (2FA) 🔢

**For high-security accounts:**
- Admin accounts
- Beta testers with sensitive data
- Optional for all users

**Implementation:**
- Supabase supports 2FA out of the box
- Enable in Supabase Dashboard → Authentication → Email Auth

---

### 8. Security Headers 📋

**Add to Edge Functions:**
```typescript
return new Response(JSON.stringify(data), {
  headers: {
    'Content-Type': 'application/json',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  },
});
```

---

## Priority 3: Monitoring & Response (Ongoing)

### 9. Set Up Security Monitoring 👁️

**Tools to use:**
- Supabase Dashboard → Reports → Auth Activity
- Set up alerts for:
  - Multiple failed login attempts
  - Unusual data export volumes
  - Account deletions

---

### 10. Incident Response Plan 🚨

**Document what to do if:**
- Security breach detected
- User reports unauthorized access
- API keys leaked

**Template:**
1. Immediately rotate compromised credentials
2. Notify affected users within 72 hours (GDPR)
3. Review audit logs
4. Patch vulnerability
5. Post-mortem report

---

## What's Already Secure ✅

You already have these implemented:

- ✅ **Row Level Security** on all tables
- ✅ **Data encryption** at rest and in transit
- ✅ **GDPR compliance** (export & delete functions)
- ✅ **Consent tracking** with versions
- ✅ **Email verification** before data access
- ✅ **Cascade deletions** (no orphaned data)
- ✅ **Password hashing** (Supabase Auth)
- ✅ **Auto-anonymization** of analytics (90 days)

---

## App Store Submission Checklist

### Required for Apple App Store:

- [x] Privacy Policy published (https://mommymilkbar.nl/privacy.html)
- [x] Terms of Service published (https://mommymilkbar.nl/terms.html)
- [ ] Privacy Policy linked in app (Settings screen)
- [x] Medical disclaimer shown before use
- [x] Age gate (18+ requirement)
- [x] Data collection explanation
- [ ] App Store Connect: Privacy questionnaire completed
- [ ] App uses "Health & Fitness" category (requires extra review)

### Apple Privacy Questionnaire Answers:

**Does your app collect data?** Yes

**What data is collected:**
- ✅ Name (optional, can be "prefer not to share")
- ✅ Email (for account creation)
- ✅ Health data (weight, baby feeding times)
- ✅ Usage data (analytics, if user consents)

**Is data linked to user identity?** Yes

**Is data used for tracking?** No

**Is data shared with third parties?** No
- Supabase is your data processor, not a third party
- No analytics to Google/Facebook/etc.

---

## Testing Security Before Launch

### Manual Security Tests:

1. **Test RLS Policies:**
   ```sql
   -- Create two test accounts
   -- Try to access User A's data while logged in as User B
   -- Should return empty results
   ```

2. **Test Data Export:**
   ```typescript
   // Call export function
   const data = await supabase.rpc('export_user_data');
   // Verify all user data is included
   ```

3. **Test Data Deletion:**
   ```typescript
   // Call delete function
   await supabase.rpc('delete_user_data');
   // Verify all data is deleted from all tables
   ```

4. **Test Email Verification:**
   - Create account without verifying email
   - Try to access protected data
   - Should be blocked or redirected

---

## Compliance Documentation

### For Your Records:

**Data Processing Agreement:**
- Supabase acts as data processor
- You are the data controller
- Review: https://supabase.com/docs/guides/getting-started/privacy

**GDPR Rights Implemented:**
- ✅ Right to Access (export function)
- ✅ Right to Erasure (delete function)
- ✅ Right to Rectification (update profile)
- ✅ Right to Data Portability (JSON export)
- ✅ Right to Object (marketing/analytics consent)

**Data Retention:**
- User data: Stored until deletion request
- Analytics: Anonymized after 90 days
- Audit logs: Keep for 1 year (recommended)

---

## Recommended Timeline

**Before App Store Submission (Must Have):**
- [ ] Add rate limiting to auth endpoints (1-2 hours)
- [ ] Create audit log table (30 minutes)
- [ ] Add Privacy Policy link to Settings screen (15 minutes)
- [ ] Test RLS policies manually (1 hour)
- [ ] Complete Apple privacy questionnaire

**Week 1 Post-Launch:**
- [ ] Monitor auth activity daily
- [ ] Set up security alerts
- [ ] Review audit logs

**Month 1 Post-Launch:**
- [ ] Security audit review
- [ ] Plan API key rotation
- [ ] Consider 2FA for admins

**Month 3 Post-Launch:**
- [ ] Evaluate need for client-side encryption
- [ ] Review and update privacy policy if needed
- [ ] Rotate API keys (first rotation)

---

## Cost of Enhancements

| Enhancement | Time | Cost | Priority |
|-------------|------|------|----------|
| Rate limiting | 1-2 hours | Free (Supabase) or $10/mo (Upstash) | High |
| Audit logging | 30 min | Free | High |
| IP hashing | 1 hour | Free | Medium |
| 2FA | 15 min (config) | Free | Low |
| Client-side encryption | 4-8 hours | Free | Low |

**Total for Priority 1:** ~3-4 hours of work, potentially $10/month

---

## Questions for You

Before implementing enhancements:

1. **Rate limiting:** Use Supabase's built-in (simpler) or add Redis (more flexible)?
2. **Audit logging:** Should we track all profile changes or just deletions/exports?
3. **IP logging:** Hash IPs for privacy, or skip entirely for MVP?
4. **2FA:** Enable for all users, or just admins initially?

---

## Summary

**Your current security is VERY GOOD for MVP.**

**Before App Store:**
- Add rate limiting (brute force protection)
- Add basic audit logging
- Link privacy policy in Settings
- Test RLS policies

**After that, you're compliant and secure!** 🎉

The other enhancements are nice-to-have and can be added post-launch based on user feedback and security monitoring.
