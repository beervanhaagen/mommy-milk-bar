#!/usr/bin/env node

/**
 * Get tunnel URL from running Expo server
 * Tries multiple methods to find the tunnel URL
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, 'expo-tunnel.log');

function findTunnelUrlInLog() {
  if (!fs.existsSync(logFile)) {
    return null;
  }

  const content = fs.readFileSync(logFile, 'utf8');
  
  // Try various patterns
  const patterns = [
    /exp:\/\/[^\s]+/g,
    /https:\/\/exp\.host\/[^\s]+/g,
    /https:\/\/u\.expo\.dev\/[^\s]+/g,
    /Metro waiting on (exp:\/\/[^\s]+)/g,
    /Tunnel ready.*?(exp:\/\/[^\s]+)/g,
  ];

  for (const pattern of patterns) {
    const matches = content.match(pattern);
    if (matches && matches.length > 0) {
      // Extract exp:// URL from match
      const urlMatch = matches[0].match(/exp:\/\/[^\s]+/);
      if (urlMatch) {
        return urlMatch[0];
      }
    }
  }

  return null;
}

function getTunnelUrlFromExpo() {
  try {
    // Try to get URL from Expo status
    const output = execSync('npx expo start --tunnel --help 2>&1', { encoding: 'utf8' });
    // This won't work, but let's try another approach
  } catch (e) {
    // Expected
  }

  // Check if Expo is running and try to get URL from process
  try {
    const psOutput = execSync('ps aux | grep "expo start.*tunnel" | grep -v grep', { encoding: 'utf8' });
    if (psOutput) {
      // Expo is running, check the log
      return findTunnelUrlInLog();
    }
  } catch (e) {
    // No process found
  }

  return null;
}

// Main
const url = findTunnelUrlInLog() || getTunnelUrlFromExpo();

if (url) {
  console.log(url);
  process.exit(0);
} else {
  console.error('Could not find tunnel URL');
  process.exit(1);
}


