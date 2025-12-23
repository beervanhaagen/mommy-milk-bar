#!/bin/bash

# Apply only the feedback table migration
echo "Applying feedback table migration to Supabase..."

# Use supabase db execute to run the specific migration
supabase db execute --file supabase/migrations/013_create_feedback_table.sql --linked

echo "Migration applied successfully!"
