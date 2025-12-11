# Supabase Database Setup

Dit document bevat instructies om de Mommy Milk Bar database op te zetten in Supabase.

## 📋 Vereisten

- Supabase account (✅ al aangemaakt)
- Project URL: `https://lqmnkdqyoxytyyxuglhx.supabase.co`

## 🚀 Database Migrations Uitvoeren

### Stap 1: Open SQL Editor

1. Ga naar je Supabase dashboard: https://supabase.com/dashboard/project/lqmnkdqyoxytyyxuglhx
2. Klik in het linker menu op **SQL Editor**

### Stap 2: Voer Migration 001 uit (Schema)

1. Klik op **New query**
2. Kopieer de volledige inhoud van [`migrations/001_initial_schema.sql`](./migrations/001_initial_schema.sql)
3. Plak in de SQL editor
4. Klik op **Run** (of druk Cmd/Ctrl + Enter)
5. ✅ Controleer dat je ziet: "Success. No rows returned"

**Wat doet deze migration?**
- Maakt alle database tabellen aan (profiles, babies, drink_sessions, drinks, etc.)
- Voegt indexes toe voor performance
- Maakt triggers aan voor auto-updates
- Voegt sample tips toe in de database

### Stap 3: Voer Migration 002 uit (Security)

1. Maak een **New query** aan
2. Kopieer de volledige inhoud van [`migrations/002_row_level_security.sql`](./migrations/002_row_level_security.sql)
3. Plak in de SQL editor
4. Klik op **Run**
5. ✅ Controleer dat je ziet: "Success. No rows returned"

**Wat doet deze migration?**
- Activeert Row Level Security (RLS) op alle tabellen
- Maakt policies aan zodat users alleen hun eigen data kunnen zien
- Voegt GDPR compliance functies toe (export/delete data)
- Maakt helper functies aan voor data validatie

## 🔐 Security Verificatie

Controleer of RLS actief is:

1. Ga naar **Database** → **Tables** in de Supabase dashboard
2. Klik op een tabel (bijv. `profiles`)
3. Scroll naar beneden naar **RLS Policies**
4. ✅ Je moet policies zien zoals "Users can view own profile"

## 🧪 Test de Database

Je kunt de database testen met deze query:

```sql
-- Controleer of alle tabellen zijn aangemaakt
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Je zou deze tabellen moeten zien:
-- analytics_events
-- babies
-- content_tips
-- data_requests
-- drink_sessions
-- drinks
-- feeding_logs
-- profiles
-- user_tip_interactions
```

## 📊 Database Schema Overzicht

```
profiles (1) ──────┐
                   │
                   ├──> babies (many)
                   │       │
                   │       └──> feeding_logs (many)
                   │
                   ├──> drink_sessions (many)
                   │       │
                   │       └──> drinks (many)
                   │
                   ├──> user_tip_interactions (many)
                   │       │
                   │       └──> content_tips (many-to-many)
                   │
                   ├──> analytics_events (many)
                   │
                   └──> data_requests (many)
```

## 🔄 Auto-Anonymization Setup (Optioneel)

Voor GDPR compliance willen we analytics data ouder dan 90 dagen anonymiseren.

1. Ga naar **Database** → **Extensions**
2. Zoek naar `pg_cron` en enable deze
3. Ga terug naar **SQL Editor** en voer uit:

```sql
-- Schedule daily anonymization at 2 AM
SELECT cron.schedule(
  'anonymize-analytics-daily',
  '0 2 * * *',
  'SELECT anonymize_old_analytics();'
);
```

## 📝 Sample Data (Optioneel - voor testing)

Als je sample data wilt om mee te testen:

```sql
-- Maak een test user aan (doe dit via de app signup flow!)
-- NIET handmatig users aanmaken in de database

-- Bekijk de sample tips die al zijn aangemaakt:
SELECT * FROM content_tips ORDER BY priority DESC;
```

## ❓ Troubleshooting

### "Permission denied" errors

- **Oplossing**: Zorg dat je ingelogd bent in je Supabase dashboard
- De SQL Editor gebruikt je admin rechten, niet de RLS policies

### "Function does not exist" errors

- **Oplossing**: Voer eerst migration 001 uit, dan 002
- Migration 002 gebruikt functies/tabellen uit migration 001

### "Relation already exists" errors

- **Oplossing**: Deze migration is al eerder uitgevoerd
- Je kunt de tabellen verwijderen en opnieuw uitvoeren (⚠️ dit verwijdert alle data!)

```sql
-- VOORZICHTIG: Dit verwijdert alle tabellen en data!
DROP TABLE IF EXISTS user_tip_interactions CASCADE;
DROP TABLE IF EXISTS content_tips CASCADE;
DROP TABLE IF EXISTS feeding_logs CASCADE;
DROP TABLE IF EXISTS drinks CASCADE;
DROP TABLE IF EXISTS drink_sessions CASCADE;
DROP TABLE IF EXISTS babies CASCADE;
DROP TABLE IF EXISTS analytics_events CASCADE;
DROP TABLE IF EXISTS data_requests CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Voer daarna migrations opnieuw uit
```

## ✅ Checklist

- [x] Supabase project aangemaakt
- [x] `.env` file geconfigureerd met SUPABASE_URL en SUPABASE_ANON_KEY
- [ ] Migration 001 uitgevoerd (Schema)
- [ ] Migration 002 uitgevoerd (RLS Policies)
- [ ] RLS policies geverifieerd in dashboard
- [ ] Test query uitgevoerd om tabellen te checken

## 🎉 Volgende Stappen

Na het uitvoeren van deze migrations:

1. Test de auth flow (signup/signin) in de app
2. Controleer of profile automatisch wordt aangemaakt bij signup
3. Test of data sync werkt (lokaal → cloud)
4. Implementeer real-time subscriptions (optioneel)

## ✉️ Edge Function: Welkomstmail via Resend

Nieuwe gebruikers ontvangen automatisch een welkomstmail via de Supabase Edge function
[`send-welcome-email`](./functions/send-welcome-email/index.ts). Zo zet je 'm live:

### Stap 1: Login bij Supabase CLI
```bash
supabase login
```
Volg de instructies om in te loggen met je access token (haal op via https://supabase.com/dashboard/account/tokens)

### Stap 2: Link je project
```bash
supabase link --project-ref lqmnkdqyoxytyyxuglhx
```

### Stap 3: Set Secrets (Environment Variables)
```bash
# Verplicht: Resend API key
supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxxx

# Optioneel: branding & CTA links
supabase secrets set RESEND_FROM_EMAIL="Mommy Milk Bar <welcome@mail.mommymilkbar.nl>"
supabase secrets set WELCOME_CTA_URL=https://mommymilkbar.nl/app
supabase secrets set APP_STORE_URL=https://mommymilkbar.nl/app
supabase secrets set INSTAGRAM_URL=https://www.instagram.com/mommymilkbar/
```

**Waar vind je je Resend API key?**
- Ga naar https://resend.com/api-keys
- Kopieer je Production API key (begint met `re_`)

### Stap 4: Deploy de Function
```bash
supabase functions deploy send-welcome-email --project-ref lqmnkdqyoxytyyxuglhx
```

### Stap 5: Test
Vanuit de app triggert `signUp()` deze function automatisch. Je kunt ook handmatig testen:
```bash
supabase functions invoke send-welcome-email \
  --project-ref lqmnkdqyoxytyyxuglhx \
  --data '{"email":"test@example.com","motherName":"Mimi"}'
```

> Let op: de function gebruikt Resend alleen voor uitgaande mails. Ontvangen gebeurt via Gmail/Workspace.

## 📞 Support

Vragen of problemen? Check:
- Supabase Logs: Dashboard → **Logs** → **Database**
- Supabase Docs: https://supabase.com/docs
- RLS Debugger: Dashboard → **Database** → **Roles** → Test policies
