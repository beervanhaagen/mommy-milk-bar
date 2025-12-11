#!/bin/bash
# =====================================================
# Run Database Migration
# =====================================================
# This script runs the master migration file against
# your Supabase database.
#
# IMPORTANT: This should only be run on a FRESH database!
# =====================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${YELLOW}║   MOMMY MILK BAR - Database Migration Runner      ║${NC}"
echo -e "${YELLOW}╚════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if migration file exists
MIGRATION_FILE="database/migrations/001_initial_schema.sql"
if [ ! -f "$MIGRATION_FILE" ]; then
  echo -e "${RED}✗ Migration file not found: $MIGRATION_FILE${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Migration file found${NC}"

# Ask for confirmation
echo ""
echo -e "${YELLOW}⚠️  WARNING: This will apply the complete database schema!${NC}"
echo -e "${YELLOW}   This should ONLY be run on a fresh database.${NC}"
echo ""
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
  echo -e "${RED}Migration cancelled.${NC}"
  exit 0
fi

echo ""
echo -e "${YELLOW}Please select your target:${NC}"
echo "1) Local Supabase (requires 'supabase start')"
echo "2) Production Supabase (requires SUPABASE_DB_URL env var)"
read -p "Enter choice (1 or 2): " choice

if [ "$choice" == "1" ]; then
  # Local Supabase
  echo ""
  echo -e "${GREEN}Running migration on LOCAL Supabase...${NC}"

  # Check if Supabase is running
  if ! command -v supabase &> /dev/null; then
    echo -e "${RED}✗ Supabase CLI not found. Please install it first.${NC}"
    exit 1
  fi

  # Run migration
  supabase db reset --db-url "postgresql://postgres:postgres@localhost:54322/postgres"
  cat "$MIGRATION_FILE" | supabase db execute --db-url "postgresql://postgres:postgres@localhost:54322/postgres"

  echo -e "${GREEN}✓ Migration completed on local database!${NC}"

elif [ "$choice" == "2" ]; then
  # Production Supabase
  echo ""
  echo -e "${YELLOW}⚠️  You are about to run migration on PRODUCTION!${NC}"
  read -p "Type 'I UNDERSTAND THE RISKS' to continue: " production_confirm

  if [ "$production_confirm" != "I UNDERSTAND THE RISKS" ]; then
    echo -e "${RED}Production migration cancelled.${NC}"
    exit 0
  fi

  # Check for DB URL
  if [ -z "$SUPABASE_DB_URL" ]; then
    echo -e "${RED}✗ SUPABASE_DB_URL environment variable not set${NC}"
    echo "Get your DB URL from: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/database"
    exit 1
  fi

  echo -e "${GREEN}Running migration on PRODUCTION Supabase...${NC}"

  # Run migration
  psql "$SUPABASE_DB_URL" -f "$MIGRATION_FILE"

  echo -e "${GREEN}✓ Migration completed on production database!${NC}"

else
  echo -e "${RED}Invalid choice. Exiting.${NC}"
  exit 1
fi

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              Migration Complete! ✓                 ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Verify tables created: Check Supabase Dashboard > Database > Tables"
echo "2. Verify RLS enabled: Check each table has policies"
echo "3. Upload email templates: Dashboard > Auth > Email Templates"
echo "4. Configure SMTP: Dashboard > Settings > Auth > SMTP Settings"
echo "5. Test account creation flow"
echo ""
