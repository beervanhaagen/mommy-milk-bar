#!/bin/bash

# Simple tunnel mode - shows Expo output directly with QR code
# This is the easiest way - Expo shows the QR code itself!

echo "🚀 Starting Mommy Milk Bar in Tunnel Mode..."
echo "📱 This will work from anywhere - no Wi‑Fi needed!"
echo ""
echo "💡 Expo will show a QR code automatically - just scan it!"
echo "💡 Press Ctrl+C to stop"
echo ""

# Kill any existing Expo processes
pkill -f "expo start" || true
sleep 2

# Start Expo in tunnel mode - it will show QR code automatically
npx expo start --tunnel


