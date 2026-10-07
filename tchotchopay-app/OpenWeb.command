#!/bin/bash
cd "$(dirname "$0")"

echo "======================================"
echo "  TchotchoPay — Opening in Browser"
echo "======================================"
echo ""

# Kill everything on relevant ports
lsof -ti :8082 | xargs kill -9 2>/dev/null || true
lsof -ti :19006 | xargs kill -9 2>/dev/null || true
sleep 1

ulimit -n 65536

# Install EXACT versions required by Expo 54
echo "Installing web packages (exact versions for Expo 54)..."
npm install --save react-dom@19.1.0 react-native-web@0.21.0 "@expo/metro-runtime@~6.1.2"
echo ""
echo "Packages installed. Starting web app..."
echo ""

# Start expo web — opens Chrome automatically
EXPO_NO_AUTH=1 npx expo start --web --port 8082

echo ""
read -p "Press Enter to close..."
