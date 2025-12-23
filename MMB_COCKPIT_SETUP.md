# MMB Cockpit - Setup & Deployment Guide

## 🚀 Wat heb je gemaakt?

Een premium admin panel ("MMB Cockpit") voor Mommy Milk Bar met:

✅ **Dark cockpit theme** (plum/charcoal + pink accents)
✅ **Auto-calculated KPIs** (activation, retention, reviews)
✅ **Cockpit Guidance** (actionable recommendations)
✅ **Assumptions tracking** (Desirability, Usability, Retention, Monetization, Compliance)
✅ **Experiments** (validatie tests)
✅ **OKRs + KRs** (objectives & key results met progress tracking)
✅ **Auth protected** (Supabase Auth)

---

## 📋 Setup Stappen

### Stap 1: Database Migrations Toepassen

De cockpit heeft 8 nieuwe database tabellen nodig. Pas deze toe via **Supabase SQL Editor**:

1. Ga naar: https://supabase.com/dashboard/project/lqmnkdqyoxytyyxuglhx/sql/new

2. Voer elke migration uit **in deze volgorde**:

   **Migration 014: Assumptions**
   ```sql
   -- Copy paste: supabase/migrations/014_create_assumptions.sql
   ```

   **Migration 015: Experiments** (MOET VOOR evidence!)
   ```sql
   -- Copy paste: supabase/migrations/015_create_experiments.sql
   ```

   **Migration 016: Evidence** (verwijst naar experiments)
   ```sql
   -- Copy paste: supabase/migrations/016_create_evidence.sql
   ```

   **Migration 017: OKRs**
   ```sql
   -- Copy paste: supabase/migrations/017_create_okrs.sql
   ```

   **Migration 018: KRs**
   ```sql
   -- Copy paste: supabase/migrations/018_create_krs.sql
   ```

   **Migration 019: KPI Snapshots**
   ```sql
   -- Copy paste: supabase/migrations/019_create_kpi_snapshots.sql
   ```

   **Migration 020: Weekly Reviews**
   ```sql
   -- Copy paste: supabase/migrations/020_create_weekly_reviews.sql
   ```

   **Migration 021: Seed Data** (bevat 5 assumptions + 1 OKR)
   ```sql
   -- Copy paste: supabase/migrations/021_seed_cockpit_data.sql
   ```

3. **Verificeer** dat de tabellen zijn aangemaakt:
   - Ga naar Table Editor in Supabase
   - Check dat deze tabellen bestaan:
     - ✅ assumptions
     - ✅ evidence
     - ✅ experiments
     - ✅ okrs
     - ✅ krs
     - ✅ kpi_snapshots
     - ✅ weekly_reviews

---

### Stap 2: Admin User Aanmaken

1. Ga naar: https://supabase.com/dashboard/project/lqmnkdqyoxytyyxuglhx/auth/users

2. Klik "Add user" → "Create new user"

3. Vul in:
   - **Email:** `info@mommymilkbar.nl` (of jouw gewenste admin email)
   - **Password:** (kies een sterk wachtwoord - bewaar dit veilig!)
   - **Auto Confirm User:** ✅ **JA** (belangrijk!)

4. Klik "Create user"

5. **Bewaar je credentials:**
   ```
   Email: info@mommymilkbar.nl
   Password: [jouw wachtwoord]
   ```

---

### Stap 3: Lokaal Testen

```bash
cd admin
npm install
npm run dev
```

Open in browser: **http://localhost:3001/admin**

Login met de admin credentials van Stap 2.

Je zou nu moeten zien:
- ✅ Login page met dark cockpit theme
- ✅ Dashboard met 6 hero stats
- ✅ Cockpit Guidance (als KPI's triggers hebben)
- ✅ 5 seed assumptions (A1, A2, B1, B2, E1)
- ✅ 1 OKR met 4 KRs (Q1 2025)
- ✅ Navigatie naar Assumptions, OKRs, etc.

---

### Stap 4: Deployment naar Vercel

#### A. Vercel Config is al klaar

De `vercel.json` in de root directory is al geconfigureerd:
- `/admin/*` → Next.js admin app
- `/` → Static marketing website

#### B. Deploy via Vercel Dashboard

1. Ga naar https://vercel.com/new

2. Import je GitHub repository

3. **Root Directory:** Laat leeg (monorepo support)

4. **Framework Preset:** Kies "Other"

5. **Build & Output Settings:**
   - Build Command: `cd admin && npm install && npm run build`
   - Output Directory: `admin/.next`
   - Install Command: (laat leeg)

6. **Environment Variables** toevoegen:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://lqmnkdqyoxytyyxuglhx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[jouw anon key uit .env]
   ```

7. Klik "Deploy"

#### C. Test Production

Zodra deployed:
1. Ga naar `https://mommymilkbar.nl/admin`
2. Login met admin credentials
3. Verifieer dat alles werkt

---

## 🎨 Features Overview

### Dashboard (`/admin/dashboard`)

**Hero Stats (auto-calculated):**
- **Installs:** Totaal aantal profiles
- **Activation Rate:** % users die onboarding hebben afgerond
- **D1 Retention:** % users actief binnen 1 dag na signup
- **D7 Retention:** % users actief binnen 7 dagen na signup
- **Reviews:** Aantal feedback entries
- **Rating:** Gemiddelde NPS score (1-10) geconverteerd naar 1-5 rating

**Cockpit Guidance:**
Automatische recommendations based op hardcoded rules:
- Als activation_rate < 60% → "Fix onboarding before marketing"
- Als d7_retention < 10% → "Focus on repeat-use triggers"
- Als rating_avg < 4.2 → "Review complaints; prioritize trust"
- Als reviews_count < 10 → "Prompt users for review"
- Als installs < 50 → "Focus on awareness and acquisition"

**At-Risk Assumptions:**
- Toont assumptions met high/critical risk + untested/invalidated status

**Running Experiments:**
- Toont actieve experimenten

**Active OKRs:**
- Toont OKRs met KR progress bars

### Assumptions (`/admin/dashboard/assumptions`)

- **List view** met alle assumptions
- **Badges:** Code, Risk, Status, Category
- **Confidence meter:** Visual circular progress (0-100%)
- **Notes** en metadata (owner, last updated)

**Seed data (5 assumptions):**
1. **A1:** Borstvoedende moeders ervaren stress na drankjes (Desirability, Critical, Testing, 70%)
2. **A2:** Onzekerheid zit in timing (Desirability, High, Testing, 60%)
3. **B1:** Gebruikers snappen zonder uitleg (Usability, Medium, Untested, 40%)
4. **B2:** Countdown voelt geruststellend (Usability, Medium, Untested, 50%)
5. **E1:** Medisch disclaimer wordt begrepen (Compliance, Critical, Testing, 55%)

### OKRs (`/admin/dashboard/okrs`)

- **List view** met objectives per period
- **Progress bars** voor elke Key Result
- **Confidence** tracking (0-100%)

**Seed data (1 OKR):**
- **Objective:** "Prove demand & usability for MMB in NL market" (Q1 2025)
- **KR1:** Activation rate ≥ 70% (current: 0%)
- **KR2:** D7 retention ≥ 20% (current: 0%)
- **KR3:** Avg rating ≥ 4.6 (current: 0)
- **KR4:** 50 feedback items (current: 0)

### Experiments, Weekly Review, Settings

- Placeholder pages (CRUD komt in volgende iteratie)

---

## 🎯 Volgende Stappen

### Direct bruikbaar:
1. ✅ Login en bekijk dashboard
2. ✅ Bekijk assumptions en OKRs (seed data)
3. ✅ Monitor KPI's (auto-calculated from existing profiles/feedback tables)
4. ✅ Ontvang cockpit guidance based op thresholds

### Handmatig toevoegen (via Table Editor):
- Nieuwe assumptions (ga naar Supabase Table Editor → assumptions)
- Nieuwe experiments
- Evidence koppelen aan assumptions
- KR values updaten (ga naar krs table, edit "current" column)

### Toekomstige features (als je wilt uitbreiden):
- **Full CRUD UI** voor assumptions (create/edit/delete dialogs)
- **Experiments CRUD** met assumption linking
- **Weekly review form** (highlights, lowlights, learnings)
- **Settings page** (password change, admin management)
- **Charts** (KPI trends over time met Recharts)
- **Export functionaliteit** (CSV export van assumptions/KPI data)

---

## 🐛 Troubleshooting

### "Cannot read property of null" errors
- Zorg dat alle migrations zijn toegepast
- Refresh de browser (hard refresh: Cmd+Shift+R)

### KPI's tonen 0 of NaN
- Normaal als je nog geen users hebt met completed onboarding
- KPI's worden live berekend uit `profiles` en `feedback` tables

### Login redirect loop
- Check dat admin user is aangemaakt met "Auto Confirm" enabled
- Verify .env.local heeft correcte SUPABASE_URL en ANON_KEY

### Vercel build fails
- Check dat `admin/package.json` correct is
- Verify environment variables zijn gezet in Vercel dashboard

### /admin geeft 404 op productie
- Check `vercel.json` routing in root directory
- Vercel kan ~5 min nodig hebben na eerste deploy

---

## 📚 Tech Stack

- **Framework:** Next.js 15 (App Router)
- **UI:** Tailwind CSS + shadcn/ui
- **Database:** Supabase PostgreSQL
- **Auth:** Supabase Auth
- **Charts:** Recharts (for future iterations)
- **Validation:** Zod
- **Deployment:** Vercel

---

## 🎨 Design System

**Colors:**
- Background: `#0F0A1C` (deep plum/charcoal)
- Surface: `#1A1425` (card backgrounds)
- Border: `#2D2438` (subtle borders)
- Accent Pink: `#F49B9B` (primary accent)
- Accent Berry: `#E47C7C` (hover states)
- Text Primary: `#F5F2F9` (almost white)
- Text Secondary: `#B8B0C8` (muted purple-gray)

**Typography:**
- Display: Poppins (headings)
- Body: Inter (text)

**Components:**
- GlassCard: Glassy cards met subtle gradients en backdrop blur
- Shadow glow: Soft pink glow voor critical/active elements
- Status badges: Color-coded (success, warning, error, info)

---

## 🔐 Security Checklist

- ✅ All `/admin` routes protected via middleware
- ✅ Supabase RLS policies (inherits from existing profiles/feedback policies)
- ✅ Service role key only in server-side code (niet exposed)
- ✅ Anon key veilig (alleen voor auth + limited read access)

---

## 📞 Support

Als je issues hebt:
1. Check de migrations zijn allemaal succesvol toegepast
2. Verify admin user is created with "Auto Confirm"
3. Check browser console voor errors
4. Verify .env.local heeft correcte Supabase credentials

---

## 🎉 Klaar!

Je hebt nu een volledig functioneel MMB Cockpit!

**Test het lokaal:**
```bash
cd admin && npm run dev
```

**Deploy naar productie:**
- Push naar GitHub
- Vercel auto-deploys
- Ga naar mommymilkbar.nl/admin

**Geniet van je premium cockpit!** 🚀
