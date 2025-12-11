// Manual email verification script
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found in .env');
  console.log('Please add your service role key to .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const verifyEmail = async (email) => {
  try {
    console.log(`🔍 Looking for user: ${email}`);

    // Get user by email
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) throw listError;

    const user = users.find(u => u.email === email);

    if (!user) {
      console.error(`❌ User not found: ${email}`);
      return;
    }

    console.log(`✓ Found user: ${user.id}`);

    // Update user to set email as confirmed
    const { data, error } = await supabase.auth.admin.updateUserById(
      user.id,
      { email_confirm: true }
    );

    if (error) throw error;

    console.log(`✅ Email verified successfully for ${email}`);
    console.log('You can now log in to the app!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
};

const email = process.argv[2] || 'beervhaagen@icloud.com';
verifyEmail(email);
