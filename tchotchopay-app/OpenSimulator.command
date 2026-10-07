#!/bin/bash
# TchotchoPay — Open in iOS Simulator (no phone needed)
cd "$(dirname "$0")"

echo "======================================"
echo "  TchotchoPay — iOS Simulator"
echo "======================================"
echo ""

# Kill any old Expo/Metro on 8082
lsof -ti :8082 | xargs kill -9 2>/dev/null || true
sleep 1

ulimit -n 65536

# Open iOS Simulator first
echo "Opening iOS Simulator..."
open -a Simulator
sleep 4

echo "Starting Expo (will auto-open in Simulator)..."
echo ""

# --ios flag auto-opens the app in the iOS Simulator
EXPO_NO_AUTH=1 npx expo start --port 8082 --ios

echo ""
echo "Done."
read -p "Press Enter to close..."
