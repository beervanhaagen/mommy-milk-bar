// Fix schema by adding missing columns
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  db: { schema: 'public' },
});

async function fixSchema() {
  console.log('Adding missing consent_timestamp column to profiles table...');

  // Execute SQL to add the missing column
  const { data, error } = await supabase.rpc('exec_sql', {
    sql: `
      ALTER TABLE profiles
      ADD COLUMN IF NOT EXISTS consent_timestamp TIMESTAMP WITH TIME ZONE;
    `
  });

  if (error) {
    console.error('Error executing SQL:', error);
    // Try alternative approach using direct query
    console.log('\nTrying alternative approach...');

    // Since we can't execute DDL directly, let's create a migration file instead
    console.log('\nYou need to run this SQL in the Supabase SQL Editor:');
    console.log('https://supabase.com/dashboard/project/lqmnkdqyoxytyyxuglhx/sql');
    console.log('\nSQL to execute:');
    console.log('----------------------------------------');
    console.log('ALTER TABLE profiles');
    console.log('ADD COLUMN IF NOT EXISTS consent_timestamp TIMESTAMP WITH TIME ZONE;');
    console.log('----------------------------------------');
  } else {
    console.log('Success!', data);
  }
}

fixSchema().catch(console.error);
