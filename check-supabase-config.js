#!/usr/bin/env node

/**
 * Check Supabase configuratie voor password reset
 */

import 'dotenv/config';

const REQUIRED_REDIRECT_URLS = [
  'https://mommymilkbar.nl/reset-password',
  'https://www.mommymilkbar.nl/reset-password',
  'http://localhost:8081/reset-password',  // Voor lokale testing
];

console.log('🔍 Supabase Configuratie Check');
console.log('================================\n');

console.log('✅ Vereiste Redirect URLs:');
REQUIRED_REDIRECT_URLS.forEach(url => {
  console.log(`   - ${url}`);
});

console.log('\n📋 Environment variabelen:');
console.log(`   EXPO_PUBLIC_SUPABASE_URL: ${process.env.EXPO_PUBLIC_SUPABASE_URL || '❌ Niet ingesteld'}`);
console.log(`   EXPO_PUBLIC_SUPABASE_ANON_KEY: ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ? '✅ Ingesteld' : '❌ Niet ingesteld'}`);
console.log(`   SUPABASE_SERVICE_ROLE_KEY: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Ingesteld' : '❌ Niet ingesteld'}`);

console.log('\n📝 Handmatige controle vereist:');
console.log('   Ga naar je Supabase Dashboard:');
console.log(`   👉 https://supabase.com/dashboard/project/${process.env.EXPO_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0]}/auth/url-configuration`);
console.log('\n   Controleer dat de volgende URLs zijn toegevoegd onder "Redirect URLs":');
REQUIRED_REDIRECT_URLS.forEach(url => {
  console.log(`   ✓ ${url}`);
});

console.log('\n🔧 Edge Function configuratie:');
const edgeFunctionPath = './supabase/functions/send-password-reset-email/index.ts';
console.log(`   File: ${edgeFunctionPath}`);
console.log(`   Expected redirect URL: https://mommymilkbar.nl/reset-password`);

console.log('\n🌐 Website configuratie:');
const websitePath = './website/reset-password.html';
console.log(`   File: ${websitePath}`);
console.log(`   Supabase URL: https://lqmnkdqyoxytyyxuglhx.supabase.co`);
console.log(`   Anon Key moet matchen met: ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.slice(0, 30)}...`);

console.log('\n💡 Debugging tips:');
console.log('   1. Test met een echte gebruiker email die in je database staat');
console.log('   2. Open de browser console (F12) om alle debug logs te zien');
console.log('   3. Check of de URL hash parameters correct zijn (#access_token=...&type=recovery)');
console.log('   4. Controleer de Supabase logs voor auth errors');
console.log('\n================================');
