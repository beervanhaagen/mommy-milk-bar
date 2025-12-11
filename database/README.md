# 🗄️ DATABASE - Mommy Milk Bar

**Version:** 2.0
**Status:** Production Ready
**Last Updated:** 2025-12-03

---

## 📂 What's in This Folder?

This is your **centralized database hub** for Mommy Milk Bar. Everything related to your Supabase database lives here.

```
/database/
├── migrations/        # SQL migration files
├── templates/         # Email templates (auth & marketing)
├── scripts/           # Helper scripts for database management
└── docs/              # Architecture and implementation guides
```

---

## 🚀 Quick Start

### First Time Setup

1. **Run the migration:**
   ```bash
   chmod +x database/scripts/run-migration.sh
   ./database/scripts/run-migration.sh
   ```

2. **Test the database:**
   - Copy `database/scripts/test-database.sql`
   - Run in Supabase SQL Editor
   - Verify all tests pass ✓

3. **Configure Supabase:**
   - Upload email templates (see Implementation Guide)
   - Set up SMTP with Resend
   - Test account creation flow

4. **Read the docs:**
   - `DATABASE_ARCHITECTURE.md` - Full technical details
   - `docs/IMPLEMENTATION_GUIDE.md` - Step-by-step setup

---

## 📋 Database Schema Overview

### Core Tables

| Table | Purpose | Key Features |
|-------|---------|--------------|
| **profiles** | Mother's profile & settings | GDPR consent tracking, privacy-first |
| **babies** | Baby data | Multiple babies per mother, display labels only |
| **drink_sessions** | Drinking sessions | Alcohol metabolism calculations |
| **drinks** | Individual drinks | Linked to sessions |
| **feeding_logs** | Feeding patterns | Optional tracking for predictions |
| **content_tips** | CMS for tips | Age-based personalization |
| **user_tip_interactions** | Engagement tracking | Helpful/dismissed flags |
| **analytics_events** | Privacy-first analytics | Auto-anonymization after 90 days |
| **data_requests** | GDPR compliance | Export/delete requests |
| **audit_log** | Security monitoring | All sensitive actions logged |

### Key Features

✅ **Privacy-First:** No real names, minimal PII
✅ **GDPR Compliant:** Consent tracking, data export, right to erasure
✅ **Secure:** Row Level Security on all tables
✅ **Maintainable:** CASCADE deletions, auto-updating timestamps
✅ **Auditable:** All sensitive actions logged

---

## 🔧 Common Tasks

### Export User Data (GDPR)

```sql
SELECT export_user_data();
```

Returns JSON with all user data.

### Delete User Account

```typescript
// Via Edge Function (handles CASCADE + auth.users deletion)
await supabase.functions.invoke('delete-user');
```

Automatically deletes:
- Profile
- All babies
- All feeding logs
- All drink sessions
- All drinks
- All tip interactions
- All data requests
- Anonymizes analytics

### Add New Content Tip

```sql
INSERT INTO content_tips (category, title, content, priority, is_active)
VALUES (
  'safety',
  'Tip Title',
  'Tip content here...',
  100,
  true
);
```

### Check Database Health

```sql
-- Run the test script
-- database/scripts/test-database.sql
```

---

## 📧 Email Templates

All auth emails use Supabase's built-in system with custom templates:

### Auth Emails (Supabase Native)
- **Sign Up:** `templates/auth/confirm-signup.html`
- **Password Reset:** `templates/auth/reset-password.html`
- **Email Change:** `templates/auth/change-email.html`

**From:** info@mommymilkbar.nl
**Branding:** Mimi mascot, Poppins font, pink CTAs

### Marketing Emails (Edge Functions)
- Place custom templates in `templates/marketing/`
- Called via Resend API from Edge Functions

---

## 🛡️ Security

### Row Level Security (RLS)

All tables have RLS enabled. Users can ONLY access their own data:

```sql
-- Example policy (applied to all user data tables)
CREATE POLICY "Users can view own data"
  ON table_name FOR SELECT
  USING (auth.uid() = user_id);
```

### Cascade Deletions

Deleting a profile automatically deletes:
- Babies → Feeding logs
- Drink sessions → Drinks
- Tip interactions
- Data requests

Analytics and audit logs are anonymized (user_id set to NULL) to preserve aggregate data.

---

## 📊 Data Retention

| Data Type | Retention | Auto-Cleanup |
|-----------|-----------|--------------|
| User data | Until deletion | Manual (user-initiated) |
| Analytics events | 90 days (then anonymized) | ✅ Daily cron job |
| Audit logs | 2 years | ✅ Monthly cron job |

---

## 🐛 Troubleshooting

### "Permission denied for table X"

➡️ Check RLS policies. Users must be authenticated to access data.

```sql
-- Verify you're authenticated
SELECT auth.uid();
```

### "Email not sending"

➡️ Check SMTP configuration in Supabase Dashboard:
- Settings > Auth > SMTP Settings
- Test the connection
- Verify Resend API key

### "CASCADE deletion not working"

➡️ Verify foreign key constraints have `ON DELETE CASCADE`:

```sql
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table,
  rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
  ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY';
```

---

## 📚 Documentation

- **[DATABASE_ARCHITECTURE.md](DATABASE_ARCHITECTURE.md)** - Complete technical specification
- **[docs/IMPLEMENTATION_GUIDE.md](docs/IMPLEMENTATION_GUIDE.md)** - Step-by-step setup
- **[Supabase Docs](https://supabase.com/docs)** - Official Supabase documentation

---

## 🎯 Design Principles

1. **Privacy-First:** Collect only what's necessary
2. **GDPR-Native:** Compliance built-in, not bolted-on
3. **User-Centric:** Easy account management
4. **Maintainer-Friendly:** Simple, not clever
5. **Supabase-Native:** Use platform features

---

## 🔄 Migration History

| Version | Date | Description |
|---------|------|-------------|
| 2.0 | 2025-12-03 | Complete rewrite: privacy-first, GDPR-compliant, Supabase-native auth |
| 1.x | 2025-11 | Initial schema with custom auth (deprecated) |

---

## 📞 Need Help?

1. Check [IMPLEMENTATION_GUIDE.md](docs/IMPLEMENTATION_GUIDE.md)
2. Review [DATABASE_ARCHITECTURE.md](DATABASE_ARCHITECTURE.md)
3. Check Supabase Logs (Dashboard > Logs)
4. Run test script to diagnose issues

---

**Built with ❤️ for mothers who deserve to enjoy life while breastfeeding.**
