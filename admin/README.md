# MMB Cockpit - Admin Panel

Premium admin panel for Mommy Milk Bar. Dark theme cockpit for managing assumptions, experiments, OKRs, and KPIs.

## Setup

### 1. Apply Database Migrations

The cockpit requires 8 new database tables. Apply them via **Supabase SQL Editor** (recommended):

1. Go to https://supabase.com/dashboard/project/lqmnkdqyoxytyyxuglhx/sql/new
2. Copy and paste each migration file **in this exact order**:
   - `supabase/migrations/014_create_assumptions.sql`
   - `supabase/migrations/015_create_experiments.sql` ⚠️ **EERST experiments**
   - `supabase/migrations/016_create_evidence.sql` (depends on experiments)
   - `supabase/migrations/017_create_okrs.sql`
   - `supabase/migrations/018_create_krs.sql`
   - `supabase/migrations/019_create_kpi_snapshots.sql`
   - `supabase/migrations/020_create_weekly_reviews.sql`
   - `supabase/migrations/021_seed_cockpit_data.sql` (includes sample data)

3. Click "Run" for each migration

**Verify:** Go to Table Editor and check that these tables exist:
- assumptions
- evidence
- experiments
- okrs
- krs
- kpi_snapshots
- weekly_reviews

### 2. Create Admin User

1. Go to https://supabase.com/dashboard/project/lqmnkdqyoxytyyxuglhx/auth/users
2. Click "Add user" → "Create new user"
3. Enter:
   - Email: `info@mommymilkbar.nl` (or your preferred admin email)
   - Password: (choose a strong password)
   - Auto Confirm User: ✅ **Yes**
4. Click "Create user"

### 3. Install Dependencies

```bash
cd admin
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

Visit: http://localhost:3001/admin

Login with the admin email/password you created in step 2.

## Project Structure

```
admin/
├── app/
│   ├── (auth)/login/       # Login page
│   └── (dashboard)/        # Protected routes
│       ├── page.tsx        # Dashboard
│       ├── assumptions/    # Assumptions CRUD
│       ├── experiments/    # Experiments CRUD
│       ├── okrs/           # OKRs & KRs
│       ├── weekly-review/  # Weekly reviews
│       └── settings/       # Settings
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── dashboard/          # Dashboard-specific
│   ├── assumptions/
│   ├── experiments/
│   └── layout/
├── lib/
│   ├── supabase/           # Supabase clients
│   ├── schemas/            # Zod validation
│   ├── guidance/           # Cockpit guidance rules
│   └── kpi/                # KPI calculation
└── middleware.ts           # Auth protection
```

## Features

### Dashboard
- **Hero Stats:** Installs, Activation%, D1/D7 Retention, Reviews, Rating
- **Cockpit Guidance:** Actionable recommendations based on KPI thresholds
- **At-Risk Assumptions:** High/critical risk assumptions to focus on
- **Running Experiments:** Active tests
- **OKR Progress:** Visual progress tracking

### Assumptions
- Create/edit/delete assumptions
- Filter by status, risk, category
- Track confidence levels (0-100%)
- Link evidence and experiments

### Experiments
- Test hypotheses linked to assumptions
- Track primary metrics and success criteria
- Record results (success/fail/inconclusive)

### OKRs
- Set quarterly/monthly objectives
- Track key results with progress
- Update current values inline

### Weekly Reviews
- Capture highlights, lowlights, learnings
- Document decisions and next week bets
- Focus on specific assumptions

## Deployment

See root `vercel.json` for deployment configuration.

The admin panel is served at `/admin/*` while the main site is served at `/`.

## KPI Calculations

KPIs are auto-calculated from existing Supabase tables:

- **Installs:** `COUNT(profiles)`
- **Activation Rate:** `COUNT(profiles WHERE has_completed_onboarding) / COUNT(profiles) * 100`
- **D1 Retention:** Users active within 1 day of signup
- **D7 Retention:** Users active within 7 days of signup
- **Reviews:** `COUNT(feedback)`
- **Rating:** `AVG(nps_score) / 2` (map 1-10 NPS to 1-5 rating)

KPI snapshots are stored for historical tracking.

## Theme

Dark "cockpit" theme with:
- Deep plum/charcoal background (#0F0A1C)
- Pink/berry accents (#F49B9B, #E47C7C)
- Glassy cards with subtle gradients
- Soft glow effects

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **UI:** Tailwind CSS + shadcn/ui
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **Charts:** Recharts
- **Validation:** Zod
