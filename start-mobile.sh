#!/bin/bash

# Startup script for Restaurant Manager Mobile App
# This ensures the correct Node.js version is used
# Logs are displayed in the terminal by default

echo "📱 Starting Restaurant Manager Mobile App..."
echo ""

# Set Node 20 path
export PATH="/opt/homebrew/opt/node@20/bin:$PATH"

# Verify Node version
NODE_VERSION=$(node --version)
echo "✓ Using Node.js: $NODE_VERSION"
echo ""

# Navigate to mobile directory
cd "$(dirname "$0")/mobile"

# Start Expo with iOS simulator
echo "Starting Expo development server with live logs..."
echo "Press 'i' to open iOS simulator once the QR code appears"
echo "Press Ctrl+C to stop"
echo ""

# Start with cleared cache and show all logs
npx expo start --clear --ios

