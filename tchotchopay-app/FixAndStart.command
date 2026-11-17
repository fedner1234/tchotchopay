#!/bin/bash
cd "$(dirname "$0")"

echo "======================================"
echo "  TchotchoPay — Fix & Start (SDK 58)"
echo "======================================"
echo ""

# Kill old processes
pkill -f "expo" 2>/dev/null || true
pkill -f "metro" 2>/dev/null || true
lsof -ti :8081 | xargs kill -9 2>/dev/null || true
sleep 1

echo "Step 1: Cleaning old packages..."
rm -rf node_modules package-lock.json
echo "Done."
echo ""

echo "Step 2: Fixing npm permissions..."
sudo chown -R $(whoami) ~/.npm 2>/dev/null || true
echo "Done."
echo ""

echo "Step 3: Installing packages..."
npm install --legacy-peer-deps --force
echo ""

echo "Step 4: Fixing SDK 58 package versions..."
npx --yes expo install --fix
echo ""

echo "======================================"
echo "  Starting — Scan QR with Expo Go app"
echo "======================================"
echo ""

npx --yes expo start --lan

echo ""
read -p "Press Enter to close..."
