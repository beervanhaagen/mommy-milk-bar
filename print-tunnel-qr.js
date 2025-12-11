#!/usr/bin/env node

/**
 * Print QR code for Expo tunnel URL
 * This script reads the tunnel URL from Expo's output and generates a QR code
 * 
 * Usage: After starting `expo start --tunnel`, run this script
 * Or pipe expo output: expo start --tunnel 2>&1 | tee expo.log & node print-tunnel-qr.js expo.log
 */

const fs = require('fs');
const qrcode = require('qrcode-terminal');
const path = require('path');

// Try to read from log file if provided
const logFile = process.argv[2] || path.join(__dirname, 'expo-tunnel.log');

function extractTunnelUrl(text) {
  // Expo tunnel URLs look like: exp://u.expo.dev/...
  // Or: https://exp.host/@username/project?release-channel=...
  const patterns = [
    /exp:\/\/[^\s]+/g,
    /https:\/\/exp\.host\/[^\s]+/g,
    /https:\/\/u\.expo\.dev\/[^\s]+/g,
  ];

  for (const pattern of patterns) {
    const matches = text.match(pattern);
    if (matches && matches.length > 0) {
      return matches[0];
    }
  }
  return null;
}

function watchForTunnelUrl() {
  console.log('\n🔍 Waiting for Expo tunnel URL...\n');
  console.log('💡 Make sure Expo is running with: expo start --tunnel\n');

  // Try to read from log file
  if (fs.existsSync(logFile)) {
    const content = fs.readFileSync(logFile, 'utf8');
    const url = extractTunnelUrl(content);
    if (url) {
      printQR(url);
      return;
    }
  }

  // If no log file, check if URL is provided as env var
  const tunnelUrl = process.env.EXPO_TUNNEL_URL;
  if (tunnelUrl) {
    printQR(tunnelUrl);
    return;
  }

  // Otherwise, provide instructions
  console.log('❌ Could not find tunnel URL automatically.\n');
  console.log('📝 Options:');
  console.log('   1. Set EXPO_TUNNEL_URL environment variable');
  console.log('   2. Or manually copy the URL from Expo output and run:');
  console.log('      EXPO_TUNNEL_URL="exp://..." node print-tunnel-qr.js\n');
  console.log('💡 The tunnel URL appears in Expo output like:');
  console.log('   "Metro waiting on exp://u.expo.dev/..."\n');
}

function printQR(url) {
  console.log('\n✅ Mommy Milk Bar - Expo Tunnel Server\n');
  console.log('📱 Scan this QR code with Expo Go:\n');
  
  qrcode.generate(url, { small: true }, (qr) => {
    console.log(qr);
    console.log(`\n📡 Tunnel URL: ${url}\n`);
    console.log('💡 Instructions:');
    console.log('   1. Open Expo Go on your iPhone');
    console.log('   2. Tap "Scan QR Code"');
    console.log('   3. Point camera at the QR above\n');
    console.log('✅ Works from anywhere - no Wi‑Fi needed!\n');
  });
}

watchForTunnelUrl();


