#!/bin/bash
echo ""
echo "=== TchotchoPay App Upgrade: SDK 50 → 54 ==="
echo ""

cd /Users/fednerfrancois/Claude/Projects/tchotchopay/tchotchopay-app

echo "[1/3] Upgrading Expo SDK to v54..."
npx expo install expo@^54.0.0

echo ""
echo "[2/3] Fixing all package versions..."
npx expo install --fix

echo ""
echo "[3/3] Starting Expo tunnel..."
ulimit -n 65536
npx expo start --tunnel
