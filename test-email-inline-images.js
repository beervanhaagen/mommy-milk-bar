#!/usr/bin/env node

/**
 * Test script to verify inline images in welcome email
 * Tests the Edge Function with proper inline image formatting
 */

const FUNCTION_URL = process.env.FUNCTION_URL || 'http://127.0.0.1:54321/functions/v1/send-welcome-email';
const TEST_EMAIL = process.env.TO_EMAIL || 'test@example.com';

async function testWelcomeEmail() {
  console.log('🧪 Testing welcome email with inline images...');
  console.log(`📧 Sending to: ${TEST_EMAIL}`);
  console.log(`🔗 Function URL: ${FUNCTION_URL}\n`);

  try {
    const response = await fetch(FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY || ''}`
      },
      body: JSON.stringify({
        email: TEST_EMAIL,
        motherName: 'Test Mama',
        verificationToken: 'test-token-12345'
      })
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('❌ Error response:', result);
      process.exit(1);
    }

    console.log('✅ Email sent successfully!');
    console.log('📨 Resend ID:', result.id);
    console.log('\n📋 Next steps:');
    console.log('1. Check your inbox at:', TEST_EMAIL);
    console.log('2. Verify inline images appear in Apple Mail/Gmail/Outlook');
    console.log('3. Images should load automatically without "Load Images" prompt');
    console.log('\n🔍 Expected images:');
    console.log('   - Mimi mascot (header)');
    console.log('   - 3 iPhone mockups (features section)');
    console.log('   - App Store button');
    console.log('   - Instagram logo');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testWelcomeEmail();
