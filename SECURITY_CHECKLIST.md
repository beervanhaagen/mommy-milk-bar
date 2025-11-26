# 🔒 Security Checklist - URGENT ACTIONS REQUIRED

## Task 1 Completed ✅
- [x] Privacy Policy created ([website/privacy.html](website/privacy.html))
- [x] Terms of Service created ([website/terms.html](website/terms.html))
- [x] Website navigation links updated to point to legal documents
- [x] .env.example updated with security warnings

---

## ⚠️ CRITICAL: Remove .env from Git History (Do This NOW)

### The Problem
The `.env` file containing **real API keys** was previously committed to Git. Even though it's now in `.gitignore`, the keys are still visible in Git history.

**Exposed credentials:**
- Supabase URL: `https://lqmnkdqyoxytyyxuglhx.supabase.co`
- Supabase anon key: `eyJhbGci...` (full JWT token)
- Resend API key: `re_fBMcuxA3...`

### Step 1: Remove .env from Git Tracking

```bash
# Remove .env from Git (keeps local file)
git rm --cached .env

# Commit the removal
git commit -m "Remove .env from version control"

# Push to remote
git push
```

### Step 2: Rotate All Exposed Keys (REQUIRED)

#### A. Rotate Supabase Anon Key
1. Go to: https://supabase.com/dashboard/project/lqmnkdqyoxytyyxuglhx/settings/api
2. Click **"Reset"** next to the `anon` / `public` key
3. Copy the new key
4. Update your local `.env` file with the new key
5. Restart your dev server

#### B. Rotate Resend API Key
1. Go to: https://resend.com/api-keys
2. Find key `re_fBMcuxA3_Bnx3vBLZ2dy8rDAaoHGqHv8v`
3. Click **"Revoke"**
4. Create a new API key
5. Update your local `.env` file
6. Update Supabase Edge Function secrets:
   ```bash
   supabase secrets set RESEND_API_KEY=re_YOUR_NEW_KEY
   ```

### Step 3: Verify .env is Ignored

```bash
# Check git status - .env should NOT appear here
git status

# Verify .gitignore includes .env
cat .gitignore | grep ".env"
```

---

## 📋 Next Steps for App Store Submission

### TASK 2: Make Legal Links Functional in App
**Status:** Not started
**File to modify:** `app/onboarding/CreateAccount.tsx`

The "voorwaarden" and "privacy policy" links need `onPress` handlers.

### TASK 3: Add Disclaimer to Landing Page
**Status:** Not started
**File to modify:** `app/landing.tsx`

Users should see medical disclaimer before using the app.

### TASK 4: Integrate Privacy Consent Screen
**Status:** Not started
**File to modify:** Onboarding flow

The comprehensive consent screen exists but isn't in the main flow.

### TASK 5: Fix Data Sync After Onboarding
**Status:** Not started
**File to modify:** `app/onboarding/completion.tsx`

Data doesn't sync to Supabase after onboarding completes.

---

## 🚨 Why This Matters

**Security Impact:**
- Anyone with access to the Git history can access your database
- Malicious actors could delete data, inject fake data, or abuse your email quota
- Exposed keys violate security best practices and could cause app rejection

**Timeline:**
- **Immediate (today):** Remove .env from Git and rotate keys
- **Before submission (this week):** Complete tasks 2-5

---

## ✅ Verification Checklist

After rotating keys, verify everything still works:

- [ ] App starts without errors
- [ ] Login/signup works
- [ ] Data saves to Supabase
- [ ] Email verification works
- [ ] Website legal links open correctly

---

## 📞 Questions?

If you encounter issues rotating keys or removing files from Git, reach out or check:
- GitHub Help: [Removing sensitive data](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
- Supabase: [API settings](https://supabase.com/dashboard)
- Resend: [API keys](https://resend.com/api-keys)

**Created:** January 26, 2025
**Priority:** 🔴 CRITICAL - Address immediately
