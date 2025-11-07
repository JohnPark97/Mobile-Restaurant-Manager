#!/bin/bash

# Startup script to launch both Backend and Mobile App
# This ensures the correct Node.js version is used for both
# Backend runs in background with log file, Mobile shows live logs

echo "🚀 Starting Restaurant Manager - Full Stack..."
echo ""

# Set Node 20 path
export PATH="/opt/homebrew/opt/node@20/bin:$PATH"

# Verify Node version
NODE_VERSION=$(node --version)
echo "✓ Using Node.js: $NODE_VERSION"

# Check if PostgreSQL is running
if ! pgrep -x "postgres" > /dev/null; then
    echo "⚠️  PostgreSQL is not running. Starting it now..."
    brew services start postgresql@14
    sleep 2
fi

echo "✓ PostgreSQL is running"
echo ""

# Start backend in background
echo "📡 Starting Backend..."
cd "$(dirname "$0")/backend"

if [ ! -f .env ]; then
    echo "❌ Error: .env file not found in backend directory"
    exit 1
fi

yarn dev > /tmp/backend.log 2>&1 &
BACKEND_PID=$!
echo "✓ Backend started (PID: $BACKEND_PID)"
echo "  📝 Backend logs: tail -f /tmp/backend.log"
sleep 3

# Check if backend started successfully
if ! curl -s http://localhost:3000/health > /dev/null; then
    echo "❌ Backend failed to start. Check logs: tail -f /tmp/backend.log"
    exit 1
fi

echo "✓ Backend health check passed"
echo ""

# Cleanup function to stop backend when script exits
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $BACKEND_PID 2>/dev/null
    echo "✓ Backend stopped"
}

trap cleanup EXIT

# Start mobile app with live logs
echo "📱 Starting Mobile App with live logs..."
cd "$(dirname "$0")/mobile"
echo "Press 'i' to open iOS simulator once ready"
echo "Press Ctrl+C to stop all services"
echo ""

npx expo start --clear --ios

# Note: When this exits, the cleanup function will stop the backend
echo ""
echo "Services stopped"

