#!/usr/bin/env node

/**
 * Test script voor wachtwoord reset flow
 * Dit script test of de wachtwoord reset email correct wordt verzonden
 */

import 'dotenv/config';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const testEmail = process.env.TEST_EMAIL || 'test@example.com';

console.log('🔧 Test Wachtwoord Reset Flow');
console.log('================================\n');

console.log('📋 Configuratie:');
console.log(`  Supabase URL: ${SUPABASE_URL}`);
console.log(`  Service Key: ${SUPABASE_SERVICE_KEY ? '✅ Ingesteld' : '❌ Ontbreekt'}`);
console.log(`  Test Email: ${testEmail}\n`);

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Supabase configuratie ontbreekt!');
  process.exit(1);
}

// Test 1: Check Supabase connection
console.log('Test 1: Supabase connectie testen...');
try {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
    headers: {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
    }
  });

  if (response.ok) {
    console.log('✅ Supabase verbinding succesvol\n');
  } else {
    console.error('❌ Supabase verbinding mislukt:', response.status, response.statusText);
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Fout bij verbinding maken:', error.message);
  process.exit(1);
}

// Test 2: Check password reset function
console.log('Test 2: Password reset function testen...');
const functionUrl = `${SUPABASE_URL}/functions/v1/send-password-reset-email`;
console.log(`  Function URL: ${functionUrl}\n`);

try {
  console.log(`📧 Versturen password reset email naar: ${testEmail}...`);

  const response = await fetch(functionUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
    },
    body: JSON.stringify({ email: testEmail })
  });

  const result = await response.json();

  console.log('\n📥 Response:', {
    status: response.status,
    statusText: response.statusText,
    result
  });

  if (response.ok && result.success) {
    console.log('\n✅ Password reset email succesvol verzonden!');
    console.log(`   Email ID: ${result.id}`);
    console.log('\n📌 Volgende stappen:');
    console.log('   1. Check de inbox van', testEmail);
    console.log('   2. Klik op de reset link in de email');
    console.log('   3. Open de browser console (F12) om de debug logs te zien');
    console.log('   4. Vul een nieuw wachtwoord in en klik op "Wachtwoord opslaan"');
    console.log('   5. Controleer de console logs voor eventuele errors\n');
  } else {
    console.error('\n❌ Fout bij verzenden email:');
    console.error('   Status:', response.status);
    console.error('   Message:', result.message);

    if (response.status === 429) {
      console.log('\n💡 Tip: Je hebt recent al een reset link aangevraagd. Wacht 60 seconden.');
    }
  }
} catch (error) {
  console.error('\n❌ Onverwachte fout:', error.message);
  process.exit(1);
}

console.log('\n================================');
console.log('Test voltooid!');
