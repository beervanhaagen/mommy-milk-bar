// Test script to verify profile creation
// Run with: node test-profile-creation.js

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables!');
  console.error('EXPO_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testProfileCreation() {
  const testUserId = 'test-' + Date.now();
  const now = new Date().toISOString();

  const profileData = {
    id: testUserId,
    consent_version: '1.0.0',
    age_consent: true,
    medical_disclaimer_consent: true,
    privacy_policy_consent: true,
    marketing_consent: false,
    analytics_consent: false,
    consent_timestamp: now,
    has_completed_onboarding: false,
    notifications_enabled: true,
    safety_mode: 'cautious',
  };

  console.log('Testing profile creation with data:', JSON.stringify(profileData, null, 2));

  const { data, error } = await supabase
    .from('profiles')
    .insert(profileData)
    .select();

  if (error) {
    console.error('Error creating profile:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
  } else {
    console.log('Success! Profile created:', data);

    // Clean up test data
    const { error: deleteError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', testUserId);

    if (deleteError) {
      console.error('Error cleaning up test data:', deleteError);
    } else {
      console.log('Test data cleaned up successfully');
    }
  }
}

testProfileCreation().catch(console.error);
