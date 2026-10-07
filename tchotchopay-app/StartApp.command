#!/bin/bash
cd "$(dirname "$0")"

echo "======================================"
echo "  TchotchoPay — Upgrade to SDK 57"
echo "======================================"
echo ""

# Kill ALL old Expo / Metro processes
echo "Killing old processes..."
pkill -f "expo start" 2>/dev/null || true
pkill -f "metro" 2>/dev/null || true
lsof -ti :8081 | xargs kill -9 2>/dev/null || true
lsof -ti :8082 | xargs kill -9 2>/dev/null || true
lsof -ti :19000 | xargs kill -9 2>/dev/null || true
sleep 2

ulimit -n 65536

echo ""
echo "Step 1: Upgrading Expo to SDK 57 (to match your Expo Go app)..."
npm install expo@~57.0.0 --save --legacy-peer-deps
echo ""

echo "Step 2: Fixing all package versions for SDK 57..."
npx expo install --fix
echo ""

echo "Your Mac IP address:"
ipconfig getifaddr en0 || ipconfig getifaddr en1
echo ""
echo "======================================"
echo "  Starting Expo — Scan QR with Expo Go"
echo "======================================"
echo ""

# Fix .expo cache permissions
chmod -R 755 ~/.expo 2>/dev/null || true

echo "Checking Expo login status..."
npx expo whoami 2>/dev/null || true
echo ""
echo ">>> If you see 'Not logged in', type your Expo credentials below."
echo ">>> Username: fedner123"
echo ""
npx expo login
echo ""
echo "Logged in! Starting app..."
echo ""

npx expo start --port 8082 --lan

echo ""
echo "Expo stopped."
read -p "Press Enter to close..."
