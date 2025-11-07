#!/bin/bash

# Startup script for Restaurant Manager Backend
# This ensures the correct Node.js version is used
# Logs are displayed in the terminal by default

echo "🚀 Starting Restaurant Manager Backend..."
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

# Navigate to backend directory
cd "$(dirname "$0")/backend"

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found in backend directory"
    echo "Please create backend/.env with DATABASE_URL and other required variables"
    exit 1
fi

echo "✓ Environment file found"
echo ""

# Start the backend with live logs
echo "Starting backend server on port 3000 with live logs..."
echo "Press Ctrl+C to stop"
echo ""
yarn dev

