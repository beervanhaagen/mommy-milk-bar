#!/bin/bash

# Start Expo in tunnel mode and keep it running
# This script ensures the server stays alive and restarts if it crashes

echo "🚀 Starting Mommy Milk Bar in Tunnel Mode..."
echo "📱 This will work from anywhere - no Wi‑Fi needed!"
echo ""

# Kill any existing Expo processes
pkill -f "expo start" || true
sleep 2

# Create a named pipe to capture Expo output
PIPE=$(mktemp -u)
mkfifo "$PIPE"

# Start Expo in tunnel mode, redirect output to both pipe and log
npx expo start --tunnel > "$PIPE" 2>&1 &
EXPO_PID=$!

# Also log to file for later reference
tee expo-tunnel.log < "$PIPE" &
TEE_PID=$!

echo "✅ Expo started (PID: $EXPO_PID)"
echo "📝 Logs are being written to: expo-tunnel.log"
echo ""
echo "⏳ Waiting for tunnel URL (this may take 10-30 seconds)..."
echo ""

# Wait for tunnel URL to appear in output
TIMEOUT=60
ELAPSED=0
TUNNEL_URL=""
QR_PRINTED=false

# Read from pipe and look for tunnel URL
while [ $ELAPSED -lt $TIMEOUT ] && [ "$QR_PRINTED" = false ]; do
  # Check log file for tunnel URL patterns
  if [ -f expo-tunnel.log ]; then
    TUNNEL_URL=$(grep -oE "exp://[^[:space:]]+" expo-tunnel.log 2>/dev/null | head -1)
    if [ -z "$TUNNEL_URL" ]; then
      TUNNEL_URL=$(grep -oE "https://exp\.host/[^[:space:]]+" expo-tunnel.log 2>/dev/null | head -1)
    fi
    if [ -z "$TUNNEL_URL" ]; then
      TUNNEL_URL=$(grep -oE "https://u\.expo\.dev/[^[:space:]]+" expo-tunnel.log 2>/dev/null | head -1)
    fi
    if [ -z "$TUNNEL_URL" ]; then
      # Also check for "Metro waiting on" pattern
      TUNNEL_URL=$(grep -oE "Metro waiting on exp://[^[:space:]]+" expo-tunnel.log 2>/dev/null | grep -oE "exp://[^[:space:]]+" | head -1)
    fi
    
    if [ -n "$TUNNEL_URL" ]; then
      echo ""
      echo "✅ Tunnel URL found: $TUNNEL_URL"
      echo ""
      # Print QR code
      EXPO_TUNNEL_URL="$TUNNEL_URL" node print-tunnel-qr.js
      QR_PRINTED=true
      echo ""
      echo "🔄 Server is running in the background"
      echo "📝 To view logs: tail -f expo-tunnel.log"
      echo "🛑 To stop: pkill -f 'expo start'"
      echo ""
      echo "💡 The server will keep running even if you close this terminal"
      break
    fi
  fi
  
  sleep 2
  ELAPSED=$((ELAPSED + 2))
  echo -n "."
done

# Clean up pipe
rm -f "$PIPE"

if [ "$QR_PRINTED" = false ]; then
  echo ""
  echo ""
  echo "⚠️  Could not find tunnel URL automatically after $TIMEOUT seconds"
  echo ""
  echo "📝 Let's try to find it manually..."
  echo ""
  
  # Try to extract from log one more time with more patterns
  TUNNEL_URL=$(node get-tunnel-url.js 2>/dev/null)
  
  if [ -n "$TUNNEL_URL" ]; then
    echo "✅ Found tunnel URL: $TUNNEL_URL"
    echo ""
    EXPO_TUNNEL_URL="$TUNNEL_URL" node print-tunnel-qr.js
    QR_PRINTED=true
  else
    echo "📱 Expo is running in tunnel mode, but URL not found in logs."
    echo ""
    echo "💡 Option 1: Check the Expo output above for a QR code or URL"
    echo "💡 Option 2: Open Expo Go app → 'Enter URL manually' → enter:"
    echo "   exp://YOUR-PROJECT-ID.exp.direct:80"
    echo ""
    echo "💡 Option 3: If you see the URL in the terminal, run:"
    echo "   EXPO_TUNNEL_URL='exp://...' node print-tunnel-qr.js"
    echo ""
    echo "📝 Full logs available at: expo-tunnel.log"
  fi
fi

# Keep script running to monitor and restart if needed
echo ""
echo "👀 Monitoring server (Ctrl+C to stop monitoring, server keeps running)..."
echo ""

# Monitor the process and restart if it dies
while true; do
  if ! kill -0 $EXPO_PID 2>/dev/null; then
    echo ""
    echo "⚠️  Expo process stopped. Restarting..."
    echo ""
    exec "$0"
  fi
  sleep 10
done

