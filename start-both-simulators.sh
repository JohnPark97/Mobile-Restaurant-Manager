#!/bin/bash

# Startup script for testing on multiple simulators simultaneously
# Opens the app on both Owner and Customer simulators for parallel testing

echo "📱 Starting Restaurant Manager on Multiple Simulators..."
echo ""

# Set Node 20 path
export PATH="/opt/homebrew/opt/node@20/bin:$PATH"

# Simulator IDs
OWNER_SIM="679232DC-FC0F-4EC4-A029-9633331B1E60"
CUSTOMER_SIM="8B1D3B14-F2BA-4373-88CC-3551E1BE99C8"

# Simulator names for display
OWNER_NAME="iPhone 16 Pro Max (Owner)"
CUSTOMER_NAME="Customer IPhone 16 Pro Max"

# Get local IP for Expo
LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)

echo "✓ Using Node.js: $(node --version)"
echo ""

# Check if both simulators are booted
echo "Checking simulators..."
OWNER_STATUS=$(xcrun simctl list devices | grep "$OWNER_SIM" | grep -o "Booted" || echo "Shutdown")
CUSTOMER_STATUS=$(xcrun simctl list devices | grep "$CUSTOMER_SIM" | grep -o "Booted" || echo "Shutdown")

# Boot simulators if needed
if [ "$OWNER_STATUS" != "Booted" ]; then
    echo "Booting $OWNER_NAME..."
    xcrun simctl boot "$OWNER_SIM"
    open -a Simulator --args -CurrentDeviceUDID "$OWNER_SIM"
    sleep 3
fi

if [ "$CUSTOMER_STATUS" != "Booted" ]; then
    echo "Booting $CUSTOMER_NAME..."
    xcrun simctl boot "$CUSTOMER_SIM"
    open -a Simulator --args -CurrentDeviceUDID "$CUSTOMER_SIM"
    sleep 3
fi

echo "✓ Both simulators are ready"
echo ""

# Check if Metro bundler is running
if ! curl -s http://localhost:8081/status > /dev/null 2>&1; then
    echo "Metro bundler not running. Starting Expo..."
    echo ""
    cd "$(dirname "$0")/mobile"
    npx expo start --clear &
    EXPO_PID=$!
    echo "Waiting for Metro bundler to start..."
    sleep 10
else
    echo "✓ Metro bundler already running"
fi

echo ""
echo "Opening app on both simulators..."
echo "  - $OWNER_NAME"
echo "  - $CUSTOMER_NAME"
echo ""

# Open app on both simulators
xcrun simctl openurl "$OWNER_SIM" "exp://$LOCAL_IP:8081"
sleep 2
xcrun simctl openurl "$CUSTOMER_SIM" "exp://$LOCAL_IP:8081"

echo ""
echo "✅ App opened on both simulators!"
echo ""
echo "📋 Testing Tips:"
echo "  - Owner simulator: Test restaurant management features"
echo "  - Customer simulator: Test ordering and customer flows"
echo "  - Both: Test real-time order updates simultaneously"
echo ""
echo "Press Ctrl+C to stop Metro bundler (if started by this script)"

# Keep script running if we started Expo
if [ ! -z "$EXPO_PID" ]; then
    wait $EXPO_PID
fi

