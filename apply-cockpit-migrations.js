// Apply cockpit migrations to Supabase
// Run with: node apply-cockpit-migrations.js

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyMigrations() {
  console.log('🚀 Applying MMB Cockpit migrations to Supabase...\n');

  const migrationsDir = path.join(__dirname, 'supabase', 'migrations');
  const cockpitMigrations = [
    '014_create_assumptions.sql',
    '015_create_evidence.sql',
    '016_create_experiments.sql',
    '017_create_okrs.sql',
    '018_create_krs.sql',
    '019_create_kpi_snapshots.sql',
    '020_create_weekly_reviews.sql',
    '021_seed_cockpit_data.sql',
  ];

  for (const migrationFile of cockpitMigrations) {
    const filePath = path.join(migrationsDir, migrationFile);

    if (!fs.existsSync(filePath)) {
      console.error(`❌ Migration file not found: ${migrationFile}`);
      continue;
    }

    const sql = fs.readFileSync(filePath, 'utf8');
    console.log(`📄 Applying: ${migrationFile}`);

    try {
      // Execute SQL using Supabase's raw SQL execution
      const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql }).single();

      if (error) {
        // Try alternative method - direct query
        const { error: queryError } = await supabase
          .from('_temp')
          .select('*')
          .limit(0);

        // Since there's no direct SQL execution in Supabase JS client,
        // we need to use the REST API directly
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`
          },
          body: JSON.stringify({ sql_query: sql })
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${await response.text()}`);
        }

        console.log(`   ✅ Applied successfully`);
      } else {
        console.log(`   ✅ Applied successfully`);
      }
    } catch (err) {
      console.error(`   ❌ Error: ${err.message}`);
      console.log(`   ℹ️  You may need to apply this migration manually via Supabase SQL Editor`);
    }

    console.log('');
  }

  console.log('✨ Migration process complete!\n');
  console.log('Next steps:');
  console.log('1. Verify tables in Supabase dashboard: Table Editor');
  console.log('2. Check seed data: SELECT * FROM assumptions;');
  console.log('3. Create your admin user via Supabase Auth dashboard\n');
}

applyMigrations().catch(console.error);
