# 🧹 CLEANUP PLAN
## Organizing Old Database Files

**Purpose:** Move old, fragmented database files to archive folder
**Status:** Safe to execute after verifying new system works
**Date:** 2025-12-03

---

## 📋 Files to Archive

### Old Migration Files (supabase/migrations/)

Move these to `database/archive/migrations-old/`:

```bash
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_row_level_security.sql
supabase/migrations/003_add_consent_and_email_fields.sql
supabase/migrations/004_minimize_pii_for_app_store.sql
supabase/migrations/005_audit_logging_and_security.sql
supabase/migrations/006_remove_deprecated_name_fields.sql
supabase/migrations/007_cleanup_extra_tables.sql
supabase/migrations/008_remove_unused_fields.sql
supabase/migrations/009_fix_audit_trigger.sql
supabase/migrations/010_fix_audit_triggers.sql
supabase/migrations/011_restore_audit_logging_clean.sql
```

**Why archive?**
- These are fragmented fixes to issues
- New migration (database/migrations/001_initial_schema.sql) replaces all of these
- Keep for reference in case we need to understand historical decisions

---

### Old Scripts (root folder)

Move these to `database/archive/scripts-old/`:

```bash
manual-delete-user.sql
send-test-email-lite.js
send-test-email.js
test-email-inline-images.js
get-tunnel-url.js
print-tunnel-qr.js
run-migration-009.js
start-tunnel.sh
start-tunnel-simple.sh
deploy-and-test-email.sh
switch-to-hosted-images.sh
```

**Why archive?**
- These were temporary development/testing scripts
- No longer needed with new centralized system
- Keep for reference

---

### Old Email Template (root folder)

Move this to `database/archive/templates-old/`:

```bash
supabase-password-reset-template.html
```

**Why archive?**
- Replaced by `database/templates/auth/reset-password.html`
- New version is Supabase-native

---

### Deprecated Edge Functions

**Delete these (no longer needed):**

```bash
supabase/functions/send-password-reset-email/
supabase/functions/verify-email/
```

**Why delete?**
- Supabase now handles auth emails natively
- Custom email verification system removed
- These cause confusion if left in codebase

**Keep these:**

```bash
supabase/functions/delete-user/           # Still needed for auth.users deletion
supabase/functions/send-welcome-email/    # Marketing email (not auth)
supabase/functions/create-profile/        # Triggered on signup (if used)
```

---

### Documentation Files (root folder)

Move these to `database/archive/docs-old/`:

```bash
ACCOUNT_DELETION_FIX.md
ALCOHOL_MODEL_CONSISTENCY_FIXED.md
ALCOHOL_MODEL_FINAL_STATUS.md
ALCOHOL_MODEL_VERIFICATION.md
CLEANUP_PLAN.md
COMPLETE_DATA_AUDIT_GDPR.md
CONSENT_AND_DATABASE_FIXES.md
DATABASE_CLEANUP_PLAN.md
DATABASE_HOLISTIC_AUDIT.md
DATABASE_STRUCTURE_REVIEW.md
DATA_COLLECTION_AUDIT.md
DEPLOY_EMAIL.md
DEPLOY_INLINE_FIX.md
DEV_SERVER.md
EMAIL_IMAGES_TROUBLESHOOTING.md
EMAIL_IMPROVEMENTS_SUMMARY.md
EMAIL_REALITY_CHECK.md
EMAIL_VERIFICATION_FIXED.md
EMAIL_VERIFICATION_GUIDE.md
EXTRA_DATABASE_TABLES_AUDIT.md
FINAL_DATABASE_CLEANUP.md
IMPLEMENTATION_SUMMARY.md
IMPLEMENTATION_SUMMARY_ALCOHOL_MODEL.md
INLINE_IMAGES_FIX.md
IOS_BUILD_GUIDE.md
MIGRATION_011_GUIDE.md
NAVIGATION_BUG_FIX.md
PRIVACY_TESTING_CHECKLIST.md
SECURITY_ENHANCEMENTS.md
SECURITY_IMPLEMENTATION_SUMMARY.md
SETUP_DOMAIN.md
TEST_RUNDOWN.md
USE_CDN_IMAGES.md
ONBOARDING_FLOW_UPDATE.md
```

**Why archive?**
- Historical documentation of development process
- May contain useful context but not needed for daily operations
- Replaced by centralized documentation in `/database/docs/`

---

## 🚀 Cleanup Script

**IMPORTANT:** Only run this AFTER verifying the new database system works!

```bash
#!/bin/bash
# File: database/scripts/cleanup-old-files.sh

set -e

echo "🧹 Cleaning up old database files..."

# Create archive folders
mkdir -p database/archive/migrations-old
mkdir -p database/archive/scripts-old
mkdir -p database/archive/templates-old
mkdir -p database/archive/docs-old
mkdir -p database/archive/functions-old

# Move old migrations
echo "📦 Archiving old migrations..."
mv supabase/migrations/001_initial_schema.sql database/archive/migrations-old/ 2>/dev/null || true
mv supabase/migrations/002_row_level_security.sql database/archive/migrations-old/ 2>/dev/null || true
mv supabase/migrations/003_add_consent_and_email_fields.sql database/archive/migrations-old/ 2>/dev/null || true
mv supabase/migrations/004_minimize_pii_for_app_store.sql database/archive/migrations-old/ 2>/dev/null || true
mv supabase/migrations/005_audit_logging_and_security.sql database/archive/migrations-old/ 2>/dev/null || true
mv supabase/migrations/006_remove_deprecated_name_fields.sql database/archive/migrations-old/ 2>/dev/null || true
mv supabase/migrations/007_cleanup_extra_tables.sql database/archive/migrations-old/ 2>/dev/null || true
mv supabase/migrations/008_remove_unused_fields.sql database/archive/migrations-old/ 2>/dev/null || true
mv supabase/migrations/009_fix_audit_trigger.sql database/archive/migrations-old/ 2>/dev/null || true
mv supabase/migrations/010_fix_audit_triggers.sql database/archive/migrations-old/ 2>/dev/null || true
mv supabase/migrations/011_restore_audit_logging_clean.sql database/archive/migrations-old/ 2>/dev/null || true

# Move old scripts
echo "📦 Archiving old scripts..."
mv manual-delete-user.sql database/archive/scripts-old/ 2>/dev/null || true
mv send-test-email-lite.js database/archive/scripts-old/ 2>/dev/null || true
mv send-test-email.js database/archive/scripts-old/ 2>/dev/null || true
mv test-email-inline-images.js database/archive/scripts-old/ 2>/dev/null || true
mv get-tunnel-url.js database/archive/scripts-old/ 2>/dev/null || true
mv print-tunnel-qr.js database/archive/scripts-old/ 2>/dev/null || true
mv run-migration-009.js database/archive/scripts-old/ 2>/dev/null || true
mv start-tunnel.sh database/archive/scripts-old/ 2>/dev/null || true
mv start-tunnel-simple.sh database/archive/scripts-old/ 2>/dev/null || true
mv deploy-and-test-email.sh database/archive/scripts-old/ 2>/dev/null || true
mv switch-to-hosted-images.sh database/archive/scripts-old/ 2>/dev/null || true

# Move old templates
echo "📦 Archiving old templates..."
mv supabase-password-reset-template.html database/archive/templates-old/ 2>/dev/null || true

# Move deprecated Edge Functions
echo "📦 Archiving deprecated Edge Functions..."
mv supabase/functions/send-password-reset-email database/archive/functions-old/ 2>/dev/null || true
mv supabase/functions/verify-email database/archive/functions-old/ 2>/dev/null || true

# Move old documentation
echo "📦 Archiving old documentation..."
mv ACCOUNT_DELETION_FIX.md database/archive/docs-old/ 2>/dev/null || true
mv ALCOHOL_MODEL_CONSISTENCY_FIXED.md database/archive/docs-old/ 2>/dev/null || true
mv ALCOHOL_MODEL_FINAL_STATUS.md database/archive/docs-old/ 2>/dev/null || true
mv ALCOHOL_MODEL_VERIFICATION.md database/archive/docs-old/ 2>/dev/null || true
mv CLEANUP_PLAN.md database/archive/docs-old/ 2>/dev/null || true
mv COMPLETE_DATA_AUDIT_GDPR.md database/archive/docs-old/ 2>/dev/null || true
mv CONSENT_AND_DATABASE_FIXES.md database/archive/docs-old/ 2>/dev/null || true
mv DATABASE_CLEANUP_PLAN.md database/archive/docs-old/ 2>/dev/null || true
mv DATABASE_HOLISTIC_AUDIT.md database/archive/docs-old/ 2>/dev/null || true
mv DATABASE_STRUCTURE_REVIEW.md database/archive/docs-old/ 2>/dev/null || true
mv DATA_COLLECTION_AUDIT.md database/archive/docs-old/ 2>/dev/null || true
mv DEPLOY_EMAIL.md database/archive/docs-old/ 2>/dev/null || true
mv DEPLOY_INLINE_FIX.md database/archive/docs-old/ 2>/dev/null || true
mv DEV_SERVER.md database/archive/docs-old/ 2>/dev/null || true
mv EMAIL_IMAGES_TROUBLESHOOTING.md database/archive/docs-old/ 2>/dev/null || true
mv EMAIL_IMPROVEMENTS_SUMMARY.md database/archive/docs-old/ 2>/dev/null || true
mv EMAIL_REALITY_CHECK.md database/archive/docs-old/ 2>/dev/null || true
mv EMAIL_VERIFICATION_FIXED.md database/archive/docs-old/ 2>/dev/null || true
mv EMAIL_VERIFICATION_GUIDE.md database/archive/docs-old/ 2>/dev/null || true
mv EXTRA_DATABASE_TABLES_AUDIT.md database/archive/docs-old/ 2>/dev/null || true
mv FINAL_DATABASE_CLEANUP.md database/archive/docs-old/ 2>/dev/null || true
mv IMPLEMENTATION_SUMMARY.md database/archive/docs-old/ 2>/dev/null || true
mv IMPLEMENTATION_SUMMARY_ALCOHOL_MODEL.md database/archive/docs-old/ 2>/dev/null || true
mv INLINE_IMAGES_FIX.md database/archive/docs-old/ 2>/dev/null || true
mv IOS_BUILD_GUIDE.md database/archive/docs-old/ 2>/dev/null || true
mv MIGRATION_011_GUIDE.md database/archive/docs-old/ 2>/dev/null || true
mv NAVIGATION_BUG_FIX.md database/archive/docs-old/ 2>/dev/null || true
mv PRIVACY_TESTING_CHECKLIST.md database/archive/docs-old/ 2>/dev/null || true
mv SECURITY_ENHANCEMENTS.md database/archive/docs-old/ 2>/dev/null || true
mv SECURITY_IMPLEMENTATION_SUMMARY.md database/archive/docs-old/ 2>/dev/null || true
mv SETUP_DOMAIN.md database/archive/docs-old/ 2>/dev/null || true
mv TEST_RUNDOWN.md database/archive/docs-old/ 2>/dev/null || true
mv USE_CDN_IMAGES.md database/archive/docs-old/ 2>/dev/null || true
mv ONBOARDING_FLOW_UPDATE.md database/archive/docs-old/ 2>/dev/null || true

echo ""
echo "✅ Cleanup complete!"
echo ""
echo "📂 Archived files are in database/archive/"
echo "📁 New centralized structure is in /database/"
echo ""
echo "Next steps:"
echo "1. Verify new system works"
echo "2. Commit changes to git"
echo "3. (Optional) Delete database/archive/ after 30 days if everything works"
```

---

## ✅ Verification Before Cleanup

Before running cleanup, verify:

- [ ] New database migration works
- [ ] All tests pass (test-database.sql)
- [ ] Account creation works
- [ ] Password reset works
- [ ] Data export works
- [ ] Account deletion works
- [ ] Emails use correct templates
- [ ] From address is info@mommymilkbar.nl

---

## 🔄 New Folder Structure

After cleanup, your structure will be:

```
/
├── database/                    # ✅ NEW: Centralized database hub
│   ├── migrations/
│   │   └── 001_initial_schema.sql
│   ├── templates/
│   │   ├── auth/
│   │   │   ├── confirm-signup.html
│   │   │   ├── reset-password.html
│   │   │   └── change-email.html
│   │   └── marketing/
│   ├── scripts/
│   │   ├── run-migration.sh
│   │   ├── test-database.sql
│   │   └── cleanup-old-files.sh
│   ├── docs/
│   │   ├── IMPLEMENTATION_GUIDE.md
│   │   └── CLEANUP_PLAN.md
│   ├── archive/                 # 📦 Old files (safe to delete after 30 days)
│   │   ├── migrations-old/
│   │   ├── scripts-old/
│   │   ├── templates-old/
│   │   ├── functions-old/
│   │   └── docs-old/
│   ├── README.md
│   └── DATABASE_ARCHITECTURE.md
│
├── supabase/
│   ├── functions/
│   │   ├── delete-user/        # ✅ KEEP: Still needed
│   │   └── send-welcome-email/ # ✅ KEEP: Marketing email
│   └── migrations/             # Empty (all moved to /database/)
│
└── (other app files)
```

---

## 📝 Notes

- **Don't rush cleanup:** Verify new system works first
- **Keep archive for 30 days:** In case we need to reference old code
- **Commit to git before cleanup:** Easy rollback if needed
- **Test thoroughly:** Run all tests before archiving

---

**Once everything is verified, the cleanup makes your codebase clean and maintainable! 🎉**
