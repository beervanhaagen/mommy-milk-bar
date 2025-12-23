// Apply migration using Supabase Management API
const https = require('https');
require('dotenv').config();

const projectRef = 'lqmnkdqyoxytyyxuglhx';
const sql = `
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS consent_timestamp TIMESTAMP WITH TIME ZONE;

UPDATE profiles
SET consent_timestamp = created_at
WHERE consent_timestamp IS NULL;
`;

// We need to use the SQL endpoint
// But for now, let's just provide instructions
console.log('');
console.log('='.repeat(80));
console.log('PLEASE RUN THIS SQL IN THE SUPABASE SQL EDITOR');
console.log('='.repeat(80));
console.log('');
console.log('1. Open this URL in your browser:');
console.log(`   https://supabase.com/dashboard/project/${projectRef}/sql/new`);
console.log('');
console.log('2. Copy and paste this SQL:');
console.log('');
console.log(sql);
console.log('');
console.log('3. Click "Run" to execute the SQL');
console.log('');
console.log('4. Then try signing up again in the app');
console.log('');
console.log('='.repeat(80));
console.log('');

// Try to open the browser automatically
const { exec } = require('child_process');
const url = `https://supabase.com/dashboard/project/${projectRef}/sql/new`;

exec(`open "${url}"`, (error) => {
  if (error) {
    console.log('Could not auto-open browser. Please open the URL manually.');
  } else {
    console.log('Opening SQL Editor in your browser...');
  }
});
