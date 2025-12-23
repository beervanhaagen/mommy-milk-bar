#!/bin/bash

# Apply only the new cockpit migrations (014-021)
# This script applies migrations directly to the remote Supabase database

echo "Applying MMB Cockpit migrations to Supabase..."

# Database connection string from .env
DB_URL="postgresql://postgres.lqmnkdqyoxytyyxuglhx:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres"

# Apply each migration
for i in {014..021}; do
  MIGRATION_FILE="supabase/migrations/${i}_*.sql"
  if [ -f $MIGRATION_FILE ]; then
    echo "Applying migration: $(basename $MIGRATION_FILE)"
    psql "$DB_URL" -f "$MIGRATION_FILE"
    if [ $? -ne 0 ]; then
      echo "Error applying migration: $(basename $MIGRATION_FILE)"
      exit 1
    fi
  fi
done

echo "All cockpit migrations applied successfully!"
