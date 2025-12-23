// Script to create the feedback table in Supabase
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing EXPO_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createFeedbackTable() {
  console.log('📝 Creating feedback table...');

  // Read the migration SQL
  const sql = fs.readFileSync('supabase/migrations/013_create_feedback_table.sql', 'utf8');

  try {
    // Execute the SQL using the REST API
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      // Try direct table creation instead
      console.log('Trying direct table creation...');

      const { error: createError } = await supabase.from('feedback').select('*').limit(1);

      if (createError && createError.code === '42P01') {
        // Table doesn't exist, we need to create it manually
        console.log('⚠️  Please run this SQL in your Supabase SQL Editor:');
        console.log('');
        console.log('https://supabase.com/dashboard/project/lqmnkdqyoxytyyxuglhx/sql/new');
        console.log('');
        console.log(sql);
        console.log('');
        process.exit(1);
      } else {
        console.log('✅ Feedback table already exists or was created!');
      }
    } else {
      console.log('✅ Feedback table created successfully!');
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
    console.log('');
    console.log('⚠️  Please run this SQL manually in your Supabase SQL Editor:');
    console.log('');
    console.log('https://supabase.com/dashboard/project/lqmnkdqyoxytyyxuglhx/sql/new');
    console.log('');
    console.log(sql);
    process.exit(1);
  }
}

createFeedbackTable();
