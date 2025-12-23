// Check if feedback table exists
const { createClient } = require('@supabase/supabase-js');

require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkTable() {
  console.log('Checking feedback table...');

  // Try to query the table
  const { data, error } = await supabase
    .from('feedback')
    .select('*')
    .limit(1);

  if (error) {
    console.error('❌ Error querying feedback table:', error);
    console.log('');
    console.log('The table probably doesn\'t exist. Please run this SQL in Supabase SQL Editor:');
    console.log('https://supabase.com/dashboard/project/lqmnkdqyoxytyyxuglhx/sql/new');
    console.log('');
    const fs = require('fs');
    const sql = fs.readFileSync('supabase/migrations/013_create_feedback_table.sql', 'utf8');
    console.log(sql);
  } else {
    console.log('✅ Feedback table exists and is accessible!');
    console.log('Data:', data);
  }
}

checkTable();
