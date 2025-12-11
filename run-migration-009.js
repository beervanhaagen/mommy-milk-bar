/**
 * Run migration 009 to fix the audit trigger
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Read environment variables
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('ERROR: SUPABASE_SERVICE_ROLE_KEY not found in .env file');
  console.log('\nYou need to add the service role key to your .env file:');
  console.log('SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here');
  console.log('\nGet it from: https://supabase.com/dashboard/project/lqmnkdqyoxytyyxuglhx/settings/api');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    console.log('Running migration 009: Fix audit trigger...\n');

    // Read the migration file
    const migrationSQL = fs.readFileSync('supabase/migrations/009_fix_audit_trigger.sql', 'utf8');

    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL });

    if (error) {
      // If exec_sql doesn't exist, we need to use a different approach
      console.log('Running SQL directly...\n');

      // Execute just the function update part
      const sqlToRun = `
CREATE OR REPLACE FUNCTION log_profile_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log significant changes (not every updated_at bump)
  -- REMOVED: height_cm, display_name (deleted in migration 008)
  IF (OLD.weight_kg IS DISTINCT FROM NEW.weight_kg OR
      OLD.safety_mode IS DISTINCT FROM NEW.safety_mode OR
      OLD.email IS DISTINCT FROM NEW.email OR
      OLD.email_verified IS DISTINCT FROM NEW.email_verified) THEN

    PERFORM log_audit_event(
      NEW.id,
      'profile_updated',
      'profile',
      NEW.id::text,
      NULL,
      jsonb_build_object(
        'fields_changed', ARRAY(
          SELECT key FROM jsonb_each(to_jsonb(NEW))
          WHERE to_jsonb(OLD)->>key IS DISTINCT FROM to_jsonb(NEW)->>key
        )
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
      `;

      const { error: directError } = await supabase.rpc('exec', { sql: sqlToRun });

      if (directError) {
        throw directError;
      }
    }

    console.log('✅ Migration 009 completed successfully!');
    console.log('✅ Audit trigger updated to remove references to deleted fields');
    console.log('\nThe sync errors should now be resolved.');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.log('\nPlease run this SQL manually in the Supabase SQL Editor:');
    console.log('https://supabase.com/dashboard/project/lqmnkdqyoxytyyxuglhx/sql/new');
    console.log('\n--- SQL TO RUN ---\n');
    console.log(fs.readFileSync('supabase/migrations/009_fix_audit_trigger.sql', 'utf8'));
  }
}

runMigration();
