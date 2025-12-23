// Test inserting feedback
const { createClient } = require('@supabase/supabase-js');

require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testFeedbackInsert() {
  console.log('🧪 Testing feedback insert...');

  // Get current authenticated user (if any)
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    console.log('⚠️  No authenticated user. Feedback requires authentication.');
    console.log('This is expected - feedback will work when users are logged in.');
    return;
  }

  console.log('✅ Authenticated user:', user.id);

  // Try to insert test feedback
  const { data, error } = await supabase
    .from('feedback')
    .insert({
      user_id: user.id,
      rating: 'positive',
      nps_score: 9,
      comment: 'Test feedback from script',
    })
    .select();

  if (error) {
    console.error('❌ Error inserting feedback:', error);
  } else {
    console.log('✅ Feedback inserted successfully!');
    console.log('Data:', data);
  }
}

testFeedbackInsert();
