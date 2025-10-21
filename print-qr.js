#!/usr/bin/env node

const os = require('os');
const qrcode = require('qrcode-terminal');

function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name] || []) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return null;
}

const ip = getLocalIp();
if (!ip) {
  console.error('❌ Could not find local IP. Connect to Wi‑Fi and try again.');
  process.exit(1);
}

const port = process.env.PORT || '8081';
const expUrl = `exp://${ip}:${port}`;

console.log('\n✅ Mommy Milk Bar - Expo Dev Server\n');
console.log('📱 Scan this QR code with Expo Go:\n');

qrcode.generate(expUrl, { small: true }, (qr) => {
  console.log(qr);
  console.log(`\n📡 Connection URL: ${expUrl}\n`);
  console.log('💡 Instructions:');
  console.log('   1. Open Expo Go on your iPhone');
  console.log('   2. Tap "Scan QR Code"');
  console.log('   3. Point camera at the QR above\n');
  console.log('⚠️  Troubleshooting:');
  console.log('   - Ensure phone and Mac are on the SAME Wi‑Fi');
  console.log('   - Disable VPN and iCloud Private Relay');
  console.log('   - iOS Settings → Expo Go → enable "Local Network"\n');
});

